const EMOJIS = ["✨", "📈", "💚", "⭐", "🔗"];

export function FloatingDecor({ count = 6 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((i) => (
        <span
          key={i}
          className="absolute text-xl opacity-20 animate-floaty"
          style={{
            left: `${(i * 137) % 100}%`,
            top: `${(i * 71) % 100}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${5 + (i % 3)}s`,
          }}
        >
          {EMOJIS[i % EMOJIS.length]}
        </span>
      ))}
    </div>
  );
}
