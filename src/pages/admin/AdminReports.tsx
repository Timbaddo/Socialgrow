import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { StateMessage } from "../../components/StateMessage";

interface ReportRow {
  id: string; reason: string; description: string | null; status: string; created_at: string;
  app_users: { username: string } | null;
}

export default function AdminReports() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("id, reason, description, status, created_at, app_users!reports_reporter_id_fkey(username)")
      .order("created_at", { ascending: false });
    setReports((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("reports").update({ status }).eq("id", id);
    load();
  }

  if (loading) return <StateMessage emoji="⏳" title="Loading reports..." />;
  if (reports.length === 0) return <StateMessage emoji="🛡️" title="No reports" subtitle="Nothing to review right now." />;

  return (
    <div className="flex flex-col gap-2">
      {reports.map((r) => (
        <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm font-semibold">{r.reason}</p>
            <span className="text-[10px] uppercase font-bold text-slate-400">{r.status}</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Reported by {r.app_users?.username} · {new Date(r.created_at).toLocaleString()}
          </p>
          {r.description && <p className="text-sm text-slate-600 mb-2">{r.description}</p>}
          {r.status === "open" && (
            <div className="flex gap-2">
              <button onClick={() => updateStatus(r.id, "reviewed")} className="text-xs font-semibold bg-slate-100 rounded-full px-3 py-1">
                Mark Reviewed
              </button>
              <button onClick={() => updateStatus(r.id, "dismissed")} className="text-xs font-semibold bg-slate-100 rounded-full px-3 py-1">
                Dismiss
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
