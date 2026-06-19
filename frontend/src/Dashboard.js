import { useEffect, useState } from "react";
import Layout from "./Layout";
import { toast } from "react-hot-toast";

import Modal from "./components/Modal";
import Skeleton from "./components/Skeleton";
import PortfolioSection from "./components/PortfolioSection";

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
  const [initialLoading, setInitialLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);

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

    setInitialLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // SEND INVITE
  // =========================
  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required");
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
  // MODAL HANDLING
  // =========================
  const openRevokeModal = (id) => {
    setSelectedInvite(id);
    setModalOpen(true);
  };

  const confirmRevoke = async () => {
    try {
      const formData = new FormData();
      formData.append("invite_id", selectedInvite);

      await fetch(`${API}/api/revoke-invite`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      toast.success("Invite revoked");
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to revoke invite");
    }
  };

  const isFormValid = inviteEmail.trim().length > 0;

  // =========================
  // UI
  // =========================
  return (
    <Layout userEmail={userEmail}>

      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      {/* ✅ PORTFOLIO SECTION */}
      <PortfolioSection />

      {/* ================= INVITE CARD ================= */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded shadow mb-6 animate-fadeIn">

        <h2 className="text-lg font-medium mb-4">
          Invite User
        </h2>

        <div className="flex gap-3">

          {/* EMAIL */}
          <input
            type="email"
            placeholder="user@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="border p-2 rounded w-full
              bg-white dark:bg-gray-700
              text-black dark:text-white
              border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* ROLE */}
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

          {/* BUTTON */}
          <button
            onClick={sendInvite}
            disabled={!isFormValid || loading}
            className={`px-4 py-2 rounded text-white transition
              ${loading || !isFormValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}
          >
            {loading ? "Sending..." : "Send"}
          </button>

        </div>

      </div>

      {/* ================= INVITES ================= */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded shadow animate-fadeIn">

        <h2 className="text-lg font-medium mb-4">
          Invites
        </h2>

        {initialLoading ? (
          <Skeleton lines={4} />
        ) : invites.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No invites yet 📭
          </div>
        ) : (
          invites.map((i) => (
            <div
              key={i.id}
              className="flex justify-between items-center border-b py-3
              hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >

              <div>
                <div className="font-medium">
                  {i.email}
                </div>

                <div className="text-sm mt-1 flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {i.role}
                  </span>

                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                    {i.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openRevokeModal(i.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Revoke
              </button>

            </div>
          ))
        )}

      </div>

      {/* ✅ MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmRevoke}
        title="Revoke Invite"
      >
        Are you sure you want to revoke this invite?
      </Modal>

    </Layout>
  );
}