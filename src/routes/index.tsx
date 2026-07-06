import { createFileRoute, Link } from "@tanstack/react-router";
import { ARTISANS, CATEGORIES } from "@/lib/artisans";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Search, MapPin, Siren, Star, Bell, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FixNear — Find verified artisans near you" },
      {
        name: "description",
        content:
          "Search NIN-verified mechanics, plumbers and electricians nearby. Emergency roadside SOS built in.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = ARTISANS.slice(0, 3);

  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry">
        {/* Header */}
        <header className="px-5 pt-10 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <MapPin size={12} className="text-brand-green" /> Lekki Phase 1, Lagos
            </p>
            <h1 className="text-2xl font-display font-bold mt-0.5">Good afternoon, Adebayo 👋</h1>
          </div>
          <button
            aria-label="Notifications"
            className="size-11 rounded-full bg-brand-yellow ring-2 ring-white shadow flex items-center justify-center relative"
          >
            <Bell size={18} className="text-foreground" />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-emergency ring-2 ring-brand-yellow" />
          </button>
        </header>

        {/* Search */}
        <div className="px-5 mt-2">
          <Link
            to="/search"
            className="flex items-center gap-3 h-12 bg-muted rounded-xl px-4 border border-border/60"
          >
            <Search size={18} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search mechanics, plumbers…</span>
          </Link>
        </div>

        {/* Emergency SOS */}
        <section className="px-5 mt-5">
          <Link
            to="/sos"
            className="block bg-emergency text-white rounded-2xl p-5 relative overflow-hidden active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <Siren size={18} />
                  <h3 className="font-display font-bold text-lg">Emergency Roadside SOS</h3>
                </div>
                <p className="text-xs text-white/85 leading-relaxed">
                  Car broke down? Stay in your car. Tap to send your GPS to the nearest verified mechanic.
                </p>
              </div>
              <div className="size-14 shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                <div className="size-8 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 size-40 rounded-full bg-white/5" />
          </Link>
        </section>

        {/* Trust strip */}
        <section className="px-5 mt-5">
          <div className="paper-texture rounded-2xl border border-paper-line p-4 flex items-center gap-3 shadow-[var(--shadow-paper)]">
            <div className="size-10 rounded-lg bg-brand-green flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Every artisan is NIN + BVN verified</p>
              <p className="text-[11px] text-muted-foreground">Home address checked. Real people, real accountability.</p>
            </div>
            <span className="stamp-badge">Trusted</span>
          </div>
        </section>

        {/* Track my jobs */}
        <section className="px-5 mt-5">
          <Link
            to="/jobs"
            className="flex items-center gap-3 p-4 rounded-2xl border border-brand-green/30 bg-brand-green/5"
          >
            <div className="size-11 rounded-xl bg-brand-green/15 flex items-center justify-center text-brand-green">
              🧰
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Track My Jobs</p>
              <p className="text-[11px] text-muted-foreground">Live status & milestone timeline</p>
            </div>
            <span className="text-brand-green">→</span>
          </Link>
        </section>

        {/* Categories */}
        <section className="px-5 mt-6">
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display font-bold text-lg">What do you need?</h2>
            <Link to="/search" className="text-brand-green text-xs font-bold">See all</Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link
                to="/search"
                key={c.key}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`size-14 rounded-2xl flex items-center justify-center border ${
                    c.tint === "yellow"
                      ? "bg-brand-yellow/15 border-brand-yellow/40"
                      : "bg-brand-green/10 border-brand-green/30"
                  }`}
                >
                  <span className="text-xl" aria-hidden>{c.emoji}</span>
                </div>
                <span className="text-[10px] font-bold text-center">{c.key}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Nearby */}
        <section className="px-5 mt-7">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="font-display font-bold text-lg">Top-rated nearby</h2>
              <p className="text-[11px] text-muted-foreground">Highest ratings in your area appear first.</p>
            </div>
            <Link to="/search" className="text-brand-green text-xs font-bold">Map view</Link>
          </div>
          <div className="space-y-3">
            {featured.map((a) => (
              <Link
                to="/artisan/$id"
                params={{ id: a.id }}
                key={a.id}
                className="flex gap-3 p-3 rounded-2xl border border-border bg-card hover:border-brand-green/40 transition-colors"
              >
                <img
                  src={a.photo}
                  alt={a.name}
                  loading="lazy"
                  width={128}
                  height={128}
                  className="size-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold truncate">{a.name}</span>
                    <VerifiedBadge />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.trade} • {a.distanceKm} km
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <Star size={12} className="fill-brand-yellow text-brand-yellow" />
                      {a.rating.toFixed(1)}
                      <span className="text-muted-foreground font-medium">({a.reviews})</span>
                    </div>
                    <span className="text-xs font-bold text-brand-green">
                      ₦{a.rateNaira.toLocaleString()}/hr
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Register CTA */}
        <section className="px-5 mt-7">
          <Link
            to="/register"
            className="block rounded-2xl p-4 bg-foreground text-white flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow">Are you an artisan?</p>
              <p className="text-sm font-semibold mt-1">Join FixNear — verify with NIN & BVN</p>
            </div>
            <span className="text-brand-yellow text-xl">→</span>
          </Link>
        </section>
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
