using System;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Common.Models;
using Medicine.Domain.Entities;
using Medicine.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Pharmacies.Commands;

public sealed record ApprovePharmacyCommand(Guid PharmacyId, Guid ApprovedByUserId) : IRequest<Result>;

public sealed class ApprovePharmacyCommandHandler : IRequestHandler<ApprovePharmacyCommand, Result>
{
    private readonly IApplicationDbContext _dbContext;

    public ApprovePharmacyCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result> Handle(ApprovePharmacyCommand request, CancellationToken cancellationToken)
    {
        var approver = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == request.ApprovedByUserId, cancellationToken);
        if (approver is null || approver.Role != UserRole.Admin)
        {
            return Result.Failure("pharmacy.approver_invalid");
        }

        var pharmacy = await _dbContext.Pharmacies.SingleOrDefaultAsync(p => p.Id == request.PharmacyId, cancellationToken);
        if (pharmacy is null)
        {
            return Result.Failure("pharmacy.not_found");
        }

        var tenant = await _dbContext.PharmacyTenants.SingleOrDefaultAsync(t => t.Id == pharmacy.TenantId, cancellationToken);
        if (tenant is null)
        {
            return Result.Failure("pharmacy.tenant_not_found");
        }

        tenant.SetStatus(TenantStatus.Active);
        pharmacy.Approve();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
