import { Check, X, MessageSquare, ShieldCheck, Clock, FileText } from "lucide-react";
import type { MsgAttachment } from "@/lib/store";

type Proposal = Extract<MsgAttachment, { kind: "proposal" }>;

export function ProposalCard({
  p,
  mine,
  onAccept,
  onReject,
  onCounter,
  time,
}: {
  p: Proposal;
  mine: boolean;
  time: string;
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
}) {
  const statusColor =
    p.status === "accepted"
      ? "text-brand-green"
      : p.status === "rejected"
        ? "text-emergency"
        : p.status === "countered"
          ? "text-muted-foreground"
          : "text-amber-700 dark:text-brand-yellow";

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] w-72 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-black/10 dark:border-white/10 overflow-hidden">
        <div className="px-3 py-2 bg-brand-green/10 border-b border-brand-green/20 flex items-center gap-1.5">
          <FileText size={14} className="text-brand-green" />
          <span className="text-xs font-bold text-brand-green">Price proposal</span>
          <span className={`ml-auto text-[10px] font-bold uppercase ${statusColor}`}>{p.status}</span>
        </div>
        <div className="px-3 py-2 space-y-1">
          {p.breakdown.map((l, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-muted-foreground truncate pr-2">{l.label}</span>
              <span className="font-medium tabular-nums">₦{l.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-black/10 dark:border-white/10 pt-1 mt-1 flex justify-between text-sm">
            <span className="font-bold">Total</span>
            <span className="font-bold tabular-nums">₦{p.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px] text-amber-700 dark:text-brand-yellow">
            <span>Materials upfront</span>
            <span className="tabular-nums font-bold">₦{p.materialsUpfront.toLocaleString()}</span>
          </div>
          {p.note && <p className="text-[11px] text-muted-foreground pt-1 italic">"{p.note}"</p>}
        </div>

        {p.status === "pending" && !mine && (onAccept || onReject || onCounter) && (
          <div className="grid grid-cols-3 border-t border-black/10 dark:border-white/10 text-xs font-bold">
            <button onClick={onReject} className="py-2 text-emergency flex items-center justify-center gap-1 hover:bg-emergency/5">
              <X size={13} /> Reject
            </button>
            <button onClick={onCounter} className="py-2 text-muted-foreground border-x border-black/10 dark:border-white/10 flex items-center justify-center gap-1 hover:bg-black/5">
              <MessageSquare size={13} /> Counter
            </button>
            <button onClick={onAccept} className="py-2 text-brand-green flex items-center justify-center gap-1 hover:bg-brand-green/5">
              <Check size={13} /> Accept
            </button>
          </div>
        )}
        {p.status === "pending" && mine && (
          <div className="px-3 py-1.5 border-t border-black/10 dark:border-white/10 text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock size={11} /> Waiting for response…
          </div>
        )}
        {p.status === "accepted" && (
          <div className="px-3 py-1.5 border-t border-black/10 dark:border-white/10 text-[10px] text-brand-green flex items-center gap-1">
            <ShieldCheck size={11} /> Sent to FixNear admin for approval
          </div>
        )}
        <div className="px-3 py-1 text-[10px] text-muted-foreground text-right">{time}</div>
      </div>
    </div>
  );
}
