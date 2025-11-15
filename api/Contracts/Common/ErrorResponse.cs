using System.Collections.Generic;

namespace Medicine.Api.Contracts.Common;

public sealed record ErrorResponse(IReadOnlyCollection<string> Errors);
