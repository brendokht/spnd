using System.Text.Json;

using Api.Data.Entities;
using Api.Data.Enums;

namespace Api.SeedData;

public class UserBuilderData()
{
    public string Email { get; set; } = "";
    public bool IsGoogleUser { get; set; }
}


public class UserBuilder : IUserBuilder
{
    private AuthUser _authUser = new AuthUser();

    private AuthIdentity _authIdentityEmail = new AuthIdentity();
    private AuthIdentity? _authIdentityGoogle;
    private DateTimeOffset _now;

    public UserBuilder()
    {
        this.Reset();
    }

    public void Reset()
    {
        var newId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        this._now = now;

        var rawUserMetaData = new
        {
            sub = newId,
            email = this._authUser.Email,
            email_verified = true,
            phone_verified = false
        };

        this._authUser = new AuthUser()
        {
            Id = newId,
            InstanceId = Guid.Empty,
            Aud = "authenticated",
            Role = "authenticated",
            EncryptedPassword = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
            EmailConfirmedAt = now,
            CreatedAt = now,
            UpdatedAt = now,
        };

        this._authIdentityEmail = new AuthIdentity()
        {
            Id = Guid.NewGuid(),
            UserId = newId,
            Provider = Providers.Email,
            ProviderId = newId.ToString(),
            IdentityData = JsonSerializer.Serialize(rawUserMetaData),
            CreatedAt = now,
            UpdatedAt = now,
        };

        this._authIdentityGoogle = null;
    }

    public void SetEmail(string email)
    {
        this._authUser.Email = email;
    }

    public void SetEmailProvider()
    {
        var rawUserMetaData = new
        {
            sub = this._authUser.Id,
            email = this._authUser.Email,
            email_verified = true,
            phone_verified = false
        };

        this._authUser.RawUserMetaData = JsonSerializer.Serialize(rawUserMetaData);

        var rawAppMetaData = new
        {
            provider = Providers.Email,
            providers = new[] { Providers.Email },
        };

        this._authUser.RawAppMetaData = JsonSerializer.Serialize(rawAppMetaData);
    }

    public void SetGoogleProvider()
    {
        var googleGuid = Guid.NewGuid();

        var rawAppMetaData = new
        {
            provider = Providers.Google,
            providers = new[] { Providers.Email, Providers.Google },
        };

        this._authUser.RawAppMetaData = JsonSerializer.Serialize(rawAppMetaData);

        var rawUserMetaData = new
        {
            iss = "https://accounts.google.com",
            sub = googleGuid,
            name = "John Google",
            email = this._authUser.Email,
            full_name = "John Google",
            provider_id = googleGuid,
            email_verified = true,
            phone_verified = false
        };

        this._authUser.RawUserMetaData = JsonSerializer.Serialize(rawUserMetaData);

        this._authIdentityGoogle = new AuthIdentity()
        {
            Id = Guid.NewGuid(),
            UserId = this._authUser.Id,
            Provider = Providers.Google,
            ProviderId = googleGuid.ToString(),
            IdentityData = this._authUser.RawUserMetaData,
            CreatedAt = this._now,
            UpdatedAt = this._now,
        };

    }

    public (AuthUser, AuthIdentity, AuthIdentity?) GetAuthData()
    {
        AuthUser user = this._authUser;
        AuthIdentity authIdentityEmail = this._authIdentityEmail;
        AuthIdentity? authIdentityGoogle = this._authIdentityGoogle;

        this.Reset();

        return (user, authIdentityEmail, authIdentityGoogle);
    }
}