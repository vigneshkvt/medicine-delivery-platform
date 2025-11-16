using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Medicine.Api.Contracts.Common;
using Medicine.Api.Contracts.Medicines;
using Medicine.Application.Medicines.Dto;
using Medicine.Application.Medicines.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Medicine.Api.Controllers;

[ApiController]
[Route("api/medicines")]
public sealed class MedicinesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;

    public MedicinesController(IMediator mediator, IMapper mapper)
    {
        _mediator = mediator;
        _mapper = mapper;
    }

    [HttpGet("search")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyCollection<MedicineCatalogItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyCollection<MedicineCatalogItemResponse>>> Search([FromQuery] string query, [FromQuery] int limit = 25)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
        {
            return BadRequest(new ErrorResponse(new[] { "medicines.query_too_short" }));
        }

        var boundedLimit = limit <= 0 ? 25 : limit > 100 ? 100 : limit;

        var results = await _mediator.Send(new SearchMedicinesQuery(query.Trim(), boundedLimit));
        var response = results.Select(_mapper.Map<MedicineCatalogItemResponse>).ToArray();
        return Ok(response);
    }
}
