using ToDoApp.Application.DTOs;

namespace ToDoApp.Application.Interfaces;

public interface ITeamService
{
    Task<IEnumerable<TeamDto>> GetTeamsForUserAsync(Guid userId);
    Task<TeamDto?> GetByIdAsync(Guid id);
    Task<TeamDto> CreateAsync(CreateTeamRequest request, Guid ownerUserId);
    Task<bool> DeleteAsync(Guid id, Guid requestingUserId);
    Task<TeamDto?> AddMemberByEmailAsync(Guid teamId, string email, Guid requestingUserId);
    Task<bool> RemoveMemberAsync(Guid teamId, Guid userIdToRemove, Guid requestingUserId);
}
