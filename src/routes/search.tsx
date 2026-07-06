import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ARTISANS, CATEGORIES } from "@/lib/artisans";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Search, Star, SlidersHorizontal, MapPin, ArrowLeft, Layers } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search artisans near you — FixNear" },
      { name: "description", content: "Location-based search with map view for artisans across Nigeria." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [view, setView] = useState<"list" | "map">("map");
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  const results = ARTISANS.filter((a) =>
    (category === "All" || a.category === category) &&
    (query === "" || a.name.toLowerCase().includes(query.toLowerCase()) || a.trade.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry">
        {/* Header */}
        <header className="px-5 pt-10 pb-3 flex items-center gap-3">
          <Link to="/" className="size-10 rounded-full border border-border flex items-center justify-center bg-background">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in Lagos…"
              className="w-full h-10 pl-9 pr-3 bg-muted border border-border rounded-xl text-sm outline-none focus:ring-2 ring-brand-green/20"
            />
          </div>
          <button className="size-10 rounded-full border border-border flex items-center justify-center bg-background">
            <SlidersHorizontal size={16} />
          </button>
        </header>

        {/* Location + view toggle */}
        <div className="px-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} className="text-brand-green" />
            <span className="font-semibold text-foreground">Ikeja, Lagos</span>
            <span>· within 5 km</span>
          </div>
          <div className="flex p-0.5 bg-muted rounded-lg border border-border">
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1 text-[11px] font-bold rounded-md ${view === "map" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              Map
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 text-[11px] font-bold rounded-md ${view === "list" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="px-5 mt-3 flex gap-2 overflow-x-auto scrollbar-none pb-2">
          {["All", ...CATEGORIES.map((c) => c.key)].map((k) => (
            <button
              key={k}
              onClick={() => setCategory(k)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                category === k
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {view === "map" ? <MapView results={results} /> : <ListView results={results} />}
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function MapView({ results }: { results: typeof ARTISANS }) {
  return (
    <>
      {/* Fake map */}
      <div className="mx-5 mt-3 h-[300px] rounded-2xl relative overflow-hidden border border-border bg-[oklch(0.94_0.02_150)]">
        {/* Grid streets */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 300" preserveAspectRatio="none">
          <path d="M0,80 Q120,60 200,110 T400,90" stroke="oklch(0.85 0.02 150)" strokeWidth="14" fill="none" />
          <path d="M0,200 Q140,180 220,220 T400,210" stroke="oklch(0.85 0.02 150)" strokeWidth="10" fill="none" />
          <path d="M100,0 Q90,140 130,300" stroke="oklch(0.85 0.02 150)" strokeWidth="8" fill="none" />
          <path d="M280,0 Q290,150 260,300" stroke="oklch(0.85 0.02 150)" strokeWidth="8" fill="none" />
        </svg>

        {/* User location */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="size-4 rounded-full bg-blue-500 ring-4 ring-blue-500/30 animate-pulse" />
        </div>

        {/* Artisan pins */}
        {results.slice(0, 4).map((a, i) => {
          const positions = [
            { top: "22%", left: "28%" },
            { top: "36%", left: "68%" },
            { top: "62%", left: "38%" },
            { top: "72%", left: "72%" },
          ];
          return (
            <Link
              to="/artisan/$id"
              params={{ id: a.id }}
              key={a.id}
              className="absolute -translate-x-1/2 -translate-y-full group"
              style={positions[i]}
            >
              <div className="bg-brand-green text-white text-[10px] font-bold px-2 py-1 rounded-full mb-1 flex items-center gap-1 shadow-lg ring-2 ring-white whitespace-nowrap">
                ₦{(a.rateNaira / 1000).toFixed(0)}k · {a.name.split(" ")[0]}
              </div>
              <div className="size-4 bg-brand-green border-2 border-white rounded-full mx-auto shadow" />
            </Link>
          );
        })}

        {/* Map controls */}
        <button className="absolute top-3 right-3 size-9 bg-background rounded-lg shadow flex items-center justify-center border border-border">
          <Layers size={14} />
        </button>
      </div>

      {/* Result count */}
      <p className="px-5 mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {results.length} verified nearby
      </p>

      {/* Compact list */}
      <div className="px-5 mt-3 space-y-3">
        {results.map((a) => (
          <ArtisanRow key={a.id} a={a} />
        ))}
      </div>
    </>
  );
}

function ListView({ results }: { results: typeof ARTISANS }) {
  return (
    <div className="px-5 mt-4 space-y-3">
      {results.map((a) => (
        <ArtisanRow key={a.id} a={a} />
      ))}
    </div>
  );
}

function ArtisanRow({ a }: { a: (typeof ARTISANS)[number] }) {
  return (
    <Link
      to="/artisan/$id"
      params={{ id: a.id }}
      className="flex gap-3 p-3 rounded-2xl border border-border bg-card"
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
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold truncate">{a.name}</span>
              <VerifiedBadge />
            </div>
            <p className="text-xs text-muted-foreground truncate">{a.trade}</p>
          </div>
          <span className="stamp-badge shrink-0">Top</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span className="flex items-center gap-1 font-bold">
            <Star size={12} className="fill-brand-yellow text-brand-yellow" />
            {a.rating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">{a.distanceKm} km</span>
          <span className="ml-auto font-bold text-brand-green">₦{a.rateNaira.toLocaleString()}/hr</span>
        </div>
      </div>
    </Link>
  );
}
