using System;
using System.Collections.Generic;
using System.Linq;
using Medicine.Domain.Enums;
using Medicine.Domain.ValueObjects;

namespace Medicine.Domain.Entities;

public class Order : AuditableEntity
{
    private readonly List<OrderItem> _items = new();

    public Guid OrderNumber { get; private set; } = Guid.NewGuid();
    public Guid CustomerId { get; private set; }
    public User Customer { get; private set; } = default!;
    public Guid PharmacyId { get; private set; }
    public Pharmacy Pharmacy { get; private set; } = default!;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; private set; } = PaymentMethod.CashOnDelivery;
    public PaymentStatus PaymentStatus { get; private set; } = PaymentStatus.Pending;
    public Address DeliveryAddress { get; private set; } = default!;
    public GeoCoordinate DeliveryLocation { get; private set; } = default!;
    public Prescription? Prescription { get; private set; }
    public DateTimeOffset? EstimatedDeliveryAtUtc { get; private set; }

    public ICollection<OrderItem> Items => _items;

    public Money Total => new(_items.Sum(i => i.Total.Amount), _items.FirstOrDefault()?.Total.Currency ?? "INR");

    private Order()
    {
    }

    public Order(Guid customerId, Guid pharmacyId, Address deliveryAddress, GeoCoordinate deliveryLocation)
    {
        CustomerId = customerId;
        PharmacyId = pharmacyId;
        DeliveryAddress = deliveryAddress;
        DeliveryLocation = deliveryLocation;
    }

    public void AddItem(Guid medicineId, string name, Money price, int quantity, bool requiresPrescription)
    {
        var existing = _items.FirstOrDefault(i => i.MedicineId == medicineId);
        if (existing != null)
        {
            existing.UpdateQuantity(existing.Quantity + quantity);
            if (requiresPrescription && !existing.RequiresPrescription)
            {
                existing.SetRequiresPrescription(true);
            }
        }
        else
        {
            _items.Add(new OrderItem(Id, medicineId, name, price, quantity, requiresPrescription));
        }

        Touch();
    }

    public void RemoveItem(Guid medicineId)
    {
        _items.RemoveAll(i => i.MedicineId == medicineId);
        Touch();
    }

    public void SetStatus(OrderStatus status)
    {
        Status = status;
        Touch();
    }

    public void SetPaymentStatus(PaymentStatus status)
    {
        PaymentStatus = status;
        Touch();
    }

    public void SetPaymentMethod(PaymentMethod method)
    {
        PaymentMethod = method;
        Touch();
    }

    public void ScheduleEstimatedDelivery(DateTimeOffset eta)
    {
        EstimatedDeliveryAtUtc = eta;
        Touch();
    }

    public void AttachPrescription(Prescription prescription)
    {
        Prescription = prescription;
        Touch();
    }

    public void UpdateDeliveryDetails(Address address, GeoCoordinate location)
    {
        DeliveryAddress = address;
        DeliveryLocation = location;
        Touch();
    }
}
