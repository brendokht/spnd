using Api.Data.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations;

internal sealed class AuthIdentityConfiguration : IEntityTypeConfiguration<AuthIdentity>
{
    public void Configure(EntityTypeBuilder<AuthIdentity> builder)
    {
        builder.ToTable("identities", "auth", t => t.ExcludeFromMigrations());
        builder.Property(i => i.IdentityData).HasColumnType("jsonb");
    }
}