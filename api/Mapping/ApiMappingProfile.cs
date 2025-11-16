using AutoMapper;
using Medicine.Api.Contracts.Medicines;
using Medicine.Application.Medicines.Dto;

namespace Medicine.Api.Mapping;

public sealed class ApiMappingProfile : Profile
{
    public ApiMappingProfile()
    {
        CreateMap<MedicineCatalogItemDto, MedicineCatalogItemResponse>();
    }
}
