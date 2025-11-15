using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medicine.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        var entityBuilder = builder;

        entityBuilder.ToTable("OrderItems");

        entityBuilder.HasKey(i => i.Id);

        entityBuilder.Property(i => i.MedicineName).IsRequired().HasMaxLength(256);
        entityBuilder.Property(i => i.Quantity).IsRequired();

        entityBuilder.OwnsOne(i => i.UnitPrice, price =>
        {
            price.Property(p => p.Amount).HasColumnName("UnitPriceAmount").HasColumnType("decimal(18,2)");
            price.Property(p => p.Currency).HasColumnName("UnitPriceCurrency").HasMaxLength(8);
        });
    }
}
