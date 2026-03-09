using ToDoApp.Application.DTOs;
using ToDoApp.Application.Interfaces;
using ToDoApp.Application.Mappings;
using ToDoApp.Domain.Entities;

namespace ToDoApp.Application.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepo;
    private readonly IUserRepository _userRepo;

    public TeamService(ITeamRepository teamRepo, IUserRepository userRepo)
    {
        _teamRepo = teamRepo;
        _userRepo = userRepo;
    }

    public async Task<IEnumerable<TeamDto>> GetTeamsForUserAsync(Guid userId)
    {
        var teams = await _teamRepo.GetTeamsForUserAsync(userId);
        return teams.Select(t => t.ToDto());
    }

    public async Task<TeamDto?> GetByIdAsync(Guid id)
    {
        var team = await _teamRepo.GetByIdAsync(id);
        return team?.ToDto();
    }

    public async Task<TeamDto> CreateAsync(CreateTeamRequest request, Guid ownerUserId)
    {
        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            OwnerUserId = ownerUserId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _teamRepo.AddAsync(team);

        await _teamRepo.AddMemberAsync(new TeamMember
        {
            TeamId = created.Id,
            UserId = ownerUserId,
            JoinedAt = DateTime.UtcNow
        });

        var full = await _teamRepo.GetByIdAsync(created.Id);
        return full!.ToDto();
    }

    public async Task<bool> DeleteAsync(Guid id, Guid requestingUserId)
    {
        var team = await _teamRepo.GetByIdAsync(id);
        if (team is null || team.OwnerUserId != requestingUserId) return false;
        return await _teamRepo.DeleteAsync(id);
    }

    public async Task<TeamDto?> AddMemberByEmailAsync(Guid teamId, string email, Guid requestingUserId)
    {
        var team = await _teamRepo.GetByIdAsync(teamId);
        if (team is null || team.OwnerUserId != requestingUserId) return null;

        var user = await _userRepo.GetByEmailAsync(email);
        if (user is null)
            throw new KeyNotFoundException(
                $"No registered user found with email \"{email}\". They must sign in to the app at least once before they can be added to a team.");

        if (team.Members.Any(m => m.UserId == user.Id)) 
        {
            return team.ToDto();
        }

        await _teamRepo.AddMemberAsync(new TeamMember
        {
            TeamId = teamId,
            UserId = user.Id,
            JoinedAt = DateTime.UtcNow
        });

        var updated = await _teamRepo.GetByIdAsync(teamId);
        return updated!.ToDto();
    }

    public async Task<bool> RemoveMemberAsync(Guid teamId, Guid userIdToRemove, Guid requestingUserId)
    {
        var team = await _teamRepo.GetByIdAsync(teamId);
        if (team is null || team.OwnerUserId != requestingUserId) return false;
        if (userIdToRemove == requestingUserId) return false;

        await _teamRepo.RemoveMemberAsync(teamId, userIdToRemove);
        return true;
    }
}
