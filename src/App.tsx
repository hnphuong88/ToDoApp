import { Routes, Route, Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import TodoDetailPage from "./pages/TodoDetailPage";
import TodoFormPage from "./pages/TodoFormPage";
import TeamPage from "./pages/TeamPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/todo/new"
        element={
          <ProtectedRoute>
            <TodoFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/todo/:id"
        element={
          <ProtectedRoute>
            <TodoDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/todo/:id/edit"
        element={
          <ProtectedRoute>
            <TodoFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
