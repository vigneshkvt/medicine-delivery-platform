using System;

namespace Medicine.Application.Pharmacies.Dto;

public sealed record MedicineItemDto(
    Guid Id,
    string Sku,
    string Name,
    string Description,
    string Category,
    decimal Price,
    string Currency,
    int StockQuantity,
    bool RequiresPrescription,
    DateTimeOffset? ExpiryDateUtc);
