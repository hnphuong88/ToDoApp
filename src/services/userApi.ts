import type { AppUser } from "../types";
import { getAccessToken, getMsalAccount } from "../auth/getToken";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5094") + "/api/users";

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
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

export const userApi = {
  async getMe(): Promise<AppUser> {
    const headers = await authHeaders();
    const account = getMsalAccount();
    const params = new URLSearchParams();
    if (account?.username) params.set("email", account.username);
    if (account?.name) params.set("displayName", account.name);
    const qs = params.toString();
    const url = qs ? `${API_BASE}/me?${qs}` : `${API_BASE}/me`;
    const res = await fetch(url, { headers });
    return handleResponse<AppUser>(res);
  },
};
