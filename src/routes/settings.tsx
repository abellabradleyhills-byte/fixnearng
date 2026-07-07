import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const prefs = usePrefs();
  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPref(k, v);


  return (
    <PhoneFrame>
      <div className="pb-24 animate-screen-entry">
        <header className="px-5 pt-10 pb-4 flex items-center gap-3">
          <Link
            to="/profile"
            className="size-10 rounded-full bg-muted flex items-center justify-center"
            aria-label="Back"
          >
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
                    prefs.language === l.id
                      ? "bg-brand-green text-white"
                      : "bg-muted text-foreground"
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
          <LinkRow to="/profile" icon={<Lock size={18} className="text-brand-green" />} title="Change Password" />
        </Group>

        <Group title="More">
          <LinkRow to="/settings" icon={<Star size={18} className="text-brand-yellow" />} title="Rate the app" />
          <LinkRow to="/messages" icon={<LifeBuoy size={18} className="text-brand-green" />} title="Contact support" />
          <LinkRow to="/settings" icon={<Info size={18} className="text-brand-green" />} title="About FixNear" />
          <LinkRow to="/settings" icon={<Share2 size={18} className="text-brand-green" />} title="Share with friends" />
        </Group>
      </div>
    </PhoneFrame>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 mt-5">
      <p className="text-[11px] font-bold tracking-widest text-muted-foreground mb-2 px-1">
        {title.toUpperCase()}
      </p>
      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
        {children}
      </div>
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

function LinkRow({
  to,
  icon,
  title,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-4 p-4">
      <div className="shrink-0">{icon}</div>
      <p className="flex-1 font-bold text-sm">{title}</p>
      <ChevronRight size={18} className="text-muted-foreground" />
    </Link>
  );
}
