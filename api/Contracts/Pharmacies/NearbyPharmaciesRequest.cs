using System.ComponentModel.DataAnnotations;

namespace Medicine.Api.Contracts.Pharmacies;

public sealed class NearbyPharmaciesRequest
{
    [Range(-90, 90)]
    public double Latitude { get; init; }

    [Range(-180, 180)]
    public double Longitude { get; init; }

    [Range(0.5, 50)]
    public double RadiusInKm { get; init; } = 5;
}
