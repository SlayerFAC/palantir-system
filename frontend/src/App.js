import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import Users from "./Users";

export default function App() {
  return (
    <BrowserRouter>

      {/* ✅ GLOBAL TOAST SYSTEM */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1f2937", // dark gray (Tailwind gray-800)
            color: "#fff",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "14px"
          },
          success: {
            style: {
              background: "#16a34a", // green
            }
          },
          error: {
            style: {
              background: "#dc2626", // red
            }
          }
        }}
      />

      <Routes>

        {/* ✅ PUBLIC */}
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ APP */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />

      </Routes>

    </BrowserRouter>
  );
}