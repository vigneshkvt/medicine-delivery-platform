using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Medicine.Application.Medicines.Models;

namespace Medicine.Application.Common.Interfaces;

public interface IMedicineCatalogService
{
    Task<IReadOnlyCollection<MedicineCatalogItem>> SearchAsync(string query, int limit, CancellationToken cancellationToken);
}
