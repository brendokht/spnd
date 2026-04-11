using System.Reflection;

using Api.Data.Entities;
using Api.Data.Enums;

using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    internal DbSet<AuthUser> AuthUsers => Set<AuthUser>();
    internal DbSet<AuthIdentity> AuthIdentities => Set<AuthIdentity>();

    public DbSet<Ledger> Ledgers => Set<Ledger>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<RecurringPayment> RecurringPayments => Set<RecurringPayment>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        // Npgsql requires enums to be registered here (model side) AND in UseNpgsql (data source side)
        // so it can map between C# enums and Postgres enum types at both the schema and runtime levels.
        modelBuilder.HasPostgresEnum<TransactionType>("public", "transaction_type");
        modelBuilder.HasPostgresEnum<RecurringFrequency>("public", "recurring_frequency");

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}