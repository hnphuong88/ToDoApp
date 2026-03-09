import type { TodoItem } from "../types";
import { getAccessToken } from "../auth/getToken";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5094") + "/api/todos";

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
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const todoApi = {
  async getAll(): Promise<TodoItem[]> {
    const headers = await authHeaders();
    const res = await fetch(API_BASE, { headers });
    return handleResponse<TodoItem[]>(res);
  },

  async getById(id: string): Promise<TodoItem> {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/${id}`, { headers });
    return handleResponse<TodoItem>(res);
  },

  async create(data: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status?: string;
    tags?: string[];
    assignedToUserId?: string | null;
  }): Promise<TodoItem> {
    const headers = await authHeaders();
    const res = await fetch(API_BASE, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<TodoItem>(res);
  },

  async update(
    id: string,
    data: {
      title: string;
      description: string;
      dueDate: string;
      priority: string;
      status: string;
      tags: string[];
      assignedToUserId?: string | null;
    }
  ): Promise<TodoItem> {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<TodoItem>(res);
  },

  async delete(id: string): Promise<void> {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<void>(res);
  },

  async updateStatus(id: string, status: string): Promise<TodoItem> {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    return handleResponse<TodoItem>(res);
  },
};
