import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const CHANNEL_URL = "https://whatsapp.com/channel/0029Vb8x0L7DjiOlt0DiGE34";
const GROUP_URL = "https://chat.whatsapp.com/E7afpZSNz7XJ0IRw098cGV";

export function WhatsAppPopup() {
  const { appUser, refreshAppUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!appUser || appUser.whatsapp_dismissed || dismissed) return null;

  async function dismiss() {
    setDismissed(true);
    await supabase.from("app_users").update({ whatsapp_dismissed: true }).eq("id", appUser!.id);
    refreshAppUser();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 animate-popIn">
        <h3 className="text-lg font-bold mb-2">Welcome to SocialGrow! 👋</h3>
        <p className="text-sm text-slate-600 mb-5">
          We're building more than just a task platform. Join our WhatsApp community so you can stay
          connected, see important updates, ask questions and interact with other members.
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className="text-center bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-2.5"
          >
            Join WhatsApp Channel
          </a>
          <a
            href={GROUP_URL}
            target="_blank"
            rel="noreferrer"
            className="text-center bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl py-2.5"
          >
            Join WhatsApp Group
          </a>
          <button onClick={dismiss} className="text-sm text-slate-400 mt-1 py-1">
            Already Joined
          </button>
        </div>
      </div>
    </div>
  );
}
