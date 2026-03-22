import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import OrgPage from "./pages/OrgPage";
import HealthPage from "./pages/HealthPage";
import Login from "./pages/Login";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { handleAuth } from "./auth/auth";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // 🔥 process auth FIRST
    handleAuth();

    const t = localStorage.getItem("token");
    setToken(t);

    setIsReady(true);
  }, []);

  // ⛔ prevent routing before auth check
  if (!isReady) return null;

  return (
    <BrowserRouter>
      {token && <Navbar />}

      <div className="bg-gray-100 min-h-screen">
        <Routes>

          <Route
            path="/"
            element={
              token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />

          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/org"
            element={
              <ProtectedRoute>
                <OrgPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/health"
            element={
              <ProtectedRoute>
                <HealthPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}