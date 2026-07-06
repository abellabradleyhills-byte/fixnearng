import type { ReactNode } from "react";

/** Mobile-first container. Constrains to 430px on tablet+ so desktop preview stays app-like. */
export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <div className={`w-full max-w-[430px] min-h-screen bg-background relative ${className}`}>
        {children}
      </div>
    </div>
  );
}
