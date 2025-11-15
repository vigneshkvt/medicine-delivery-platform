using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Authentication.Dto;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Common.Models;
using Medicine.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Authentication.Commands;

public sealed record LoginCommand(string Email, string Password) : IRequest<Result<AuthTokenDto>>;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthTokenDto>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;

    public LoginCommandHandler(IApplicationDbContext dbContext, IJwtTokenService jwtTokenService, IPasswordHasher passwordHasher)
    {
        _dbContext = dbContext;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<AuthTokenDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user is null)
        {
            return Result<AuthTokenDto>.Failure("auth.invalid_credentials");
        }

        if (!user.IsActive)
        {
            return Result<AuthTokenDto>.Failure("auth.disabled");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Result<AuthTokenDto>.Failure("auth.invalid_credentials");
        }

        user.RegisterLogin();
        await _dbContext.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenService.GenerateToken(user.Id.ToString(), user.Email, user.Role.ToString(), new Dictionary<string, string>
        {
            ["preferredLanguage"] = user.PreferredLanguage
        });

        return Result<AuthTokenDto>.Success(new AuthTokenDto(token, user.Role, user.PreferredLanguage));
    }
}
