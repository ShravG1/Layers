export default function SkeletonSummary() {
  return (
    <div className="space-y-3 anim-fade">
      <div className="h-3 rounded-full bg-[var(--color-cream-200)] anim-skeleton w-3/4" />
      <div className="h-3 rounded-full bg-[var(--color-cream-200)] anim-skeleton w-5/6" />
      <div className="h-3 rounded-full bg-[var(--color-cream-200)] anim-skeleton w-2/3" />
      <div className="h-3 rounded-full bg-[var(--color-cream-200)] anim-skeleton w-4/5" />
      <div className="h-3 rounded-full bg-[var(--color-cream-200)] anim-skeleton w-1/2" />
    </div>
  );
}
