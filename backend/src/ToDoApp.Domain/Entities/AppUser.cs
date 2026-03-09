namespace ToDoApp.Domain.Entities;

public class AppUser
{
    public Guid Id { get; set; }
    public string AzureAdObjectId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
    public ICollection<Team> OwnedTeams { get; set; } = new List<Team>();
}
