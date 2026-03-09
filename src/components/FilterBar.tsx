import { useState } from "react";
import "./FilterBar.css";

export type FilterMode = "today" | "week" | "specific";

interface FilterBarProps {
  mode: FilterMode;
  specificDate: string;
  searchQuery: string;
  selectedTag: string;
  allTags: string[];
  onModeChange: (mode: FilterMode) => void;
  onDateChange: (date: string) => void;
  onSearchChange: (query: string) => void;
  onTagChange: (tag: string) => void;
}

export default function FilterBar({
  mode,
  specificDate,
  searchQuery,
  selectedTag,
  allTags,
  onModeChange,
  onDateChange,
  onSearchChange,
  onTagChange,
}: FilterBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(mode === "specific");

  function handleModeClick(m: FilterMode) {
    if (m === "specific") {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
    onModeChange(m);
  }

  return (
    <div className="filter-bar">
      <div className="filter-buttons">
        <button
          className={`filter-btn ${mode === "today" ? "active" : ""}`}
          onClick={() => handleModeClick("today")}
        >
          Today
        </button>
        <button
          className={`filter-btn ${mode === "week" ? "active" : ""}`}
          onClick={() => handleModeClick("week")}
        >
          This Week
        </button>
        <button
          className={`filter-btn ${mode === "specific" ? "active" : ""}`}
          onClick={() => handleModeClick("specific")}
        >
          Pick a Day
        </button>
      </div>
      {showDatePicker && (
        <div className="filter-date-picker">
          <input
            type="date"
            value={specificDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      )}

      <div className="filter-search-row">
        <div className="search-input-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tag-pills-filter">
          <button
            className={`tag-pill-btn ${selectedTag === "" ? "active" : ""}`}
            onClick={() => onTagChange("")}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-pill-btn ${selectedTag === tag ? "active" : ""}`}
              onClick={() => onTagChange(selectedTag === tag ? "" : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
