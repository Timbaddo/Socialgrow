import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface SettingRow { key: string; value: any; }

const LABELS: Record<string, string> = {
  xp_per_approved_task: "XP per approved task",
  xp_unlock_threshold: "XP required to unlock Add Profile",
  max_featured_profiles: "Maximum featured profiles",
  low_activity_threshold_days: "Days of inactivity before 'Low Activity'",
  inactive_threshold_days: "Days of inactivity before 'Inactive'",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("app_settings").select("*").order("key");
    setSettings((data as SettingRow[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function save(key: string, value: number) {
    setSaving(key);
    await supabase.from("app_settings").update({ value }).eq("key", key);
    setSaving(null);
    load();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
      {settings.map((s) => (
        <SettingRowEditor key={s.key} label={LABELS[s.key] ?? s.key} value={Number(s.value)}
          saving={saving === s.key} onSave={(v) => save(s.key, v)} />
      ))}
      <p className="text-xs text-slate-400 p-4">
        Note: "Maximum featured profiles" is enforced at 5 by the database function itself; changing this
        value here is for reference until the enforcement layer is extended to read it dynamically.
      </p>
    </div>
  );
}

function SettingRowEditor({ label, value, saving, onSave }: { label: string; value: number; saving: boolean; onSave: (v: number) => void }) {
  const [local, setLocal] = useState(value);
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <input type="number" value={local} onChange={(e) => setLocal(Number(e.target.value))}
          className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm text-right" />
        <button onClick={() => onSave(local)} disabled={saving || local === value}
          className="text-xs font-semibold bg-brand text-white rounded-full px-3 py-1 disabled:opacity-40">
          {saving ? "..." : "Save"}
        </button>
      </div>
    </div>
  );
}
