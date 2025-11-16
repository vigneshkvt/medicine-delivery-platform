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

public sealed record RejectPharmacyCommand(Guid PharmacyId, Guid RejectedByUserId) : IRequest<Result>;

public sealed class RejectPharmacyCommandHandler : IRequestHandler<RejectPharmacyCommand, Result>
{
    private readonly IApplicationDbContext _dbContext;

    public RejectPharmacyCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result> Handle(RejectPharmacyCommand request, CancellationToken cancellationToken)
    {
        var rejector = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == request.RejectedByUserId, cancellationToken);
        if (rejector is null || rejector.Role != UserRole.Admin)
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

        tenant.SetStatus(TenantStatus.Deactivated);
        pharmacy.Reject();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
