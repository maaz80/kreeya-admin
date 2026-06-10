import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { clearAdminToken, isAdminLoggedIn, setAdminToken } from "../utils/auth.js";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export default function Login() {
     const navigate = useNavigate();
     const [username, setUsername] = useState("");
     const [password, setPassword] = useState("");
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");

     if (isAdminLoggedIn()) {
          return <Navigate to="/" replace />;
     }

     const handleSubmit = async (event) => {
          event.preventDefault();
          clearAdminToken();
          setError("");
          setLoading(true);

          try {
               const res = await fetch(`${API}/admin/login`, {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username: username.trim(), password })
               });

               const data = await res.json();

               if (!res.ok) {
                    throw new Error(data.error || "Login failed.");
               }

               setAdminToken(data.token);
               navigate("/", { replace: true });
          } catch (err) {
               setError(err.message);
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="min-h-screen bg-neutral-950/20 backdrop-blur-2xl flex items-center justify-center px-4">
               <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl"
               >
                    <h1 className="text-2xl font-semibold mb-6">Admin Login</h1>

                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                         value={username}
                         onChange={(event) => setUsername(event.target.value)}
                         className="border border-gray-300 rounded-lg p-3 mb-4 w-full outline-none focus:ring-2 focus:ring-orange-400"
                         autoComplete="username"
                         required
                    />

                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                         type="password"
                         value={password}
                         onChange={(event) => setPassword(event.target.value)}
                         className="border border-gray-300 rounded-lg p-3 mb-4 w-full outline-none focus:ring-2 focus:ring-orange-400"
                         autoComplete="current-password"
                         required
                    />

                    {error && (
                         <p className="text-sm text-red-600 mb-4">{error}</p>
                    )}

                    <button
                         type="submit"
                         disabled={loading}
                         className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium disabled:opacity-60"
                    >
                         {loading ? "Logging in..." : "Login"}
                    </button>
               </form>
          </div>
     );
}
