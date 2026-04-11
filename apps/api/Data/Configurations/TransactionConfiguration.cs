using Api.Data.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations;

internal sealed class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("transactions");
        builder.Property(t => t.Amount).HasColumnType("numeric(12,2)");
        builder.Property(t => t.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(t => t.UpdatedAt).HasDefaultValueSql("now()");
        builder.HasOne<AuthUser>().WithMany()
            .HasForeignKey(t => t.UserId)
            .HasConstraintName("transactions_user_id_fkey")
            .OnDelete(DeleteBehavior.Cascade);
        // Deleting a ledger removes all its transactions.
        builder.HasOne(t => t.Ledger).WithMany(l => l.Transactions)
            .HasForeignKey(t => t.LedgerId)
            .HasConstraintName("transactions_ledger_id_fkey")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(t => t.Category).WithMany()
            .HasForeignKey(t => t.CategoryId)
            .HasConstraintName("transactions_category_id_fkey")
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(t => t.RecurringPayment).WithMany(r => r.Transactions)
            .HasForeignKey(t => t.RecurringPaymentId)
            .HasConstraintName("transactions_recurring_payment_id_fkey")
            .OnDelete(DeleteBehavior.SetNull);
    }
}