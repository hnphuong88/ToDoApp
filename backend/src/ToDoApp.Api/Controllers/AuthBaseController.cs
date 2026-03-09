using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoApp.Application.Interfaces;
using ToDoApp.Domain.Entities;

namespace ToDoApp.Api.Controllers;

public abstract class AuthBaseController : ControllerBase
{
    protected string GetAzureAdObjectId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
            ?? User.FindFirst("oid")?.Value
            ?? throw new UnauthorizedAccessException("No user identifier in token");
    }

    protected string GetDisplayName()
    {
        return User.FindFirst("name")?.Value
            ?? User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst("preferred_username")?.Value
            ?? "Unknown";
    }

    protected string GetEmail()
    {
        var raw = User.FindFirst("emails")?.Value;
        if (!string.IsNullOrEmpty(raw))
        {
            if (raw.TrimStart().StartsWith("["))
            {
                try
                {
                    var arr = JsonSerializer.Deserialize<string[]>(raw);
                    if (arr is { Length: > 0 }) return arr[0];
                }
                catch { }
            }
            return raw;
        }

        return User.FindFirst(ClaimTypes.Email)?.Value
            ?? User.FindFirst("email")?.Value
            ?? User.FindFirst("preferred_username")?.Value
            ?? User.FindFirst(ClaimTypes.Upn)?.Value
            ?? User.FindFirst("upn")?.Value
            ?? "";
    }

    protected Task<AppUser> GetOrCreateAppUser(IUserRepository userRepo)
        => GetOrCreateAppUser(userRepo, null, null);

    protected async Task<AppUser> GetOrCreateAppUser(
        IUserRepository userRepo,
        string? clientEmail,
        string? clientDisplayName)
    {
        var oid = GetAzureAdObjectId();
        var name = !string.IsNullOrWhiteSpace(clientDisplayName) ? clientDisplayName : GetDisplayName();
        var email = !string.IsNullOrWhiteSpace(clientEmail) ? clientEmail : GetEmail();

        var existing = await userRepo.GetByAzureAdObjectIdAsync(oid);
        if (existing is not null)
        {
            if (existing.DisplayName != name || existing.Email != email)
            {
                existing.DisplayName = name;
                existing.Email = email;
                await userRepo.UpdateAsync(existing);
            }
            return existing;
        }

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            AzureAdObjectId = oid,
            DisplayName = name,
            Email = email,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            return await userRepo.AddAsync(user);
        }
        catch (DbUpdateException)
        {
            var created = await userRepo.GetByAzureAdObjectIdAsync(oid);
            if (created is not null) return created;
            throw;
        }
    }
}
