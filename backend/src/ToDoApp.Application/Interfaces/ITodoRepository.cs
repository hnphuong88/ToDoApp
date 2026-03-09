using ToDoApp.Domain.Entities;

namespace ToDoApp.Application.Interfaces;

public interface ITodoRepository
{
    Task<IEnumerable<TodoItem>> GetAllForUserAsync(Guid userId);
    Task<TodoItem?> GetByIdAsync(Guid id);
    Task<TodoItem> AddAsync(TodoItem item);
    Task<TodoItem> UpdateAsync(TodoItem item);
    Task DeleteAsync(Guid id);
}
