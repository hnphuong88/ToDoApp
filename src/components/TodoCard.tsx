import { useNavigate } from "react-router-dom";
import { useTodo } from "../context/TodoContext";
import type { TodoItem, TodoStatus } from "../types";
import "./TodoCard.css";

interface TodoCardProps {
  todo: TodoItem;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: "To Do",
  inprogress: "In Progress",
  complete: "Complete",
};

export default function TodoCard({ todo }: TodoCardProps) {
  const { changeStatus } = useTodo();
  const navigate = useNavigate();

  async function handleCycleStatus(e: React.MouseEvent) {
    e.stopPropagation();
    const order: TodoStatus[] = ["todo", "inprogress", "complete"];
    const idx = order.indexOf(todo.status);
    const next = order[(idx + 1) % order.length];
    try {
      await changeStatus(todo.id, next);
    } catch {
      // silently fail; user can retry
    }
  }

  return (
    <div
      className={`todo-card ${todo.status === "complete" ? "completed" : ""}`}
      onClick={() => navigate(`/todo/${todo.id}`)}
    >
      <button
        className={`status-dot status-dot-${todo.status}`}
        onClick={handleCycleStatus}
        aria-label={`Status: ${STATUS_LABELS[todo.status]}. Click to change.`}
        title={STATUS_LABELS[todo.status]}
      >
        {todo.status === "complete" && (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
      <div className="todo-card-body">
        <div className="todo-card-top-row">
          <span className="todo-card-title">{todo.title}</span>
          <span className={`status-badge status-${todo.status}`}>
            {STATUS_LABELS[todo.status]}
          </span>
        </div>
        <div className="todo-card-bottom-row">
          <span className="todo-card-date">{formatDate(todo.dueDate)}</span>
          {todo.assignedTo && (
            <span className="todo-card-assignee" title={`Assigned to ${todo.assignedTo.displayName}`}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {todo.assignedTo.displayName}
            </span>
          )}
          {todo.tags.length > 0 && (
            <div className="todo-card-tags">
              {todo.tags.map((tag) => (
                <span key={tag} className="tag-pill-sm">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <span className={`priority-badge priority-${todo.priority}`}>
        {todo.priority}
      </span>
    </div>
  );
}
