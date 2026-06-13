import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import Users from "./Users";

export default function App() {
  return (
    <BrowserRouter>

      {/* ✅ Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <Routes>

        {/* ✅ Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ Protected routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />

      </Routes>

    </BrowserRouter>
  );
}