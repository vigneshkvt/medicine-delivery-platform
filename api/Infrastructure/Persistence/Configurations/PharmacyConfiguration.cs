using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medicine.Infrastructure.Persistence.Configurations;

public class PharmacyConfiguration : IEntityTypeConfiguration<Pharmacy>
{
    public void Configure(EntityTypeBuilder<Pharmacy> builder)
    {
        builder.ToTable("Pharmacies");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(256);
        builder.Property(p => p.Description).HasMaxLength(1024);
        builder.Property(p => p.ContactNumber).IsRequired().HasMaxLength(20);
        builder.Property(p => p.Email).IsRequired().HasMaxLength(256);

        builder.OwnsOne(p => p.Address, address =>
        {
            address.Property(a => a.Line1).HasColumnName("AddressLine1").HasMaxLength(256);
            address.Property(a => a.Line2).HasColumnName("AddressLine2").HasMaxLength(256);
            address.Property(a => a.City).HasColumnName("City").HasMaxLength(128);
            address.Property(a => a.State).HasColumnName("State").HasMaxLength(128);
            address.Property(a => a.Country).HasColumnName("Country").HasMaxLength(128);
            address.Property(a => a.PostalCode).HasColumnName("PostalCode").HasMaxLength(32);
        });

        builder.OwnsOne(p => p.Location, location =>
        {
            location.Property(l => l.Latitude).HasColumnName("Latitude").HasColumnType("decimal(9,6)");
            location.Property(l => l.Longitude).HasColumnName("Longitude").HasColumnType("decimal(9,6)");
        });

        builder.HasMany(p => p.Inventory)
            .WithOne(i => i.Pharmacy)
            .HasForeignKey(i => i.PharmacyId);

        builder.HasMany(p => p.Memberships)
            .WithOne(m => m.Pharmacy)
            .HasForeignKey(m => m.PharmacyId);
    }
}
