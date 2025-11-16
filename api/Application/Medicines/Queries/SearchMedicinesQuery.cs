using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FluentValidation;
using Medicine.Application.Common.Interfaces;
using Medicine.Application.Medicines.Dto;
using Medicine.Application.Medicines.Models;
using MediatR;

namespace Medicine.Application.Medicines.Queries;

public sealed record SearchMedicinesQuery(string Query, int Limit) : IRequest<IReadOnlyCollection<MedicineCatalogItemDto>>;

public sealed class SearchMedicinesQueryValidator : AbstractValidator<SearchMedicinesQuery>
{
    public SearchMedicinesQueryValidator()
    {
        RuleFor(x => x.Query)
            .NotEmpty()
            .MinimumLength(2)
            .MaximumLength(100);

        RuleFor(x => x.Limit)
            .GreaterThan(0)
            .LessThanOrEqualTo(100);
    }
}

public sealed class SearchMedicinesQueryHandler : IRequestHandler<SearchMedicinesQuery, IReadOnlyCollection<MedicineCatalogItemDto>>
{
    private readonly IMedicineCatalogService _catalogService;
    private readonly IMapper _mapper;

    public SearchMedicinesQueryHandler(IMedicineCatalogService catalogService, IMapper mapper)
    {
        _catalogService = catalogService;
        _mapper = mapper;
    }

    public async Task<IReadOnlyCollection<MedicineCatalogItemDto>> Handle(SearchMedicinesQuery request, CancellationToken cancellationToken)
    {
        var results = await _catalogService.SearchAsync(request.Query, request.Limit, cancellationToken);
        return _mapper.Map<IReadOnlyCollection<MedicineCatalogItemDto>>(results);
    }
}
