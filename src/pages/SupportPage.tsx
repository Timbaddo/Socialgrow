import { useState } from "react";

const CATEGORIES = [
  "Task problem", "Proof problem", "XP problem", "Profile problem",
  "Account problem", "Report a user", "Other",
];

export default function SupportPage() {
  const [category, setCategory] = useState(CATEGORIES[0]);

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-24">
      <h1 className="text-xl font-bold mb-2">Support</h1>
      <p className="text-sm text-slate-500 mb-1">Having an issue? We're here to help.</p>
      <p className="text-sm text-slate-500 mb-6">
        Whether something isn't working, you don't understand a task, you have a problem with your XP,
        or you want to report something that doesn't seem right, contact us and explain what happened.
      </p>

      <label className="block text-xs font-medium text-slate-500 mb-1">What's this about?</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-5 text-sm">
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>

      <div className="flex flex-col gap-3">
        <a
          href={`https://whatsapp.com/channel/0029Vb8x0L7DjiOlt0DiGE34`}
          target="_blank" rel="noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-3 text-center"
        >
          Contact via WhatsApp
        </a>
        <a
          href="https://t.me/Heistimo" target="_blank" rel="noreferrer"
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl py-3 text-center"
        >
          Contact via Telegram
        </a>
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Note: there is no in-site appeal system for rejected proofs. If you believe there was a mistake,
        you're welcome to contact us and explain.
      </p>
    </div>
  );
}
