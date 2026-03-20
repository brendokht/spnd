using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    internal DbSet<AuthUser> AuthUsers => Set<AuthUser>();
    internal DbSet<AuthIdentity> AuthIdentities => Set<AuthIdentity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        modelBuilder.Entity<AuthUser>(e =>
        {
            e.ToTable("users", "auth");
            e.Property(u => u.RawAppMetaData).HasColumnType("jsonb");
            e.Property(u => u.RawUserMetaData).HasColumnType("jsonb");
        });

        modelBuilder.Entity<AuthIdentity>(e =>
        {
            e.ToTable("identities", "auth");
            e.Property(i => i.IdentityData).HasColumnType("jsonb");
        });
    }
}

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