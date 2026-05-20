export default function SkeletonSummary() {
  return (
    <div className="space-y-3 anim-ink-fade">
      {[3, 5, 2, 4, 1].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-[var(--ink-700)]"
          style={{ width: `${50 + w * 8}%`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
}
