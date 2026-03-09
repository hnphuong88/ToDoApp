using Microsoft.EntityFrameworkCore;
using ToDoApp.Application.Interfaces;
using ToDoApp.Domain.Entities;
using ToDoApp.Infrastructure.Data;

namespace ToDoApp.Infrastructure.Repositories;

public class TeamRepository : ITeamRepository
{
    private readonly TodoDbContext _context;

    public TeamRepository(TodoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Team>> GetTeamsForUserAsync(Guid userId)
    {
        return await _context.Teams
            .Include(t => t.Members).ThenInclude(m => m.User)
            .Include(t => t.Owner)
            .Where(t => t.OwnerUserId == userId || t.Members.Any(m => m.UserId == userId))
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<Team?> GetByIdAsync(Guid id)
    {
        return await _context.Teams
            .Include(t => t.Members).ThenInclude(m => m.User)
            .Include(t => t.Owner)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Team> AddAsync(Team team)
    {
        _context.Teams.Add(team);
        await _context.SaveChangesAsync();
        return team;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var team = await _context.Teams.FindAsync(id);
        if (team is null) return false;
        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task AddMemberAsync(TeamMember member)
    {
        _context.TeamMembers.Add(member);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveMemberAsync(Guid teamId, Guid userId)
    {
        var member = await _context.TeamMembers
            .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == userId);
        if (member is not null)
        {
            _context.TeamMembers.Remove(member);
            await _context.SaveChangesAsync();
        }
    }
}
