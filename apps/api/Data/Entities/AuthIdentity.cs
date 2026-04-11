namespace Api.Data.Entities;

public sealed class AuthIdentity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ProviderId { get; set; } = "";
    public string Provider { get; set; } = "";
    public string IdentityData { get; set; } = "{}";
    public DateTimeOffset? LastSignInAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}