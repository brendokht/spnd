using Api.Data.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations;

internal sealed class AuthUserConfiguration : IEntityTypeConfiguration<AuthUser>
{
    public void Configure(EntityTypeBuilder<AuthUser> builder)
    {
        builder.ToTable("users", "auth", t => t.ExcludeFromMigrations());
        builder.Property(u => u.RawAppMetaData).HasColumnType("jsonb");
        builder.Property(u => u.RawUserMetaData).HasColumnType("jsonb");
    }
}