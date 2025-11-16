using System;
using Medicine.Application.Common.Interfaces;
using Medicine.Infrastructure.Identity;
using Medicine.Infrastructure.Persistence;
using Medicine.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Medicine.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
        services.Configure<OgdCatalogOptions>(configuration.GetSection("OgdCatalog"));

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

        services.AddHttpClient<IMedicineCatalogService, OgdMedicineCatalogService>((provider, client) =>
        {
            var optionsAccessor = provider.GetRequiredService<IOptions<OgdCatalogOptions>>();
            var ogdOptions = optionsAccessor.Value;
            if (!string.IsNullOrWhiteSpace(ogdOptions.BaseUrl))
            {
                client.BaseAddress = new Uri(ogdOptions.BaseUrl.TrimEnd('/') + "/");
            }

            if (ogdOptions.TimeoutSeconds > 0)
            {
                client.Timeout = TimeSpan.FromSeconds(ogdOptions.TimeoutSeconds);
            }
        });

        return services;
    }
}
