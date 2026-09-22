export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="sgGrad" x1="0" y1="40" x2="40" y2="0">
          <stop offset="0%" stopColor="#5B4EFF" />
          <stop offset="100%" stopColor="#1FD1A1" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#sgGrad)" />
      {/* connection nodes */}
      <circle cx="12" cy="27" r="3" fill="white" fillOpacity="0.95" />
      <circle cx="20" cy="19" r="3" fill="white" fillOpacity="0.95" />
      <circle cx="28" cy="11" r="3.4" fill="white" />
      <path d="M12 27L20 19L28 11" stroke="white" strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round" />
      {/* growth arrow head */}
      <path d="M23 9.5H28.5V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ size = 36, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <LogoMark size={size} />
      {withText && (
        <span className="font-extrabold tracking-tight text-slate-900" style={{ fontSize: size * 0.5 }}>
          Social<span className="text-brand">Grow</span>
        </span>
      )}
    </div>
  );
}
