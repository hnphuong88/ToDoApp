using ToDoApp.Domain.Enums;

namespace ToDoApp.Domain.Entities;

public class TodoItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly DueDate { get; set; }
    public TodoStatus Status { get; set; }
    public Priority Priority { get; set; }
    public List<string> Tags { get; set; } = new();

    public Guid OwnerUserId { get; set; }
    public AppUser Owner { get; set; } = null!;

    public Guid? AssignedToUserId { get; set; }
    public AppUser? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
