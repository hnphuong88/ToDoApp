import { useEffect, useRef, useCallback } from "react";
import type { TodoItem } from "../types";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useDueNotifications(todos: TodoItem[]) {
  const notifiedRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    function checkAndNotify() {
      const today = todayStr();
      todos.forEach((todo) => {
        if (
          todo.dueDate === today &&
          todo.status !== "complete" &&
          !notifiedRef.current.has(todo.id)
        ) {
          notifiedRef.current.add(todo.id);
          new Notification("Task Due Today", {
            body: todo.title,
            tag: todo.id,
          });
        }
      });
    }

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60_000);
    return () => clearInterval(interval);
  }, [todos]);

  return { requestPermission };
}
