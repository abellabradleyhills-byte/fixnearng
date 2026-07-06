import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ChevronLeft, Plus, Send, Banknote, ShieldCheck, Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import { addMoney, useStore, type Tx } from "@/lib/store";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "My Wallet — FixNear Pay" },
      { name: "description", content: "Add money, transfer to other users, and pay artisans securely with FixNear Pay." },
    ],
  }),
  component: WalletPage,
});

type Modal = null | "add" | "transfer" | "withdraw";

function WalletPage() {
  const [filter, setFilter] = useState<"all" | "deposit" | "payment" | "refund">("all");
  const [modal, setModal] = useState<Modal>(null);
  const wallet = useStore((s) => s.wallet);
  const txs = useStore((s) => s.txs);
  const filtered: Tx[] = txs.filter((t) => filter === "all" || t.type === filter);

  return (
    <PhoneFrame className="!bg-neutral-950 text-white">
      <div className="pb-32 animate-screen-entry">
        {/* Header */}
        <header className="px-5 pt-8 pb-4 flex items-center gap-3">
          <Link to="/profile" className="size-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/60">FIXNEAR PAY</p>
            <h1 className="text-2xl font-display font-bold leading-tight">My Wallet</h1>
          </div>
        </header>

        {/* Balance card */}
        <section className="mx-5 rounded-3xl bg-gradient-to-br from-brand-green to-emerald-700 p-5 shadow-xl">
          <p className="text-[10px] font-bold tracking-[0.2em] text-white/80">AVAILABLE BALANCE</p>
          <p className="font-display font-bold text-5xl mt-2 text-neutral-950">₦{wallet.balance.toLocaleString()}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1.5 text-xs font-semibold">
            <ShieldCheck size={14} /> Secured
          </div>
        </section>

        {/* Stats */}
        <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
          <StatCard label="TOTAL DEPOSITED" value={`₦${wallet.deposited.toLocaleString()}`} tone="text-brand-green" />
          <StatCard label="TOTAL SPENT" value={`₦${wallet.spent.toLocaleString()}`} tone="text-emergency" />
        </div>

        {/* Actions */}
        <div className="mx-5 mt-4 grid grid-cols-3 gap-3">
          <ActionButton onClick={() => setModal("add")} className="bg-brand-yellow text-neutral-900" icon={<Plus size={22} />} label="Add Money" />
          <ActionButton onClick={() => setModal("transfer")} className="bg-brand-green text-white" icon={<Send size={20} />} label="Transfer" />
          <ActionButton onClick={() => setModal("withdraw")} className="bg-white/5 border border-white/10 text-white" icon={<Banknote size={20} />} label="Withdraw" />
        </div>

        {/* History */}
        <div className="mx-5 mt-6">
          <h2 className="font-display font-bold text-xl">Transaction History</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {(["all", "deposit", "payment", "refund"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap border ${
                  filter === f ? "bg-brand-green text-white border-brand-green" : "bg-white/5 border-white/10 text-white/80"
                }`}
              >
                {f === "all" ? "All" : f + "s"}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center px-6">
              <WalletIcon size={44} className="text-white/30" />
              <p className="mt-3 font-bold text-white/80">No transactions yet.</p>
              <p className="text-sm text-white/50">Add money to get started.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {filtered.map((t) => (
                <li key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className={`size-10 rounded-full flex items-center justify-center ${t.amount >= 0 ? "bg-brand-green/20 text-brand-green" : "bg-emergency/20 text-emergency"}`}>
                    {t.amount >= 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{t.label}</p>
                    <p className="text-xs text-white/50">{t.date}</p>
                  </div>
                  <p className={`font-display font-bold ${t.amount >= 0 ? "text-brand-green" : "text-emergency"}`}>
                    {t.amount >= 0 ? "+" : "−"}₦{Math.abs(t.amount).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {modal && <ActionSheet type={modal} onClose={() => setModal(null)} />}
      <BottomNav />
    </PhoneFrame>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
      <p className="text-[10px] font-bold tracking-widest text-white/60">{label}</p>
      <p className={`font-display font-bold text-2xl mt-2 ${tone}`}>{value}</p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  className,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 font-bold text-sm shadow-md ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ActionSheet({ type, onClose }: { type: Exclude<Modal, null>; onClose: () => void }) {
  const titles = {
    add: "Add Money to Wallet",
    transfer: "Send to another user",
    withdraw: "Withdraw to Bank",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-neutral-900 text-white rounded-t-3xl p-5 pb-8 border-t border-white/10 animate-screen-entry"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-xl">{titles[type]}</h3>
          <button onClick={onClose} className="size-9 rounded-full bg-white/10 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {type === "transfer" && (
          <SheetField label="Recipient phone or @username" placeholder="+234 803 000 0000" />
        )}
        {type === "withdraw" && (
          <>
            <SheetField label="Bank" placeholder="GTBank" />
            <SheetField label="Account number" placeholder="0123456789" />
          </>
        )}
        {type === "add" && (
          <SheetField label="Card / bank transfer" placeholder="Choose method" />
        )}

        <SheetField label="Amount (₦)" placeholder="5,000" />

        <div className="mt-2 flex flex-wrap gap-2">
          {[1000, 2000, 5000, 10000].map((v) => (
            <span key={v} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold">
              ₦{v.toLocaleString()}
            </span>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-4 rounded-2xl bg-brand-green text-white font-bold shadow-lg shadow-brand-green/20"
        >
          {type === "add" ? "Add money" : type === "transfer" ? "Send now" : "Withdraw"}
        </button>
        <p className="mt-3 text-[11px] text-white/50 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} className="text-brand-green" /> Payments secured by FixNear Pay
        </p>
      </div>
    </div>
  );
}

function SheetField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="mb-3">
      <label className="text-[10px] font-bold tracking-widest text-white/60">{label}</label>
      <input
        placeholder={placeholder}
        className="mt-1 w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder:text-white/30 outline-none focus:border-brand-green"
      />
    </div>
  );
}
