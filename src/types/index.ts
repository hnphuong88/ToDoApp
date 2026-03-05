export interface User {
  firstName: string;
  lastName: string;
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
  createdAt: string;
  updatedAt: string;
}
