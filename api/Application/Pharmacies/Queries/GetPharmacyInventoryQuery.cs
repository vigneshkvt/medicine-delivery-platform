using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Pharmacies.Dto;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Pharmacies.Queries;

public sealed record GetPharmacyInventoryQuery(Guid PharmacyId) : IRequest<IReadOnlyCollection<MedicineItemDto>>;

public sealed class GetPharmacyInventoryQueryHandler : IRequestHandler<GetPharmacyInventoryQuery, IReadOnlyCollection<MedicineItemDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetPharmacyInventoryQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<MedicineItemDto>> Handle(GetPharmacyInventoryQuery request, CancellationToken cancellationToken)
    {
        var items = await _dbContext.MedicineItems
            .AsNoTracking()
            .Where(m => m.PharmacyId == request.PharmacyId)
            .OrderBy(m => m.Name)
            .Select(m => new MedicineItemDto(
                m.Id,
                m.Sku,
                m.Name,
                m.Description,
                m.Category,
                m.Price.Amount,
                m.Price.Currency,
                m.StockQuantity,
                m.RequiresPrescription,
                m.ExpiryDateUtc))
            .ToListAsync(cancellationToken);

        return items;
    }
}
