using System;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Common.Models;
using Medicine.Domain.Entities;
using Medicine.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Orders.Commands;

public sealed record UpdateOrderStatusCommand(Guid OrderId, Guid PharmacyId, Guid RequesterId, OrderStatus Status, DateTimeOffset? EstimatedDeliveryAtUtc) : IRequest<Result>;

public sealed class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Result>
{
    private readonly IApplicationDbContext _dbContext;

    public UpdateOrderStatusCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
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

        var order = await _dbContext.Orders.SingleOrDefaultAsync(o => o.Id == request.OrderId && o.PharmacyId == request.PharmacyId, cancellationToken);
        if (order is null)
        {
            return Result.Failure("order.not_found");
        }

        if (order.Status == OrderStatus.Completed || order.Status == OrderStatus.Cancelled)
        {
            return Result.Failure("order.already_finalized");
        }

        if (!IsTransitionAllowed(order.Status, request.Status))
        {
            return Result.Failure("order.invalid_transition");
        }

        order.SetStatus(request.Status);

        if (request.EstimatedDeliveryAtUtc.HasValue)
        {
            order.ScheduleEstimatedDelivery(request.EstimatedDeliveryAtUtc.Value);
        }

        if (request.Status == OrderStatus.Completed)
        {
            order.SetPaymentStatus(PaymentStatus.Captured);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static bool IsTransitionAllowed(OrderStatus current, OrderStatus next)
    {
        return current switch
        {
            OrderStatus.Pending => next is OrderStatus.Approved or OrderStatus.Rejected or OrderStatus.AwaitingPrescriptionReview,
            OrderStatus.AwaitingPrescriptionReview => next is OrderStatus.Approved or OrderStatus.Rejected,
            OrderStatus.Approved => next is OrderStatus.Preparing or OrderStatus.Cancelled,
            OrderStatus.Preparing => next is OrderStatus.ReadyForDelivery or OrderStatus.Cancelled,
            OrderStatus.ReadyForDelivery => next is OrderStatus.OutForDelivery or OrderStatus.Cancelled,
            OrderStatus.OutForDelivery => next is OrderStatus.Completed or OrderStatus.Cancelled,
            OrderStatus.Rejected => next is OrderStatus.Cancelled,
            _ => false
        };
    }
}
