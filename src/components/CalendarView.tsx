import { useState, useMemo } from "react";
import type { TodoItem } from "../types";
import "./CalendarView.css";

interface CalendarViewProps {
  todos: TodoItem[];
  onDaySelect: (date: string) => void;
  selectedDate: string | null;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarView({ todos, onDaySelect, selectedDate }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const taskCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    todos.forEach((t) => {
      map[t.dueDate] = (map[t.dueDate] || 0) + 1;
    });
    return map;
  }, [todos]);

  const todayStr = toDateStr(today);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  function goPrev() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goNext() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={goPrev} aria-label="Previous month">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="calendar-title">{MONTH_NAMES[month]} {year}</span>
        <button className="calendar-nav" onClick={goNext} aria-label="Next month">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="calendar-grid">
        {DAY_HEADERS.map((dh) => (
          <div key={dh} className="calendar-day-header">{dh}</div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-cell empty" />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const count = taskCountByDate[dateStr] || 0;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              className={`calendar-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${count > 0 ? "has-tasks" : ""}`}
              onClick={() => onDaySelect(dateStr)}
            >
              <span className="calendar-day-num">{day}</span>
              {count > 0 && (
                <span className="calendar-dot-count">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
