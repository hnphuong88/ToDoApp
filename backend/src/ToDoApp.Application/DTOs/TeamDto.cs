namespace ToDoApp.Application.DTOs;

public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public AppUserDto Owner { get; set; } = null!;
    public List<AppUserDto> Members { get; set; } = new();
    public string CreatedAt { get; set; } = string.Empty;
}
