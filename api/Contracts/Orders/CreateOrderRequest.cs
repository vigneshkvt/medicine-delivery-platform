using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Medicine.Api.Contracts.Orders;

public sealed class CreateOrderRequest
{
    [Required]
    public Guid PharmacyId { get; init; }

    [Required]
    [MaxLength(256)]
    public string DeliveryLine1 { get; init; } = string.Empty;

    [MaxLength(256)]
    public string? DeliveryLine2 { get; init; }

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
    [MinLength(1)]
    public List<CreateOrderItemRequest> Items { get; init; } = new();

    [RegularExpression("CashOnDelivery|Online", ErrorMessage = "order.payment_method_not_supported")]
    public string PaymentMethod { get; init; } = "CashOnDelivery";

    public IFormFile? Prescription { get; init; }
}
