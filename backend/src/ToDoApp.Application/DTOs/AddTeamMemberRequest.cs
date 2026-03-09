using System.ComponentModel.DataAnnotations;

namespace ToDoApp.Application.DTOs;

public class AddTeamMemberRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
