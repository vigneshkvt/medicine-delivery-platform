using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Medicine.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber).IsRequired();
        builder.Property(o => o.Status).IsRequired();
        builder.Property(o => o.PaymentMethod).IsRequired();
        builder.Property(o => o.PaymentStatus).IsRequired();

        builder.OwnsOne(o => o.DeliveryAddress, address =>
        {
            address.Property(a => a.Line1).HasColumnName("DeliveryAddressLine1").HasMaxLength(256);
            address.Property(a => a.Line2).HasColumnName("DeliveryAddressLine2").HasMaxLength(256);
            address.Property(a => a.City).HasColumnName("DeliveryCity").HasMaxLength(128);
            address.Property(a => a.State).HasColumnName("DeliveryState").HasMaxLength(128);
            address.Property(a => a.Country).HasColumnName("DeliveryCountry").HasMaxLength(128);
            address.Property(a => a.PostalCode).HasColumnName("DeliveryPostalCode").HasMaxLength(32);
        });

        builder.OwnsOne(o => o.DeliveryLocation, location =>
        {
            location.Property(l => l.Latitude).HasColumnName("DeliveryLatitude").HasColumnType("decimal(9,6)");
            location.Property(l => l.Longitude).HasColumnName("DeliveryLongitude").HasColumnType("decimal(9,6)");
        });

        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId);

        builder.HasOne(o => o.Prescription)
            .WithOne(p => p.Order)
            .HasForeignKey<Prescription>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
