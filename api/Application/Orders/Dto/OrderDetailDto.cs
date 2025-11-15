using System;
using System.Collections.Generic;
using Medicine.Domain.Enums;

namespace Medicine.Application.Orders.Dto;

public sealed record OrderDetailDto(
    Guid OrderId,
    Guid OrderNumber,
    Guid PharmacyId,
    string PharmacyName,
    Guid CustomerId,
    string CustomerEmail,
    string DeliveryLine1,
    string? DeliveryLine2,
    string City,
    string State,
    string Country,
    string PostalCode,
    double Latitude,
    double Longitude,
    decimal TotalAmount,
    string Currency,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    OrderStatus Status,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? EstimatedDeliveryAtUtc,
    IReadOnlyCollection<OrderItemDto> Items,
    string? PrescriptionFileName,
    string? PrescriptionStatus);
