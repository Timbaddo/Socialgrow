import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { AppUser } from "../../lib/types";

export default function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");

  async function load() {
    const { data } = await supabase.from("app_users").select("*").order("created_at", { ascending: false }).limit(200);
    setUsers((data as AppUser[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function toggleRole(u: AppUser) {
    const nextRole = u.role === "admin" ? "user" : "admin";
    if (!confirm(`Change ${u.username} to ${nextRole}?`)) return;
    await supabase.from("app_users").update({ role: nextRole }).eq("id", u.id);
    load();
  }

  const filtered = users.filter(
    (u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        placeholder="Search by username or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4"
      />
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {filtered.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{u.username}</p>
              <p className="text-xs text-slate-400">{u.email} · {u.xp} XP · {u.activity_status}</p>
            </div>
            <button
              onClick={() => toggleRole(u)}
              className={`text-xs font-semibold rounded-full px-3 py-1 ${
                u.role === "admin" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {u.role === "admin" ? "Admin" : "Make Admin"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
