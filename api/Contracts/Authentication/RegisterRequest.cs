using System.ComponentModel.DataAnnotations;

namespace Medicine.Api.Contracts.Authentication;

public sealed class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; init; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; init; } = string.Empty;

    [Required]
    [RegularExpression("en|ta", ErrorMessage = "auth.language_not_supported")]
    public string PreferredLanguage { get; init; } = "en";
}
