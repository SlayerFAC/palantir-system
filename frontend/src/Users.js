import { useEffect, useState } from "react";
import Layout from "./Layout";
import { toast } from "react-hot-toast";

const API = "http://localhost:8000";

export default function Users() {

  const [users, setUsers] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  // =========================
  // LOAD USERS
  // =========================
  const load = async () => {

    try {
      // ✅ Load users
      const res = await fetch(`${API}/api/users`, {
        credentials: "include"
      });

      const data = await res.json();

      if (!data.error) {
        setUsers(data.users || []);

        // ✅ Get logged user (for Layout)
        const dash = await fetch(`${API}/api/dashboard`, {
          credentials: "include"
        });

        const d = await dash.json();
        setUserEmail(d.user_email);

      } else {
        window.location.href = "/login";
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <Layout userEmail={userEmail}>

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold mb-6 text-black dark:text-white">
        Users
      </h1>

      {/* ================= USERS CARD ================= */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">

        <h2 className="text-lg font-medium mb-4 text-black dark:text-white">
          Team Members
        </h2>

        {/* EMPTY STATE */}
        {users.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            No users yet
          </p>
        )}

        {/* USER LIST */}
        {users.map((u, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b
            border-gray-200 dark:border-gray-700 py-2"
          >

            {/* EMAIL */}
            <span className="text-black dark:text-white">
              {u.email}
            </span>

            {/* ROLE */}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {u.role}
            </span>

          </div>
        ))}

      </div>

    </Layout>
  );
}