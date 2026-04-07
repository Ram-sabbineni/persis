using Microsoft.EntityFrameworkCore;
using Persis.Api.Data;
using Persis.Api.DTOs;

namespace Persis.Api.Services;

public class MenuService : IMenuService
{
    private readonly AppDbContext _db;

    public MenuService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<MenuItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.MenuItems
            .AsNoTracking()
            .Where(m => m.IsAvailable)
            .OrderBy(m => m.Category)
            .ThenBy(m => m.Name)
            .Select(m => new MenuItemDto(
                m.Id,
                m.Name,
                m.Description,
                m.Price,
                m.ImageUrl,
                m.Category,
                m.IsAvailable))
            .ToListAsync(ct);
    }

    public async Task<MenuItemDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var m = await _db.MenuItems.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (m is null) return null;
        return new MenuItemDto(m.Id, m.Name, m.Description, m.Price, m.ImageUrl, m.Category, m.IsAvailable);
    }
}
