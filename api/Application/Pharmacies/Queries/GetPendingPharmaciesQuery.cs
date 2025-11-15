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

public sealed record GetPendingPharmaciesQuery : IRequest<IReadOnlyCollection<PharmacyDto>>;

public sealed class GetPendingPharmaciesQueryHandler : IRequestHandler<GetPendingPharmaciesQuery, IReadOnlyCollection<PharmacyDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetPendingPharmaciesQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<PharmacyDto>> Handle(GetPendingPharmaciesQuery request, CancellationToken cancellationToken)
    {
        var pharmacies = await _dbContext.Pharmacies
            .AsNoTracking()
            .Where(p => p.Status == TenantStatus.PendingApproval)
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
                0,
                0))
            .ToListAsync(cancellationToken);

        return pharmacies;
    }
}
