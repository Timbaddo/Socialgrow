export function StateMessage({
  emoji = "💭",
  title,
  subtitle,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center py-14 px-6">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="font-semibold text-slate-700">{title}</p>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
