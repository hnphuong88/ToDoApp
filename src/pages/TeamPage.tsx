import { useState, type FormEvent } from "react";
import { useTodo } from "../context/TodoContext";
import { teamApi } from "../services/teamApi";
import Header from "../components/Header";
import ConfirmModal from "../components/ConfirmModal";
import "./TeamPage.css";

export default function TeamPage() {
  const { state, fetchTeams } = useTodo();
  const [newTeamName, setNewTeamName] = useState("");
  const [teamNameError, setTeamNameError] = useState("");
  const [addMemberEmail, setAddMemberEmail] = useState<Record<string, string>>({});
  const [memberError, setMemberError] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ teamId: string; teamName: string } | null>(null);

  async function handleCreateTeam(e: FormEvent) {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setTeamNameError("Please enter a team name.");
      return;
    }
    setTeamNameError("");
    setError(null);
    try {
      await teamApi.create(newTeamName.trim());
      setNewTeamName("");
      await fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    }
  }

  async function handleAddMember(teamId: string) {
    const email = addMemberEmail[teamId]?.trim();
    if (!email) {
      setMemberError((prev) => ({ ...prev, [teamId]: "Please enter an email address." }));
      return;
    }
    setMemberError((prev) => ({ ...prev, [teamId]: "" }));
    setError(null);
    try {
      await teamApi.addMember(teamId, email);
      setAddMemberEmail((prev) => ({ ...prev, [teamId]: "" }));
      await fetchTeams();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add member.";
      setMemberError((prev) => ({ ...prev, [teamId]: msg }));
    }
  }

  async function handleRemoveMember(teamId: string, userId: string) {
    setError(null);
    try {
      await teamApi.removeMember(teamId, userId);
      await fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  async function handleDeleteTeam() {
    if (!deleteTarget) return;
    setError(null);
    try {
      await teamApi.delete(deleteTarget.teamId);
      setDeleteTarget(null);
      await fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team");
    }
  }

  return (
    <div className="dashboard">
      <Header />
      <main className="container dashboard-main">
        <h2 className="team-page-title">My Teams</h2>

        {error && <div className="team-error">{error}</div>}

        <form className="team-create-form" onSubmit={handleCreateTeam}>
          <div className="team-create-input-group">
            <div className="team-create-row">
              <input
                type="text"
                placeholder="New team name..."
                value={newTeamName}
                onChange={(e) => {
                  setNewTeamName(e.target.value);
                  if (e.target.value.trim()) setTeamNameError("");
                }}
                className={`team-input ${teamNameError ? "input-error" : ""}`}
              />
              <button type="submit" className="btn btn-primary">
                Create Team
              </button>
            </div>
            {teamNameError && <span className="field-error">{teamNameError}</span>}
          </div>
        </form>

        {state.teams.length === 0 ? (
          <div className="empty-state">
            <h3>No teams yet</h3>
            <p>Create a team and invite members to collaborate on tasks.</p>
          </div>
        ) : (
          <div className="team-list">
            {state.teams.map((team) => (
              <div key={team.id} className="team-card">
                <div className="team-card-header">
                  <h3 className="team-card-name">{team.name}</h3>
                  {state.user?.id === team.owner.id && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget({ teamId: team.id, teamName: team.name })}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="team-card-owner">
                  Owner: {team.owner.displayName}
                </p>

                <div className="team-members">
                  <h4>Members ({team.members.length})</h4>
                  <ul className="member-list">
                    {team.members.map((member) => (
                      <li key={member.id} className="member-item">
                        <span className="member-name">
                          {member.displayName}
                          <span className="member-email">{member.email}</span>
                        </span>
                        {state.user?.id === team.owner.id && member.id !== team.owner.id && (
                          <button
                            className="btn-icon-remove"
                            onClick={() => handleRemoveMember(team.id, member.id)}
                            title="Remove member"
                          >
                            &times;
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {state.user?.id === team.owner.id && (
                  <div className="team-add-member">
                    <div className="team-add-member-row">
                      <input
                        type="email"
                        placeholder="Add member by email..."
                        value={addMemberEmail[team.id] ?? ""}
                        onChange={(e) => {
                          setAddMemberEmail((prev) => ({
                            ...prev,
                            [team.id]: e.target.value,
                          }));
                          if (e.target.value.trim())
                            setMemberError((prev) => ({ ...prev, [team.id]: "" }));
                        }}
                        className={`team-input ${memberError[team.id] ? "input-error" : ""}`}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddMember(team.id)}
                      >
                        Add
                      </button>
                    </div>
                    {memberError[team.id] && (
                      <span className="field-error member-field-error">{memberError[team.id]}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Team"
          message={`Delete team "${deleteTarget.teamName}"? This cannot be undone.`}
          onConfirm={handleDeleteTeam}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
