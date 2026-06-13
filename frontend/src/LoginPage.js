import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function LoginPage() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = async (endpoint) => {

    const f = new FormData();
    f.append("email", email);
    f.append("password", password);

    const res = await fetch(`${API}/${endpoint}`, {
      method: "POST",
      credentials: "include",
      body: f
    });

    const data = await res.json();

    if (data.success) {
      navigate("/");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white p-8 rounded shadow w-full max-w-md">

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Welcome back
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={() => auth("api/login")}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>

        <button
          onClick={() => auth("api/register")}
          className="w-full border py-2 rounded mt-2"
        >
          Create account
        </button>

        <button
          onClick={() => {
            const f = new FormData();
            f.append("email", email);
            fetch(`${API}/api/request-reset`, { method: "POST", body: f });
            alert("If account exists, email sent");
          }}
          className="text-sm text-gray-500 mt-3 w-full"
        >
          Forgot password?
        </button>

        <div className="text-center mt-6">
          <span className="text-gray-400">or</span>
        </div>

        <a href={`${API}/login/google`}>
          <button className="w-full bg-red-500 text-white py-2 rounded mt-4">
            Continue with Google
          </button>
        </a>

      </div>

    </div>
  );
}