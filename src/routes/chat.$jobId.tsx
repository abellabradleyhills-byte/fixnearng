import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import {
  getJob,
  markJobCompleted,
  markJobRead,
  respondProposal,
  sendMessage,
  sendProposal,
  useStore,
  type MsgAttachment,
  type ProposalLine,
} from "@/lib/store";
import { getPrefs } from "@/lib/prefs";
import { ChatComposer, MessageBubble, TypingDots } from "@/components/ChatUI";
import { ProposalCard } from "@/components/ProposalCard";
import { useState } from "react";
import {
  ChevronLeft,
  Phone,
  ShieldCheck,
  Wallet as WalletIcon,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Handshake,
  Plus,
  Trash2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/chat/$jobId")({
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    return { jobId: params.jobId };
  },
  head: () => ({ meta: [{ title: "Booking Chat — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: ChatPage,
});

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-brand-yellow/25 text-amber-900" },
  confirmed: { label: "Accepted", cls: "bg-brand-green/25 text-brand-green" },
  enroute: { label: "In Progress", cls: "bg-brand-green/25 text-brand-green" },
  completed: { label: "Completed", cls: "bg-white/20 text-white" },
  paid: { label: "Paid", cls: "bg-brand-green/40 text-white" },
};

function ChatPage() {
  const { jobId } = Route.useLoaderData();
  const job = useStore((s) => s.jobs.find((j) => j.id === jobId));
  const [typing, setTyping] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    markJobRead(jobId);
  }, [jobId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [job?.messages.length, typing]);

  if (!job) return null;

  const materialsDue = !!job.materials && !job.materials.paid;
  const finalDue = job.status === "completed" && !job.finalPaid && !!job.finalAmount;
  const payDue = materialsDue || finalDue;
  const statusInfo = STATUS_LABEL[job.status];
  const shortId = job.id.slice(0, 8).toUpperCase();

  const send = (text: string, attachment?: MsgAttachment) => {
    sendMessage(job.id, text, "customer", attachment);
    if (getPrefs().chatMessages) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        sendMessage(job.id, "Noted, sir. I dey come.", "artisan");
      }, 1400);
    }
  };

  return (
    <PhoneFrame className="!bg-[#ECE5DD] dark:!bg-neutral-950">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-brand-green text-white px-3 pt-9 pb-3 flex items-center gap-2 shadow-lg">
          <Link
            to="/messages"
            className="size-9 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <ChevronLeft size={22} />
          </Link>
          <Link to="/artisan/$id" params={{ id: job.artisanId }} className="flex items-center gap-2 flex-1 min-w-0">
            <img src={job.artisanPhoto} alt={job.artisanName} className="size-10 rounded-full object-cover ring-2 ring-white/40" />
            <div className="min-w-0">
              <p className="font-bold truncate leading-tight">{job.artisanName}</p>
              <p className="text-[10px] text-white/75 truncate">{job.category} · Booking #{shortId}</p>
            </div>
          </Link>
          <button className="size-9 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Call">
            <Phone size={18} />
          </button>
          <button
            disabled={!payDue}
            onClick={() =>
              payDue &&
              navigate({
                to: "/pay/$jobId",
                params: { jobId: job.id },
                search: { kind: materialsDue ? "materials" : "final" },
              })
            }
            className="size-9 rounded-full bg-brand-yellow/25 flex items-center justify-center disabled:opacity-40"
            aria-label="Pay with FixNear Wallet"
          >
            <WalletIcon size={16} />
          </button>
        </header>

        {/* Booking summary */}
        <div className="bg-white dark:bg-neutral-900 border-b border-black/5 dark:border-white/10">
          <button
            onClick={() => setSummaryOpen((v) => !v)}
            className="w-full px-4 py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.cls}`}>
                {statusInfo.label.toUpperCase()}
              </span>
              <p className="text-xs font-bold truncate">{job.title}</p>
            </div>
            {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {summaryOpen && (
            <div className="px-4 pb-3 grid grid-cols-2 gap-y-1.5 text-[11px]">
              <SumRow icon={<Clock size={11} />} label="Scheduled" value={job.eta ?? "Any time"} />
              <SumRow icon={<MapPin size={11} />} label="Location" value={job.location} />
              <SumRow icon={<CheckCircle2 size={11} />} label="Booking ID" value={`#${shortId}`} />
              <SumRow icon={<WalletIcon size={11} />} label="Final" value={job.finalAmount ? `₦${job.finalAmount.toLocaleString()}` : "TBD"} />
            </div>
          )}
        </div>

        <div className="px-4 py-1.5 bg-brand-yellow/20 border-b border-brand-yellow/40 text-[10px] text-amber-900 dark:text-brand-yellow flex items-center gap-1.5 justify-center">
          <ShieldCheck size={11} /> Payments held in FixNear Pay · Released after job done
        </div>

        {job.negotiation && (
          <div
            className={`px-4 py-2 text-[11px] flex items-center gap-2 border-b ${
              job.negotiation.adminStatus === "approved"
                ? "bg-brand-green/15 border-brand-green/30 text-brand-green"
                : job.negotiation.adminStatus === "rejected"
                  ? "bg-emergency/10 border-emergency/30 text-emergency"
                  : "bg-brand-yellow/20 border-brand-yellow/40 text-amber-900 dark:text-brand-yellow"
            }`}
          >
            <ShieldCheck size={12} />
            <span className="font-bold">
              {job.negotiation.adminStatus === "approved" && "Admin approved"}
              {job.negotiation.adminStatus === "pending" && "Admin review pending"}
              {job.negotiation.adminStatus === "rejected" && "Admin rejected"}
            </span>
            <span className="opacity-80">
              · Agreed ₦{job.negotiation.agreedTotal.toLocaleString()} · Materials ₦
              {job.negotiation.materialsUpfront.toLocaleString()}
            </span>
          </div>
        )}

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {job.messages.length === 0 && (
            <p className="text-center text-xs text-muted-foreground mt-8">
              Say hello to {job.artisanName.split(" ")[0]}.
            </p>
          )}
          {job.messages.map((m, i) => {
            const prev = job.messages[i - 1];
            if (m.from === "system") {
              return (
                <div key={m.id} className="flex justify-center my-1.5">
                  <span className="text-[10px] text-muted-foreground bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
                    {m.text}
                  </span>
                </div>
              );
            }
            if (m.attachment?.kind === "proposal") {
              const p = m.attachment;
              const mine = m.from === "customer";
              const time = new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <ProposalCard
                  key={m.id}
                  p={p}
                  mine={mine}
                  time={time}
                  onAccept={() => respondProposal(job.id, p.id, "accepted", "customer")}
                  onReject={() => respondProposal(job.id, p.id, "rejected", "customer")}
                  onCounter={() => {
                    respondProposal(job.id, p.id, "countered", "customer");
                    setNegotiateOpen(true);
                  }}
                />
              );
            }
            const showAvatar = m.from === "artisan" && (!prev || prev.from !== m.from);
            return (
              <MessageBubble key={m.id} msg={m} showAvatar={showAvatar} avatarSrc={job.artisanPhoto} variant="job" />
            );
          })}
          {typing && <TypingDots />}
        </div>

        {/* Action buttons */}
        <div className="px-3 py-2 flex gap-2 bg-background border-t border-black/5 dark:border-white/10">
          {!job.negotiation && (
            <button
              onClick={() => setNegotiateOpen(true)}
              className="flex-1 h-10 rounded-full bg-brand-yellow text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Handshake size={14} /> Negotiate Price
            </button>
          )}
          {payDue && (
            <button
              onClick={() =>
                navigate({
                  to: "/pay/$jobId",
                  params: { jobId: job.id },
                  search: { kind: materialsDue ? "materials" : "final" },
                })
              }
              className="flex-1 h-10 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <WalletIcon size={14} /> Pay ₦{(materialsDue ? job.materials!.amount : job.finalAmount!).toLocaleString()}
            </button>
          )}
          {job.negotiation?.adminStatus === "approved" &&
            !payDue &&
            (job.status === "enroute" || job.status === "confirmed") && (
              <button
                onClick={() => markJobCompleted(job.id)}
                className="flex-1 h-10 rounded-full border-2 border-brand-green text-brand-green text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Job Completed
              </button>
            )}
          {job.status === "completed" && !finalDue && (
            <div className="flex-1 h-10 rounded-full bg-brand-green/15 text-brand-green text-xs font-bold flex items-center justify-center">
              Waiting for final invoice
            </div>
          )}
          {job.status === "paid" && (
            <Link
              to="/jobs"
              className="flex-1 h-10 rounded-full bg-brand-green/15 text-brand-green text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={14} /> Paid · Rate your experience
            </Link>
          )}
        </div>

        <ChatComposer onSend={send} />
        {negotiateOpen && (
          <NegotiateModal
            onClose={() => setNegotiateOpen(false)}
            onSend={(data) => {
              sendProposal(job.id, "customer", data);
              setNegotiateOpen(false);
            }}
          />
        )}
      </div>
    </PhoneFrame>
  );
}

function NegotiateModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (data: { breakdown: ProposalLine[]; materialsUpfront: number; note?: string }) => void;
}) {
  const [lines, setLines] = useState<ProposalLine[]>([
    { label: "Materials & parts", amount: 15000 },
    { label: "Labour", amount: 10000 },
  ]);
  const [materials, setMaterials] = useState(15000);
  const [note, setNote] = useState("");
  const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);

  const update = (i: number, patch: Partial<ProposalLine>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const add = () => setLines((ls) => [...ls, { label: "", amount: 0 }]);
  const remove = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Handshake size={18} className="text-brand-green" />
            <h3 className="font-bold">Send price proposal</h3>
          </div>
          <button onClick={onClose} className="size-8 rounded-full hover:bg-black/5 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Break down your offer. Once both parties agree, the price is sent to FixNear admin for approval before payment.
        </p>

        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={l.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Item (e.g. Materials, Labour)"
                className="flex-1 h-9 rounded-lg border border-black/10 dark:border-white/10 bg-muted px-2 text-xs"
              />
              <div className="flex items-center gap-1 w-28">
                <span className="text-xs text-muted-foreground">₦</span>
                <input
                  type="number"
                  value={l.amount || ""}
                  onChange={(e) => update(i, { amount: Number(e.target.value) || 0 })}
                  className="w-full h-9 rounded-lg border border-black/10 dark:border-white/10 bg-muted px-2 text-xs tabular-nums"
                />
              </div>
              {lines.length > 1 && (
                <button onClick={() => remove(i)} className="size-8 text-emergency flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button onClick={add} className="text-xs text-brand-green font-bold flex items-center gap-1">
            <Plus size={14} /> Add line
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-brand-green/10 border border-brand-green/25">
          <div className="flex justify-between text-sm">
            <span className="font-bold">Total price</span>
            <span className="font-bold tabular-nums">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs font-bold text-muted-foreground">Materials upfront (₦)</label>
          <input
            type="number"
            value={materials || ""}
            onChange={(e) => setMaterials(Number(e.target.value) || 0)}
            className="w-full h-10 mt-1 rounded-lg border border-black/10 dark:border-white/10 bg-muted px-3 text-sm tabular-nums"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Paid via FixNear Wallet after admin approval. Balance ₦{Math.max(0, total - materials).toLocaleString()} due on job completion.
          </p>
        </div>

        <div className="mt-3">
          <label className="text-xs font-bold text-muted-foreground">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Add context for the artisan / admin"
            className="w-full mt-1 rounded-lg border border-black/10 dark:border-white/10 bg-muted px-3 py-2 text-sm resize-none"
          />
        </div>

        <button
          disabled={total <= 0 || materials < 0 || materials > total}
          onClick={() =>
            onSend({
              breakdown: lines.filter((l) => l.label.trim() && l.amount > 0),
              materialsUpfront: materials,
              note: note.trim() || undefined,
            })
          }
          className="mt-4 w-full h-11 rounded-full bg-brand-green text-white text-sm font-bold disabled:opacity-40"
        >
          Send Proposal
        </button>
      </div>
    </div>
  );
}

function SumRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="font-bold text-foreground/60">{label}:</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  );
}
