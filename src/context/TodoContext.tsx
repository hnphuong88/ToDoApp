import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type { User, TodoItem, TodoStatus } from "../types";
import { todoApi } from "../services/todoApi";

const STORAGE_KEY_USER = "todo_user";

interface AppState {
  user: User | null;
  todos: TodoItem[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "SET_USER"; payload: User }
  | { type: "CLEAR_USER" }
  | { type: "SET_TODOS"; payload: TodoItem[] }
  | { type: "ADD_TODO"; payload: TodoItem }
  | { type: "UPDATE_TODO"; payload: TodoItem }
  | { type: "DELETE_TODO"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function getInitialState(): AppState {
  return {
    user: loadUser(),
    todos: [],
    loading: false,
    error: null,
  };
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_USER":
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(action.payload));
      return { ...state, user: action.payload };

    case "CLEAR_USER":
      localStorage.removeItem(STORAGE_KEY_USER);
      return { ...state, user: null, todos: [] };

    case "SET_TODOS":
      return { ...state, todos: action.payload };

    case "ADD_TODO":
      return { ...state, todos: [...state.todos, action.payload] };

    case "UPDATE_TODO":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload),
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

interface TodoContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  fetchTodos: () => Promise<void>;
  createTodo: (data: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status?: string;
    tags?: string[];
  }) => Promise<TodoItem>;
  updateTodo: (
    id: string,
    data: {
      title: string;
      description: string;
      dueDate: string;
      priority: string;
      status: string;
      tags: string[];
    }
  ) => Promise<TodoItem>;
  deleteTodo: (id: string) => Promise<void>;
  changeStatus: (id: string, status: TodoStatus) => Promise<TodoItem>;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  const fetchTodos = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const todos = await todoApi.getAll();
      dispatch({ type: "SET_TODOS", payload: todos });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to fetch todos",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const createTodo = useCallback(
    async (data: {
      title: string;
      description: string;
      dueDate: string;
      priority: string;
      status?: string;
      tags?: string[];
    }) => {
      const created = await todoApi.create(data);
      dispatch({ type: "ADD_TODO", payload: created });
      return created;
    },
    []
  );

  const updateTodo = useCallback(
    async (
      id: string,
      data: {
        title: string;
        description: string;
        dueDate: string;
        priority: string;
        status: string;
        tags: string[];
      }
    ) => {
      const updated = await todoApi.update(id, data);
      dispatch({ type: "UPDATE_TODO", payload: updated });
      return updated;
    },
    []
  );

  const deleteTodo = useCallback(async (id: string) => {
    await todoApi.delete(id);
    dispatch({ type: "DELETE_TODO", payload: id });
  }, []);

  const changeStatus = useCallback(async (id: string, status: TodoStatus) => {
    const updated = await todoApi.updateStatus(id, status);
    dispatch({ type: "UPDATE_TODO", payload: updated });
    return updated;
  }, []);

  return (
    <TodoContext.Provider
      value={{
        state,
        dispatch,
        fetchTodos,
        createTodo,
        updateTodo,
        deleteTodo,
        changeStatus,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return ctx;
}
