using System;
using System.Collections.Generic;
using Medicine.Domain.Enums;

namespace Medicine.Domain.Entities;

public class PharmacyTenant : AuditableEntity
{
    private readonly List<Pharmacy> _pharmacies = new();

    public string Name { get; private set; } = default!;
    public string LegalName { get; private set; } = default!;
    public string TaxRegistrationNumber { get; private set; } = default!;
    public TenantStatus Status { get; private set; } = TenantStatus.PendingApproval;

    public IReadOnlyCollection<Pharmacy> Pharmacies => _pharmacies.AsReadOnly();

    private PharmacyTenant()
    {
    }

    public PharmacyTenant(string name, string legalName, string taxRegistrationNumber)
    {
        Name = name;
        LegalName = legalName;
        TaxRegistrationNumber = taxRegistrationNumber;
    }

    public void SetStatus(TenantStatus status)
    {
        Status = status;
        Touch();
    }
}
