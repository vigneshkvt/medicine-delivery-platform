using System;
using System.Collections.Generic;
using Medicine.Domain.Enums;

namespace Medicine.Domain.Entities;

public class User : AuditableEntity
{
    private readonly List<Order> _orders = new();
    private readonly List<PharmacyMembership> _memberships = new();

    public string Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public UserRole Role { get; private set; } = UserRole.Customer;
    public string PreferredLanguage { get; private set; } = "en";
    public bool IsActive { get; private set; } = true;
    public DateTimeOffset? LastLoginAtUtc { get; private set; }
    public ICollection<Order> Orders => _orders;
    public ICollection<PharmacyMembership> Memberships => _memberships;

    private User()
    {
    }

    public User(string email, string passwordHash, string firstName, string lastName, UserRole role, string preferredLanguage)
    {
        Email = email;
        PasswordHash = passwordHash;
        FirstName = firstName;
        LastName = lastName;
        Role = role;
        PreferredLanguage = preferredLanguage;
    }

    public void UpdateProfile(string firstName, string lastName, string preferredLanguage)
    {
        FirstName = firstName;
        LastName = lastName;
        PreferredLanguage = preferredLanguage;
        Touch();
    }

    public void SetPasswordHash(string hash)
    {
        PasswordHash = hash;
        Touch();
    }

    public void RegisterLogin()
    {
        LastLoginAtUtc = DateTimeOffset.UtcNow;
        Touch();
    }

    public void Deactivate()
    {
        IsActive = false;
        Touch();
    }

    public void Activate()
    {
        IsActive = true;
        Touch();
    }
}
