import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/proofs", label: "Proof Review" },
  { to: "/admin/featured", label: "Featured" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Admin Dashboard</h1>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end as any}
            className={({ isActive }) =>
              `whitespace-nowrap text-sm font-semibold rounded-full px-4 py-1.5 border ${
                isActive ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
