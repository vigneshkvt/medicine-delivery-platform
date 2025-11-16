namespace Medicine.Application.Medicines.Models;

public sealed record MedicineCatalogItem(
    string Id,
    string Name,
    string? Composition,
    string? Manufacturer,
    string? Form,
    string? Strength,
    string? Schedule,
    bool RequiresPrescription,
    decimal? MaximumRetailPrice,
    string? OgdSource
);
