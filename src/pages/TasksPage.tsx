import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Platform, TaskAction, PLATFORM_META, ACTION_LABEL } from "../lib/types";
import { TaskCard, FeedTask } from "../components/TaskCard";
import { TaskFlowModal } from "../components/TaskFlowModal";
import { StateMessage } from "../components/StateMessage";

const PAGE_SIZE = 10;
const PLATFORMS: Platform[] = ["facebook", "instagram", "tiktok", "youtube", "x"];
const ACTIONS: TaskAction[] = ["follow", "like", "comment", "visit_profile", "subscribe"];

export default function TasksPage() {
  const [featured, setFeatured] = useState<FeedTask[]>([]);
  const [feed, setFeed] = useState<FeedTask[]>([]);
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [action, setAction] = useState<TaskAction | "all">("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<FeedTask | null>(null);

  async function loadFeatured() {
    const { data } = await supabase.rpc("get_featured_feed");
    setFeatured((data as FeedTask[]) ?? []);
  }

  async function loadFeed(reset: boolean) {
    setLoading(true);
    const nextPage = reset ? 0 : page;
    const { data, error } = await supabase.rpc("get_rotation_feed", {
      p_platform: platform === "all" ? null : platform,
      p_action: action === "all" ? null : action,
      p_limit: PAGE_SIZE,
      p_offset: nextPage * PAGE_SIZE,
    });
    if (!error) {
      const rows = (data as FeedTask[]) ?? [];
      setFeed(reset ? rows : (prev) => [...prev, ...rows] as any);
      setHasMore(rows.length === PAGE_SIZE);
      setPage(nextPage + 1);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadFeatured();
    loadFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, action]);

  function handleSubmitted() {
    setActive(null);
    loadFeed(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-24">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Tasks</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 -mx-4 px-4">
        <FilterChip active={platform === "all"} onClick={() => setPlatform("all")}>All</FilterChip>
        {PLATFORMS.map((p) => (
          <FilterChip key={p} active={platform === p} onClick={() => setPlatform(p)}>
            {PLATFORM_META[p].label}
          </FilterChip>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
        <FilterChip active={action === "all"} onClick={() => setAction("all")}>All actions</FilterChip>
        {ACTIONS.map((a) => (
          <FilterChip key={a} active={action === a} onClick={() => setAction(a)}>
            {ACTION_LABEL[a]}
          </FilterChip>
        ))}
      </div>

      {featured.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-amber-600 mb-2">⭐ Featured</h2>
          <div className="flex flex-col gap-2">
            {featured.map((t) => (
              <TaskCard key={t.task_id} task={t} featured onOpen={setActive} />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-bold text-slate-600 mb-2">🔄 Community Tasks</h2>
      {loading && feed.length === 0 ? (
        <StateMessage emoji="⏳" title="Loading your tasks..." />
      ) : feed.length === 0 ? (
        <StateMessage emoji="🌱" title="No tasks are available right now." subtitle="Check back soon." />
      ) : (
        <div className="flex flex-col gap-2">
          {feed.map((t) => (
            <TaskCard key={t.task_id} task={t} onOpen={setActive} />
          ))}
        </div>
      )}

      {hasMore && feed.length > 0 && (
        <button
          onClick={() => loadFeed(false)}
          disabled={loading}
          className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl py-2.5 text-sm"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}

      {active && (
        <TaskFlowModal task={active} onClose={() => setActive(null)} onSubmitted={handleSubmitted} />
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap text-xs font-semibold rounded-full px-3 py-1.5 border ${
        active ? "bg-brand text-white border-brand" : "bg-white text-slate-600 border-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
