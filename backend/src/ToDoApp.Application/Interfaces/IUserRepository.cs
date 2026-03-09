using ToDoApp.Domain.Entities;

namespace ToDoApp.Application.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetByAzureAdObjectIdAsync(string objectId);
    Task<AppUser?> GetByIdAsync(Guid id);
    Task<AppUser?> GetByEmailAsync(string email);
    Task<AppUser> AddAsync(AppUser user);
    Task<AppUser> UpdateAsync(AppUser user);
}
