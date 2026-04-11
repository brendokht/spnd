namespace Api.Logging;

static partial class SeedLog
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Seeded user {Email}")]
    public static partial void UserSeeded(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Debug, Message = "User {Email} already exists — skipping")]
    public static partial void UserSkipped(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Seeded finance data for {Email}")]
    public static partial void FinanceDataSeeded(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Finance data for {Email} already exists — skipping")]
    public static partial void FinanceDataSkipped(ILogger logger, string email);
}