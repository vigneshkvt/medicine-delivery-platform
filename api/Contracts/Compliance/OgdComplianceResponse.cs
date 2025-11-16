using System.Collections.Generic;

namespace Medicine.Api.Contracts.Compliance;

public sealed record OgdComplianceResponse
{
    public required string Jurisdiction { get; init; }
    public required string Summary { get; init; }
    public required IReadOnlyCollection<OgdCompliancePhase> Phases { get; init; }
}

public sealed record OgdCompliancePhase
{
    public required string Name { get; init; }
    public required string Objective { get; init; }
    public required IReadOnlyCollection<string> RequiredActions { get; init; }
}
