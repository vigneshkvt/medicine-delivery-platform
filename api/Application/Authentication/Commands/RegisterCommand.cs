using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Authentication.Dto;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Common.Models;
using Medicine.Domain.Entities;
using Medicine.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Authentication.Commands;

public sealed record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string PreferredLanguage,
    UserRole Role
) : IRequest<Result<AuthTokenDto>>;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthTokenDto>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public RegisterCommandHandler(IApplicationDbContext dbContext, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<Result<AuthTokenDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await _dbContext.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (existingUser)
        {
            return Result<AuthTokenDto>.Failure("auth.email_exists");
        }

        var hashedPassword = _passwordHasher.Hash(request.Password);
        var effectiveRole = request.Role == UserRole.Pharmacist ? UserRole.Pharmacist : UserRole.Customer;
        var user = new User(normalizedEmail, hashedPassword, request.FirstName.Trim(), request.LastName.Trim(), effectiveRole, request.PreferredLanguage);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenService.GenerateToken(user.Id.ToString(), user.Email, user.Role.ToString(), new Dictionary<string, string>
        {
            ["preferredLanguage"] = user.PreferredLanguage
        });

        return Result<AuthTokenDto>.Success(new AuthTokenDto(token, user.Role, user.PreferredLanguage));
    }
}
