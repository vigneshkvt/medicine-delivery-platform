using System;
using Medicine.Domain.ValueObjects;

namespace Medicine.Domain.Entities;

public class OrderItem : AuditableEntity
{
    public Guid OrderId { get; private set; }
    public Order Order { get; private set; } = default!;
    public Guid MedicineId { get; private set; }
    public string MedicineName { get; private set; } = default!;
    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public Money Total => new(UnitPrice.Amount * Quantity, UnitPrice.Currency);
    public bool RequiresPrescription { get; private set; }

    private OrderItem()
    {
    }

    public OrderItem(Guid orderId, Guid medicineId, string medicineName, Money unitPrice, int quantity, bool requiresPrescription)
    {
        OrderId = orderId;
        MedicineId = medicineId;
        MedicineName = medicineName;
        UnitPrice = unitPrice;
        Quantity = quantity;
        RequiresPrescription = requiresPrescription;
    }

    public void UpdateQuantity(int quantity)
    {
        Quantity = quantity;
        Touch();
    }

    public void UpdateUnitPrice(Money price)
    {
        UnitPrice = price;
        Touch();
    }

    public void SetRequiresPrescription(bool requiresPrescription)
    {
        RequiresPrescription = requiresPrescription;
        Touch();
    }
}
