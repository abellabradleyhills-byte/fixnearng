import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PhoneFrame } from "@/components/PhoneFrame";
import { getJob, getReceipt, useStore, payMaterials, payFinal, addMoney } from "@/lib/store";
import {
  ChevronLeft,
  ShieldCheck,
  Package,
  Wrench,
  Check,
  Plus,
  Copy,
  Share2,
  MessageCircle,
} from "lucide-react";

const searchSchema = z.object({ kind: z.enum(["materials", "final"]).default("materials") });

export const Route = createFileRoute("/pay/$jobId")({
  validateSearch: searchSchema,
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    return { jobId: params.jobId };
  },
  head: () => ({ meta: [{ title: "Pay with FixNear Wallet" }, { name: "robots", content: "noindex" }] }),
  component: PayPage,
});

function PayPage() {
  const { jobId } = Route.useLoaderData();
  const { kind } = Route.useSearch();
  const job = useStore((s) => s.jobs.find((j) => j.id === jobId));
  const balance = useStore((s) => s.wallet.balance);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [topup, setTopup] = useState(0);

  if (!job) return null;

  const isFinal = kind === "final";
  const amount = isFinal ? job.finalAmount ?? 0 : job.materials?.amount ?? 0;
  const disabled =
    (isFinal && (job.status !== "completed" || job.finalPaid)) ||
    (!isFinal && (!job.materials || job.materials.paid));

  const handlePay = () => {
    setError(null);
    const res = isFinal ? payFinal(job.id) : payMaterials(job.id);
    if (!res.ok) return setError(res.error ?? "Payment failed");
    setReceiptId(res.receiptId ?? null);
  };

  if (receiptId) {
    const r = getReceipt(receiptId);
    if (!r) return null;
    return <ReceiptView receiptId={r.id} isFinal={isFinal} />;
  }

  return (
    <PhoneFrame className="!bg-neutral-950 text-white">
      <div className="pb-8 animate-screen-entry">
        <header className="px-5 pt-8 pb-4 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/jobs" })}
            className="size-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/60">FIXNEAR PAY</p>
            <h1 className="text-xl font-display font-bold">
              {isFinal ? "Final Payment" : "Materials Upfront"}
            </h1>
          </div>
        </header>

        <section className="mx-5 rounded-3xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <img src={job.artisanPhoto} alt={job.artisanName} className="size-12 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="font-bold truncate">{job.artisanName}</p>
              <p className="text-xs text-white/60 truncate">{job.title}</p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
            {isFinal ? (
              <Wrench size={18} className="text-brand-green mt-0.5" />
            ) : (
              <Package size={18} className="text-brand-yellow mt-0.5" />
            )}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-white/60">
                {isFinal ? "JOB PAYMENT" : "MATERIALS REQUESTED"}
              </p>
              <p className="text-sm text-white/80 mt-1">
                {isFinal ? "Paid once the artisan marks the job complete." : job.materials?.description}
              </p>
            </div>
          </div>

          <p className="mt-6 text-[10px] font-bold tracking-widest text-white/60">AMOUNT</p>
          <p className="font-display font-bold text-5xl mt-1">₦{amount.toLocaleString()}</p>

          <div className="mt-5 flex items-center justify-between p-3 rounded-2xl border border-white/10">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-white/60">FIXNEAR WALLET</p>
              <p className="font-display font-bold text-lg">₦{balance.toLocaleString()}</p>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                balance >= amount ? "bg-brand-green/20 text-brand-green" : "bg-emergency/20 text-emergency"
              }`}
            >
              {balance >= amount ? "Enough balance" : "Insufficient"}
            </span>
          </div>

          {balance < amount && (
            <div className="mt-3 rounded-2xl border border-brand-yellow/40 bg-brand-yellow/10 p-3">
              <p className="text-[10px] font-bold text-brand-yellow tracking-widest">TOP UP QUICKLY (DEMO)</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {[5000, 10000, 25000, 50000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setTopup(v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                      topup === v
                        ? "bg-brand-yellow text-neutral-900 border-brand-yellow"
                        : "bg-white/5 border-white/10 text-white"
                    }`}
                  >
                    ₦{v.toLocaleString()}
                  </button>
                ))}
              </div>
              <button
                disabled={!topup}
                onClick={() => {
                  addMoney(topup, "Wallet top-up");
                  setTopup(0);
                }}
                className="mt-3 w-full py-2.5 rounded-xl bg-brand-yellow text-neutral-900 font-bold text-sm inline-flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <Plus size={14} /> Add money
              </button>
            </div>
          )}

          {isFinal && job.status !== "completed" && (
            <p className="mt-4 text-xs text-brand-yellow">
              ⚠︎ Final payment unlocks after the artisan marks the job complete.
            </p>
          )}

          <button
            disabled={disabled || balance < amount}
            onClick={handlePay}
            className="mt-5 w-full py-4 rounded-2xl bg-brand-green text-white font-bold text-base shadow-lg shadow-brand-green/20 disabled:opacity-40"
          >
            {isFinal ? `Pay ₦${amount.toLocaleString()}` : `Approve & Pay ₦${amount.toLocaleString()}`}
          </button>

          {error && <p className="mt-3 text-sm text-emergency text-center">{error}</p>}

          <p className="mt-4 text-[11px] text-white/50 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-brand-green" /> Held securely by FixNear Pay
          </p>
        </section>
      </div>
    </PhoneFrame>
  );
}

