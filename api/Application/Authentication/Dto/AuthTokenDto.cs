using Medicine.Domain.Enums;

namespace Medicine.Application.Authentication.Dto;

public sealed record AuthTokenDto(string Token, UserRole Role, string PreferredLanguage);
