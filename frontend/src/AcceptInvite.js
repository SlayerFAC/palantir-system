import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function AcceptInvite() {

  const [params] = useSearchParams();
  const token = params.get("token");

  const [state, setState] = useState("loading");
  const [invite, setInvite] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/invite-info?token=${token}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {

        if (data.need_login) {
          setState("login");
          return;
        }

        if (data.wrong_account) {
          setState("wrong");
          return;
        }

        if (data.error) {
          setState("error");
          return;
        }

        if (data.already_joined) {
          setState("already");
          return;
        }

        setInvite(data);
        setState("ready");
      });
  }, []);

  const accept = async () => {
    const res = await fetch(`${API}/api/accept-invite`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ token })
    });

    const data = await res.json();

    if (data.success) {
      setState("success");

      setTimeout(() => navigate("/"), 1500);
    }
  };

  // ========================= UI =========================

  if (state === "loading") return <h2>⏳ Loading...</h2>;

  if (state === "login") {
    return (
      <div>
        <h2>🔐 Login required</h2>
        <button onClick={() => window.location.href = `${API}/login`}>
          Login with Google
        </button>
      </div>
    );
  }

  if (state === "wrong") {
    return (
      <div>
        <h2>⚠️ Wrong account</h2>
        <p>Please login using the invited email</p>
        <button onClick={() => window.location.href = `${API}/login`}>
          Switch Account
        </button>
      </div>
    );
  }

  if (state === "already") {
    return <h2>✅ Already joined</h2>;
  }

  if (state === "error") {
    return <h2>❌ Invalid or expired invite</h2>;
  }

  if (state === "success") {
    return <h2>✅ Joined successfully!</h2>;
  }

  return (
    <div>
      <h2>🎉 You're invited</h2>
      <p>Email: {invite.email}</p>
      <p>Role: {invite.role}</p>

      <button onClick={accept}>
        Accept Invite
      </button>
    </div>
  );
}