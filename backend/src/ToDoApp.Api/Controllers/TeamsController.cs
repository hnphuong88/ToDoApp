using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToDoApp.Application.DTOs;
using ToDoApp.Application.Interfaces;

namespace ToDoApp.Api.Controllers;

[ApiController]
[Route("api/teams")]
[Authorize]
public class TeamsController : AuthBaseController
{
    private readonly ITeamService _teamService;
    private readonly IUserRepository _userRepo;

    public TeamsController(ITeamService teamService, IUserRepository userRepo)
    {
        _teamService = teamService;
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetMyTeams()
    {
        var user = await GetOrCreateAppUser(_userRepo);
        var teams = await _teamService.GetTeamsForUserAsync(user.Id);
        return Ok(teams);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TeamDto>> GetById(Guid id)
    {
        var team = await _teamService.GetByIdAsync(id);
        if (team is null) return NotFound();
        return Ok(team);
    }

    [HttpPost]
    public async Task<ActionResult<TeamDto>> Create([FromBody] CreateTeamRequest request)
    {
        var user = await GetOrCreateAppUser(_userRepo);
        var team = await _teamService.CreateAsync(request, user.Id);
        return CreatedAtAction(nameof(GetById), new { id = team.Id }, team);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await GetOrCreateAppUser(_userRepo);
        var deleted = await _teamService.DeleteAsync(id, user.Id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("{id:guid}/members")]
    public async Task<ActionResult<TeamDto>> AddMember(Guid id, [FromBody] AddTeamMemberRequest request)
    {
        var user = await GetOrCreateAppUser(_userRepo);

        try
        {
            var team = await _teamService.AddMemberByEmailAsync(id, request.Email, user.Id);
            if (team is null) return NotFound();
            return Ok(team);
        }
        catch (KeyNotFoundException ex)
        {
            return UnprocessableEntity(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid userId)
    {
        var user = await GetOrCreateAppUser(_userRepo);
        var removed = await _teamService.RemoveMemberAsync(id, userId, user.Id);
        if (!removed) return NotFound();
        return NoContent();
    }
}
