import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { StateMessage } from "../../components/StateMessage";
import { PlatformIcon } from "../../components/PlatformIcon";

interface ProofRow {
  id: string; storage_path: string; status: string; created_at: string;
  app_users: { username: string; email: string } | null;
  tasks: { platform: any; action: any; username: string } | null;
}

export default function AdminProofReview() {
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("proofs")
      .select("id, storage_path, status, created_at, app_users!proofs_user_id_fkey(username, email), tasks(platform, action, username)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    const rows = (data as any as ProofRow[]) ?? [];
    setProofs(rows);
    const urls: Record<string, string> = {};
    for (const p of rows) {
      const { data: signed } = await supabase.storage.from("proofs").createSignedUrl(p.storage_path, 3600);
      if (signed) urls[p.id] = signed.signedUrl;
    }
    setSignedUrls(urls);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    setBusyId(id);
    const { error } = await supabase.rpc("approve_proof", { p_proof_id: id });
    setBusyId(null);
    if (!error) setProofs((p) => p.filter((x) => x.id !== id));
    else alert(error.message);
  }

  async function reject() {
    if (!rejectingId || !reason.trim()) return;
    setBusyId(rejectingId);
    const { error } = await supabase.rpc("reject_proof", { p_proof_id: rejectingId, p_reason: reason });
    setBusyId(null);
    if (!error) {
      setProofs((p) => p.filter((x) => x.id !== rejectingId));
      setRejectingId(null);
      setReason("");
    } else alert(error.message);
  }

  if (loading) return <StateMessage emoji="⏳" title="Loading proofs..." />;
  if (proofs.length === 0) return <StateMessage emoji="✅" title="No pending proofs" subtitle="You're all caught up." />;

  return (
    <div className="flex flex-col gap-4">
      {proofs.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {p.tasks && <PlatformIcon platform={p.tasks.platform} size={22} />}
              <div>
                <p className="text-sm font-semibold">{p.app_users?.username} <span className="text-slate-400 font-normal">({p.app_users?.email})</span></p>
                <p className="text-xs text-slate-400">
                  {p.tasks?.action} · @{p.tasks?.username} · {new Date(p.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {signedUrls[p.id] && (
            <img src={signedUrls[p.id]} alt="Proof screenshot" className="w-full max-h-80 object-contain bg-slate-50 rounded-xl mb-3" />
          )}
          <div className="flex gap-2">
            <button disabled={busyId === p.id} onClick={() => approve(p.id)}
              className="flex-1 bg-growmint text-white font-semibold rounded-xl py-2 disabled:opacity-50">
              Approve
            </button>
            <button disabled={busyId === p.id} onClick={() => setRejectingId(p.id)}
              className="flex-1 bg-red-500 text-white font-semibold rounded-xl py-2 disabled:opacity-50">
              Reject
            </button>
          </div>
        </div>
      ))}

      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRejectingId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-2">Rejection reason</h3>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder="e.g. Your screenshot doesn't clearly show that the account was followed."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3" />
            <button onClick={reject} disabled={!reason.trim()} className="w-full bg-red-500 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5">
              Confirm Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
