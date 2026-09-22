import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-brand/5 to-white">
      <Logo size={44} />
      <form onSubmit={handleSubmit} className="w-full max-w-sm mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-lg font-bold mb-4">Welcome back</h1>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm"
        />
        <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-2 text-sm"
        />
        <Link to="/forgot-password" className="text-xs text-brand font-medium">Forgot password?</Link>
        <button
          disabled={loading}
          className="w-full mt-4 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold rounded-xl py-2.5"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
        <p className="text-sm text-slate-500 text-center mt-4">
          New here? <Link to="/signup" className="text-brand font-semibold">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
