using Api.Data;

using Microsoft.EntityFrameworkCore;

namespace Api.SeedData;

static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var userId1 = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var userId2 = Guid.Parse("00000000-0000-0000-0000-000000000002");

        if (await db.AuthUsers.AnyAsync(u => u.Id == userId1 || u.Id == userId2).ConfigureAwait(false))
            return;

        var now = DateTimeOffset.UtcNow;

        db.AuthUsers.Add(new AuthUser
        {
            Id = userId1,
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

        db.AuthUsers.Add(new AuthUser
        {
            Id = userId2,
            InstanceId = Guid.Empty,
            Aud = "authenticated",
            Role = "authenticated",
            Email = "oauth@example.com",
            EncryptedPassword = BCrypt.Net.BCrypt.HashPassword("tester"),
            EmailConfirmedAt = now,
            RawAppMetaData = """{"provider":"google","providers":["email", "google"]}""",
            RawUserMetaData = """{"iss": "https://accounts.google.com", "sub": "000000000000000000001", "name": "John Google", "email": "oauth@example.com", "full_name": "John Google", "provider_id": "000000000000000000001", "email_verified": true, "phone_verified": false}""",
            CreatedAt = now,
            UpdatedAt = now,
        });

        await db.SaveChangesAsync().ConfigureAwait(false);

        db.AuthIdentities.Add(new AuthIdentity
        {
            Id = userId1,
            UserId = userId1,
            IdentityData = $$"""{"sub":"{{userId1}}","email":"test@example.com"}""",
            Provider = "email",
            ProviderId = "test@example.com",
            LastSignInAt = now,
            CreatedAt = now,
            UpdatedAt = now,
        });

        db.AuthIdentities.Add(new AuthIdentity
        {
            Id = userId2,
            UserId = userId2,
            IdentityData = $$"""{"sub":"{{userId2}}","email":"oauth@example.com"}""",
            Provider = "google",
            ProviderId = "000000000000000000001",
            LastSignInAt = now,
            CreatedAt = now,
            UpdatedAt = now,
        });

        await db.SaveChangesAsync().ConfigureAwait(false);
    }
}