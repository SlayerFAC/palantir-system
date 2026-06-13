import { useSearchParams } from "react-router-dom";
import { useState } from "react";

const API = "http://localhost:8000";

export default function ResetPassword() {

  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const reset = async () => {

    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", password);

    const res = await fetch(`${API}/api/reset-password`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      setStatus("✅ Password updated");
    } else {
      setStatus(data.error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={reset}>
        Reset Password
      </button>

      <p>{status}</p>
    </div>
  );
}