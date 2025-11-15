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

public sealed record GetManagedPharmaciesQuery(Guid UserId) : IRequest<IReadOnlyCollection<PharmacyDto>>;

public sealed class GetManagedPharmaciesQueryHandler : IRequestHandler<GetManagedPharmaciesQuery, IReadOnlyCollection<PharmacyDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetManagedPharmaciesQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<PharmacyDto>> Handle(GetManagedPharmaciesQuery request, CancellationToken cancellationToken)
    {
        var query = request.UserId == Guid.Empty
            ? _dbContext.Pharmacies.AsNoTracking().Where(p => p.Status == Medicine.Domain.Enums.TenantStatus.Active)
                .Select(p => new PharmacyDto(
                    p.Id,
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
                    4.5,
                    120))
            : _dbContext.PharmacyMemberships
                .AsNoTracking()
                .Where(m => m.UserId == request.UserId)
                .Select(m => new PharmacyDto(
                    m.Pharmacy.Id,
                    m.Pharmacy.Name,
                    m.Pharmacy.Description,
                    m.Pharmacy.ContactNumber,
                    m.Pharmacy.Email,
                    m.Pharmacy.Address.Line1,
                    m.Pharmacy.Address.Line2 ?? string.Empty,
                    m.Pharmacy.Address.City,
                    m.Pharmacy.Address.State,
                    m.Pharmacy.Address.Country,
                    m.Pharmacy.Address.PostalCode,
                    m.Pharmacy.Location.Latitude,
                    m.Pharmacy.Location.Longitude,
                    m.Pharmacy.DeliveryAvailable,
                    m.Pharmacy.OpeningTime,
                    m.Pharmacy.ClosingTime,
                    4.5,
                    120));

        var pharmacies = await query.ToListAsync(cancellationToken);

        return pharmacies;
    }
}
