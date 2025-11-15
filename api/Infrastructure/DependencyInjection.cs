using System;
using Medicine.Application.Common.Interfaces;
using Medicine.Infrastructure.Identity;
using Medicine.Infrastructure.Persistence;
using Medicine.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Medicine.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            var useInMemory = configuration.GetValue<bool>("UseInMemoryDatabase");

            if (useInMemory)
            {
                options.UseInMemoryDatabase("MedicineDb");
            }
            else
            {
                var connectionString = configuration.GetConnectionString("DefaultConnection")
                    ?? throw new InvalidOperationException("DefaultConnection is not configured.");
                options.UseSqlServer(connectionString);
            }
        });

        services.AddLocalization(options => options.ResourcesPath = "Resources");

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IDateTimeProvider, SystemDateTimeProvider>();
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IStorageService, LocalStorageService>();
        services.AddScoped<IEmailService, ConsoleEmailService>();
        services.AddScoped<ILocalizationService, ResourceLocalizationService>();

        return services;
    }
}
