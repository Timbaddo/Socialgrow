import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Stats {
  totalUsers: number; totalProfiles: number; activeTasks: number;
  pendingProofs: number; approvedProofs: number; rejectedProofs: number; totalXpAwarded: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [
        { count: totalUsers },
        { count: totalProfiles },
        { count: activeTasks },
        { count: pendingProofs },
        { count: approvedProofs },
        { count: rejectedProofs },
        { data: xpRows },
      ] = await Promise.all([
        supabase.from("app_users").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("proofs").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("proofs").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("proofs").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("xp_transactions").select("amount"),
      ]);
      const totalXpAwarded = (xpRows ?? []).reduce((s: number, r: any) => s + r.amount, 0);
      setStats({
        totalUsers: totalUsers ?? 0, totalProfiles: totalProfiles ?? 0, activeTasks: activeTasks ?? 0,
        pendingProofs: pendingProofs ?? 0, approvedProofs: approvedProofs ?? 0,
        rejectedProofs: rejectedProofs ?? 0, totalXpAwarded,
      });
    })();
  }, []);

  if (!stats) return <p className="text-sm text-slate-400">Loading statistics...</p>;

  const cards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Total Profiles", value: stats.totalProfiles },
    { label: "Active Tasks", value: stats.activeTasks },
    { label: "Pending Proofs", value: stats.pendingProofs },
    { label: "Approved Proofs", value: stats.approvedProofs },
    { label: "Rejected Proofs", value: stats.rejectedProofs },
    { label: "Total XP Awarded", value: stats.totalXpAwarded },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-extrabold text-slate-900">{c.value}</p>
          <p className="text-xs text-slate-400">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
