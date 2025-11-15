using System.Collections.Generic;

namespace Medicine.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(string userId, string email, string role, IDictionary<string, string>? claims = null);
}
