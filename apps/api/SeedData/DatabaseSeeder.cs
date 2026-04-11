using Api.Data;
using Api.Data.Entities;
using Api.Data.Enums;
using Api.Logging;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Api.SeedData;

static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db, ILogger logger)
    {
        await SeedUsersAsync(db, logger);
        await SeedFinanceDataAsync(db, logger);
    }

    private static async Task SeedUsersAsync(AppDbContext db, ILogger logger)
    {
        var userDirector = new UserDirector();
        var userBuilder = new UserBuilder();
        userDirector.Builder = userBuilder;

        List<UserBuilderData> userBuilderData = [
            new () { Email = "test@example.com", IsGoogleUser = false },
            new () { Email = "oauth@example.com", IsGoogleUser = true }
        ];

        foreach (var data in userBuilderData)
        {
            var exists = await db.AuthUsers
                .AnyAsync(u => u.Email == data.Email)
                .ConfigureAwait(false);

            if (exists)
            {
                SeedLog.UserSkipped(logger, data.Email);
                continue;
            }

            if (data.IsGoogleUser)
                userDirector.BuildGoogleUser(data.Email);
            else
                userDirector.BuildEmailUser(data.Email);

            var (user, emailIdentity, googleIdentity) = userBuilder.GetAuthData();

            db.AuthUsers.Add(user);
            await db.SaveChangesAsync().ConfigureAwait(false);

            // Because of the email provider identity fix for users who sign up with Google
            // We do not need to create the email identity for Google users here
            // This may change in the future if the issue gets fixed
            if (googleIdentity == null)
                db.AuthIdentities.Add(emailIdentity);
            else
                db.AuthIdentities.Add(googleIdentity);

            await db.SaveChangesAsync().ConfigureAwait(false);
            SeedLog.UserSeeded(logger, data.Email);
        }
    }

    private static async Task SeedFinanceDataAsync(AppDbContext db, ILogger logger)
    {
        var testUser = await db.AuthUsers
            .FirstOrDefaultAsync(u => u.Email == "test@example.com")
            .ConfigureAwait(false);

        if (testUser is null) return;

        var ledgerExists = await db.Ledgers
            .AnyAsync(l => l.UserId == testUser.Id)
            .ConfigureAwait(false);

        if (ledgerExists)
        {
            SeedLog.FinanceDataSkipped(logger, testUser.Email!);
            return;
        }

        var category = new Category
        {
            UserId = testUser.Id,
            Name = "Groceries",
            Color = "#4ade80",
        };
        db.Categories.Add(category);
        await db.SaveChangesAsync().ConfigureAwait(false);

        var ledger = new Ledger
        {
            UserId = testUser.Id,
            Name = "Personal",
            Currency = "USD",
        };
        db.Ledgers.Add(ledger);
        await db.SaveChangesAsync().ConfigureAwait(false);

        db.Transactions.AddRange(
            new Transaction
            {
                UserId = testUser.Id,
                LedgerId = ledger.Id,
                CategoryId = category.Id,
                Amount = -52.30m,
                Description = "Weekly grocery run",
                Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)),
                Type = TransactionType.Expense,
            },
            new Transaction
            {
                UserId = testUser.Id,
                LedgerId = ledger.Id,
                Amount = 3200.00m,
                Description = "Monthly salary",
                Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)),
                Type = TransactionType.Income,
            },
            new Transaction
            {
                UserId = testUser.Id,
                LedgerId = ledger.Id,
                CategoryId = category.Id,
                Amount = -14.99m,
                Description = "Netflix subscription",
                Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7)),
                Type = TransactionType.Expense,
            }
        );
        await db.SaveChangesAsync().ConfigureAwait(false);
        SeedLog.FinanceDataSeeded(logger, testUser.Email!);
    }
}