using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToDoApp.Application.DTOs;
using ToDoApp.Application.Interfaces;
using ToDoApp.Application.Mappings;

namespace ToDoApp.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : AuthBaseController
{
    private readonly IUserRepository _userRepo;

    public UsersController(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    [HttpGet("me")]
    public async Task<ActionResult<AppUserDto>> GetCurrentUser(
        [FromQuery] string? email = null,
        [FromQuery] string? displayName = null)
    {
        var user = await GetOrCreateAppUser(_userRepo, email, displayName);
        return Ok(user.ToDto());
    }

    [HttpGet("me/claims")]
    public ActionResult GetClaims()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value });
        return Ok(claims);
    }
}
