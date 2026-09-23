import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { ACTIONS_BY_PLATFORM, ACTION_LABEL, PLATFORM_META, Platform, TaskAction, humanInstructions } from "../lib/types";

const UNLOCK_THRESHOLD = 100;
const PLATFORMS = Object.keys(PLATFORM_META) as Platform[];

export default function AddProfilePage() {
  const { appUser, refreshAppUser } = useAuth();
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [action, setAction] = useState<TaskAction>("follow");
  const [username, setUsername] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [proofRequirement, setProofRequirement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!appUser) return null;

  const unlocked = appUser.xp >= UNLOCK_THRESHOLD || appUser.role === "admin"; 
  const needsContentUrl = action === "like" || action === "comment";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.rpc("create_task", {
      p_platform: platform,
      p_action: action,
      p_username: username,
      p_profile_url: profileUrl,
      p_content_url: needsContentUrl ? contentUrl : null,
      p_instructions: humanInstructions(action),
      p_proof_requirement: proofRequirement || "A screenshot clearly showing the completed action.",
    });
    setSubmitting(false);
    if (error) setError(error.message);
    else {
      setDone(true);
      refreshAppUser();
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h1 className="text-lg font-bold mb-2">Nice one!</h1>
        <p className="text-sm text-slate-500">
          Your profile has been submitted and is now part of the community rotation.
        </p>
      </div>
    );
  }

  if (!unlocked) {
    const pct = Math.round((appUser.xp / UNLOCK_THRESHOLD) * 100);
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-lg font-bold mb-2">Your profile is locked</h1>
        <p className="text-sm text-slate-500 mb-5">
          Complete tasks and earn {UNLOCK_THRESHOLD} approved XP to add your own profile.
        </p>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-growmint rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-400">{appUser.xp} / {UNLOCK_THRESHOLD} XP</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="text-2xl mb-1">✅</div>
      <h1 className="text-lg font-bold mb-1">You're unlocked!</h1>
      <p className="text-sm text-slate-500 mb-5">Add your profile or a specific post to the community rotation.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5">
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <label className="block text-xs font-medium text-slate-500 mb-1">Platform</label>
        <select value={platform} onChange={(e) => { setPlatform(e.target.value as Platform); setAction(ACTIONS_BY_PLATFORM[e.target.value as Platform][0]); }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm">
          {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_META[p].label}</option>)}
        </select>

        <label className="block text-xs font-medium text-slate-500 mb-1">Task type</label>
        <select value={action} onChange={(e) => setAction(e.target.value as TaskAction)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm">
          {ACTIONS_BY_PLATFORM[platform].map((a) => <option key={a} value={a}>{ACTION_LABEL[a]}</option>)}
        </select>

        <label className="block text-xs font-medium text-slate-500 mb-1">Username / display name</label>
        <input required value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm" placeholder="e.g. yourhandle" />

        <label className="block text-xs font-medium text-slate-500 mb-1">Profile URL</label>
        <input required type="url" value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm" placeholder="https://..." />

        {needsContentUrl && (
          <>
            <label className="block text-xs font-medium text-slate-500 mb-1">Post / video URL</label>
            <input required type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3 text-sm" placeholder="https://..." />
          </>
        )}

        <label className="block text-xs font-medium text-slate-500 mb-1">Proof requirement</label>
        <textarea value={proofRequirement} onChange={(e) => setProofRequirement(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-4 text-sm" rows={2}
          placeholder="e.g. Screenshot clearly showing you're following the account" />

        <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-500">
          Instructions shown to members: "{humanInstructions(action)}"
        </div>

        <button disabled={submitting} className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold rounded-xl py-3">
          {submitting ? "Submitting..." : "Submit Profile"}
        </button>
      </form>
    </div>
  );
}
