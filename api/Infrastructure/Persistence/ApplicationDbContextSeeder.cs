using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Medicine.Domain.Entities;
using Medicine.Domain.Enums;
using Medicine.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Medicine.Infrastructure.Persistence;

public static class ApplicationDbContextSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync();
        }
        else
        {
            await context.Database.EnsureCreatedAsync();
        }

        if (await context.Users.AnyAsync())
        {
            return;
        }

        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var pharmacistPasswordHash = BCrypt.Net.BCrypt.HashPassword("Pharma@123");
        var customerPasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123");

        var adminUser = new User(
            email: "admin@medicloud.local",
            passwordHash: adminPasswordHash,
            firstName: "Admin",
            lastName: "User",
            role: UserRole.Admin,
            preferredLanguage: "en");

        var pharmacistUser = new User(
            email: "pharmacist@medicloud.local",
            passwordHash: pharmacistPasswordHash,
            firstName: "Pharma",
            lastName: "Lead",
            role: UserRole.Pharmacist,
            preferredLanguage: "en");

        var customerUser = new User(
            email: "customer@medicloud.local",
            passwordHash: customerPasswordHash,
            firstName: "John",
            lastName: "Doe",
            role: UserRole.Customer,
            preferredLanguage: "en");

        var tenant = new PharmacyTenant("MediCloud Pharmacy", "MediCloud Pvt Ltd", "GSTIN12345");
        tenant.SetStatus(TenantStatus.Active);

        var pharmacy = new Pharmacy(
            tenant.Id,
            "MediCloud - Chennai Central",
            new Address("12 Anna Salai", null, "Chennai", "Tamil Nadu", "India", "600002"),
            GeoCoordinate.From(13.0827, 80.2707),
            "+91-44-1234-5678",
            "central@medicloud.local");
        pharmacy.Approve();
        pharmacy.UpdateDeliveryAvailability(true);

        var paracetamol = new MedicineItem(pharmacy.Id, "MED-0001", "Paracetamol 500mg", new Money(35m, "INR"), 120, false);
        paracetamol.UpdateDetails("Paracetamol 500mg", "Fever reducer and pain reliever", "Analgesics", new Money(35m, "INR"), false);

        var insulin = new MedicineItem(pharmacy.Id, "MED-0002", "Human Insulin", new Money(520m, "INR"), 40, true);
        insulin.UpdateDetails("Human Insulin", "Essential insulin for diabetes", "Endocrinology", new Money(520m, "INR"), true);

        var membership = new PharmacyMembership(pharmacy.Id, pharmacistUser.Id, UserRole.Pharmacist);

        pharmacy.Inventory.Add(paracetamol);
        pharmacy.Inventory.Add(insulin);
        pharmacy.Memberships.Add(membership);

        context.PharmacyTenants.Add(tenant);
        context.Pharmacies.Add(pharmacy);
        context.Users.AddRange(adminUser, pharmacistUser, customerUser);

        await context.SaveChangesAsync();

        logger.LogInformation("Seeded default data for environment");
    }
}
