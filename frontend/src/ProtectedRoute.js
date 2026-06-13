import { useEffect, useState } from "react";
import API from "./api";

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch(`${API}/api/dashboard`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus("unauthenticated");
        } else {
          setStatus("authenticated");
        }
      })
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "loading") {
    return <p className="p-10">Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600 mb-4">
          You must log in first
        </p>

        <a
          href="http://127.0.0.1:8000/login"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login with Google
        </a>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;