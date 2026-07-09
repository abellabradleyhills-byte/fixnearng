import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import {
  useStore,
  markAllNotificationsRead,
  clearNotifications,
  type Notification,
} from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { ChevronLeft, Bell, Briefcase, MessageSquare, Megaphone, CheckCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

type Filter = "all" | "job" | "chat" | "marketing";

function NotificationsPage() {
  const items = useStore((s) => s.notifications);
  const prefs = usePrefs();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const t = setTimeout(() => markAllNotificationsRead(), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = filter === "all" ? items : items.filter((n) => n.kind === filter);

  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry">
        <header className="px-5 pt-10 pb-4 flex items-center gap-3">
          <Link to="/" className="size-10 rounded-full bg-muted flex items-center justify-center" aria-label="Back">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">Notifications</h1>
            <p className="text-xs text-muted-foreground">Respects your Settings toggles.</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => clearNotifications()}
              className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
              aria-label="Clear all"
              title="Clear all"
            >
              <Trash2 size={16} />
            </button>
          )}
        </header>

        <div className="px-5 flex gap-2 overflow-x-auto pb-2">
          {(["all", "job", "chat", "marketing"] as Filter[]).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 capitalize ${
                filter === k
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {k === "job" ? "Jobs" : k === "chat" ? "Chats" : k === "marketing" ? "Deals" : "All"}
            </button>
          ))}
        </div>

        <div className="px-4 mt-2 rounded-2xl bg-brand-green/10 border border-brand-green/20 mx-4 p-3 flex items-center gap-2">
          <CheckCheck size={14} className="text-brand-green" />
          <p className="text-[11px] text-brand-green">
            Job alerts {prefs.jobAlerts ? "on" : "off"} · Chat {prefs.chatMessages ? "on" : "off"} · Marketing {prefs.marketing ? "on" : "off"}
          </p>
        </div>

        <div className="px-4 mt-4 space-y-2">
          {filtered.length === 0 ? (
            <Empty />
          ) : (
            filtered.map((n) => <Row key={n.id} n={n} />)
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function Row({ n }: { n: Notification }) {
  const icon =
    n.kind === "job" ? (
      <Briefcase size={16} className="text-brand-green" />
    ) : n.kind === "chat" ? (
      <MessageSquare size={16} className="text-brand-green" />
    ) : (
      <Megaphone size={16} className="text-brand-yellow" />
    );
  const body = (
    <div className={`flex gap-3 p-3 rounded-2xl border ${n.read ? "border-border bg-card" : "border-brand-green/30 bg-brand-green/5"}`}>
      <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-sm truncate">{n.title}</p>
          {!n.read && <span className="size-2 rounded-full bg-brand-green shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(n.at)}</p>
      </div>
    </div>
  );
  if (n.jobId) {
    return (
      <Link to="/chat/$jobId" params={{ jobId: n.jobId }} className="block">
        {body}
      </Link>
    );
  }
  return body;
}

function Empty() {
  return (
    <div className="mt-16 text-center text-muted-foreground">
      <Bell size={40} className="mx-auto opacity-30" />
      <p className="mt-3 font-bold">You're all caught up</p>
      <p className="text-xs mt-1">New alerts land here.</p>
    </div>
  );
}

function timeAgo(at: number) {
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
