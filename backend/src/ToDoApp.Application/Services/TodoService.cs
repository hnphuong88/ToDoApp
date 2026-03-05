using ToDoApp.Application.DTOs;
using ToDoApp.Application.Interfaces;
using ToDoApp.Application.Mappings;

namespace ToDoApp.Application.Services;

public class TodoService : ITodoService
{
    private readonly ITodoRepository _repository;

    public TodoService(ITodoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<TodoItemDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items.Select(i => i.ToDto());
    }

    public async Task<TodoItemDto?> GetByIdAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item?.ToDto();
    }

    public async Task<TodoItemDto> CreateAsync(CreateTodoRequest request)
    {
        var entity = request.ToEntity();
        var created = await _repository.AddAsync(entity);
        return created.ToDto();
    }

    public async Task<TodoItemDto?> UpdateAsync(Guid id, UpdateTodoRequest request)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity is null) return null;

        entity.ApplyUpdate(request);
        var updated = await _repository.UpdateAsync(entity);
        return updated.ToDto();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity is null) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<TodoItemDto?> UpdateStatusAsync(Guid id, string status)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity is null) return null;

        entity.Status = TodoMappingExtensions.ParseStatus(status);
        entity.UpdatedAt = DateTime.UtcNow;
        var updated = await _repository.UpdateAsync(entity);
        return updated.ToDto();
    }
}
