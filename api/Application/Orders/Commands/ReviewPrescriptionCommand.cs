using System;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Common.Models;
using Medicine.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Orders.Commands;

public sealed record ReviewPrescriptionCommand(Guid OrderId, Guid PharmacyId, Guid RequesterId, PrescriptionStatus Status, string? Notes) : IRequest<Result>;

public sealed class ReviewPrescriptionCommandHandler : IRequestHandler<ReviewPrescriptionCommand, Result>
{
    private readonly IApplicationDbContext _dbContext;

    public ReviewPrescriptionCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result> Handle(ReviewPrescriptionCommand request, CancellationToken cancellationToken)
    {
        if (request.RequesterId != Guid.Empty)
        {
            var membership = await _dbContext.PharmacyMemberships
                .AsNoTracking()
                .SingleOrDefaultAsync(m => m.PharmacyId == request.PharmacyId && m.UserId == request.RequesterId, cancellationToken);

            if (membership is null)
            {
                return Result.Failure("order.unauthorized_pharmacy_access");
            }
        }

        var order = await _dbContext.Orders
            .Include(o => o.Prescription)
            .SingleOrDefaultAsync(o => o.Id == request.OrderId && o.PharmacyId == request.PharmacyId, cancellationToken);

        if (order is null)
        {
            return Result.Failure("order.not_found");
        }

        if (order.Prescription is null)
        {
            return Result.Failure("order.prescription_missing");
        }

        order.Prescription.SetStatus(request.Status, request.Notes);

        if (request.Status == PrescriptionStatus.Approved && order.Status is OrderStatus.Pending or OrderStatus.AwaitingPrescriptionReview)
        {
            order.SetStatus(OrderStatus.Approved);
        }
        else if (request.Status == PrescriptionStatus.Rejected)
        {
            order.SetStatus(OrderStatus.Rejected);
        }
        else
        {
            order.SetStatus(OrderStatus.AwaitingPrescriptionReview);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
