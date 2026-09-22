import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { PlatformIcon } from "../../components/PlatformIcon";

interface TaskRow { id: string; platform: any; action: any; username: string; }
interface FeaturedRow { task_id: string; position: number; tasks: TaskRow | null; }

export default function AdminFeatured() {
  const [featured, setFeatured] = useState<FeaturedRow[]>([]);
  const [allTasks, setAllTasks] = useState<TaskRow[]>([]);
  const [selected, setSelected] = useState("");

  async function load() {
    const [{ data: f }, { data: t }] = await Promise.all([
      supabase.from("featured_profiles").select("task_id, position, tasks(id, platform, action, username)").order("position"),
      supabase.from("tasks").select("id, platform, action, username").eq("active", true),
    ]);
    setFeatured((f as any) ?? []);
    setAllTasks((t as TaskRow[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  const availablePositions = [1, 2, 3, 4, 5].filter((p) => !featured.some((f) => f.position === p));
  const featuredIds = new Set(featured.map((f) => f.task_id));
  const candidates = allTasks.filter((t) => !featuredIds.has(t.id));

  async function feature() {
    if (!selected || availablePositions.length === 0) return;
    const { error } = await supabase.rpc("feature_task", { p_task_id: selected, p_position: availablePositions[0] });
    if (error) alert(error.message);
    else { setSelected(""); load(); }
  }

  async function unfeature(taskId: string) {
    await supabase.rpc("unfeature_task", { p_task_id: taskId });
    load();
  }

  async function move(taskId: string, newPos: number) {
    if (newPos < 1 || newPos > 5) return;
    await supabase.rpc("feature_task", { p_task_id: taskId, p_position: newPos });
    load();
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <p className="text-sm font-semibold mb-2">Feature a profile ({featured.length}/5)</p>
        {featured.length >= 5 ? (
          <p className="text-sm text-amber-600">Your featured section is full. Unfeature one profile before adding another.</p>
        ) : (
          <div className="flex gap-2">
            <select value={selected} onChange={(e) => setSelected(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Select a profile...</option>
              {candidates.map((t) => (
                <option key={t.id} value={t.id}>{t.platform} · @{t.username} · {t.action}</option>
              ))}
            </select>
            <button onClick={feature} disabled={!selected} className="bg-brand text-white font-semibold rounded-lg px-4 disabled:opacity-50">
              Feature
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {featured.map((f) => (
          <div key={f.task_id} className="bg-white rounded-xl border border-amber-200 bg-amber-50/40 p-3 flex items-center gap-3">
            <span className="font-bold text-amber-600 w-5">{f.position}</span>
            {f.tasks && <PlatformIcon platform={f.tasks.platform} size={22} />}
            <span className="flex-1 text-sm font-medium">@{f.tasks?.username} · {f.tasks?.action}</span>
            <button onClick={() => move(f.task_id, f.position - 1)} disabled={f.position === 1} className="text-slate-400 disabled:opacity-30">↑</button>
            <button onClick={() => move(f.task_id, f.position + 1)} disabled={f.position === 5} className="text-slate-400 disabled:opacity-30">↓</button>
            <button onClick={() => unfeature(f.task_id)} className="text-xs text-red-500 font-semibold ml-2">Unfeature</button>
          </div>
        ))}
      </div>
    </div>
  );
}
