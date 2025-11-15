using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Admin.Dto;
using Medicine.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Admin.Queries;

public sealed record GetAdminDashboardQuery : IRequest<AdminDashboardDto>;

public sealed class GetAdminDashboardQueryHandler : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
{
    private readonly IApplicationDbContext _dbContext;

    public GetAdminDashboardQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AdminDashboardDto> Handle(GetAdminDashboardQuery request, CancellationToken cancellationToken)
    {
        var totalUsers = await _dbContext.Users.CountAsync(cancellationToken);
        var activePharmacies = await _dbContext.Pharmacies.CountAsync(p => p.Status == Medicine.Domain.Enums.TenantStatus.Active, cancellationToken);
        var pendingPharmacies = await _dbContext.Pharmacies.CountAsync(p => p.Status == Medicine.Domain.Enums.TenantStatus.PendingApproval, cancellationToken);
        var totalOrders = await _dbContext.Orders.CountAsync(cancellationToken);
        var totalOrderValue = await _dbContext.Orders.SumAsync(o => (decimal?)o.Total.Amount, cancellationToken) ?? 0m;

        var topPharmaciesQuery = await _dbContext.Orders
            .AsNoTracking()
            .GroupBy(o => o.Pharmacy.Name)
            .Select(g => new AdminTopPharmacyDto(
                g.Key,
                g.Count(),
                g.Sum(o => o.Total.Amount)))
            .OrderByDescending(x => x.Orders)
            .Take(5)
            .ToListAsync(cancellationToken);

        var topMedicinesQuery = await _dbContext.OrderItems
            .AsNoTracking()
            .GroupBy(i => i.MedicineName)
            .Select(g => new AdminTopMedicineDto(
                g.Key,
                g.Count(),
                g.Sum(i => i.Total.Amount)))
            .OrderByDescending(x => x.Orders)
            .Take(5)
            .ToListAsync(cancellationToken);

        return new AdminDashboardDto(
            totalUsers,
            activePharmacies,
            pendingPharmacies,
            totalOrders,
            totalOrderValue,
            topPharmaciesQuery,
            topMedicinesQuery);
    }
}
