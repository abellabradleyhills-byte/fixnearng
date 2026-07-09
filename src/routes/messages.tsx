import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useStore, type Job } from "@/lib/store";
import { ARTISANS } from "@/lib/artisans";
import { Search, ShieldCheck, Briefcase, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: Messages,
});

type Tab = "booking" | "direct";

function Messages() {
  const jobs = useStore((s) => s.jobs);
  const [tab, setTab] = useState<Tab>("booking");
  const [q, setQ] = useState("");

  const bookingChats = useMemo(
    () =>
      jobs
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .filter((j) => j.title.toLowerCase().includes(q.toLowerCase()) || j.artisanName.toLowerCase().includes(q.toLowerCase())),
    [jobs, q],
  );

  const direct = ARTISANS.slice(0, 3).filter(
    (a) => a.name.toLowerCase().includes(q.toLowerCase()) || a.trade.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry min-h-screen">
        {/* Green header */}
        <header className="bg-brand-green text-white rounded-b-[36px] px-6 pt-10 pb-8 shadow-xl">
          <h1 className="text-4xl font-display font-bold">Messages</h1>
          <p className="text-white/85 text-xs mt-1 flex items-center gap-1.5">
            <ShieldCheck size={12} /> All chats · No phone numbers shared
          </p>
          <div className="mt-5 h-12 bg-white rounded-full flex items-center gap-2 px-4">
            <Search size={16} className="text-neutral-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search conversations…"
              className="flex-1 bg-transparent outline-none text-sm text-neutral-800 placeholder:text-neutral-400"
            />
          </div>
        </header>

        {/* Tabs */}
        <div className="px-4 mt-5 flex gap-2">
          <TabButton active={tab === "booking"} onClick={() => setTab("booking")} icon={<Briefcase size={14} />}>
            Booking chats
          </TabButton>
          <TabButton active={tab === "direct"} onClick={() => setTab("direct")} icon={<MessageSquare size={14} />}>
            Direct messages
          </TabButton>
        </div>

        <div className="px-4 mt-4 space-y-3">
          {tab === "booking" ? (
            bookingChats.length === 0 ? (
              <Empty label="No booking chats yet." />
            ) : (
              bookingChats.map((j) => <BookingRow key={j.id} job={j} />)
            )
          ) : direct.length === 0 ? (
            <Empty label="No direct messages yet." />
          ) : (
            direct.map((a, i) => (
              <Link
                key={a.id}
                to="/artisan/$id"
                params={{ id: a.id }}
                className="flex gap-3 p-3 rounded-2xl border border-border bg-card items-center"
              >
                <img src={a.photo} alt={a.name} className="size-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {i === 0 ? "2m" : i === 1 ? "1h" : "Yesterday"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {["I'm 5 minutes away, sir.", "Confirmed for tomorrow 10am.", "Job completed — thank you!"][i]}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-11 rounded-full text-sm font-bold flex items-center justify-center gap-2 border ${
        active
          ? "bg-brand-green text-white border-brand-green"
          : "bg-muted text-muted-foreground border-transparent"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function BookingRow({ job }: { job: Job }) {
  const last = job.messages[job.messages.length - 1];
  const statusMap: Record<Job["status"], { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-brand-yellow/25 text-amber-800" },
    confirmed: { label: "Confirmed", cls: "bg-brand-green/20 text-brand-green" },
    enroute: { label: "En route", cls: "bg-brand-green/20 text-brand-green" },
    completed: { label: "Complete", cls: "bg-muted text-foreground" },
    paid: { label: "Paid", cls: "bg-brand-green/30 text-brand-green" },
  };
  const { label, cls } = statusMap[job.status];

  return (
    <Link
      to="/chat/$jobId"
      params={{ jobId: job.id }}
      className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border"
    >
      <div className="size-12 rounded-full bg-brand-green/15 flex items-center justify-center shrink-0">
        <Briefcase size={18} className="text-brand-green" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm">Artisan</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
        </div>
        <p className="text-xs text-foreground/80 truncate mt-0.5">
          {job.isEmergency ? "🚨 " : ""}
          {job.title}
        </p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {last ? last.text : "No messages yet"}
        </p>
      </div>
    </Link>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="mt-10 text-center text-muted-foreground">
      <MessageSquare size={32} className="mx-auto opacity-40" />
      <p className="text-xs mt-2">{label}</p>
    </div>
  );
}
