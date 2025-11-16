using System;
using Medicine.Domain.Enums;

namespace Medicine.Application.Pharmacies.Dto;

public sealed record PharmacyDto(
    Guid Id,
    TenantStatus Status,
    string Name,
    string Description,
    string ContactNumber,
    string Email,
    string AddressLine1,
    string AddressLine2,
    string City,
    string State,
    string Country,
    string PostalCode,
    double Latitude,
    double Longitude,
    bool DeliveryAvailable,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime,
    double Rating,
    int ReviewCount);
