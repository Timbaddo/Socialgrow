import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import { useUnreadCount } from "../hooks/useUnreadCount";

const links = [
  { to: "/", label: "Home" },
  { to: "/tasks", label: "Tasks" },
  { to: "/my-tasks", label: "My Tasks" },
  { to: "/progress", label: "Progress" },
  { to: "/add-profile", label: "Add Profile" },
  { to: "/community", label: "Community" },
  { to: "/rules", label: "Rules" },
  { to: "/support", label: "Support" },
];

export function Header() {
  const { appUser, signOut } = useAuth();
  const unread = useUnreadCount(appUser?.id);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/"><Logo size={32} /></Link>

        <nav className="hidden md:flex items-center gap-5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-brand" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {appUser ? (
            <>
              <span className="hidden sm:inline text-sm font-semibold text-brand bg-brand/10 rounded-full px-3 py-1">
                {appUser.xp} XP
              </span>
              <Link to="/notifications" className="relative text-xl" aria-label="Notifications">
                🔔
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              {appUser.role === "admin" && (
                <Link to="/admin" className="text-sm font-semibold text-brand">
                  Admin
                </Link>
              )} 
              <button onClick={signOut} className="hidden md:inline text-sm text-slate-500 hover:text-slate-800">
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold bg-brand text-white rounded-full px-4 py-2 hover:bg-brand-dark"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
