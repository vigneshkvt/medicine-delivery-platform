using System;
using System.ComponentModel.DataAnnotations;

namespace Medicine.Api.Contracts.Orders;

public sealed class CreateOrderItemRequest
{
    [Required]
    public Guid MedicineId { get; init; }

    [Range(1, 999)]
    public int Quantity { get; init; }
}
