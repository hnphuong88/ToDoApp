import { useState, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTodo } from "../context/TodoContext";
import type { Priority, TodoStatus } from "../types";
import Header from "../components/Header";
import "./TodoFormPage.css";

export default function TodoFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { state, createTodo, updateTodo } = useTodo();
  const navigate = useNavigate();

  const existing = isEdit ? state.todos.find((t) => t.id === id) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TodoStatus>("todo");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setDueDate(existing.dueDate);
      setPriority(existing.priority);
      setStatus(existing.status);
      setTags(existing.tags ?? []);
    }
  }, [existing]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "Title is required";
    if (!dueDate) next.dueDate = "Due date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleAddTag(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      if (isEdit && existing) {
        await updateTodo(existing.id, {
          title: title.trim(),
          description: description.trim(),
          dueDate,
          priority,
          status,
          tags,
        });
      } else {
        await createTodo({
          title: title.trim(),
          description: description.trim(),
          dueDate,
          priority,
          status,
          tags,
        });
      }
      navigate("/dashboard");
    } catch {
      setErrors({ title: "Failed to save. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && !existing) {
    return (
      <div className="dashboard">
        <Header />
        <main className="container form-page">
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

  return (
    <div className="dashboard">
      <Header />
      <main className="container form-page">
        <div className="form-card">
          <h2 className="form-page-title">{isEdit ? "Edit Task" : "New Task"}</h2>
          <form className="todo-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                placeholder="What do you need to do?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Add some details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label>Priority</label>
              <div className="priority-radios">
                {(["low", "medium", "high"] as Priority[]).map((p) => (
                  <label key={p} className={`priority-option ${priority === p ? "selected" : ""} priority-${p}`}>
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={() => setPriority(p)}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {isEdit && (
              <div className="form-group">
                <label>Status</label>
                <div className="status-radios">
                  {([
                    { value: "todo" as TodoStatus, label: "To Do" },
                    { value: "inprogress" as TodoStatus, label: "In Progress" },
                    { value: "complete" as TodoStatus, label: "Complete" },
                  ]).map((s) => (
                    <label key={s.value} className={`status-option ${status === s.value ? "selected" : ""} status-${s.value}`}>
                      <input
                        type="radio"
                        name="status"
                        value={s.value}
                        checked={status === s.value}
                        onChange={() => setStatus(s.value)}
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="tagInput">Tags</label>
              <div className="tag-input-area">
                {tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                    <button type="button" className="tag-remove" onClick={() => handleRemoveTag(tag)}>
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  id="tagInput"
                  type="text"
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="tag-text-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : isEdit
                    ? "Save Changes"
                    : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
