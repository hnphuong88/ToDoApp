import type { TodoItem } from "../types";

const API_BASE = "http://localhost:5094/api/todos";

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
    const res = await fetch(API_BASE);
    return handleResponse<TodoItem[]>(res);
  },

  async getById(id: string): Promise<TodoItem> {
    const res = await fetch(`${API_BASE}/${id}`);
    return handleResponse<TodoItem>(res);
  },

  async create(data: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status?: string;
    tags?: string[];
  }): Promise<TodoItem> {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    }
  ): Promise<TodoItem> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<TodoItem>(res);
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    return handleResponse<void>(res);
  },

  async updateStatus(id: string, status: string): Promise<TodoItem> {
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return handleResponse<TodoItem>(res);
  },
};
