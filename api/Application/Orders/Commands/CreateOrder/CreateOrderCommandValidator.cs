using System.Linq;
using FluentValidation;
using Medicine.Domain.Enums;

namespace Medicine.Application.Orders.Commands.CreateOrder;

public sealed class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(c => c.CustomerId).NotEmpty();
        RuleFor(c => c.PharmacyId).NotEmpty();
        RuleFor(c => c.DeliveryLine1).NotEmpty().MaximumLength(256);
        RuleFor(c => c.City).NotEmpty().MaximumLength(128);
        RuleFor(c => c.State).NotEmpty().MaximumLength(128);
        RuleFor(c => c.Country).NotEmpty().MaximumLength(128);
        RuleFor(c => c.PostalCode).NotEmpty().MaximumLength(32);
        RuleFor(c => c.Latitude).InclusiveBetween(-90, 90);
        RuleFor(c => c.Longitude).InclusiveBetween(-180, 180);
        RuleFor(c => c.Items)
            .NotEmpty()
            .WithMessage("order.item_required")
            .Must(items => items.All(i => i.Quantity > 0))
            .WithMessage("order.invalid_quantity");
        RuleFor(c => c.PaymentMethod)
            .Equal(PaymentMethod.CashOnDelivery)
            .WithMessage("order.payment_method_not_supported");
    }
}
