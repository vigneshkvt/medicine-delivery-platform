using FluentValidation;

namespace Medicine.Application.Orders.Commands;

public sealed class ReviewPrescriptionCommandValidator : AbstractValidator<ReviewPrescriptionCommand>
{
    public ReviewPrescriptionCommandValidator()
    {
        RuleFor(c => c.OrderId).NotEmpty();
        RuleFor(c => c.PharmacyId).NotEmpty();
        RuleFor(c => c.Status).IsInEnum();
        RuleFor(c => c.Notes).MaximumLength(512);
    }
}
