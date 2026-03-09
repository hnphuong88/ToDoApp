import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTodo } from "../context/TodoContext";
import Header from "../components/Header";
import FilterBar, { type FilterMode } from "../components/FilterBar";
import TodoCard from "../components/TodoCard";
import CalendarView from "../components/CalendarView";
import { useDueNotifications } from "../hooks/useDueNotifications";
import "./DashboardPage.css";

type ViewMode = "list" | "calendar";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekRange(): [string, string] {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return [monday.toISOString().slice(0, 10), sunday.toISOString().slice(0, 10)];
}

const STATUS_ORDER: Record<string, number> = { todo: 0, inprogress: 1, complete: 2 };

export default function DashboardPage() {
  const { state, fetchTodos } = useTodo();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("today");
  const [specificDate, setSpecificDate] = useState(todayStr());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useDueNotifications(state.todos);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    state.todos.forEach((t) => t.tags?.forEach((tag) => tagSet.add(tag)));
    return [...tagSet].sort();
  }, [state.todos]);

  const filteredTodos = useMemo(() => {
    let items = [...state.todos];

    if (viewMode === "list") {
      if (filterMode === "today") {
        const today = todayStr();
        items = items.filter((t) => t.dueDate === today);
      } else if (filterMode === "week") {
        const [start, end] = getWeekRange();
        items = items.filter((t) => t.dueDate >= start && t.dueDate <= end);
      } else {
        items = items.filter((t) => t.dueDate === specificDate);
      }
    } else if (calendarSelectedDate) {
      items = items.filter((t) => t.dueDate === calendarSelectedDate);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter((t) => t.title.toLowerCase().includes(q));
    }

    if (selectedTag) {
      items = items.filter((t) => t.tags?.includes(selectedTag));
    }

    items.sort((a, b) => {
      const sa = STATUS_ORDER[a.status] ?? 0;
      const sb = STATUS_ORDER[b.status] ?? 0;
      if (sa !== sb) return sa - sb;
      return a.dueDate.localeCompare(b.dueDate);
    });

    return items;
  }, [state.todos, viewMode, filterMode, specificDate, calendarSelectedDate, searchQuery, selectedTag]);

  function handleCalendarDaySelect(date: string) {
    setCalendarSelectedDate(date);
  }

  return (
    <div className="dashboard">
      <Header />
      <main className="container dashboard-main">
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
            onClick={() => setViewMode("calendar")}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Calendar
          </button>
        </div>

        {viewMode === "list" && (
          <FilterBar
            mode={filterMode}
            specificDate={specificDate}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            allTags={allTags}
            onModeChange={setFilterMode}
            onDateChange={setSpecificDate}
            onSearchChange={setSearchQuery}
            onTagChange={setSelectedTag}
          />
        )}

        {viewMode === "calendar" && (
          <>
            <CalendarView
              todos={state.todos}
              onDaySelect={handleCalendarDaySelect}
              selectedDate={calendarSelectedDate}
            />
            <div className="filter-search-row" style={{ marginBottom: "var(--spacing-md)" }}>
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            {allTags.length > 0 && (
              <div className="tag-pills-filter" style={{ marginBottom: "var(--spacing-md)" }}>
                <button
                  className={`tag-pill-btn ${selectedTag === "" ? "active" : ""}`}
                  onClick={() => setSelectedTag("")}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-pill-btn ${selectedTag === tag ? "active" : ""}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {state.loading ? (
          <div className="loading-state">
            <p>Loading tasks...</p>
          </div>
        ) : state.error ? (
          <div className="error-state">
            <p>Failed to load tasks. Is the backend running?</p>
            <button className="btn btn-secondary" onClick={fetchTodos}>
              Retry
            </button>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="12" y="8" width="40" height="48" rx="4" />
                <line x1="22" y1="22" x2="42" y2="22" />
                <line x1="22" y1="30" x2="38" y2="30" />
                <line x1="22" y1="38" x2="34" y2="38" />
              </svg>
            </div>
            <h3>No tasks found</h3>
            <p>
              {viewMode === "calendar" && !calendarSelectedDate
                ? "Select a day on the calendar to view tasks."
                : filterMode === "today" && viewMode === "list"
                  ? "You have no tasks for today. Enjoy your free time, or add a new task!"
                  : "No tasks match this filter. Try a different date or create a new task."}
            </p>
          </div>
        ) : (
          <div className="todo-list">
            {filteredTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </main>

      <button
        className="fab"
        onClick={() => navigate("/todo/new")}
        aria-label="Create new task"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
