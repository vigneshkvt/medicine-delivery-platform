using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Orders.Dto;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Orders.Queries;

public sealed record GetCustomerOrdersQuery(Guid CustomerId) : IRequest<IReadOnlyCollection<OrderDetailDto>>;

public sealed class GetCustomerOrdersQueryHandler : IRequestHandler<GetCustomerOrdersQuery, IReadOnlyCollection<OrderDetailDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetCustomerOrdersQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<OrderDetailDto>> Handle(GetCustomerOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _dbContext.Orders
            .AsNoTracking()
            .Where(o => o.CustomerId == request.CustomerId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new OrderDetailDto(
                o.Id,
                o.OrderNumber,
                o.PharmacyId,
                o.Pharmacy.Name,
                o.CustomerId,
                o.Customer.Email,
                o.DeliveryAddress.Line1,
                o.DeliveryAddress.Line2,
                o.DeliveryAddress.City,
                o.DeliveryAddress.State,
                o.DeliveryAddress.Country,
                o.DeliveryAddress.PostalCode,
                o.DeliveryLocation.Latitude,
                o.DeliveryLocation.Longitude,
                o.Total.Amount,
                o.Total.Currency,
                o.PaymentMethod,
                o.PaymentStatus,
                o.Status,
                o.CreatedAtUtc,
                o.EstimatedDeliveryAtUtc,
                o.Items.Select(i => new OrderItemDto(
                    i.MedicineId,
                    i.MedicineName,
                    i.Quantity,
                    i.UnitPrice.Amount,
                    i.Total.Amount,
                    i.UnitPrice.Currency,
                    i.RequiresPrescription)).ToList(),
                o.Prescription != null ? o.Prescription.FileName : null,
                o.Prescription != null ? o.Prescription.Status.ToString() : null))
            .ToListAsync(cancellationToken);

        return orders;
    }
}
