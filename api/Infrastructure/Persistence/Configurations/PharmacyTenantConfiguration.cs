using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medicine.Infrastructure.Persistence.Configurations;

public class PharmacyTenantConfiguration : IEntityTypeConfiguration<PharmacyTenant>
{
    public void Configure(EntityTypeBuilder<PharmacyTenant> builder)
    {
        builder.ToTable("PharmacyTenants");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name).IsRequired().HasMaxLength(256);
        builder.Property(t => t.LegalName).IsRequired().HasMaxLength(256);
        builder.Property(t => t.TaxRegistrationNumber).IsRequired().HasMaxLength(64);
    }
}
