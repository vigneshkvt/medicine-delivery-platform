using System.Collections.Generic;
using Medicine.Api.Contracts.Compliance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Medicine.Api.Controllers;

[ApiController]
[Route("api/policies")]
public sealed class PoliciesController : ControllerBase
{
    [HttpGet("ogd-compliance")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(OgdComplianceResponse), StatusCodes.Status200OK)]
    public ActionResult<OgdComplianceResponse> GetOgdComplianceGuidance()
    {
        var response = new OgdComplianceResponse
        {
            Jurisdiction = "India",
            Summary = "Operational checklist for responsibly consuming Open Government Data (OGD) pharmaceutical datasets in an e-pharmacy workflow.",
            Phases = new List<OgdCompliancePhase>
            {
                new()
                {
                    Name = "Technical Implementation & Data Acquisition",
                    Objective = "Ingest and operationalise authoritative OGD medicine catalogs within customer- and pharmacist-facing flows.",
                    RequiredActions = new List<string>
                    {
                        "Register an API key on data.gov.in and configure secure storage for the credential.",
                        "Automate ingestion and reconciliation of medicine master datasets (name, composition, MRP) into the application catalog with periodic syncs.",
                        "Expose medicine search, detail, and prescription-upload features in the customer application before checkout.",
                        "Provide a pharmacist operations portal that surfaces every uploaded prescription alongside the requested medicine list for manual review."
                    }
                },
                new()
                {
                    Name = "Legal Framework & Compliance Integration",
                    Objective = "Embed CDSCO/Drugs and Cosmetics Act obligations directly in onboarding, verification, and fulfilment journeys.",
                    RequiredActions = new List<string>
                    {
                        "Verify and archive each partner pharmacy's Form 20/21 retail and wholesale drug licences prior to making them discoverable.",
                        "Require a registered pharmacist to digitally sign off on every prescription order before dispatch, leaving an immutable audit log.",
                        "Generate GST-compliant invoices that reference the dispensing pharmacy's licence and registration numbers for every order.",
                        "Publish precise terms of service and privacy notices clarifying the platform's intermediary role and data handling practices."
                    }
                }
            }
        };

        return Ok(response);
    }
}
