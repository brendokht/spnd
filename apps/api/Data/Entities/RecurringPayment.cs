namespace Api.Data.Entities;

public sealed class RecurringPayment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid LedgerId { get; set; }
    public Guid? CategoryId { get; set; }
    public string Name { get; set; } = "";
    public decimal Amount { get; set; }
    public Enums.RecurringFrequency Frequency { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly NextDueDate { get; set; }
    public bool Active { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Ledger Ledger { get; set; } = null!;
    public Category? Category { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = [];
}