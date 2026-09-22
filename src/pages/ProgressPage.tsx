import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { StateMessage } from "../components/StateMessage";

const UNLOCK_THRESHOLD = 100;

interface Counts { approved: number; pending: number; rejected: number; }
interface XpTx { id: string; amount: number; transaction_type: string; created_at: string; }

export default function ProgressPage() {
  const { appUser } = useAuth();
  const [counts, setCounts] = useState<Counts>({ approved: 0, pending: 0, rejected: 0 });
  const [history, setHistory] = useState<XpTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    (async () => {
      const [{ data: proofs }, { data: tx }] = await Promise.all([
        supabase.from("proofs").select("status").eq("user_id", appUser.id),
        supabase.from("xp_transactions").select("id, amount, transaction_type, created_at")
          .eq("user_id", appUser.id).order("created_at", { ascending: false }).limit(10),
      ]);
      const c: Counts = { approved: 0, pending: 0, rejected: 0 };
      (proofs ?? []).forEach((p: any) => { c[p.status as keyof Counts]++; });
      setCounts(c);
      setHistory((tx as XpTx[]) ?? []);
      setLoading(false);
    })();
  }, [appUser]);

  if (!appUser) return null;
  const pct = Math.min(100, Math.round((appUser.xp / UNLOCK_THRESHOLD) * 100));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-slate-900 mb-4">My Progress</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <p className="text-3xl font-extrabold text-brand mb-1">{appUser.xp} XP</p>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-growmint rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-400">{pct}% toward unlocking your own profile</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBox label="Approved" value={counts.approved} color="text-growmint" />
        <StatBox label="Pending" value={counts.pending} color="text-amber-500" />
        <StatBox label="Rejected" value={counts.rejected} color="text-red-500" />
      </div>

      <h2 className="text-sm font-bold text-slate-600 mb-2">Recent XP history</h2>
      {loading ? (
        <StateMessage emoji="⏳" title="Loading your progress..." />
      ) : history.length === 0 ? (
        <StateMessage emoji="✨" title="No XP yet" subtitle="Complete a task to start earning." />
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((tx) => (
            <div key={tx.id} className="bg-white rounded-xl border border-slate-200 p-3 flex justify-between items-center">
              <span className="text-sm text-slate-600">Task approved</span>
              <span className="text-sm font-bold text-growmint">+{tx.amount} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
      <p className={`text-xl font-extrabold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
