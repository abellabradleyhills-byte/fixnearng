import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useStore, advanceStatus, submitReview, type Job, type JobStatus } from "@/lib/store";
import {
  ChevronLeft,
  Clock,
  CheckCircle2,
  Truck,
  Wrench,
  MessageCircle,
  Wallet as WalletIcon,
  Zap,
  Package,
  Star,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Track My Jobs — FixNear" },
      { name: "description", content: "Live status and milestone timeline for every FixNear booking." },
    ],
  }),
  component: JobsPage,
});

const TABS = ["active", "past", "support"] as const;
type Tab = (typeof TABS)[number];

function JobsPage() {
  const jobs = useStore((s) => s.jobs);
  const [tab, setTab] = useState<Tab>("active");

  const active = jobs.filter((j) => j.status !== "paid");
  const past = jobs.filter((j) => j.status === "paid");
  const list = tab === "active" ? active : tab === "past" ? past : [];

  return (
    <PhoneFrame className="!bg-neutral-950 text-white">
      <div className="pb-32 animate-screen-entry">
        <header className="px-5 pt-8 pb-4 flex items-center gap-3">
          <Link to="/" className="size-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/60">SERVICE TRACKER</p>
            <h1 className="text-2xl font-display font-bold leading-tight">My Jobs</h1>
          </div>
        </header>

        <div className="mt-2 border-b border-white/10 flex">
          {TABS.map((t) => {
            const count = t === "active" ? active.length : t === "past" ? past.length : 0;
            const label = t === "support" ? "Support" : `${t[0].toUpperCase()}${t.slice(1)} (${count})`;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-bold capitalize relative ${
                  tab === t ? "text-brand-green" : "text-white/50"
                }`}
              >
                {label}
                {tab === t && <span className="absolute bottom-0 inset-x-6 h-0.5 bg-brand-green rounded-full" />}
              </button>
            );
          })}
        </div>

        <div className="px-5 mt-5 space-y-4">
          {tab === "support" ? (
            <SupportPanel />
          ) : list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            list.map((j) => <JobCard key={j.id} job={j} />)
          )}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: "Waiting for artisan to accept",
  confirmed: "Artisan confirmed — preparing to head out",
  enroute: "Artisan is on the way to your location",
  completed: "Job marked complete — awaiting your payment",
  paid: "Payment confirmed — thank you!",
};

function JobCard({ job }: { job: Job }) {
  const [review, setReview] = useState({ rating: 5, text: "" });
  const [flash, setFlash] = useState<string | null>(null);

  const stepIndex = (
    { pending: 0, confirmed: 1, enroute: 2, completed: 3, paid: 3 } as Record<JobStatus, number>
  )[job.status];

  const materialsBlocked = job.materials && !job.materials.paid;

  return (
    <article className="rounded-3xl bg-white/[0.03] border border-white/10 p-4 shadow-lg">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-lg leading-none mt-0.5">{job.isEmergency ? "🚨" : "🧰"}</span>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base leading-snug">{job.title}</h3>
            <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
              📍 {job.location}
            </p>
          </div>
        </div>
        <StatusPill status={job.status} />
      </header>

      {/* Timeline */}
      <div className="mt-5 flex items-start justify-between px-1">
        <Milestone icon={<Clock size={18} />} label="Request Sent" active={stepIndex >= 0} done={stepIndex > 0} />
        <StepBar filled={stepIndex >= 1} />
        <Milestone icon={<CheckCircle2 size={18} />} label="Booking Confirmed" active={stepIndex >= 1} done={stepIndex > 1} />
        <StepBar filled={stepIndex >= 2} />
        <Milestone icon={<Truck size={18} />} label="Artisan En Route" active={stepIndex >= 2} done={stepIndex > 2} />
        <StepBar filled={stepIndex >= 3} />
        <Milestone icon={<Wrench size={18} />} label="Job Completed" active={stepIndex >= 3} done={job.finalPaid} />
      </div>

      <p className="mt-4 text-sm text-white/70">{STATUS_LABEL[job.status]}</p>

      {/* Materials upfront request */}
      {job.materials && (
        <div
          className={`mt-4 rounded-2xl p-3 border ${
            job.materials.paid
              ? "bg-brand-green/10 border-brand-green/30"
              : "bg-brand-yellow/10 border-brand-yellow/40"
          }`}
        >
          <div className="flex items-start gap-2">
            <Package size={16} className={job.materials.paid ? "text-brand-green mt-0.5" : "text-brand-yellow mt-0.5"} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold tracking-wide">
                {job.materials.paid ? "MATERIALS PAID" : "MATERIALS REQUESTED UPFRONT"}
              </p>
              <p className="text-sm mt-1 text-white/80">{job.materials.description}</p>
              <p className="mt-2 font-display font-bold text-xl">
                ₦{job.materials.amount.toLocaleString()}
              </p>
              <p className="text-[11px] text-white/50 mt-1">
                Paid securely in-app — released to artisan once accepted.
              </p>
            </div>
          </div>
          {!job.materials.paid && (
            <Link
              to="/pay/$jobId"
              params={{ jobId: job.id }}
              search={{ kind: "materials" }}
              className="mt-3 w-full inline-flex items-center justify-center py-3 rounded-xl bg-brand-yellow text-neutral-900 font-bold text-sm"
            >
              Approve & Pay Materials
            </Link>
          )}
        </div>
      )}

      {/* Final payment */}
      {job.status === "completed" && !job.finalPaid && job.finalAmount && (
        <div className="mt-3 rounded-2xl p-3 border bg-emergency/10 border-emergency/30">
          <p className="text-xs font-bold text-emergency">FINAL PAYMENT DUE</p>
          <p className="font-display font-bold text-xl mt-1">₦{job.finalAmount.toLocaleString()}</p>
          <p className="text-[11px] text-white/60 mt-1">
            Confirm the job is done, then pay. You can review after payment is confirmed.
          </p>
          <Link
            to="/pay/$jobId"
            params={{ jobId: job.id }}
            search={{ kind: "final" }}
            className="mt-3 w-full inline-flex items-center justify-center py-3 rounded-xl bg-brand-green text-white font-bold text-sm"
          >
            Pay ₦{job.finalAmount.toLocaleString()} with FixNear Wallet
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 space-y-2">
        {job.isEmergency && (
          <div className="w-full py-3 rounded-xl border border-emergency/40 text-emergency font-bold text-sm flex items-center justify-center gap-2">
            <Zap size={16} /> Emergency SOS Job
          </div>
        )}

        <Link
          to="/chat/$jobId"
          params={{ jobId: job.id }}
          className="w-full py-3 rounded-xl border border-white/15 bg-white/[0.02] font-bold text-sm flex items-center justify-between px-4"
        >
          <span className="flex items-center gap-2">
            <MessageCircle size={16} className="text-brand-green" />
            Open chat with artisan
          </span>
          <ChevronRight size={16} className="text-white/50" />
        </Link>

        {(materialsBlocked || (job.status === "completed" && !job.finalPaid)) ? (
          <Link
            to="/pay/$jobId"
            params={{ jobId: job.id }}
            search={{ kind: materialsBlocked ? "materials" : "final" }}
            className="w-full py-3 rounded-xl border border-brand-green/40 text-brand-green font-bold text-sm flex items-center justify-between px-4"
          >
            <span className="flex items-center gap-2">
              <WalletIcon size={16} />
              Pay with FixNear Wallet
            </span>
            <ChevronRight size={16} />
          </Link>
        ) : (
          <div
            aria-disabled
            className="w-full py-3 rounded-xl border border-white/10 text-white/40 font-bold text-sm flex items-center justify-between px-4 cursor-not-allowed"
            title={
              job.finalPaid
                ? "Payment already confirmed"
                : "Payment unlocks when the artisan requests materials or marks the job complete."
            }
          >
            <span className="flex items-center gap-2">
              <WalletIcon size={16} />
              {job.finalPaid ? "Payment confirmed" : "No payment due yet"}
            </span>
          </div>
        )}
      </div>

      {/* Demo simulate */}
      {job.status !== "completed" && job.status !== "paid" && (
        <button
          onClick={() => advanceStatus(job.id)}
          className="mt-3 w-full text-[11px] text-white/40 underline"
        >
          (demo) advance status →
        </button>
      )}

      {/* Review */}
      {job.status === "paid" && !job.review && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs font-bold tracking-wide text-brand-yellow">RATE YOUR EXPERIENCE</p>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setReview((r) => ({ ...r, rating: n }))}>
                <Star
                  size={22}
                  className={n <= review.rating ? "fill-brand-yellow text-brand-yellow" : "text-white/30"}
                />
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Was the work well done?"
            value={review.text}
            onChange={(e) => setReview((r) => ({ ...r, text: e.target.value }))}
            className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl p-2 text-sm outline-none"
          />
          <button
            onClick={() => {
              const res = submitReview(job.id, review.rating, review.text);
              if (!res.ok) setFlash(res.error ?? "Could not submit");
            }}
            className="mt-2 w-full py-3 rounded-xl bg-brand-green text-white font-bold text-sm"
          >
            Submit review
          </button>
        </div>
      )}
      {job.review && (
        <div className="mt-4 rounded-2xl bg-brand-green/10 border border-brand-green/20 p-3">
          <p className="text-xs font-bold text-brand-green">YOUR REVIEW · {job.review.rating}★</p>
          <p className="text-sm mt-1 text-white/80">{job.review.text || "Thanks for rating."}</p>
        </div>
      )}
      {flash && <p className="mt-2 text-[11px] text-emergency">{flash}</p>}
    </article>
  );
}

function StatusPill({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-brand-yellow/20 text-brand-yellow border-brand-yellow/40" },
    confirmed: { label: "Confirmed", cls: "bg-brand-green/20 text-brand-green border-brand-green/40" },
    enroute: { label: "En route", cls: "bg-brand-green/20 text-brand-green border-brand-green/40" },
    completed: { label: "Completed", cls: "bg-white/10 text-white border-white/20" },
    paid: { label: "Paid", cls: "bg-brand-green/30 text-brand-green border-brand-green/50" },
  };
  const { label, cls } = map[status];
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${cls}`}>{label}</span>;
}

function Milestone({
  icon,
  label,
  active,
  done,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-14 shrink-0">
      <div
        className={`size-11 rounded-full flex items-center justify-center border-2 ${
          done
            ? "bg-brand-green border-brand-green text-white"
            : active
              ? "bg-brand-green/20 border-brand-green text-brand-green"
              : "bg-white/5 border-white/15 text-white/40"
        }`}
      >
        {icon}
      </div>
      <span className={`text-[10px] font-bold text-center leading-tight ${active ? "text-white" : "text-white/40"}`}>
        {label}
      </span>
    </div>
  );
}

function StepBar({ filled }: { filled: boolean }) {
  return <div className={`flex-1 h-0.5 mt-5 ${filled ? "bg-brand-green" : "bg-white/15"}`} />;
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="mt-16 text-center text-white/60">
      <Wrench size={40} className="mx-auto text-white/30" />
      <p className="mt-3 font-bold">{tab === "active" ? "No active jobs" : "No past jobs yet"}</p>
      <p className="text-xs mt-1">Book an artisan from the home screen.</p>
    </div>
  );
}

function SupportPanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
      <h3 className="font-display font-bold text-lg">Need help with a job?</h3>
      <p className="text-sm text-white/70">
        Our safety team is available 24/7. All payments are held securely in FixNear Pay until you confirm the job.
      </p>
      <Link
        to="/messages"
        className="block text-center py-3 rounded-xl bg-brand-green text-white font-bold text-sm"
      >
        Chat with FixNear support
      </Link>
    </div>
  );
}
