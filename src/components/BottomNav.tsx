import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const items = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/tasks", label: "Tasks", icon: "🔄" },
  { to: "/my-tasks", label: "My Tasks", icon: "📋" },
  { to: "/progress", label: "Progress", icon: "📈" },
  { to: "/account", label: "Account", icon: "👤" },
];

export function BottomNav() {
  const { appUser } = useAuth();
  if (!appUser) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 px-3 text-[11px] font-medium ${
                isActive ? "text-brand" : "text-slate-500"
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
