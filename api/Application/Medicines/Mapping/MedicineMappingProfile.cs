using AutoMapper;
using Medicine.Application.Medicines.Dto;
using Medicine.Application.Medicines.Models;

namespace Medicine.Application.Medicines.Mapping;

public sealed class MedicineMappingProfile : Profile
{
    public MedicineMappingProfile()
    {
        CreateMap<MedicineCatalogItem, MedicineCatalogItemDto>();
    }
}
