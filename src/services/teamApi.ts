import type { Team } from "../types";
import { getAccessToken } from "../auth/getToken";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5094") + "/api/teams";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = `HTTP ${response.status}`;
    if (text) {
      try {
        const json = JSON.parse(text);
        message = json.message ?? json.title ?? text;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const teamApi = {
  async getMyTeams(): Promise<Team[]> {
    const headers = await authHeaders();
    const res = await fetch(API_BASE, { headers });
    return handleResponse<Team[]>(res);
  },

  async getById(id: string): Promise<Team> {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/${id}`, { headers });
    return handleResponse<Team>(res);
  },

  async create(name: string): Promise<Team> {
    const headers = await authHeaders();
    const res = await fetch(API_BASE, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    return handleResponse<Team>(res);
  },

  async delete(id: string): Promise<void> {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<void>(res);
  },

  async addMember(teamId: string, email: string): Promise<Team> {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/${teamId}/members`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });
    return handleResponse<Team>(res);
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/${teamId}/members/${userId}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<void>(res);
  },
};
