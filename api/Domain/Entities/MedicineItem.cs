using System;
using Medicine.Domain.ValueObjects;

namespace Medicine.Domain.Entities;

public class MedicineItem : AuditableEntity
{
    public Guid PharmacyId { get; private set; }
    public Pharmacy Pharmacy { get; private set; } = default!;
    public string Sku { get; private set; } = default!;
    public string Name { get; private set; } = default!;
    public string Description { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public Money Price { get; private set; } = Money.Zero("INR");
    public int StockQuantity { get; private set; }
    public bool RequiresPrescription { get; private set; }
    public DateTimeOffset? ExpiryDateUtc { get; private set; }

    private MedicineItem()
    {
    }

    public MedicineItem(Guid pharmacyId, string sku, string name, Money price, int stockQuantity, bool requiresPrescription)
    {
        PharmacyId = pharmacyId;
        Sku = sku;
        Name = name;
        Price = price;
        StockQuantity = stockQuantity;
        RequiresPrescription = requiresPrescription;
    }

    public void UpdateDetails(string name, string description, string category, Money price, bool requiresPrescription)
    {
        Name = name;
        Description = description;
        Category = category;
        Price = price;
        RequiresPrescription = requiresPrescription;
        Touch();
    }

    public void AdjustStock(int delta)
    {
        StockQuantity += delta;
        Touch();
    }

    public void SetExpiry(DateTimeOffset? expiryDateUtc)
    {
        ExpiryDateUtc = expiryDateUtc;
        Touch();
    }
}
