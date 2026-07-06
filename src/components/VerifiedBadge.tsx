import { Check } from "lucide-react";

export function VerifiedBadge({ size = 14 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-brand-green text-white ring-2 ring-white shrink-0"
      style={{ width: size, height: size }}
      aria-label="NIN and BVN verified"
      title="NIN + BVN verified"
    >
      <Check strokeWidth={3} size={Math.max(8, size - 6)} />
    </span>
  );
}
