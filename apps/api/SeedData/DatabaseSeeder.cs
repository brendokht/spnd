using Api.Data;

using Microsoft.EntityFrameworkCore;

namespace Api.SeedData;
static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
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

            if (exists) continue;

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
        }

    }
}