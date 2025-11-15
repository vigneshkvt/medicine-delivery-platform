using System;

namespace Medicine.Api.Contracts.Orders;

public sealed record CreateOrderResponse(
    Guid OrderId,
    Guid OrderNumber,
    decimal TotalAmount,
    string Currency,
    string PaymentMethod,
    string PaymentStatus,
    string Status);
