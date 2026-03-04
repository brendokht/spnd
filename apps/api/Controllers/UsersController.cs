using Api.Data;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class UsersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        var users = await db.AuthUsers
            .Select(u => new { u.Id, u.Email, u.CreatedAt })
            .ToListAsync()
            .ConfigureAwait(false);

        return Ok(users);
    }
}