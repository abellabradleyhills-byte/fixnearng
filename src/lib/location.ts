import { useSyncExternalStore } from "react";

export type UserLocation = {
  label: string; // short display: "Area, City"
  full: string; // full: "Area, City, LGA, State"
  state?: string;
  lga?: string;
  city?: string;
  area?: string;
  street?: string;
  lat?: number;
  lng?: number;
  source: "gps" | "manual" | "default";
  updatedAt: number;
};

const KEY = "fixnear.location";
const DEFAULT_LOC: UserLocation = {
  label: "Lekki Phase 1, Lagos",
  full: "Lekki Phase 1, Lagos, Eti-Osa, Lagos",
  state: "Lagos",
  lga: "Eti-Osa",
  city: "Lagos",
  area: "Lekki Phase 1",
  source: "default",
  updatedAt: 0,
};

let current: UserLocation = load();
const listeners = new Set<() => void>();

function load(): UserLocation {
  if (typeof window === "undefined") return DEFAULT_LOC;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as UserLocation;
  } catch {}
  return DEFAULT_LOC;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {}
}

function emit() {
  listeners.forEach((l) => l());
}

export function setLocation(loc: UserLocation) {
  current = { ...loc, updatedAt: Date.now() };
  persist();
  emit();
}

export function getLocation(): UserLocation {
  return current;
}

export function useLocation(): UserLocation {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => DEFAULT_LOC,
  );
}

// ─── Nominatim (OpenStreetMap) — free, no key, works anywhere in Nigeria ──

type NominatimAddress = {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  city_district?: string;
  county?: string;
  local_government_area?: string;
  state?: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

function toLoc(
  r: NominatimResult,
  lat: number,
  lng: number,
  source: UserLocation["source"],
): UserLocation {
  const a = r.address ?? {};
  const street = a.road;
  const area = a.neighbourhood || a.suburb || a.quarter || a.hamlet || a.village || a.city_district;
  const city = a.city || a.town || a.village || a.hamlet;
  const lga = a.local_government_area || a.county;
  const state = a.state?.replace(/\s*State$/i, "");
  const shortParts = [area || street || city, state].filter(Boolean);
  const fullParts = [area || street, city, lga, state].filter(Boolean);
  return {
    label: shortParts.join(", ") || r.display_name.split(",").slice(0, 2).join(",").trim(),
    full: fullParts.join(", ") || r.display_name,
    state,
    lga,
    city,
    area,
    street,
    lat,
    lng,
    source,
    updatedAt: Date.now(),
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<UserLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as NominatimResult;
    return toLoc(data, lat, lng, "gps");
  } catch {
    return null;
  }
}

export type PlaceSuggestion = UserLocation & { id: string };

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ng&addressdetails=1&limit=8&accept-language=en&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const arr = (await res.json()) as NominatimResult[];
    return arr.map((r, i) => {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      const loc = toLoc(r, lat, lng, "manual");
      return { ...loc, id: `${r.lat},${r.lon},${i}` };
    });
  } catch {
    return [];
  }
}

// ─── Geolocation ──────────────────────────────────────────────────────────

let watchId: number | null = null;

export type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported" | "error";

const statusListeners = new Set<(s: GeoStatus) => void>();
let status: GeoStatus = "idle";

export function useGeoStatus(): GeoStatus {
  return useSyncExternalStore(
    (cb) => {
      const wrap = () => cb();
      statusListeners.add(wrap);
      return () => statusListeners.delete(wrap);
    },
    () => status,
    () => "idle" as GeoStatus,
  );
}

function setStatus(s: GeoStatus) {
  status = s;
  statusListeners.forEach((l) => l(s));
}

export async function requestGeolocation(opts?: { watch?: boolean }): Promise<UserLocation | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    setStatus("unsupported");
    return null;
  }
  setStatus("requesting");
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("granted");
        const { latitude, longitude } = pos.coords;
        const loc = (await reverseGeocode(latitude, longitude)) ?? {
          label: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
          full: `GPS ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          lat: latitude,
          lng: longitude,
          source: "gps" as const,
          updatedAt: Date.now(),
        };
        setLocation(loc);
        if (opts?.watch) startWatch();
        resolve(loc);
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  });
}

export function startWatch() {
  if (typeof navigator === "undefined" || !navigator.geolocation) return;
  if (watchId !== null) return;
  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      // Only re-geocode if moved >150m
      const prev = current;
      if (prev.lat && prev.lng) {
        const d = haversine(prev.lat, prev.lng, latitude, longitude);
        if (d < 0.15) return;
      }
      const loc = await reverseGeocode(latitude, longitude);
      if (loc) setLocation(loc);
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 30_000 },
  );
}

export function stopWatch() {
  if (watchId !== null && typeof navigator !== "undefined") {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
