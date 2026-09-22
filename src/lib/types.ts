export type Platform = "facebook" | "instagram" | "tiktok" | "youtube" | "x";
export type TaskAction = "follow" | "like" | "comment" | "visit_profile" | "subscribe";
export type ProofStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  xp: number;
  activity_status: "active" | "low" | "inactive";
  whatsapp_dismissed: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  owner_id: string;
  platform: Platform;
  action: TaskAction;
  username: string;
  profile_url: string;
  content_url: string | null;
  instructions: string;
  proof_requirement: string;
  active: boolean;
  created_at: string;
}

export interface Proof {
  id: string;
  task_id: string;
  user_id: string;
  storage_path: string;
  status: ProofStatus;
  rejection_reason: string | null;
  reviewer_id: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  facebook: { label: "Facebook", color: "#1877F2" },
  instagram: { label: "Instagram", color: "#E1306C" },
  tiktok: { label: "TikTok", color: "#000000" },
  youtube: { label: "YouTube", color: "#FF0000" },
  x: { label: "X", color: "#000000" },
};

export const ACTIONS_BY_PLATFORM: Record<Platform, TaskAction[]> = {
  facebook: ["follow", "like", "comment", "visit_profile"],
  instagram: ["follow", "like", "comment", "visit_profile"],
  tiktok: ["follow", "like", "comment", "visit_profile"],
  youtube: ["subscribe", "like", "comment", "visit_profile"],
  x: ["follow", "like", "comment", "visit_profile"],
};

export const ACTION_LABEL: Record<TaskAction, string> = {
  follow: "Follow",
  like: "Like",
  comment: "Comment",
  visit_profile: "Visit Profile",
  subscribe: "Subscribe",
};

export function humanInstructions(action: TaskAction): string {
  switch (action) {
    case "follow":
      return "Tap the button below to open the profile. Follow the account, then come back here and upload a screenshot showing that you're following it.";
    case "like":
      return "Open the post using the button below, tap Like, then come back here and upload a screenshot showing the like.";
    case "comment":
      return "Open the post and leave a genuine, relevant comment. Please don't spam or copy the same comment everywhere. When you're done, come back here and upload your screenshot.";
    case "subscribe":
      return "Open the YouTube channel, subscribe, then come back here and upload a screenshot showing that you've subscribed.";
    case "visit_profile":
      return "Open the profile and take a proper look around. When you're done, come back here and follow the proof instructions shown on this page.";
  }
}
