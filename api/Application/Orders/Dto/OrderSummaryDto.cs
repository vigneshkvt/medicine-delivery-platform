using System;
using Medicine.Domain.Enums;

namespace Medicine.Application.Orders.Dto;

public sealed record OrderSummaryDto(
    Guid OrderId,
    Guid OrderNumber,
    decimal TotalAmount,
    string Currency,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    OrderStatus Status);
