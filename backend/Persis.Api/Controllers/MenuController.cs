using Microsoft.AspNetCore.Mvc;
using Persis.Api.Services;

namespace Persis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menu;
    private readonly ILogger<MenuController> _logger;

    public MenuController(IMenuService menu, ILogger<MenuController> logger)
    {
        _menu = menu;
        _logger = logger;
    }

    /// <summary>All available menu items for the Persis menu page.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        try
        {
            var items = await _menu.GetAllAsync(ct);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load menu.");
            return Problem(detail: "Could not load menu.", statusCode: 500);
        }
    }

    /// <summary>Single menu item by id (includes unavailable for admin-style use).</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        try
        {
            var item = await _menu.GetByIdAsync(id, ct);
            if (item is null)
                return NotFound(new { message = "Menu item not found." });
            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load menu item {Id}.", id);
            return Problem(detail: "Could not load menu item.", statusCode: 500);
        }
    }
}
