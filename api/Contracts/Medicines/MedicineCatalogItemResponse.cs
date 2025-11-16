namespace Medicine.Api.Contracts.Medicines;

public sealed record MedicineCatalogItemResponse
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public string? Composition { get; init; }
    public string? Manufacturer { get; init; }
    public string? Form { get; init; }
    public string? Strength { get; init; }
    public string? Schedule { get; init; }
    public bool RequiresPrescription { get; init; }
    public decimal? MaximumRetailPrice { get; init; }
    public string? OgdSource { get; init; }
}
