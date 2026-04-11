namespace Api.Logging;

static partial class LedgerLog
{
    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} fetched {Count} ledger(s)")]
    public static partial void LedgersFetched(ILogger logger, Guid userId, int count);
}