using System;
using System.ComponentModel.DataAnnotations;

namespace Medicine.Api.Contracts.Orders;

public sealed class UpdateOrderStatusRequest
{
    [Required]
    public string Status { get; init; } = string.Empty;

    public DateTimeOffset? EstimatedDeliveryAtUtc { get; init; }
}
