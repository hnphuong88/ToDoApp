using System.ComponentModel.DataAnnotations;

namespace ToDoApp.Application.DTOs;

public class CreateTodoRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required]
    public string DueDate { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(low|medium|high)$", ErrorMessage = "Priority must be low, medium, or high")]
    public string Priority { get; set; } = "medium";

    [RegularExpression("^(todo|inprogress|complete)$", ErrorMessage = "Status must be todo, inprogress, or complete")]
    public string Status { get; set; } = "todo";

    public List<string> Tags { get; set; } = new();
}
