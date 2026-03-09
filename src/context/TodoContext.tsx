import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import type { AppUser, TodoItem, TodoStatus, Team } from "../types";
import { todoApi } from "../services/todoApi";
import { userApi } from "../services/userApi";
import { teamApi } from "../services/teamApi";

interface AppState {
  user: AppUser | null;
  todos: TodoItem[];
  teams: Team[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "SET_USER"; payload: AppUser }
  | { type: "CLEAR_USER" }
  | { type: "SET_TODOS"; payload: TodoItem[] }
  | { type: "ADD_TODO"; payload: TodoItem }
  | { type: "UPDATE_TODO"; payload: TodoItem }
  | { type: "DELETE_TODO"; payload: string }
  | { type: "SET_TEAMS"; payload: Team[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

function getInitialState(): AppState {
  return {
    user: null,
    todos: [],
    teams: [],
    loading: false,
    error: null,
  };
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "CLEAR_USER":
      return { ...state, user: null, todos: [], teams: [] };

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

    case "SET_TEAMS":
      return { ...state, teams: action.payload };

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
  fetchTeams: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  createTodo: (data: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status?: string;
    tags?: string[];
    assignedToUserId?: string | null;
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
      assignedToUserId?: string | null;
    }
  ) => Promise<TodoItem>;
  deleteTodo: (id: string) => Promise<void>;
  changeStatus: (id: string, status: TodoStatus) => Promise<TodoItem>;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);
  const isAuthenticated = useIsAuthenticated();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const user = await userApi.getMe();
      dispatch({ type: "SET_USER", payload: user });
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  }, []);

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

  const fetchTeams = useCallback(async () => {
    try {
      const teams = await teamApi.getMyTeams();
      dispatch({ type: "SET_TEAMS", payload: teams });
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  }, []);

  const didFetch = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !didFetch.current) {
      didFetch.current = true;
      fetchCurrentUser();
      fetchTodos();
      fetchTeams();
    }
  }, [isAuthenticated, fetchCurrentUser, fetchTodos, fetchTeams]);

  const createTodo = useCallback(
    async (data: {
      title: string;
      description: string;
      dueDate: string;
      priority: string;
      status?: string;
      tags?: string[];
      assignedToUserId?: string | null;
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
        assignedToUserId?: string | null;
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
        fetchTeams,
        fetchCurrentUser,
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
