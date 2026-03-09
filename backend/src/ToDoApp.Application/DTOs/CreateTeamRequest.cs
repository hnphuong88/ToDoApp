using System.ComponentModel.DataAnnotations;

namespace ToDoApp.Application.DTOs;

public class CreateTeamRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
}
