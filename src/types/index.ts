export interface AppUser {
  id: string;
  displayName: string;
  email: string;
}

export interface Team {
  id: string;
  name: string;
  owner: AppUser;
  members: AppUser[];
  createdAt: string;
}

export type Priority = "low" | "medium" | "high";

export type TodoStatus = "todo" | "inprogress" | "complete";

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: TodoStatus;
  priority: Priority;
  tags: string[];
  owner?: AppUser | null;
  assignedTo?: AppUser | null;
  createdAt: string;
  updatedAt: string;
}
