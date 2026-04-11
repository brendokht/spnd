namespace Api.Data.Entities;

public sealed class Ledger
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = "";
    public string Currency { get; set; } = "USD";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Transaction> Transactions { get; set; } = [];
    public ICollection<RecurringPayment> RecurringPayments { get; set; } = [];
}