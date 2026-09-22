import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { StateMessage } from "../components/StateMessage";
import { NotificationRow } from "../lib/types";

export default function NotificationsPage() {
  const { appUser } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    load();
  }, [appUser]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", appUser!.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data as NotificationRow[]) ?? []);
    setLoading(false);
    const unreadIds = (data ?? []).filter((n: any) => !n.read).map((n: any) => n.id);
    if (unreadIds.length) {
      await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Notifications</h1>
      {loading ? (
        <StateMessage emoji="⏳" title="Loading notifications..." />
      ) : items.length === 0 ? (
        <StateMessage emoji="🔔" title="No notifications yet" />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <div key={n.id} className={`rounded-xl border p-3 ${n.read ? "bg-white border-slate-200" : "bg-brand/5 border-brand/20"}`}>
              <p className="text-sm font-semibold text-slate-800">{n.title}</p>
              <p className="text-sm text-slate-600">{n.message}</p>
              <p className="text-[11px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
