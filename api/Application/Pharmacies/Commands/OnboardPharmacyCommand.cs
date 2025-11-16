using System;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Common.Models;
using Medicine.Application.Pharmacies.Dto;
using Medicine.Domain.Entities;
using Medicine.Domain.Enums;
using Medicine.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Pharmacies.Commands;

public sealed record OnboardPharmacyCommand(
    Guid OwnerUserId,
    string TenantName,
    string LegalName,
    string TaxRegistrationNumber,
    string PharmacyName,
    string Description,
    string Line1,
    string? Line2,
    string City,
    string State,
    string Country,
    string PostalCode,
    double Latitude,
    double Longitude,
    string ContactNumber,
    string Email
) : IRequest<Result<PharmacyDto>>;

public sealed class OnboardPharmacyCommandHandler : IRequestHandler<OnboardPharmacyCommand, Result<PharmacyDto>>
{
    private readonly IApplicationDbContext _dbContext;

    public OnboardPharmacyCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<PharmacyDto>> Handle(OnboardPharmacyCommand request, CancellationToken cancellationToken)
    {
        var owner = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == request.OwnerUserId, cancellationToken);
        if (owner is null)
        {
            return Result<PharmacyDto>.Failure("pharmacy.owner_not_found");
        }

        if (owner.Role != UserRole.Pharmacist && owner.Role != UserRole.Admin)
        {
            return Result<PharmacyDto>.Failure("pharmacy.owner_invalid_role");
        }

        var existingPharmacy = await _dbContext.Pharmacies.AnyAsync(p => p.Email == request.Email, cancellationToken);
        if (existingPharmacy)
        {
            return Result<PharmacyDto>.Failure("pharmacy.email_exists");
        }

        var tenant = new PharmacyTenant(request.TenantName, request.LegalName, request.TaxRegistrationNumber);
        _dbContext.PharmacyTenants.Add(tenant);

        var pharmacy = new Pharmacy(
            tenant.Id,
            request.PharmacyName,
            new Address(request.Line1, request.Line2, request.City, request.State, request.Country, request.PostalCode),
            GeoCoordinate.From(request.Latitude, request.Longitude),
            request.ContactNumber,
            request.Email);
        pharmacy.UpdateProfile(request.PharmacyName, request.Description, pharmacy.Address, pharmacy.Location, request.ContactNumber);
        pharmacy.UpdateDeliveryAvailability(true);

        _dbContext.Pharmacies.Add(pharmacy);

        var membership = new PharmacyMembership(pharmacy.Id, owner.Id, UserRole.Pharmacist);
        _dbContext.PharmacyMemberships.Add(membership);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = new PharmacyDto(
            pharmacy.Id,
            pharmacy.Status,
            pharmacy.Name,
            pharmacy.Description,
            pharmacy.ContactNumber,
            pharmacy.Email,
            pharmacy.Address.Line1,
            pharmacy.Address.Line2 ?? string.Empty,
            pharmacy.Address.City,
            pharmacy.Address.State,
            pharmacy.Address.Country,
            pharmacy.Address.PostalCode,
            pharmacy.Location.Latitude,
            pharmacy.Location.Longitude,
            pharmacy.DeliveryAvailable,
            pharmacy.OpeningTime,
            pharmacy.ClosingTime,
            0,
            0);

        return Result<PharmacyDto>.Success(response);
    }
}
