import { useEffect, useState } from "react";
import {
  useLocation,
  useGeoStatus,
  requestGeolocation,
  searchPlaces,
  setLocation,
  type PlaceSuggestion,
} from "@/lib/location";
import { MapPin, Search, Crosshair, X, Loader2 } from "lucide-react";

export function LocationPicker({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const loc = useLocation();
  const status = useGeoStatus();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const r = await searchPlaces(q);
      setResults(r);
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] bg-background rounded-t-3xl max-h-[85vh] flex flex-col animate-screen-entry">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-xl font-display font-bold">Choose Location</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="size-9 rounded-full bg-muted flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Current */}
        <div className="px-5 pb-3">
          <div className="p-3 rounded-2xl border border-brand-green/30 bg-brand-green/5 flex items-center gap-3">
            <MapPin size={16} className="text-brand-green shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Current
              </p>
              <p className="text-sm font-bold truncate">{loc.label}</p>
              {loc.full && loc.full !== loc.label && (
                <p className="text-[11px] text-muted-foreground truncate">{loc.full}</p>
              )}
            </div>
          </div>
        </div>

        {/* Use GPS */}
        <div className="px-5">
          <button
            onClick={async () => {
              const r = await requestGeolocation({ watch: true });
              if (r) onClose();
            }}
            disabled={status === "requesting"}
            className="w-full py-3.5 rounded-xl bg-brand-green text-white font-bold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {status === "requesting" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Detecting…
              </>
            ) : (
              <>
                <Crosshair size={16} /> Use My Current Location
              </>
            )}
          </button>
          {status === "denied" && (
            <p className="text-[11px] text-emergency mt-2 text-center">
              Permission denied. Enable location in your browser settings or search manually below.
            </p>
          )}
          {status === "unsupported" && (
            <p className="text-[11px] text-emergency mt-2 text-center">
              GPS unavailable on this device. Please search below.
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="px-5 mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Or search
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Search */}
        <div className="px-5 mt-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Village, town, city, LGA or street…"
              className="w-full h-11 pl-9 pr-3 bg-muted border border-border rounded-xl text-sm outline-none focus:ring-2 ring-brand-green/20"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Anywhere in Nigeria — try “Wuse 2 Abuja”, “Nsukka”, “Nnewi”, “Bodija Ibadan”.
          </p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 mt-3 pb-8">
          {searching && (
            <div className="py-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" /> Searching…
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No matches. Try a nearby town or LGA.
            </p>
          )}
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => {
                    setLocation({ ...r, source: "manual" });
                    onClose();
                  }}
                  className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card text-left hover:border-brand-green/40"
                >
                  <MapPin size={16} className="text-brand-green mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{r.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{r.full}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
