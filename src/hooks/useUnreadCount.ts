import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useUnreadCount(userId?: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);
      setCount(count ?? 0);
    }
    load();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}
