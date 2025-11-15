using System;
using System.Collections.Generic;
using Medicine.Domain.Enums;
using Medicine.Domain.ValueObjects;

namespace Medicine.Domain.Entities;

public class Pharmacy : AuditableEntity
{
    private readonly List<MedicineItem> _inventory = new();
    private readonly List<PharmacyMembership> _memberships = new();

    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = default!;
    public string Description { get; private set; } = string.Empty;
    public Address Address { get; private set; } = default!;
    public GeoCoordinate Location { get; private set; } = default!;
    public string ContactNumber { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public TenantStatus Status { get; private set; } = TenantStatus.PendingApproval;
    public bool DeliveryAvailable { get; private set; }
    public TimeOnly OpeningTime { get; private set; } = new(9, 0);
    public TimeOnly ClosingTime { get; private set; } = new(21, 0);

    public ICollection<MedicineItem> Inventory => _inventory;
    public ICollection<PharmacyMembership> Memberships => _memberships;

    private Pharmacy()
    {
    }

    public Pharmacy(Guid tenantId, string name, Address address, GeoCoordinate location, string contactNumber, string email)
    {
        TenantId = tenantId;
        Name = name;
        Address = address;
        Location = location;
        ContactNumber = contactNumber;
        Email = email;
    }

    public void Approve()
    {
        Status = TenantStatus.Active;
        Touch();
    }

    public void Reject()
    {
        Status = TenantStatus.Deactivated;
        Touch();
    }

    public void Suspend()
    {
        Status = TenantStatus.Suspended;
        Touch();
    }

    public void UpdateOperatingHours(TimeOnly opening, TimeOnly closing)
    {
        OpeningTime = opening;
        ClosingTime = closing;
        Touch();
    }

    public void UpdateDeliveryAvailability(bool enabled)
    {
        DeliveryAvailable = enabled;
        Touch();
    }

    public void UpdateProfile(string name, string description, Address address, GeoCoordinate location, string contactNumber)
    {
        Name = name;
        Description = description;
        Address = address;
        Location = location;
        ContactNumber = contactNumber;
        Touch();
    }
}
