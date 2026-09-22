import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { PlatformIcon } from "./PlatformIcon";
import { ACTION_LABEL, PLATFORM_META } from "../lib/types";
import { FeedTask } from "./TaskCard";

const MAX_FILE_MB = 5;

export function TaskFlowModal({ task, onClose, onSubmitted }: {
  task: FeedTask;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { appUser } = useAuth();
  const [step, setStep] = useState<"before" | "submit">("before");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [opened, setOpened] = useState(false);

  const destinationUrl = task.content_url || task.profile_url;

  function handleFile(f: File | null) {
    setError(null);
    if (!f) { setFile(null); setPreview(null); return; }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`That file is too big. Please keep it under ${MAX_FILE_MB}MB.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleOpenDestination() {
    setOpened(true);
    window.open(destinationUrl, "_blank", "noopener,noreferrer");
    await supabase.rpc("record_impression", { p_task_id: task.task_id });
  }

  async function handleSubmit() {
    if (!file || !appUser) return;
    setSubmitting(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `${appUser.id}/${task.task_id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("proofs").upload(path, file);
      if (uploadErr) throw uploadErr;

      const { error: rpcErr } = await supabase.rpc("submit_proof", {
        p_task_id: task.task_id,
        p_storage_path: path,
      });
      if (rpcErr) throw rpcErr;

      onSubmitted();
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-6 animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <PlatformIcon platform={task.platform} size={28} />
          <div>
            <p className="font-bold text-slate-900">
              {PLATFORM_META[task.platform].label} · {ACTION_LABEL[task.action]}
            </p>
            <p className="text-sm text-slate-500">@{task.username}</p>
          </div>
        </div>

        {step === "before" && (
          <>
            <p className="text-sm font-semibold text-slate-800 mb-1">Before you start</p>
            <p className="text-sm text-slate-600 mb-3">Please read this first.</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 mb-3">{task.instructions}</p>
            <p className="text-xs text-slate-500 mb-1">Proof required: {task.proof_requirement}</p>
            <p className="text-xs font-bold text-growmint mb-3">Reward: +10 XP</p>
            <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3 mb-5">
              ⚠️ You need to actually complete the task before submitting your screenshot. Your proof will
              be reviewed before you receive XP.
            </p>
            <button
              onClick={handleOpenDestination}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl py-3 mb-2"
            >
              I Understand — Open Profile
            </button>
            {opened && (
              <button
                onClick={() => setStep("submit")}
                className="w-full bg-growmint/10 text-growmint font-semibold rounded-xl py-3"
              >
                I've done it — Continue
              </button>
            )}
          </>
        )}

        {step === "submit" && (
          <>
            <p className="text-sm font-semibold text-slate-800 mb-1">Quick reminder</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 mb-2">{task.instructions}</p>
            <p className="text-xs text-slate-500 mb-4">
              Proof required: {task.proof_requirement}. Fake or incorrect proof can be rejected.
            </p>

            {!preview ? (
              <label className="block border-2 border-dashed border-slate-300 rounded-xl py-8 text-center text-sm text-slate-500 cursor-pointer mb-3">
                Tap to select a screenshot from your Gallery or Files
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <div className="mb-3">
                <img src={preview} alt="Proof preview" className="w-full rounded-xl mb-2 max-h-64 object-contain bg-slate-50" />
                <div className="flex gap-2">
                  <label className="flex-1 text-center text-sm font-medium bg-slate-100 rounded-lg py-2 cursor-pointer">
                    Replace
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                  </label>
                  <button onClick={() => handleFile(null)} className="flex-1 text-sm font-medium bg-slate-100 rounded-lg py-2">
                    Remove
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              disabled={!file || submitting}
              onClick={handleSubmit}
              className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold rounded-xl py-3"
            >
              {submitting ? "Submitting..." : "Submit Proof"}
            </button>
          </>
        )}

        <button onClick={onClose} className="w-full text-sm text-slate-400 mt-3">
          Cancel
        </button>
      </div>
    </div>
  );
}
