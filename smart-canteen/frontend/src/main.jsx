import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import StudentApp from "./StudentApp";
import Login from "./Login";
import Register from "./Register";

function MainRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Student Public Web App */}
          <Route path="/" element={<StudentApp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MainRouter />
  </StrictMode>
);
