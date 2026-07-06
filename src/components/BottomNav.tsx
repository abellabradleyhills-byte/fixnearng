import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MapPin, Siren, MessageCircle, User } from "lucide-react";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const is = (p: string) => pathname === p;

  return (
    <nav className="fixed bottom-4 inset-x-4 z-40 bg-foreground text-white rounded-2xl px-3 py-2 flex items-center justify-between shadow-2xl">
      <TabLink to="/" active={is("/")} icon={<Home size={20} />} label="Home" />
      <TabLink to="/search" active={is("/search")} icon={<MapPin size={20} />} label="Search" />
      <Link
        to="/sos"
        className="-mt-8 size-14 rounded-full bg-emergency text-white flex items-center justify-center ring-4 ring-background animate-sos-pulse"
        aria-label="Emergency SOS"
      >
        <Siren size={24} />
      </Link>
      <TabLink to="/messages" active={is("/messages")} icon={<MessageCircle size={20} />} label="Chat" />
      <TabLink to="/profile" active={is("/profile")} icon={<User size={20} />} label="You" />
    </nav>
  );
}

function TabLink({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
        active ? "text-brand-yellow" : "text-white/60"
      }`}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </Link>
  );
}
