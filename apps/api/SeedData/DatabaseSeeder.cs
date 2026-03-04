using Api.Data;

using Microsoft.EntityFrameworkCore;

namespace Api.SeedData;

static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var userId = Guid.Parse("00000000-0000-0000-0000-000000000001");

        if (await db.AuthUsers.AnyAsync(u => u.Id == userId).ConfigureAwait(false))
            return;

        var now = DateTimeOffset.UtcNow;

        db.AuthUsers.Add(new AuthUser
        {
            Id = userId,
            InstanceId = Guid.Empty,
            Aud = "authenticated",
            Role = "authenticated",
            Email = "test@example.com",
            EncryptedPassword = BCrypt.Net.BCrypt.HashPassword("tester"),
            EmailConfirmedAt = now,
            RawAppMetaData = """{"provider":"email","providers":["email"]}""",
            RawUserMetaData = "{}",
            CreatedAt = now,
            UpdatedAt = now,
        });

        db.AuthIdentities.Add(new AuthIdentity
        {
            Id = userId,
            UserId = userId,
            IdentityData = $$"""{"sub":"{{userId}}","email":"test@example.com"}""",
            Provider = "email",
            ProviderId = "test@example.com",
            LastSignInAt = now,
            CreatedAt = now,
            UpdatedAt = now,
        });

        await db.SaveChangesAsync().ConfigureAwait(false);
    }
}