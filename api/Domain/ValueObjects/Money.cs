using System.Globalization;

namespace Medicine.Domain.ValueObjects;

public sealed record Money(decimal Amount, string Currency)
{
    public override string ToString()
    {
        return string.Format(CultureInfo.InvariantCulture, "{0} {1:N2}", Currency, Amount);
    }

    public static Money Zero(string currency) => new(0m, currency);
}
