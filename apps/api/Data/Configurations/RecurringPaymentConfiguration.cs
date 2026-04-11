using Api.Data.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations;

internal sealed class RecurringPaymentConfiguration : IEntityTypeConfiguration<RecurringPayment>
{
    public void Configure(EntityTypeBuilder<RecurringPayment> builder)
    {
        builder.ToTable("recurring_payments");
        builder.Property(r => r.Active).HasDefaultValue(true);
        builder.Property(r => r.Amount).HasColumnType("numeric(12,2)");
        builder.Property(r => r.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(r => r.UpdatedAt).HasDefaultValueSql("now()");
        builder.HasOne<AuthUser>().WithMany()
            .HasForeignKey(r => r.UserId)
            .HasConstraintName("recurring_payments_user_id_fkey")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(r => r.Ledger).WithMany(l => l.RecurringPayments)
            .HasForeignKey(r => r.LedgerId)
            .HasConstraintName("recurring_payments_ledger_id_fkey")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(r => r.Category).WithMany()
            .HasForeignKey(r => r.CategoryId)
            .HasConstraintName("recurring_payments_category_id_fkey")
            .OnDelete(DeleteBehavior.SetNull);
    }
}