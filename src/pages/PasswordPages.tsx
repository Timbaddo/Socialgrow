import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Logo } from "../components/Logo";

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await resetPassword(email);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <Logo size={40} />
      <div className="w-full max-w-sm mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-lg font-bold mb-2">Reset your password</h1>
        {sent ? (
          <p className="text-sm text-slate-600">
            If that email is registered, we've sent a reset link. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <p className="text-sm text-slate-500 mb-3">Enter your email and we'll send you a reset link.</p>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm" />
            <button className="w-full bg-brand text-white font-semibold rounded-xl py-2.5">Send reset link</button>
          </form>
        )}
        <p className="text-sm text-slate-500 text-center mt-4">
          <Link to="/login" className="text-brand font-semibold">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <Logo size={40} />
      <div className="w-full max-w-sm mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h1 className="text-lg font-bold mb-2">Choose a new password</h1>
        {done ? (
          <p className="text-sm text-slate-600">Your password has been updated. You can now log in.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm" />
            <button className="w-full bg-brand text-white font-semibold rounded-xl py-2.5">Update password</button>
          </form>
        )}
        <p className="text-sm text-slate-500 text-center mt-4">
          <Link to="/login" className="text-brand font-semibold">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
