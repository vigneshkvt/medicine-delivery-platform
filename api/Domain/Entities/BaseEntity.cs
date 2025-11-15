using System;

namespace Medicine.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAtUtc { get; protected set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAtUtc { get; protected set; }
    public Guid CreatedBy { get; protected set; }
    public Guid? UpdatedBy { get; protected set; }

    protected void Touch(Guid? userId = null)
    {
        UpdatedAtUtc = DateTimeOffset.UtcNow;
        if (userId.HasValue)
        {
            UpdatedBy = userId.Value;
        }
    }
}
