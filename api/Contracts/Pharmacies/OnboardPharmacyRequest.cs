using System.ComponentModel.DataAnnotations;

namespace Medicine.Api.Contracts.Pharmacies;

public sealed class OnboardPharmacyRequest
{
    [Required]
    [MaxLength(256)]
    public string TenantName { get; init; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string LegalName { get; init; } = string.Empty;

    [Required]
    [MaxLength(64)]
    public string TaxRegistrationNumber { get; init; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string PharmacyName { get; init; } = string.Empty;

    [MaxLength(1024)]
    public string Description { get; init; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Line1 { get; init; } = string.Empty;

    [MaxLength(256)]
    public string? Line2 { get; init; }

    [Required]
    [MaxLength(128)]
    public string City { get; init; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string State { get; init; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string Country { get; init; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string PostalCode { get; init; } = string.Empty;

    [Range(-90, 90)]
    public double Latitude { get; init; }

    [Range(-180, 180)]
    public double Longitude { get; init; }

    [Required]
    [MaxLength(20)]
    public string ContactNumber { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;
}
