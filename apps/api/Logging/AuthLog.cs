namespace Api.Logging;

static partial class AuthLog
{
    [LoggerMessage(Level = LogLevel.Warning, Message = "JWT authentication failed: {Error}")]
    public static partial void AuthenticationFailed(ILogger logger, string error);

    [LoggerMessage(Level = LogLevel.Warning, Message = "401 challenge on {Path} - error: {Error}, description: {Description}")]
    public static partial void Challenge(ILogger logger, string path, string? error, string? description);

    [LoggerMessage(Level = LogLevel.Warning, Message = "403 forbidden on {Path}")]
    public static partial void Forbidden(ILogger logger, string path);
}