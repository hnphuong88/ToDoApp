namespace ToDoApp.Domain.Entities;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OwnerUserId { get; set; }
    public AppUser Owner { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
}
