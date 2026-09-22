import { Platform } from "../lib/types";

export function PlatformIcon({ platform, size = 24 }: { platform: Platform; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24" };

  switch (platform) {
    case "facebook":
      return (
        <svg {...common} fill="#1877F2" aria-label="Facebook">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} viewBox="0 0 24 24" aria-label="Instagram">
          <defs>
            <radialGradient id="igGrad" cx="30%" cy="107%" r="150%">
              <stop offset="0%" stopColor="#fdf497" />
              <stop offset="10%" stopColor="#fdf497" />
              <stop offset="30%" stopColor="#fd5949" />
              <stop offset="60%" stopColor="#d6249f" />
              <stop offset="100%" stopColor="#285AEB" />
            </radialGradient>
          </defs>
          <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#igGrad)" />
          <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="1.8" />
          <circle cx="17.4" cy="6.6" r="1.15" fill="white" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common} fill="#000000" aria-label="TikTok">
          <path d="M16.6 5.82c-1.02-.9-1.66-2.2-1.66-3.65h-3.02v13.9c0 1.48-1.2 2.68-2.68 2.68a2.68 2.68 0 010-5.36c.28 0 .55.04.8.12V10.4a5.7 5.7 0 00-.8-.06 5.7 5.7 0 105.7 5.7V8.98a7.08 7.08 0 004.06 1.27V7.25a4.85 4.85 0 01-2.4-1.43z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} aria-label="YouTube">
          <rect x="1" y="4" width="22" height="16" rx="5" fill="#FF0000" />
          <path d="M10 8.5l6 3.5-6 3.5z" fill="white" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} fill="#000000" aria-label="X">
          <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.828l-5.35-6.99L4.7 22H1.44l8.02-9.17L1 2h7l4.84 6.4L18.244 2zm-1.2 18h1.84L7.03 3.9H5.06L17.044 20z" />
        </svg>
      );
  }
}
