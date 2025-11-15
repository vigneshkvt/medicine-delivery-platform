using System;

namespace Medicine.Domain.Entities;

public abstract class AuditableEntity : BaseEntity
{
    public string? ConcurrencyStamp { get; private set; } = Guid.NewGuid().ToString();

    public void RefreshConcurrencyStamp()
    {
        ConcurrencyStamp = Guid.NewGuid().ToString();
        Touch();
    }
}
