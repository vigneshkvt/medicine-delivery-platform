using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medicine.Infrastructure.Persistence.Configurations;

public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
{
    public void Configure(EntityTypeBuilder<Prescription> builder)
    {
        builder.ToTable("Prescriptions");

        builder.HasKey(p => p.Id);

        builder.HasIndex(p => p.OrderId).IsUnique();

        builder.Property(p => p.FileName).IsRequired().HasMaxLength(256);
        builder.Property(p => p.StoragePath).IsRequired().HasMaxLength(512);
        builder.Property(p => p.Status).IsRequired();
        builder.Property(p => p.PharmacistNotes).HasMaxLength(1024);
    }
}
