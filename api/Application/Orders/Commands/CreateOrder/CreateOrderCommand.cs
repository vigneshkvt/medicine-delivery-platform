using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Common.Models;
using Medicine.Application.Orders.Dto;
using Medicine.Domain.Entities;
using Medicine.Domain.Enums;
using Medicine.Domain.ValueObjects;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Medicine.Application.Orders.Commands.CreateOrder;

public sealed record CreateOrderCommand(
    Guid CustomerId,
    Guid PharmacyId,
    string DeliveryLine1,
    string? DeliveryLine2,
    string City,
    string State,
    string Country,
    string PostalCode,
    double Latitude,
    double Longitude,
    PaymentMethod PaymentMethod,
    IReadOnlyCollection<CreateOrderItemInput> Items,
    UploadedPrescriptionInput? Prescription
) : IRequest<Result<OrderSummaryDto>>;

public sealed record CreateOrderItemInput(Guid MedicineId, int Quantity);

public sealed record UploadedPrescriptionInput(string FileName, byte[] Content, string? ContentType = null);

public sealed class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<OrderSummaryDto>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IStorageService _storageService;

    public CreateOrderCommandHandler(IApplicationDbContext dbContext, IStorageService storageService)
    {
        _dbContext = dbContext;
        _storageService = storageService;
    }

    public async Task<Result<OrderSummaryDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        if (request.PaymentMethod != PaymentMethod.CashOnDelivery)
        {
            return Result<OrderSummaryDto>.Failure("order.payment_method_not_supported");
        }

        var pharmacy = await _dbContext.Pharmacies
            .Include(p => p.Inventory)
            .SingleOrDefaultAsync(p => p.Id == request.PharmacyId, cancellationToken);

        if (pharmacy is null || pharmacy.Status != TenantStatus.Active)
        {
            return Result<OrderSummaryDto>.Failure("order.pharmacy_unavailable");
        }

        if (request.Items.Count == 0)
        {
            return Result<OrderSummaryDto>.Failure("order.no_items");
        }

        var itemIds = request.Items.Select(i => i.MedicineId).ToHashSet();
        var inventoryItems = pharmacy.Inventory
            .Where(i => itemIds.Contains(i.Id))
            .ToDictionary(i => i.Id, i => i);

        if (inventoryItems.Count != itemIds.Count)
        {
            return Result<OrderSummaryDto>.Failure("order.invalid_items");
        }

        var requiresPrescription = false;
        foreach (var item in request.Items)
        {
            var inventoryItem = inventoryItems[item.MedicineId];

            if (item.Quantity <= 0)
            {
                return Result<OrderSummaryDto>.Failure("order.invalid_quantity");
            }

            if (inventoryItem.StockQuantity < item.Quantity)
            {
                return Result<OrderSummaryDto>.Failure("order.insufficient_stock");
            }

            if (inventoryItem.RequiresPrescription)
            {
                requiresPrescription = true;
            }
        }

        if (requiresPrescription && request.Prescription is null)
        {
            return Result<OrderSummaryDto>.Failure("order.prescription_required");
        }

        var order = new Order(
            request.CustomerId,
            request.PharmacyId,
            new Address(
                request.DeliveryLine1,
                request.DeliveryLine2,
                request.City,
                request.State,
                request.Country,
                request.PostalCode),
            GeoCoordinate.From(request.Latitude, request.Longitude));

        order.SetPaymentMethod(request.PaymentMethod);

        foreach (var item in request.Items)
        {
            var inventoryItem = inventoryItems[item.MedicineId];
            order.AddItem(inventoryItem.Id, inventoryItem.Name, inventoryItem.Price, item.Quantity, inventoryItem.RequiresPrescription);
            inventoryItem.AdjustStock(-item.Quantity);
        }

        _dbContext.Orders.Add(order);

        if (request.Prescription is not null)
        {
            await using var contentStream = new MemoryStream(request.Prescription.Content);
            var folder = Path.Combine("prescriptions", order.OrderNumber.ToString());
            var safeFileName = Path.GetFileName(request.Prescription.FileName);
            var storagePath = await _storageService.UploadAsync(contentStream, safeFileName, folder, cancellationToken);

            var prescription = new Prescription(order.Id, safeFileName, storagePath);
            _dbContext.Prescriptions.Add(prescription);
            order.AttachPrescription(prescription);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var total = order.Total;
        var response = new OrderSummaryDto(
            order.Id,
            order.OrderNumber,
            total.Amount,
            total.Currency,
            order.PaymentMethod,
            order.PaymentStatus,
            order.Status);

        return Result<OrderSummaryDto>.Success(response);
    }
}
