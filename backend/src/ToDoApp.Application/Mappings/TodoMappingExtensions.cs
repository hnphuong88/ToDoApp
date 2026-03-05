using ToDoApp.Application.DTOs;
using ToDoApp.Domain.Entities;
using ToDoApp.Domain.Enums;

namespace ToDoApp.Application.Mappings;

public static class TodoMappingExtensions
{
    private static string StatusToString(TodoStatus status) => status switch
    {
        TodoStatus.Todo => "todo",
        TodoStatus.InProgress => "inprogress",
        TodoStatus.Complete => "complete",
        _ => "todo"
    };

    public static TodoStatus ParseStatus(string status) => status.ToLower() switch
    {
        "inprogress" => TodoStatus.InProgress,
        "complete" => TodoStatus.Complete,
        _ => TodoStatus.Todo
    };

    public static TodoItemDto ToDto(this TodoItem entity)
    {
        return new TodoItemDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            DueDate = entity.DueDate.ToString("yyyy-MM-dd"),
            Status = StatusToString(entity.Status),
            Priority = entity.Priority.ToString().ToLower(),
            Tags = entity.Tags,
            CreatedAt = entity.CreatedAt.ToUniversalTime().ToString("o"),
            UpdatedAt = entity.UpdatedAt.ToUniversalTime().ToString("o")
        };
    }

    public static TodoItem ToEntity(this CreateTodoRequest request)
    {
        var now = DateTime.UtcNow;
        return new TodoItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            DueDate = DateOnly.Parse(request.DueDate),
            Status = ParseStatus(request.Status),
            Priority = Enum.Parse<Priority>(request.Priority, ignoreCase: true),
            Tags = request.Tags,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public static void ApplyUpdate(this TodoItem entity, UpdateTodoRequest request)
    {
        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.DueDate = DateOnly.Parse(request.DueDate);
        entity.Priority = Enum.Parse<Priority>(request.Priority, ignoreCase: true);
        entity.Status = ParseStatus(request.Status);
        entity.Tags = request.Tags;
        entity.UpdatedAt = DateTime.UtcNow;
    }
}
