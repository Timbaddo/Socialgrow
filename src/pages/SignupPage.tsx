import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password, username);
    setLoading(false);
    if (error) setError(error);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-3">📬</div>
        <h1 className="text-lg font-bold mb-2">You're all set!</h1>
        <p className="text-sm text-slate-500 mb-6">
          Check your email to confirm your account, then log in to get started.
        </p>
        <Link to="/login" className="bg-brand text-white font-semibold rounded-xl px-6 py-2.5">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-brand/5 to-white">
      <Logo size={44} />
      <form onSubmit={handleSubmit} className="w-full max-w-sm mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-lg font-bold mb-4">Create your account</h1>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
        <input required value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm" />
        <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm" />
        <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-2 text-sm" />
        <button disabled={loading}
          className="w-full mt-4 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold rounded-xl py-2.5">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        <p className="text-sm text-slate-500 text-center mt-4">
          Already have an account? <Link to="/login" className="text-brand font-semibold">Log in</Link>
        </p>
      </form>
    </div>
  );
}