function ReceiptView({ receiptId, isFinal }: { receiptId: string; isFinal: boolean }) {
  const r = useStore((s) => s.receipts.find((x) => x.id === receiptId));
  const [copied, setCopied] = useState(false);
  if (!r) return null;

  const dt = new Date(r.at);
  const dateStr = dt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(r.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const share = async () => {
    const text = `FixNear receipt ${r.reference}\n₦${r.amount.toLocaleString()} paid to ${r.artisanName}`;
    try {
      if (navigator.share) await navigator.share({ title: "FixNear Receipt", text });
      else await navigator.clipboard.writeText(text);
    } catch { /* noop */ }
  };

  return (
    <PhoneFrame className="!bg-neutral-950 text-white">
      <div className="min-h-screen px-5 pt-10 pb-8 animate-screen-entry">
        <div className="flex flex-col items-center text-center">
          <div className="size-20 rounded-full bg-brand-green flex items-center justify-center shadow-lg shadow-brand-green/40">
            <Check size={40} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-display font-bold mt-5">Payment confirmed</h1>
          <p className="text-sm text-white/70 mt-2 max-w-[32ch]">
            ₦{r.amount.toLocaleString()} sent securely to {r.artisanName} via FixNear Pay.
          </p>
          {isFinal && (
            <p className="text-xs text-brand-yellow mt-2">
              +100 loyalty points earned · You can now leave a review.
            </p>
          )}
        </div>

        {/* Ticket-style receipt */}
        <section className="mt-7 rounded-3xl bg-white text-neutral-900 p-5 shadow-xl relative overflow-hidden">
          <div className="absolute -left-2 top-1/2 size-4 rounded-full bg-neutral-950" />
          <div className="absolute -right-2 top-1/2 size-4 rounded-full bg-neutral-950" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500">FIXNEAR PAY</p>
              <p className="font-display font-bold text-lg">Official Receipt</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold tracking-widest text-neutral-500">STATUS</p>
              <p className="text-brand-green font-bold text-sm">PAID</p>
            </div>
          </div>

          <div className="my-4 border-t border-dashed border-neutral-300" />

          <div className="space-y-3 text-sm">
            <Row label="Amount" value={<span className="font-display font-bold text-lg">₦{r.amount.toLocaleString()}</span>} />
            <Row label="Type" value={r.kind === "materials" ? "Materials upfront" : "Final job payment"} />
            <Row label="Paid to" value={`${r.artisanName} · ${r.category}`} />
            <Row label="Date" value={dateStr} />
            <Row
              label="Reference"
              value={
                <button onClick={copyRef} className="inline-flex items-center gap-1 font-mono text-xs">
                  {r.reference}
                  <Copy size={12} className="text-neutral-400" />
                </button>
              }
            />
            {copied && <p className="text-[11px] text-brand-green text-right">Copied</p>}
          </div>

          <div className="my-4 border-t border-dashed border-neutral-300" />

          <p className="text-[11px] text-neutral-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-brand-green" /> Held securely by FixNear Pay
          </p>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={share}
            className="py-3 rounded-2xl border border-white/15 bg-white/[0.03] font-bold text-sm flex items-center justify-center gap-2"
          >
            <Share2 size={14} /> Share
          </button>
          <Link
            to="/chat/$jobId"
            params={{ jobId: r.jobId }}
            className="py-3 rounded-2xl border border-white/15 bg-white/[0.03] font-bold text-sm flex items-center justify-center gap-2"
          >
            <MessageCircle size={14} /> Message
          </Link>
        </div>

        <Link
          to="/jobs"
          className="mt-3 block w-full py-4 rounded-2xl bg-brand-green text-white font-bold text-center"
        >
          Back to My Jobs
        </Link>
      </div>
    </PhoneFrame>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] font-bold tracking-widest text-neutral-500 pt-1">{label.toUpperCase()}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
