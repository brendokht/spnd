using Api.Data.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Data.Configurations;

internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");
        builder.Property(c => c.CreatedAt).HasDefaultValueSql("now()");
        builder.HasOne<AuthUser>().WithMany()
            .HasForeignKey(c => c.UserId)
            .HasConstraintName("categories_user_id_fkey")
            .OnDelete(DeleteBehavior.Cascade);
    }
}