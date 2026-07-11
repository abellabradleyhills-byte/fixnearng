import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ARTISANS } from "@/lib/artisans";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useLocation, requestGeolocation } from "@/lib/location";
import { ArrowLeft, MapPin, Phone, Siren } from "lucide-react";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "Emergency SOS — FixNear" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SosPage,
});

function SosPage() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Sort mechanics by distance
  const nearest = ARTISANS.filter((a) => a.category === "Mechanic")
    .sort((x, y) => x.distanceKm - y.distanceKm)
    .concat(ARTISANS.filter((a) => a.category !== "Mechanic"));

  return (
    <div className="min-h-screen bg-emergency text-white flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen pb-10 animate-screen-entry relative overflow-hidden">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -left-24 size-72 rounded-full bg-white/5" />

        <header className="px-5 pt-10 pb-4 flex items-center justify-between relative z-10">
          <Link to="/" className="size-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold">Live</p>
            <p className="text-xs font-mono">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</p>
          </div>
        </header>

        <section className="px-5 mt-4 text-center relative z-10">
          <div className="mx-auto size-24 rounded-full bg-white/15 flex items-center justify-center mb-4 animate-sos-pulse">
            <Siren size={40} />
          </div>
          <h1 className="text-3xl font-display font-bold">Sending your GPS</h1>
          <p className="text-sm text-white/80 mt-2 max-w-[32ch] mx-auto">
            Stay in your car. We're alerting the closest verified mechanics to your exact location.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-xs">
            <MapPin size={12} />
            <span>Third Mainland Bridge, Lagos · 6.5244°N, 3.3792°E</span>
          </div>
        </section>

        <section className="mt-8 relative z-10">
          <div className="px-5 mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Alerted mechanics</p>
            <span className="text-xs font-bold">{nearest.length} responding</span>
          </div>
          <div className="bg-background text-foreground rounded-t-3xl p-5 space-y-3 min-h-[300px]">
            {nearest.slice(0, 4).map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border">
                <div className="relative">
                  <img src={a.photo} alt={a.name} width={80} height={80} className="size-12 rounded-xl object-cover" />
                  {i === 0 && <div className="absolute -top-1 -right-1 size-3 rounded-full bg-brand-green ring-2 ring-background animate-pulse" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm truncate">{a.name}</span>
                    <VerifiedBadge size={12} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {a.distanceKm} km · ETA ~{Math.max(4, Math.round(a.distanceKm * 6))} min
                  </p>
                </div>
                <a
                  href="tel:+2348030000000"
                  className="size-10 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0"
                  aria-label={`Call ${a.name}`}
                >
                  <Phone size={16} />
                </a>
              </div>
            ))}

            <Link
              to="/"
              className="block text-center mt-4 py-3 border border-border rounded-xl text-sm font-bold text-muted-foreground"
            >
              Cancel SOS
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
