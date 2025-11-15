using System;

namespace Medicine.Application.Orders.Dto;

public sealed record OrderItemDto(
    Guid MedicineId,
    string MedicineName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal,
    string Currency,
    bool RequiresPrescription);
