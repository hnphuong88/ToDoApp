using ToDoApp.Domain.Entities;

namespace ToDoApp.Application.Interfaces;

public interface ITeamRepository
{
    Task<IEnumerable<Team>> GetTeamsForUserAsync(Guid userId);
    Task<Team?> GetByIdAsync(Guid id);
    Task<Team> AddAsync(Team team);
    Task<bool> DeleteAsync(Guid id);
    Task AddMemberAsync(TeamMember member);
    Task RemoveMemberAsync(Guid teamId, Guid userId);
}
