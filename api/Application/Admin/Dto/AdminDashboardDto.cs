using System.Collections.Generic;

namespace Medicine.Application.Admin.Dto;

public sealed record AdminDashboardDto(
    int TotalUsers,
    int ActivePharmacies,
    int PendingPharmacies,
    int TotalOrders,
    decimal TotalOrderValue,
    IReadOnlyCollection<AdminTopPharmacyDto> TopPharmacies,
    IReadOnlyCollection<AdminTopMedicineDto> TopMedicines);

public sealed record AdminTopPharmacyDto(string PharmacyName, int Orders, decimal Revenue);

public sealed record AdminTopMedicineDto(string MedicineName, int Orders, decimal Revenue);
