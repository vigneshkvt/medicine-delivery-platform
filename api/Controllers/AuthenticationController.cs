using System.Linq;
using System.Threading.Tasks;
using Medicine.Api.Contracts.Authentication;
using Medicine.Api.Contracts.Common;
using Medicine.Application.Authentication.Commands;
using Medicine.Application.Authentication.Dto;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Medicine.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthenticationController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthenticationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthTokenDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthTokenDto>> Register([FromBody] RegisterRequest request)
    {
        var result = await _mediator.Send(new RegisterCommand(request.Email, request.Password, request.FirstName, request.LastName, request.PreferredLanguage));

        if (!result.Succeeded)
        {
            return BadRequest(new ErrorResponse(result.Errors.ToArray()));
        }

        return Created("/api/auth/me", result.Data!);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthTokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status423Locked)]
    public async Task<ActionResult<AuthTokenDto>> Login([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(new LoginCommand(request.Email, request.Password));

        if (!result.Succeeded)
        {
            var errors = result.Errors.ToArray();

            if (errors.Contains("auth.invalid_credentials"))
            {
                return Unauthorized(new ErrorResponse(errors));
            }

            if (errors.Contains("auth.disabled"))
            {
                return StatusCode(StatusCodes.Status423Locked, new ErrorResponse(errors));
            }

            return BadRequest(new ErrorResponse(errors));
        }

        if (result.Data is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse(new[] { "auth.unexpected_error" }));
        }

        return Ok(result.Data);
    }
}
