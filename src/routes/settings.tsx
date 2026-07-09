import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { usePrefs, setPref, type Prefs } from "@/lib/prefs";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Bell,
  MessageSquare,
  Megaphone,
  MapPin,
  Shield,
  User as UserIcon,
  Lock,
  Star,
  LifeBuoy,
  Info,
  Share2,
  X,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

type Modal = null | "password" | "rate" | "about";

function SettingsPage() {
  const prefs = usePrefs();
  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPref(k, v);
  const [modal, setModal] = useState<Modal>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const toast = (m: string) => {
    setFlash(m);
    setTimeout(() => setFlash(null), 2000);
  };

  const share = async () => {
    const shareData = {
      title: "FixNear",
      text: "Find verified artisans near you across Nigeria.",
      url: typeof window !== "undefined" ? window.location.origin : "https://fixnearng.lovable.app",
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        toast("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  };

  const submitPassword = () => {
    if (pw.next.length < 6) return toast("New password too short");
    if (pw.next !== pw.confirm) return toast("Passwords do not match");
    setPw({ current: "", next: "", confirm: "" });
    setModal(null);
    toast("Password updated");
  };

  const submitRating = () => {
    setModal(null);
    toast(`Thanks for rating ${rating}★`);
  };

  return (
    <PhoneFrame>
      <div className="pb-24 animate-screen-entry">
        <header className="px-5 pt-10 pb-4 flex items-center gap-3">
          <Link to="/profile" className="size-10 rounded-full bg-muted flex items-center justify-center" aria-label="Back">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
        </header>

        <Group title="Appearance">
          <ToggleRow
            icon={<Sun size={18} className="text-brand-green" />}
            title="Light Mode"
            checked={prefs.theme === "light"}
            onChange={() => update("theme", "light")}
          />
          <ToggleRow
            icon={<Moon size={18} className="text-brand-green" />}
            title="Dark Mode"
            checked={prefs.theme === "dark"}
            onChange={() => update("theme", "dark")}
          />
          <ToggleRow
            icon={<Globe size={18} className="text-brand-green" />}
            title="Follow system"
            subtitle="Auto dark/light based on device setting"
            checked={prefs.theme === "system"}
            onChange={() => update("theme", "system")}
          />
          <div className="p-4">
            <div className="flex items-start gap-4 mb-3">
              <Globe size={18} className="text-brand-green mt-0.5" />
              <div>
                <p className="font-bold">Language</p>
                <p className="text-xs text-muted-foreground">App language / Pidgin or English</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "english", label: "🇬🇧 English" },
                { id: "pidgin", label: "🇳🇬 Pidgin" },
                { id: "yoruba", label: "🇳🇬 Yorùbá" },
                { id: "hausa", label: "🇳🇬 Hausa" },
                { id: "igbo", label: "🇳🇬 Igbo" },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => update("language", l.id as Prefs["language"])}
                  className={`h-11 rounded-xl text-sm font-bold transition-colors ${
                    prefs.language === l.id ? "bg-brand-green text-white" : "bg-muted text-foreground"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </Group>

        <Group title="Notifications">
          <ToggleRow
            icon={<Bell size={18} className="text-brand-green" />}
            title="Job Alerts"
            subtitle="New requests and status changes"
            checked={prefs.jobAlerts}
            onChange={(v) => update("jobAlerts", v)}
          />
          <ToggleRow
            icon={<MessageSquare size={18} className="text-brand-green" />}
            title="Chat Messages"
            subtitle="In-app message notifications"
            checked={prefs.chatMessages}
            onChange={(v) => update("chatMessages", v)}
          />
          <ToggleRow
            icon={<Megaphone size={18} className="text-brand-green" />}
            title="Marketing"
            subtitle="Deals, tips and updates"
            checked={prefs.marketing}
            onChange={(v) => update("marketing", v)}
          />
        </Group>

        <Group title="Privacy">
          <ToggleRow
            icon={<MapPin size={18} className="text-brand-green" />}
            title="Share Location"
            subtitle="Allow artisans to see your area"
            checked={prefs.shareLocation}
            onChange={(v) => update("shareLocation", v)}
          />
          <ToggleRow
            icon={<Shield size={18} className="text-brand-green" />}
            title="Hide Phone Number"
            subtitle="Show only in accepted bookings"
            checked={prefs.hidePhone}
            onChange={(v) => update("hidePhone", v)}
          />
        </Group>

        <Group title="Account">
          <LinkRow to="/profile" icon={<UserIcon size={18} className="text-brand-green" />} title="Edit Profile" />
          <ButtonRow
            onClick={() => setModal("password")}
            icon={<Lock size={18} className="text-brand-green" />}
            title="Change Password"
          />
        </Group>

        <Group title="More">
          <ButtonRow
            onClick={() => setModal("rate")}
            icon={<Star size={18} className="text-brand-yellow" />}
            title="Rate the app"
          />
          <LinkRow
            to="/messages"
            icon={<LifeBuoy size={18} className="text-brand-green" />}
            title="Contact support"
          />
          <ButtonRow
            onClick={() => setModal("about")}
            icon={<Info size={18} className="text-brand-green" />}
            title="About FixNear"
          />
          <ButtonRow
            onClick={share}
            icon={<Share2 size={18} className="text-brand-green" />}
            title="Share with friends"
          />
        </Group>

        {flash && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold shadow-xl">
            {flash}
          </div>
        )}
      </div>

      {modal && <Modal onClose={() => setModal(null)}>
        {modal === "password" && (
          <>
            <h3 className="font-display font-bold text-lg">Change Password</h3>
            <p className="text-xs text-muted-foreground">Choose a strong password with 6+ characters.</p>
            <input
              type="password"
              placeholder="Current password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              className="mt-4 w-full h-11 px-3 rounded-xl bg-muted border border-border text-sm outline-none"
            />
            <input
              type="password"
              placeholder="New password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              className="mt-2 w-full h-11 px-3 rounded-xl bg-muted border border-border text-sm outline-none"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              className="mt-2 w-full h-11 px-3 rounded-xl bg-muted border border-border text-sm outline-none"
            />
            <button
              onClick={submitPassword}
              className="mt-4 w-full py-3 rounded-xl bg-brand-green text-white font-bold text-sm"
            >
              Update password
            </button>
          </>
        )}
        {modal === "rate" && (
          <>
            <h3 className="font-display font-bold text-lg">Rate FixNear</h3>
            <p className="text-xs text-muted-foreground">Tell us how we're doing.</p>
            <div className="flex justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)}>
                  <Star size={32} className={n <= rating ? "fill-brand-yellow text-brand-yellow" : "text-muted-foreground/40"} />
                </button>
              ))}
            </div>
            <button
              onClick={submitRating}
              className="mt-4 w-full py-3 rounded-xl bg-brand-green text-white font-bold text-sm"
            >
              Submit rating
            </button>
          </>
        )}
        {modal === "about" && (
          <>
            <h3 className="font-display font-bold text-lg">About FixNear</h3>
            <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
            <p className="text-sm mt-4 leading-relaxed">
              FixNear connects Nigerians with NIN + BVN verified artisans — mechanics, plumbers, electricians, painters and more. Every payment is held securely in FixNear Pay until the job is done.
            </p>
            <div className="mt-4 rounded-xl bg-muted p-3 text-xs space-y-1">
              <p><span className="font-bold">Built in:</span> Nigeria 🇳🇬</p>
              <p><span className="font-bold">Verification:</span> NIN, BVN, Home address</p>
              <p><span className="font-bold">Support:</span> 24/7 via in-app chat</p>
            </div>
            <button
              onClick={() => setModal(null)}
              className="mt-4 w-full py-3 rounded-xl bg-brand-green text-white font-bold text-sm inline-flex items-center justify-center gap-2"
            >
              <Check size={16} /> Got it
            </button>
          </>
        )}
      </Modal>}
    </PhoneFrame>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card rounded-t-3xl sm:rounded-3xl p-5 animate-screen-entry relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 size-8 rounded-full bg-muted flex items-center justify-center"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 mt-5">
      <p className="text-[11px] font-bold tracking-widest text-muted-foreground mb-2 px-1">{title.toUpperCase()}</p>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">{children}</div>
    </section>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
          checked ? "bg-brand-green" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function LinkRow({ to, icon, title }: { to: string; icon: React.ReactNode; title: string }) {
  return (
    <Link to={to} className="flex items-center gap-4 p-4">
      <div className="shrink-0">{icon}</div>
      <p className="flex-1 font-bold text-sm">{title}</p>
      <ChevronRight size={18} className="text-muted-foreground" />
    </Link>
  );
}

function ButtonRow({ onClick, icon, title }: { onClick: () => void; icon: React.ReactNode; title: string }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 text-left">
      <div className="shrink-0">{icon}</div>
      <p className="flex-1 font-bold text-sm">{title}</p>
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
  );
}
