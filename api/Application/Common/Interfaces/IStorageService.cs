using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Medicine.Application.Common.Interfaces;

public interface IStorageService
{
    Task<string> UploadAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default);
}
