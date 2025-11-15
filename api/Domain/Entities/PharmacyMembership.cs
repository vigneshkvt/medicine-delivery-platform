using System;
using Medicine.Domain.Enums;

namespace Medicine.Domain.Entities;

public class PharmacyMembership : AuditableEntity
{
    public Guid PharmacyId { get; private set; }
    public Pharmacy Pharmacy { get; private set; } = default!;
    public Guid UserId { get; private set; }
    public User User { get; private set; } = default!;
    public UserRole Role { get; private set; } = UserRole.Pharmacist;

    private PharmacyMembership()
    {
    }

    public PharmacyMembership(Guid pharmacyId, Guid userId, UserRole role)
    {
        PharmacyId = pharmacyId;
        UserId = userId;
        Role = role;
    }

    public void UpdateRole(UserRole role)
    {
        Role = role;
        Touch();
    }
}
