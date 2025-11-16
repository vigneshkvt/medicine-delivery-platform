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
        
        // Load orders into memory first to access value object properties
        var allOrders = await _dbContext.Orders.AsNoTracking().ToListAsync(cancellationToken);
        var totalOrderValue = allOrders.Sum(o => o.Total.Amount);

        var topPharmaciesQuery = allOrders
            .GroupBy(o => o.Pharmacy.Name)
            .Select(g => new AdminTopPharmacyDto(
                g.Key,
                g.Count(),
                g.Sum(o => o.Total.Amount)))
            .OrderByDescending(x => x.Orders)
            .Take(5)
            .ToList();

        var allOrderItems = await _dbContext.OrderItems.AsNoTracking().ToListAsync(cancellationToken);
        var topMedicinesQuery = allOrderItems
            .GroupBy(i => i.MedicineName)
            .Select(g => new AdminTopMedicineDto(
                g.Key,
                g.Count(),
                g.Sum(i => i.Total.Amount)))
            .OrderByDescending(x => x.Orders)
            .Take(5)
            .ToList();

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
