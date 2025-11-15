using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Api.Contracts.Common;
using Medicine.Api.Contracts.Orders;
using Medicine.Application.Orders.Commands.CreateOrder;
using Medicine.Application.Orders.Commands;
using Medicine.Application.Orders.Dto;
using Medicine.Application.Orders.Queries;
using Medicine.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Medicine.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public sealed class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(IReadOnlyCollection<OrderDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyOrders()
    {
        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(subject, out var customerId))
        {
            return Unauthorized(new ErrorResponse(new[] { "auth.unauthorized" }));
        }

        var orders = await _mediator.Send(new GetCustomerOrdersQuery(customerId));
        return Ok(orders);
    }

    [HttpGet("pharmacy/{pharmacyId:guid}")]
    [Authorize(Roles = "Pharmacist,Admin")]
    [ProducesResponseType(typeof(IReadOnlyCollection<OrderDetailDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPharmacyOrders(Guid pharmacyId, [FromQuery] string? status)
    {
        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(subject, out var requesterId))
        {
            return Unauthorized(new ErrorResponse(new[] { "auth.unauthorized" }));
        }

        OrderStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
        {
            statusFilter = parsedStatus;
        }

        var queryRequesterId = User.IsInRole("Admin") ? Guid.Empty : requesterId;
        var orders = await _mediator.Send(new GetPharmacyOrdersQuery(queryRequesterId, pharmacyId, statusFilter));
        return Ok(orders);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(CreateOrderResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromForm] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(subject, out var customerId))
        {
            return Unauthorized(new ErrorResponse(new[] { "auth.unauthorized" }));
        }

        var paymentMethod = Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var parsedPayment)
            ? parsedPayment
            : PaymentMethod.CashOnDelivery;

        var items = request.Items.Select(i => new CreateOrderItemInput(i.MedicineId, i.Quantity)).ToList();

        UploadedPrescriptionInput? prescription = null;
        if (request.Prescription is not null)
        {
            await using var memoryStream = new MemoryStream();
            await request.Prescription.CopyToAsync(memoryStream, cancellationToken);
            prescription = new UploadedPrescriptionInput(request.Prescription.FileName, memoryStream.ToArray(), request.Prescription.ContentType);
        }

        var command = new CreateOrderCommand(
            customerId,
            request.PharmacyId,
            request.DeliveryLine1,
            request.DeliveryLine2,
            request.City,
            request.State,
            request.Country,
            request.PostalCode,
            request.Latitude,
            request.Longitude,
            paymentMethod,
            items,
            prescription);

        var result = await _mediator.Send(command, cancellationToken);

        if (!result.Succeeded || result.Data is null)
        {
            var errors = result.Errors.Any()
                ? result.Errors.ToArray()
                : new[] { "order.unexpected_error" };
            return BadRequest(new ErrorResponse(errors));
        }

        var response = new CreateOrderResponse(
            result.Data.OrderId,
            result.Data.OrderNumber,
            result.Data.TotalAmount,
            result.Data.Currency,
            result.Data.PaymentMethod.ToString(),
            result.Data.PaymentStatus.ToString(),
            result.Data.Status.ToString());

        return Created($"/api/orders/{response.OrderId}", response);
    }

    [HttpPatch("{orderId:guid}/status")]
    [Authorize(Roles = "Pharmacist,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(Guid orderId, [FromQuery] Guid pharmacyId, [FromBody] UpdateOrderStatusRequest request)
    {
        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(subject, out var userId))
        {
            return Unauthorized(new ErrorResponse(new[] { "auth.unauthorized" }));
        }
        if (!Enum.TryParse<OrderStatus>(request.Status, true, out var status))
        {
            return BadRequest(new ErrorResponse(new[] { "order.status_invalid" }));
        }

        if (pharmacyId == Guid.Empty)
        {
            return BadRequest(new ErrorResponse(new[] { "order.pharmacy_required" }));
        }

        var command = new UpdateOrderStatusCommand(orderId, pharmacyId, User.IsInRole("Admin") ? Guid.Empty : userId, status, request.EstimatedDeliveryAtUtc);
        var result = await _mediator.Send(command);
        return result.Succeeded ? NoContent() : BadRequest(new ErrorResponse(result.Errors.Any() ? result.Errors.ToArray() : new[] { "order.update_failed" }));
    }

    [HttpPost("{orderId:guid}/prescription/review")]
    [Authorize(Roles = "Pharmacist,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReviewPrescription(Guid orderId, [FromQuery] Guid pharmacyId, [FromBody] ReviewPrescriptionRequest request)
    {
        var subject = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(subject, out var userId))
        {
            return Unauthorized(new ErrorResponse(new[] { "auth.unauthorized" }));
        }
        if (pharmacyId == Guid.Empty)
        {
            return BadRequest(new ErrorResponse(new[] { "order.pharmacy_required" }));
        }

        if (!Enum.TryParse<PrescriptionStatus>(request.Status, true, out var status))
        {
            return BadRequest(new ErrorResponse(new[] { "order.prescription_status_invalid" }));
        }

        var command = new ReviewPrescriptionCommand(orderId, pharmacyId, User.IsInRole("Admin") ? Guid.Empty : userId, status, request.Notes);
        var result = await _mediator.Send(command);
        return result.Succeeded ? NoContent() : BadRequest(new ErrorResponse(result.Errors.Any() ? result.Errors.ToArray() : new[] { "order.prescription_review_failed" }));
    }
}
