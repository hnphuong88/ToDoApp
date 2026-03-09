using Microsoft.EntityFrameworkCore;
using ToDoApp.Application.Interfaces;
using ToDoApp.Domain.Entities;
using ToDoApp.Domain.Enums;
using ToDoApp.Infrastructure.Data;

namespace ToDoApp.Infrastructure.Repositories;

public class TodoRepository : ITodoRepository
{
    private readonly TodoDbContext _context;

    public TodoRepository(TodoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TodoItem>> GetAllForUserAsync(Guid userId)
    {
        return await _context.TodoItems
            .Include(t => t.AssignedTo)
            .Include(t => t.Owner)
            .Where(t => t.OwnerUserId == userId || t.AssignedToUserId == userId)
            .OrderBy(t => t.Status == TodoStatus.Complete ? 2 : t.Status == TodoStatus.InProgress ? 1 : 0)
            .ThenBy(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<TodoItem?> GetByIdAsync(Guid id)
    {
        return await _context.TodoItems
            .Include(t => t.AssignedTo)
            .Include(t => t.Owner)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<TodoItem> AddAsync(TodoItem item)
    {
        _context.TodoItems.Add(item);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(item.Id) ?? item;
    }

    public async Task<TodoItem> UpdateAsync(TodoItem item)
    {
        _context.TodoItems.Update(item);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(item.Id) ?? item;
    }

    public async Task DeleteAsync(Guid id)
    {
        var item = await _context.TodoItems.FindAsync(id);
        if (item is not null)
        {
            _context.TodoItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}
