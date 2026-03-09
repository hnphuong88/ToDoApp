using ToDoApp.Application.DTOs;

namespace ToDoApp.Application.Interfaces;

public interface ITodoService
{
    Task<IEnumerable<TodoItemDto>> GetAllForUserAsync(Guid userId);
    Task<TodoItemDto?> GetByIdAsync(Guid id);
    Task<TodoItemDto> CreateAsync(CreateTodoRequest request, Guid ownerUserId);
    Task<TodoItemDto?> UpdateAsync(Guid id, UpdateTodoRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<TodoItemDto?> UpdateStatusAsync(Guid id, string status);
}
