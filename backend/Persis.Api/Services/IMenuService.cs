using Persis.Api.DTOs;

namespace Persis.Api.Services;

public interface IMenuService
{
    Task<IReadOnlyList<MenuItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<MenuItemDto?> GetByIdAsync(int id, CancellationToken ct = default);
}
