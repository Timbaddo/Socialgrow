import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { StateMessage } from "../components/StateMessage";
import { PlatformIcon } from "../components/PlatformIcon";
import { ACTION_LABEL, PLATFORM_META } from "../lib/types";

interface ProofRow {
  id: string; status: "pending" | "approved" | "rejected"; rejection_reason: string | null;
  created_at: string;
  tasks: { platform: any; action: any; username: string } | null;
}

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
] as const;

export default function MyTasksPage() {
  const { appUser } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("pending");
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    setLoading(true);
    supabase
      .from("proofs")
      .select("id, status, rejection_reason, created_at, tasks(platform, action, username)")
      .eq("user_id", appUser.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProofs((data as any) ?? []);
        setLoading(false);
      });
  }, [appUser]);

  const filtered = proofs.filter((p) => p.status === tab);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-slate-900 mb-4">My Tasks</h1>

      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm font-semibold rounded-full px-4 py-1.5 ${
              tab === t.key ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <StateMessage emoji="⏳" title="Loading your tasks..." />
      ) : filtered.length === 0 ? (
        <StateMessage
          emoji="📭"
          title={`No ${tab} tasks`}
          subtitle={tab === "pending" ? "Your proof is in the queue. We'll let you know when it's reviewed." : undefined}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                {p.tasks && <PlatformIcon platform={p.tasks.platform} size={22} />}
                <span className="text-sm font-medium text-slate-800">
                  {p.tasks ? `${PLATFORM_META[p.tasks.platform as keyof typeof PLATFORM_META].label} · ${ACTION_LABEL[p.tasks.action as keyof typeof ACTION_LABEL]}` : "Task"}
                </span>
              </div>
              {p.status === "pending" && <p className="text-xs text-amber-600">⏳ Waiting for admin review</p>}
              {p.status === "approved" && <p className="text-xs text-growmint">✅ Approved — +10 XP</p>}
              {p.status === "rejected" && (
                <p className="text-xs text-red-500">❌ Rejected: {p.rejection_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
