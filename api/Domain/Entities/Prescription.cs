using System;
using Medicine.Domain.Enums;

namespace Medicine.Domain.Entities;

public class Prescription : AuditableEntity
{
    public Guid OrderId { get; private set; }
    public Order Order { get; private set; } = default!;
    public string FileName { get; private set; } = default!;
    public string StoragePath { get; private set; } = default!;
    public PrescriptionStatus Status { get; private set; } = PrescriptionStatus.Pending;
    public string? PharmacistNotes { get; private set; }

    private Prescription()
    {
    }

    public Prescription(Guid orderId, string fileName, string storagePath)
    {
        OrderId = orderId;
        FileName = fileName;
        StoragePath = storagePath;
    }

    public void SetStatus(PrescriptionStatus status, string? notes)
    {
        Status = status;
        PharmacistNotes = notes;
        Touch();
    }
}
