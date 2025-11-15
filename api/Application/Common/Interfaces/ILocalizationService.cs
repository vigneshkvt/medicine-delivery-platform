namespace Medicine.Application.Common.Interfaces;

public interface ILocalizationService
{
    string this[string key] { get; }
    string this[string key, params object[] args] { get; }
}
