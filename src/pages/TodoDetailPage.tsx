import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTodo } from "../context/TodoContext";
import type { TodoStatus } from "../types";
import Header from "../components/Header";
import ConfirmModal from "../components/ConfirmModal";
import "./TodoDetailPage.css";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: "To Do",
  inprogress: "In Progress",
  complete: "Complete",
};

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, deleteTodo, changeStatus } = useTodo();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const todo = state.todos.find((t) => t.id === id);

  if (!todo) {
    return (
      <div className="dashboard">
        <Header />
        <main className="container detail-page">
          <div className="empty-state">
            <h3>Task not found</h3>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await deleteTodo(todo!.id);
      navigate("/dashboard");
    } catch {
      setShowDeleteModal(false);
    }
  }

  async function handleStatusChange(newStatus: TodoStatus) {
    try {
      await changeStatus(todo!.id, newStatus);
    } catch {
      // silently fail
    }
  }

  return (
    <div className="dashboard">
      <Header />
      <main className="container detail-page">
        <div className="detail-card">
          <div className="detail-header-row">
            <div className="detail-title-group">
              <h2 className={`detail-title ${todo.status === "complete" ? "completed-title" : ""}`}>
                {todo.title}
              </h2>
              <span className={`priority-badge priority-${todo.priority}`}>
                {todo.priority}
              </span>
              <span className={`status-badge status-${todo.status}`}>
                {STATUS_LABELS[todo.status]}
              </span>
            </div>
          </div>

          {todo.description && (
            <p className="detail-description">{todo.description}</p>
          )}

          {todo.tags.length > 0 && (
            <div className="detail-tags">
              {todo.tags.map((tag) => (
                <span key={tag} className="tag-pill-sm">{tag}</span>
              ))}
            </div>
          )}

          <div className="detail-meta">
            <div className="meta-row">
              <span className="meta-label">Due Date</span>
              <span className="meta-value">{formatDate(todo.dueDate)}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Status</span>
              <div className="detail-status-selector">
                {(["todo", "inprogress", "complete"] as TodoStatus[]).map((s) => (
                  <button
                    key={s}
                    className={`detail-status-btn ${todo.status === s ? "active" : ""} detail-status-${s}`}
                    onClick={() => handleStatusChange(s)}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            {todo.owner && (
              <div className="meta-row">
                <span className="meta-label">Owner</span>
                <span className="meta-value">{todo.owner.displayName}</span>
              </div>
            )}
            {todo.assignedTo && (
              <div className="meta-row">
                <span className="meta-label">Assigned To</span>
                <span className="meta-value">{todo.assignedTo.displayName}</span>
              </div>
            )}
            <div className="meta-row">
              <span className="meta-label">Created</span>
              <span className="meta-value">{formatTimestamp(todo.createdAt)}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Updated</span>
              <span className="meta-value">{formatTimestamp(todo.updatedAt)}</span>
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
              Back
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/todo/${todo.id}/edit`)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              Delete
            </button>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Task"
          message={`Are you sure you want to delete "${todo.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
