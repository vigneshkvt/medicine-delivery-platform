using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Medicine.Api.Contracts.Common;
using Medicine.Api.Contracts.Pharmacies;
using Medicine.Application.Common.Models;
using Medicine.Application.Pharmacies.Commands;
using Medicine.Application.Pharmacies.Dto;
using Medicine.Application.Pharmacies.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Medicine.Api.Controllers;

[ApiController]
[Route("api/pharmacies")]
public sealed class PharmaciesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMemoryCache _memoryCache;

    public PharmaciesController(IMediator mediator, IMemoryCache memoryCache)
    {
        _mediator = mediator;
        _memoryCache = memoryCache;
    }

    [HttpGet("nearby")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyCollection<PharmacyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<PharmacyDto>>> GetNearby([FromQuery] NearbyPharmaciesRequest request)
    {
        var radius = request.RadiusInKm <= 0 ? 5 : request.RadiusInKm;
        var cacheKey = $"nearby::{request.Latitude:F4}:{request.Longitude:F4}:{radius:F0}";
        if (!_memoryCache.TryGetValue(cacheKey, out IReadOnlyCollection<PharmacyDto>? pharmacies))
        {
            var query = new GetNearbyPharmaciesQuery(request.Latitude, request.Longitude, radius);
            pharmacies = await _mediator.Send(query);

            var cacheEntryOptions = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(2));
            _memoryCache.Set(cacheKey, pharmacies, cacheEntryOptions);
        }

        return Ok(pharmacies);
    }

    [HttpGet("mine")]
    [Authorize(Roles = "Pharmacist,Admin")]
    [ProducesResponseType(typeof(IReadOnlyCollection<PharmacyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<PharmacyDto>>> GetManagedPharmacies()
    {
        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(subject, out var userId))
        {
            return Unauthorized(new ErrorResponse(new[] { "auth.unauthorized" }));
        }

        var query = new GetManagedPharmaciesQuery(User.IsInRole("Admin") ? Guid.Empty : userId);
        var pharmacies = await _mediator.Send(query);
        return Ok(pharmacies);
    }

    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(IReadOnlyCollection<PharmacyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<PharmacyDto>>> GetPendingPharmacies()
    {
        var pharmacies = await _mediator.Send(new GetPendingPharmaciesQuery());
        return Ok(pharmacies);
    }

    [HttpGet("{pharmacyId:guid}/inventory")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyCollection<MedicineItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyCollection<MedicineItemDto>>> GetInventory(Guid pharmacyId)
    {
        var items = await _mediator.Send(new GetPharmacyInventoryQuery(pharmacyId));
        if (items.Count == 0)
        {
            return NotFound(new ErrorResponse(new[] { "pharmacy.inventory_empty" }));
        }

        return Ok(items);
    }

    [HttpPost("onboard")]
    [Authorize(Roles = "Pharmacist,Admin")]
    [ProducesResponseType(typeof(PharmacyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Onboard([FromBody] OnboardPharmacyRequest request)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var ownerId))
        {
            return Unauthorized(new ErrorResponse(new[] { "auth.unauthorized" }));
        }

        var command = new OnboardPharmacyCommand(
            ownerId,
            request.TenantName,
            request.LegalName,
            request.TaxRegistrationNumber,
            request.PharmacyName,
            request.Description,
            request.Line1,
            request.Line2,
            request.City,
            request.State,
            request.Country,
            request.PostalCode,
            request.Latitude,
            request.Longitude,
            request.ContactNumber,
            request.Email);

        var result = await _mediator.Send(command);

        return result.Succeeded
            ? Created($"/api/pharmacies/{result.Data!.Id}", result.Data)
            : BadRequest(new ErrorResponse(result.Errors.Any() ? result.Errors.ToArray() : new[] { "pharmacy.onboard_failed" }));
    }

    [HttpPost("{pharmacyId:guid}/approve")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve(Guid pharmacyId)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var adminId))
        {
            return Unauthorized(new ErrorResponse(new[] { "auth.unauthorized" }));
        }

        var result = await _mediator.Send(new ApprovePharmacyCommand(pharmacyId, adminId));
        return result.Succeeded ? NoContent() : BadRequest(new ErrorResponse(result.Errors.Any() ? result.Errors.ToArray() : new[] { "pharmacy.approval_failed" }));
    }
}
