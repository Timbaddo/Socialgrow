import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { appUser, signOut } = useAuth();
  if (!appUser) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24">
      <h1 className="text-xl font-bold text-slate-900 mb-5">Account</h1>
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        <Row label="Username" value={appUser.username} />
        <Row label="Email" value={appUser.email} />
        <Row label="XP" value={`${appUser.xp} XP`} />
        <Row label="Role" value={appUser.role === "admin" ? "Administrator" : "Member"} />
        <Row label="Joined" value={new Date(appUser.created_at).toLocaleDateString()} />
      </div>
      <button onClick={signOut} className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl py-3">
        Log out
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
