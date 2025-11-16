using FluentValidation;
using Medicine.Domain.Enums;

namespace Medicine.Application.Authentication.Commands;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(r => r.Email).NotEmpty().EmailAddress();
        RuleFor(r => r.Password).NotEmpty().MinimumLength(6);
        RuleFor(r => r.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(r => r.LastName).NotEmpty().MaximumLength(100);
        RuleFor(r => r.PreferredLanguage).NotEmpty().Matches("^(en|ta)$").WithMessage("auth.language_not_supported");
        RuleFor(r => r.Role)
            .Must(role => role == UserRole.Customer || role == UserRole.Pharmacist)
            .WithMessage("auth.role_not_supported");
    }
}
