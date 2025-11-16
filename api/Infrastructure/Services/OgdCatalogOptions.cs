namespace Medicine.Infrastructure.Services;

public sealed class OgdCatalogOptions
{
    public string BaseUrl { get; init; } = "https://api.data.gov.in/resource";
    public string ResourceId { get; init; } = string.Empty;
    public string ApiKey { get; init; } = string.Empty;
    public string SearchField { get; init; } = "drug_name";
    public int DefaultLimit { get; init; } = 25;
    public int MaxLimit { get; init; } = 100;
    public int TimeoutSeconds { get; init; } = 10;
}
