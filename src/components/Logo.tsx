export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="SocialGrow"
      width={size}
      height={size}
      style={{ objectFit: "contain", borderRadius: size * 0.25 }}
    />
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
