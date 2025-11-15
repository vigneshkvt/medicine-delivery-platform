using FluentValidation;
using Medicine.Domain.Enums;

namespace Medicine.Application.Orders.Commands;

public sealed class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(c => c.OrderId).NotEmpty();
        RuleFor(c => c.PharmacyId).NotEmpty();
        RuleFor(c => c.Status)
            .IsInEnum()
            .Must(status => status != OrderStatus.Pending)
            .WithMessage("order.status_invalid");
    }
}
