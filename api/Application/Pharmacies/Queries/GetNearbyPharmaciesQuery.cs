using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Pharmacies.Dto;
using Medicine.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Pharmacies.Queries;

public sealed record GetNearbyPharmaciesQuery(double Latitude, double Longitude, double RadiusInKm) : IRequest<IReadOnlyCollection<PharmacyDto>>;

public sealed class GetNearbyPharmaciesQueryHandler : IRequestHandler<GetNearbyPharmaciesQuery, IReadOnlyCollection<PharmacyDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetNearbyPharmaciesQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<PharmacyDto>> Handle(GetNearbyPharmaciesQuery request, CancellationToken cancellationToken)
    {
        var pharmacies = await _dbContext.Pharmacies
            .AsNoTracking()
            .Include(p => p.Inventory)
            .Where(p => p.Status == Medicine.Domain.Enums.TenantStatus.Active)
            .Select(p => new PharmacyDto(
                p.Id,
                p.Status,
                p.Name,
                p.Description,
                p.ContactNumber,
                p.Email,
                p.Address.Line1,
                p.Address.Line2 ?? string.Empty,
                p.Address.City,
                p.Address.State,
                p.Address.Country,
                p.Address.PostalCode,
                p.Location.Latitude,
                p.Location.Longitude,
                p.DeliveryAvailable,
                p.OpeningTime,
                p.ClosingTime,
                4.5, // placeholder rating until reviews module is implemented
                120)) // placeholder review count
            .ToListAsync(cancellationToken);

        // TODO: Calculate precise distance filtering using Haversine formula or SQL geography when available.
        return pharmacies;
    }
}
