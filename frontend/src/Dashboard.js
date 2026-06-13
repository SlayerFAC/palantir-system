import { useEffect, useState } from "react";
import Layout from "./Layout";
import { toast } from "react-hot-toast";

const API = "http://localhost:8000";

export default function Dashboard() {

  // =========================
  // STATE
  // =========================
  const [userEmail, setUserEmail] = useState("");
  const [invites, setInvites] = useState([]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("VIEWER");

  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD DATA
  // =========================
  const load = async () => {
    try {
      const res = await fetch(`${API}/api/dashboard`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!data.error) {
        setUserEmail(data.user_email);
        setInvites(data.invites || []);
      } else {
        window.location.href = "/login";
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // SEND INVITE
  // =========================
  const sendInvite = async () => {

    if (!inviteEmail) {
      toast.error("Enter email");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", inviteEmail);
      formData.append("role", inviteRole);

      const res = await fetch(`${API}/api/invite`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Invite sent ✅");
        setInviteEmail("");
        load();
      } else {
        toast.error(data.error);
      }

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }

    setLoading(false);
  };

  // =========================
  // REVOKE INVITE
  // =========================
  const revokeInvite = async (id) => {

    try {
      const formData = new FormData();
      formData.append("invite_id", id);

      await fetch(`${API}/api/revoke-invite`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      toast.success("Invite revoked");
      load();

    } catch (err) {
      console.error(err);
      toast.error("Failed to revoke invite");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <Layout userEmail={userEmail}>

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold mb-6 text-black dark:text-white">
        Dashboard
      </h1>

      {/* ================= INVITE CARD ================= */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded shadow mb-6">

        <h2 className="text-lg font-medium mb-4 text-black dark:text-white">
          Invite User
        </h2>

        <div className="flex gap-3">

          {/* EMAIL INPUT */}
          <input
            type="email"
            placeholder="user@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="border p-2 rounded w-full
            bg-white dark:bg-gray-700
            text-black dark:text-white
            border-gray-300 dark:border-gray-600"
          />

          {/* ROLE SELECT */}
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="border p-2 rounded
            bg-white dark:bg-gray-700
            text-black dark:text-white
            border-gray-300 dark:border-gray-600"
          >
            <option value="VIEWER">Viewer</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* SEND BUTTON */}
          <button
            onClick={sendInvite}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "..." : "Send"}
          </button>

        </div>

      </div>

      {/* ================= INVITES LIST ================= */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded shadow">

        <h2 className="text-lg font-medium mb-4 text-black dark:text-white">
          Invites
        </h2>

        {invites.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            No invites yet
          </p>
        )}

        {invites.map((i) => (
          <div
            key={i.id}
            className="flex justify-between items-center border-b
            border-gray-200 dark:border-gray-700 py-2"
          >

            <div>
              <span className="font-medium text-black dark:text-white">
                {i.email}
              </span>

              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                {i.role} • {i.status}
              </span>
            </div>

            <button
              onClick={() => revokeInvite(i.id)}
              className="text-red-600 text-sm hover:underline"
            >
              Revoke
            </button>

          </div>
        ))}

      </div>

    </Layout>
  );
}