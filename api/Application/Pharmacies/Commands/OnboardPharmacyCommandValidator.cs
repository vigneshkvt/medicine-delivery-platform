using FluentValidation;

namespace Medicine.Application.Pharmacies.Commands;

public sealed class OnboardPharmacyCommandValidator : AbstractValidator<OnboardPharmacyCommand>
{
    public OnboardPharmacyCommandValidator()
    {
        RuleFor(c => c.OwnerUserId).NotEmpty();
        RuleFor(c => c.TenantName).NotEmpty().MaximumLength(256);
        RuleFor(c => c.LegalName).NotEmpty().MaximumLength(256);
        RuleFor(c => c.TaxRegistrationNumber).NotEmpty().MaximumLength(64);
        RuleFor(c => c.PharmacyName).NotEmpty().MaximumLength(256);
        RuleFor(c => c.Description).MaximumLength(1024);
        RuleFor(c => c.Line1).NotEmpty().MaximumLength(256);
        RuleFor(c => c.City).NotEmpty().MaximumLength(128);
        RuleFor(c => c.State).NotEmpty().MaximumLength(128);
        RuleFor(c => c.Country).NotEmpty().MaximumLength(128);
        RuleFor(c => c.PostalCode).NotEmpty().MaximumLength(32);
        RuleFor(c => c.ContactNumber).NotEmpty().MaximumLength(20);
        RuleFor(c => c.Email).NotEmpty().EmailAddress();
        RuleFor(c => c.Latitude).InclusiveBetween(-90, 90);
        RuleFor(c => c.Longitude).InclusiveBetween(-180, 180);
    }
}
