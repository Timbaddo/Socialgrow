import { PlatformIcon } from "./PlatformIcon";
import { ACTION_LABEL, PLATFORM_META, Platform, TaskAction } from "../lib/types";

export interface FeedTask {
  task_id: string;
  platform: Platform;
  action: TaskAction;
  username: string;
  profile_url: string;
  content_url: string | null;
  instructions: string;
  proof_requirement: string;
  owner_id: string;
  already_done?: boolean;
}

export function TaskCard({
  task,
  featured,
  onOpen,
}: {
  task: FeedTask;
  featured?: boolean;
  onOpen: (task: FeedTask) => void;
}) {
  const done = task.already_done;
  return (
    <div
      className={`rounded-2xl border p-4 bg-white flex items-center gap-3 shadow-sm ${
        featured ? "border-amber-300 bg-amber-50/50" : "border-slate-200"
      }`}
    >
      <PlatformIcon platform={task.platform} size={32} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate">@{task.username}</p>
        <p className="text-xs text-slate-500">
          {PLATFORM_META[task.platform].label} · {ACTION_LABEL[task.action]}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-xs font-bold text-growmint bg-growmint/10 rounded-full px-2 py-0.5">
          +10 XP
        </span>
        {done ? (
          <span className="text-xs font-medium text-slate-400">Submitted</span>
        ) : (
          <button
            onClick={() => onOpen(task)}
            className="text-sm font-semibold bg-brand text-white rounded-full px-4 py-1.5 hover:bg-brand-dark"
          >
            Open
          </button>
        )}
      </div>
    </div>
  );
}
