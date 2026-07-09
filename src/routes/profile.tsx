import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import {
  ChevronRight,
  Phone,
  MapPin,
  Star,
  Wallet,
  Calendar,
  ShieldCheck,
  Settings as SettingsIcon,
  MessageCircle,
  LogOut,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Your profile — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: Profile,
});

function Profile() {
  return (
    <PhoneFrame className="!bg-neutral-950 text-white">
      <div className="pb-32 animate-screen-entry">
        {/* Green identity header */}
        <header className="mx-4 mt-6 rounded-3xl bg-gradient-to-br from-brand-green to-emerald-700 p-5 flex items-center gap-4 shadow-xl">
          <div className="size-20 rounded-3xl bg-brand-yellow flex items-center justify-center font-display font-bold text-3xl text-neutral-900 shadow-lg">
            P
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold truncate">princelaw4u.pl</h1>
            <p className="text-white/80 text-sm">Customer</p>
          </div>
        </header>

        {/* Contact card */}
        <section className="mx-4 mt-5 rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
          <InfoRow icon={<Phone size={18} />} label="PHONE" value="07026855490" />
          <InfoRow icon={<MapPin size={18} />} label="LOCATION" value="Amassoma Bayelsa" />
        </section>

        {/* Points banner */}
        <div className="mx-4 mt-5 rounded-2xl bg-gradient-to-r from-brand-yellow to-amber-300 p-4 flex items-center gap-3 shadow-lg">
          <Star size={28} className="text-amber-900 fill-amber-900" />
          <div>
            <p className="font-display font-bold text-lg text-neutral-900 leading-tight">0 points</p>
            <p className="text-xs text-neutral-800/80">500 pts to next reward</p>
          </div>
        </div>

        {/* Menu list */}
        <section className="mx-4 mt-5 rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10 overflow-hidden">
          <MenuItem
            to="/rewards"
            iconWrap="bg-brand-yellow/20"
            icon={<Star size={18} className="text-brand-yellow" />}
            title="Rewards & Reminders"
            subtitle="Loyalty points & maintenance alerts"
          />
          <MenuItem
            to="/wallet"
            iconWrap="bg-brand-green/20"
            icon={<Wallet size={18} className="text-brand-green" />}
            title="My Wallet"
            subtitle="Balance, deposits & payments"
          />
          <MenuItem
            to="/jobs"
            iconWrap="bg-white/10"
            icon={<Calendar size={18} className="text-white" />}
            title="Track My Jobs"
            subtitle="Live status & milestone timeline"
          />
          <MenuItem
            to="/register"
            iconWrap="bg-brand-green/20"
            icon={<ShieldCheck size={18} className="text-brand-green" />}
            title="Verify My Account"
            subtitle="Upload NIN & utility bill"
          />
          <MenuItem
            to="/settings"
            iconWrap="bg-white/10"
            icon={<SettingsIcon size={18} className="text-white" />}
            title="Settings"
            subtitle="App language / Pidgin or English"
          />
          <MenuItem
            to="/messages"
            iconWrap="bg-white/10"
            icon={<MessageCircle size={18} className="text-white" />}
            title="Help & support"
            subtitle="Chat with the FixNear team"
          />
        </section>

        <button className="mx-4 mt-5 w-[calc(100%-2rem)] py-3 rounded-2xl border border-emergency/40 text-emergency text-sm font-bold flex items-center justify-center gap-2">
          <LogOut size={14} /> Sign out
        </button>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="text-brand-green">{icon}</div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-white/50">{label}</p>
        <p className="font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function MenuItem({
  to,
  icon,
  iconWrap,
  title,
  subtitle,
}: {
  to: string;
  icon: React.ReactNode;
  iconWrap: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 p-4">
      <div className={`size-11 rounded-xl flex items-center justify-center ${iconWrap}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white">{title}</p>
        <p className="text-xs text-white/60">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="text-white/40" />
    </Link>
  );
}
