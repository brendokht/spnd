namespace Api.Data.Entities;

public sealed class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid LedgerId { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? RecurringPaymentId { get; set; }
    public Guid? TransferPairId { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public Enums.TransactionType Type { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Ledger Ledger { get; set; } = null!;
    public Category? Category { get; set; }
    public RecurringPayment? RecurringPayment { get; set; }
}