using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Medicines.Models;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;

namespace Medicine.Infrastructure.Services;

public sealed class OgdMedicineCatalogService : IMedicineCatalogService
{
    private readonly HttpClient _httpClient;
    private readonly OgdCatalogOptions _options;
    private readonly ILogger<OgdMedicineCatalogService> _logger;
    private readonly IReadOnlyCollection<MedicineCatalogItem> _fallbackCatalog;

    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public OgdMedicineCatalogService(HttpClient httpClient, IOptions<OgdCatalogOptions> options, ILogger<OgdMedicineCatalogService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
        _fallbackCatalog = BuildFallbackCatalog();
    }

    public async Task<IReadOnlyCollection<MedicineCatalogItem>> SearchAsync(string query, int limit, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Array.Empty<MedicineCatalogItem>();
        }

        var effectiveLimit = Math.Clamp(limit <= 0 ? _options.DefaultLimit : limit, 1, _options.MaxLimit);
        var trimmedQuery = query.Trim();

        if (string.IsNullOrWhiteSpace(_options.ApiKey) || string.IsNullOrWhiteSpace(_options.ResourceId))
        {
            _logger.LogWarning("OGD catalog configuration incomplete. Falling back to embedded dataset for query '{Query}'.", trimmedQuery);
            return FilterFallback(trimmedQuery, effectiveLimit);
        }

        try
        {
            var requestUri = BuildRequestUri(trimmedQuery, effectiveLimit);
            using var response = await _httpClient.GetAsync(requestUri, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("OGD catalog request returned {StatusCode}. Using fallback dataset.", response.StatusCode);
                return FilterFallback(trimmedQuery, effectiveLimit);
            }

            await using var content = await response.Content.ReadAsStreamAsync(cancellationToken);
            var payload = await JsonSerializer.DeserializeAsync<OgdResponse>(content, SerializerOptions, cancellationToken);
            if (payload?.Records is null || payload.Records.Count == 0)
            {
                return Array.Empty<MedicineCatalogItem>();
            }

            return payload.Records
                .Select(record => record.ToCatalogItem())
                .Where(item => item is not null)
                .Take(effectiveLimit)
                .Cast<MedicineCatalogItem>()
                .ToArray();
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogError(ex, "Failed to fetch OGD catalog data. Reverting to embedded dataset for query '{Query}'.", trimmedQuery);
            return FilterFallback(trimmedQuery, effectiveLimit);
        }
    }

    private string BuildRequestUri(string query, int limit)
    {
        var basePath = _options.BaseUrl.TrimEnd('/') + "/" + _options.ResourceId.Trim('/');
        var queryParams = new Dictionary<string, string?>
        {
            ["api-key"] = _options.ApiKey,
            ["format"] = "json",
            ["limit"] = limit.ToString(CultureInfo.InvariantCulture),
            ["q"] = query,
            [$"filters[{_options.SearchField}]" ] = query
        };

        return QueryHelpers.AddQueryString(basePath, queryParams);
    }

    private IReadOnlyCollection<MedicineCatalogItem> FilterFallback(string query, int limit)
    {
        return _fallbackCatalog
            .Where(item => item.Name.Contains(query, StringComparison.OrdinalIgnoreCase)
                || (item.Composition?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false))
            .Take(limit)
            .ToArray();
    }

    private static IReadOnlyCollection<MedicineCatalogItem> BuildFallbackCatalog()
    {
        return new List<MedicineCatalogItem>
        {
            new(
                "FALLBACK-PCM-500",
                "Paracetamol 500mg Tablet",
                "Paracetamol IP 500mg",
                "Universal Pharma Labs",
                "Tablet",
                "500 mg",
                "H1",
                false,
                12.50m,
                "OGD Fallback Sample"
            ),
            new(
                "FALLBACK-AMOX-625",
                "Amoxicillin & Clavulanate Potassium 625",
                "Amoxicillin 500mg + Clavulanate Potassium 125mg",
                "HealthCare Formulations",
                "Tablet",
                "625 mg",
                "H",
                true,
                182.00m,
                "OGD Fallback Sample"
            ),
            new(
                "FALLBACK-ATOR-10",
                "Atorvastatin 10mg Tablet",
                "Atorvastatin Calcium 10mg",
                "CardioLife Pharmaceuticals",
                "Tablet",
                "10 mg",
                "H",
                true,
                85.00m,
                "OGD Fallback Sample"
            ),
            new(
                "FALLBACK-AZTH-500",
                "Azithromycin 500mg Tablet",
                "Azithromycin Dihydrate 500mg",
                "Global Remedies",
                "Tablet",
                "500 mg",
                "H",
                true,
                75.00m,
                "OGD Fallback Sample"
            ),
            new(
                "FALLBACK-ORS-POWDER",
                "Oral Rehydration Salts",
                "WHO ORS Formula",
                "Hydration Plus",
                "Powder",
                "21 g sachet",
                null,
                false,
                20.00m,
                "OGD Fallback Sample"
            )
        };
    }

    private sealed record OgdResponse
    {
        [JsonPropertyName("records")]
        public List<OgdRecord>? Records { get; init; }
    }

    private sealed record OgdRecord
    {
        [JsonPropertyName("id")]
        public string? Id { get; init; }
        [JsonPropertyName("drug_name")]
        public string? Drug_Name { get; init; }
        [JsonPropertyName("composition")]
        public string? Composition { get; init; }
        [JsonPropertyName("manufacturer")]
        public string? Manufacturer { get; init; }
        [JsonPropertyName("dosage_form")]
        public string? Dosage_Form { get; init; }
        [JsonPropertyName("strength")]
        public string? Strength { get; init; }
        [JsonPropertyName("schedule")]
        public string? Schedule { get; init; }
        [JsonPropertyName("mrp")]
        public string? Mrp { get; init; }

        public MedicineCatalogItem? ToCatalogItem()
        {
            var name = Drug_Name ?? string.Empty;
            if (string.IsNullOrWhiteSpace(name))
            {
                return null;
            }

            decimal? mrp = null;
            if (!string.IsNullOrWhiteSpace(Mrp) && decimal.TryParse(Mrp, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsedMrp))
            {
                mrp = parsedMrp;
            }

            var requiresPrescription = !string.IsNullOrWhiteSpace(Schedule) && !Schedule.Equals("OTC", StringComparison.OrdinalIgnoreCase);

            return new MedicineCatalogItem(
                string.IsNullOrWhiteSpace(Id) ? $"OGD-{Guid.NewGuid():N}" : Id,
                name.Trim(),
                Composition?.Trim(),
                Manufacturer?.Trim(),
                Dosage_Form?.Trim(),
                Strength?.Trim(),
                Schedule?.Trim(),
                requiresPrescription,
                mrp,
                "OGD API"
            );
        }
    }
}
