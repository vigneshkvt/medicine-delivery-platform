using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Medicine.Infrastructure.Services;

public sealed class LocalStorageService : IStorageService
{
    private readonly string _basePath;

    public LocalStorageService(IConfiguration configuration)
    {
        _basePath = configuration.GetValue<string>("Storage:BasePath") ?? Path.Combine(AppContext.BaseDirectory, "storage");
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> UploadAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        var directoryPath = Path.Combine(_basePath, folder);
        Directory.CreateDirectory(directoryPath);

        var safeFileName = Path.GetFileName(fileName);
        var fullPath = Path.Combine(directoryPath, $"{Guid.NewGuid()}_{safeFileName}");

        await using var fileStream = File.Create(fullPath);
        await content.CopyToAsync(fileStream, cancellationToken);

        return fullPath;
    }
}
