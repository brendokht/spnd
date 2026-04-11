namespace Api.Data.Entities;

public sealed class Category
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = "";
    public string? Color { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}