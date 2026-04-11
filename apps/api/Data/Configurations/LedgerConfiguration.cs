using Api.Data.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations;

internal sealed class LedgerConfiguration : IEntityTypeConfiguration<Ledger>
{
    public void Configure(EntityTypeBuilder<Ledger> builder)
    {
        builder.ToTable("ledgers");
        builder.Property(l => l.Currency).HasDefaultValue("USD");
        builder.Property(l => l.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(l => l.UpdatedAt).HasDefaultValueSql("now()");
        builder.HasOne<AuthUser>().WithMany()
            .HasForeignKey(l => l.UserId)
            .HasConstraintName("ledgers_user_id_fkey")
            .OnDelete(DeleteBehavior.Cascade);
    }
}