using System.Threading;
using System.Threading.Tasks;
using Medicine.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Pharmacy> Pharmacies { get; }
    DbSet<PharmacyTenant> PharmacyTenants { get; }
    DbSet<MedicineItem> MedicineItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<Prescription> Prescriptions { get; }
    DbSet<PharmacyMembership> PharmacyMemberships { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
