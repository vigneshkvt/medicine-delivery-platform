using System;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Medicine.Infrastructure.Services;

public sealed class ConsoleEmailService : IEmailService
{
    private readonly ILogger<ConsoleEmailService> _logger;

    public ConsoleEmailService(ILogger<ConsoleEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email queued. To: {Recipient}, Subject: {Subject}. Body preview: {Preview}", to, subject, body[..Math.Min(body.Length, 200)]);
        return Task.CompletedTask;
    }
}
