import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useStore, type DirectThread, type Job, type ChatMsg } from "@/lib/store";
import { ARTISANS } from "@/lib/artisans";
import { Search, ShieldCheck, Briefcase, MessageSquare, Circle, CheckCheck, Check, PenSquare } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: Messages,
});

type Tab = "booking" | "direct";

function Messages() {
  const jobs = useStore((s) => s.jobs);
  const threads = useStore((s) => s.threads);
  const [tab, setTab] = useState<Tab>("booking");
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();

  const bookingChats = useMemo(
    () =>
      jobs
        .slice()
        .sort((a, b) => lastAt(b) - lastAt(a))
        .filter((j) => {
          if (!query) return true;
          const last = j.messages[j.messages.length - 1]?.text ?? "";
          return (
            j.title.toLowerCase().includes(query) ||
            j.artisanName.toLowerCase().includes(query) ||
            j.id.toLowerCase().includes(query) ||
            last.toLowerCase().includes(query)
          );
        }),
    [jobs, query],
  );

  const direct = useMemo(
    () =>
      threads
        .slice()
        .sort((a, b) => lastAt(b) - lastAt(a))
        .filter((t) => {
          if (!query) return true;
          const last = t.messages[t.messages.length - 1]?.text ?? "";
          return (
            t.artisanName.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            last.toLowerCase().includes(query)
          );
        }),
    [threads, query],
  );

  const totalBookingUnread = jobs.reduce((n, j) => n + (j.unread ?? 0), 0);
  const totalDMUnread = threads.reduce((n, t) => n + t.unread, 0);

  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry min-h-screen">
        <header className="bg-brand-green text-white rounded-b-[36px] px-6 pt-10 pb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-display font-bold">Messages</h1>
            <Link to="/search" className="size-11 rounded-full bg-white/15 flex items-center justify-center" aria-label="New chat">
              <PenSquare size={18} />
            </Link>
          </div>
          <p className="text-white/85 text-xs mt-1 flex items-center gap-1.5">
            <ShieldCheck size={12} /> All chats · No phone numbers shared
          </p>
          <div className="mt-5 h-12 bg-white rounded-full flex items-center gap-2 px-4">
            <Search size={16} className="text-neutral-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, booking ID, message…"
              className="flex-1 bg-transparent outline-none text-sm text-neutral-800 placeholder:text-neutral-400"
            />
          </div>
        </header>

        <div className="px-4 mt-5 flex gap-2">
          <TabButton active={tab === "booking"} onClick={() => setTab("booking")} icon={<Briefcase size={14} />} count={totalBookingUnread}>
            Booking chats
          </TabButton>
          <TabButton active={tab === "direct"} onClick={() => setTab("direct")} icon={<MessageSquare size={14} />} count={totalDMUnread}>
            Direct messages
          </TabButton>
        </div>

        <div className="px-4 mt-4 space-y-2">
          {tab === "booking" ? (
            bookingChats.length === 0 ? (
              <Empty label="You have no active bookings yet." ctaLabel="Find an artisan" />
            ) : (
              bookingChats.map((j) => <BookingRow key={j.id} job={j} />)
            )
          ) : direct.length === 0 ? (
            <div>
              <Empty label="Start a conversation with an artisan." ctaLabel="Browse artisans" />
              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">Suggested</p>
                <div className="space-y-2">
                  {ARTISANS.slice(0, 3).map((a) => (
                    <Link
                      key={a.id}
                      to="/dm/$artisanId"
                      params={{ artisanId: a.id }}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card"
                    >
                      <img src={a.photo} alt={a.name} className="size-11 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{a.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{a.trade} · {a.area}</p>
                      </div>
                      <span className="text-[10px] font-bold text-brand-green">CHAT</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            direct.map((t) => <DirectRow key={t.id} thread={t} />)
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function lastAt(x: { messages: ChatMsg[]; createdAt?: number }): number {
  return x.messages[x.messages.length - 1]?.at ?? x.createdAt ?? 0;
}

function TabButton({
  active,
  onClick,
  children,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-11 rounded-full text-sm font-bold flex items-center justify-center gap-2 border relative ${
        active
          ? "bg-brand-green text-white border-brand-green"
          : "bg-muted text-muted-foreground border-transparent"
      }`}
    >
      {icon}
      {children}
      {count > 0 && (
        <span className={`ml-1 min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center ${
          active ? "bg-white text-brand-green" : "bg-brand-green text-white"
        }`}>{count}</span>
      )}
    </button>
  );
}

const STATUS_MAP: Record<Job["status"], { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-brand-yellow/25 text-amber-800" },
  confirmed: { label: "Accepted", cls: "bg-brand-green/20 text-brand-green" },
  enroute: { label: "In Progress", cls: "bg-brand-green/25 text-brand-green" },
  completed: { label: "Completed", cls: "bg-muted text-foreground" },
  paid: { label: "Paid", cls: "bg-brand-green/30 text-brand-green" },
};

function previewText(m?: ChatMsg): string {
  if (!m) return "No messages yet";
  if (m.attachment?.kind === "image") return "📷 Photo";
  if (m.attachment?.kind === "voice") return `🎤 Voice · ${m.attachment.duration}s`;
  if (m.attachment?.kind === "location") return "📍 Location";
  if (m.attachment?.kind === "file") return `📎 ${m.attachment.name}`;
  return m.text;
}

function timeAgo(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

function BookingRow({ job }: { job: Job }) {
  const last = job.messages[job.messages.length - 1];
  const status = STATUS_MAP[job.status];
  const unread = job.unread ?? 0;

  return (
    <Link
      to="/chat/$jobId"
      params={{ jobId: job.id }}
      className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border hover:bg-muted/60 transition-colors"
    >
      <div className="relative shrink-0">
        <img src={job.artisanPhoto} alt={job.artisanName} className="size-12 rounded-full object-cover" />
        <span className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-brand-green flex items-center justify-center ring-2 ring-card">
          <Briefcase size={10} className="text-white" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm truncate">{job.artisanName}</span>
          <span className={`text-[9px] text-muted-foreground shrink-0 ${unread > 0 ? "text-brand-green font-bold" : ""}`}>
            {timeAgo(last?.at ?? job.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${status.cls}`}>{status.label}</span>
          <p className="text-[10px] text-muted-foreground truncate">
            {job.isEmergency ? "🚨 " : ""}{job.title}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className={`text-xs truncate ${unread > 0 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
            {previewText(last)}
          </p>
          {unread > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function DirectRow({ thread }: { thread: DirectThread }) {
  const last = thread.messages[thread.messages.length - 1];
  const mine = last?.from === "customer";

  return (
    <Link
      to="/dm/$artisanId"
      params={{ artisanId: thread.artisanId }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:bg-muted/60 transition-colors"
    >
      <div className="relative shrink-0">
        <img src={thread.artisanPhoto} alt={thread.artisanName} className="size-12 rounded-full object-cover" />
        {thread.online && (
          <Circle size={11} className="absolute -bottom-0.5 -right-0.5 fill-brand-green text-brand-green" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm truncate">{thread.artisanName}</span>
          <span className={`text-[10px] shrink-0 ${thread.unread > 0 ? "text-brand-green font-bold" : "text-muted-foreground"}`}>
            {timeAgo(last?.at ?? thread.lastSeenAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-xs truncate flex items-center gap-1 ${thread.unread > 0 ? "text-foreground font-bold" : "text-muted-foreground"}`}>
            {mine && last && (last.read ? <CheckCheck size={12} className="text-brand-green" /> : <Check size={12} />)}
            {previewText(last) || `Say hello to ${thread.artisanName.split(" ")[0]}`}
          </p>
          {thread.unread > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand-green text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Empty({ label, cta }: { label: string; cta?: { to: string; label: string } }) {
  return (
    <div className="mt-10 text-center text-muted-foreground py-8">
      <MessageSquare size={40} className="mx-auto opacity-30" />
      <p className="text-sm mt-3">{label}</p>
      {cta && (
        <Link to={cta.to} className="mt-4 inline-flex items-center px-5 py-2.5 rounded-full bg-brand-green text-white text-xs font-bold">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
