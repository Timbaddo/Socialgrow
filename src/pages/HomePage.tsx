import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FloatingDecor } from "../components/FloatingDecor";

const UNLOCK_THRESHOLD = 100;

export default function HomePage() {
  const { appUser } = useAuth();
  const pct = appUser ? Math.min(100, Math.round((appUser.xp / UNLOCK_THRESHOLD) * 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      <div className="relative rounded-3xl bg-gradient-to-br from-brand to-growmint text-white p-8 mb-6 overflow-hidden">
        <FloatingDecor />
        <h1 className="text-2xl font-extrabold mb-2 relative">Grow Together. Connect. Support.</h1>
        <p className="text-sm text-white/90 max-w-md relative">
          SocialGrow is a place where people can discover each other, support genuine social activity,
          and grow together.
        </p>
      </div>

      {appUser && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-semibold text-slate-600">Your XP</span>
            <span className="text-sm font-bold text-brand">{appUser.xp} / {UNLOCK_THRESHOLD} XP</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-growmint rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {appUser.xp >= UNLOCK_THRESHOLD
              ? "✅ Profile unlocked — you can add your own task!"
              : `You need ${UNLOCK_THRESHOLD - appUser.xp} more XP to add your profile.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <HomeCard to="/tasks" emoji="🔄" title="Available Tasks" subtitle="Browse and complete tasks" />
        <HomeCard to="/community" emoji="🤝" title="Community" subtitle="Join the conversation" />
        <HomeCard to="/progress" emoji="📈" title="My Progress" subtitle="Track your XP" />
        <HomeCard to="/add-profile" emoji="➕" title="Add Profile" subtitle="Share your own task" />
      </div>
    </div>
  );
}

function HomeCard({ to, emoji, title, subtitle }: { to: string; emoji: string; title: string; subtitle: string }) {
  return (
    <Link to={to} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-brand transition">
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="font-semibold text-sm text-slate-900">{title}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </Link>
  );
}
