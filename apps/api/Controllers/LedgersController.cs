using System.Security.Claims;

using Api.Data;
using Api.Logging;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class LedgersController(AppDbContext db, ILogger<LedgersController> logger) : ControllerBase
{
    //Test endpoint to ensure the ledger schema works
    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (userId is null)
            return Unauthorized();

        var parsedUserId = Guid.Parse(userId);

        var ledgers = await db.Ledgers
            .Where(l => l.UserId == parsedUserId)
            .Select(l => new
            {
                l.Id,
                l.Name,
                l.Currency,
                l.CreatedAt,
                TransactionCount = l.Transactions.Count(),
                Balance = l.Transactions.Sum(t => t.Amount),
            })
            .ToListAsync()
            .ConfigureAwait(false);

        LedgerLog.LedgersFetched(logger, parsedUserId, ledgers.Count);

        return Ok(ledgers);
    }
}