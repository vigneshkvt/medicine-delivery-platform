using Medicine.Application.Common.Interfaces;
using Microsoft.Extensions.Localization;

namespace Medicine.Infrastructure.Services;

public sealed class ResourceLocalizationService : ILocalizationService
{
    private readonly IStringLocalizer _localizer;

    public ResourceLocalizationService(IStringLocalizerFactory factory)
    {
        _localizer = factory.Create("SharedResources", System.Reflection.Assembly.GetExecutingAssembly().GetName().Name!);
    }

    public string this[string key] => _localizer[key];

    public string this[string key, params object[] args] => _localizer[key, args];
}
