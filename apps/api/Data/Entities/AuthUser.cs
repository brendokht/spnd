namespace Api.Data.Entities;

public sealed class AuthUser
{
    public Guid Id { get; set; }
    public Guid InstanceId { get; set; }
    public string Aud { get; set; } = "";
    public string Role { get; set; } = "";
    public string Email { get; set; } = "";
    public string EncryptedPassword { get; set; } = "";
    public DateTimeOffset? EmailConfirmedAt { get; set; }
    public string RawAppMetaData { get; set; } = "{}";
    public string RawUserMetaData { get; set; } = "{}";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string ConfirmationToken { get; set; } = "";
    public string RecoveryToken { get; set; } = "";
    public string EmailChangeTokenNew { get; set; } = "";
    public string EmailChange { get; set; } = "";
}