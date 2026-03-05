using ToDoApp.Domain.Entities;

namespace ToDoApp.Application.Interfaces;

public interface ITodoRepository
{
    Task<IEnumerable<TodoItem>> GetAllAsync();
    Task<TodoItem?> GetByIdAsync(Guid id);
    Task<TodoItem> AddAsync(TodoItem item);
    Task<TodoItem> UpdateAsync(TodoItem item);
    Task DeleteAsync(Guid id);
}
