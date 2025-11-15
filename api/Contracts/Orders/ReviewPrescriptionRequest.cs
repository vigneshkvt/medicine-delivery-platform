using System.ComponentModel.DataAnnotations;

namespace Medicine.Api.Contracts.Orders;

public sealed class ReviewPrescriptionRequest
{
    [Required]
    public string Status { get; init; } = string.Empty;

    [MaxLength(512)]
    public string? Notes { get; init; }
}
