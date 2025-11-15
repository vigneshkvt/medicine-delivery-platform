using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medicine.Infrastructure.Persistence.Configurations;

public class PharmacyMembershipConfiguration : IEntityTypeConfiguration<PharmacyMembership>
{
    public void Configure(EntityTypeBuilder<PharmacyMembership> builder)
    {
        builder.ToTable("PharmacyMemberships");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Role).IsRequired();
    }
}
