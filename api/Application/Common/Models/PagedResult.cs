using System.Collections.Generic;

namespace Medicine.Application.Common.Models;

public class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages => (int)System.Math.Ceiling(TotalCount / (double)PageSize);

    private PagedResult(IReadOnlyCollection<T> items, int pageNumber, int pageSize, int totalCount)
    {
        Items = items;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalCount = totalCount;
    }

    public static PagedResult<T> Create(IReadOnlyCollection<T> items, int pageNumber, int pageSize, int totalCount)
    {
        return new PagedResult<T>(items, pageNumber, pageSize, totalCount);
    }
}
