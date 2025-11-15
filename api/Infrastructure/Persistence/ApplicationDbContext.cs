using System.Reflection;
using Medicine.Application.Common.Interfaces;
using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Pharmacy> Pharmacies => Set<Pharmacy>();
    public DbSet<PharmacyTenant> PharmacyTenants => Set<PharmacyTenant>();
    public DbSet<MedicineItem> MedicineItems => Set<MedicineItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<PharmacyMembership> PharmacyMemberships => Set<PharmacyMembership>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
