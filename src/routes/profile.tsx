import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ShieldCheck, ChevronRight, LogOut, Bell, MapPin, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Your profile — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: Profile,
});

function Profile() {
  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry">
        <header className="px-5 pt-10 pb-4">
          <h1 className="text-2xl font-display font-bold">You</h1>
        </header>

        <div className="px-5">
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
            <div className="size-14 rounded-full bg-brand-yellow flex items-center justify-center font-display font-bold text-lg">
              A
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">Adebayo O.</span>
                <VerifiedBadge />
              </div>
              <p className="text-xs text-muted-foreground">Customer · Lekki Phase 1</p>
            </div>
          </div>

          <div className="mt-4 paper-texture rounded-2xl border border-paper-line p-4 flex items-center gap-3 shadow-[var(--shadow-paper)]">
            <ShieldCheck size={20} className="text-brand-green shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">Safety Center</p>
              <p className="text-[11px] text-muted-foreground">Emergency contacts, in-app calls, share trip</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card divide-y divide-border">
            <Row icon={<MapPin size={16} />} label="Saved addresses" />
            <Row icon={<Bell size={16} />} label="Notifications" />
            <Row icon={<HelpCircle size={16} />} label="Help & support" />
          </div>

          <Link
            to="/register"
            className="mt-4 block rounded-2xl p-4 bg-foreground text-white flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-yellow">Are you an artisan?</p>
              <p className="text-sm font-semibold mt-1">Get verified and start earning</p>
            </div>
            <ChevronRight size={16} className="text-brand-yellow" />
          </Link>

          <button className="mt-4 w-full py-3 text-sm font-bold text-emergency flex items-center justify-center gap-2">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="text-muted-foreground">{icon}</div>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <ChevronRight size={16} className="text-muted-foreground" />
    </div>
  );
}
