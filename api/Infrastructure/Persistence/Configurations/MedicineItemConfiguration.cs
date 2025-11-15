using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medicine.Infrastructure.Persistence.Configurations;

public class MedicineItemConfiguration : IEntityTypeConfiguration<MedicineItem>
{
    public void Configure(EntityTypeBuilder<MedicineItem> builder)
    {
        var entityBuilder = builder;

        entityBuilder.ToTable("MedicineItems");

        entityBuilder.HasKey(m => m.Id);

        entityBuilder.Property(m => m.Sku).IsRequired().HasMaxLength(128);
        entityBuilder.Property(m => m.Name).IsRequired().HasMaxLength(256);
        entityBuilder.Property(m => m.Description).HasMaxLength(1024);
        entityBuilder.Property(m => m.Category).HasMaxLength(128);

        entityBuilder.OwnsOne(m => m.Price, price =>
        {
            price.Property(p => p.Amount).HasColumnName("PriceAmount").HasColumnType("decimal(18,2)");
            price.Property(p => p.Currency).HasColumnName("PriceCurrency").HasMaxLength(8);
        });
    }
}
