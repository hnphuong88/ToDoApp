using System.ComponentModel.DataAnnotations;

namespace ToDoApp.Application.DTOs;

public class UpdateStatusRequest
{
    [Required]
    [RegularExpression("^(todo|inprogress|complete)$", ErrorMessage = "Status must be todo, inprogress, or complete")]
    public string Status { get; set; } = string.Empty;
}
