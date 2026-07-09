import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { useStore, addReminder, removeReminder, redeemPoints } from "@/lib/store";
import { ChevronLeft, Star, TrendingUp, Gift, Zap, Wrench, CheckCircle2, Bell, Plus, X } from "lucide-react";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Rewards & Reminders — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: RewardsPage,
});

function RewardsPage() {
  const rewards = useStore((s) => s.rewards);
  const reminders = useStore((s) => s.reminders);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Plumber", weeks: 4 });
  const [flash, setFlash] = useState<string | null>(null);

  const pct = Math.min(100, (rewards.points / 500) * 100);

  const submit = () => {
    if (!form.title.trim()) return;
    addReminder(form.title.trim(), form.category, Date.now() + form.weeks * 7 * 86400_000);
    setForm({ title: "", category: "Plumber", weeks: 4 });
    setAdding(false);
  };

  const doRedeem = () => {
    const res = redeemPoints();
    setFlash(res.ok ? "₦500 credit added to your wallet." : res.error ?? "Could not redeem");
    setTimeout(() => setFlash(null), 2500);
  };

  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry">
        <header className="px-5 pt-10 pb-4 flex items-center gap-3">
          <Link to="/profile" className="size-10 rounded-full bg-muted flex items-center justify-center">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">FIXNEAR</p>
            <h1 className="text-2xl font-display font-bold">Rewards & Reminders</h1>
          </div>
        </header>

        {/* Loyalty card */}
        <section className="mx-5 rounded-3xl bg-gradient-to-br from-brand-yellow to-amber-300 p-5 shadow-xl text-neutral-900">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-70">FIXNEAR LOYALTY</p>
              <p className="font-display font-bold text-5xl mt-1 leading-none">{rewards.points}</p>
              <p className="text-xs font-bold mt-1 opacity-80">points</p>
            </div>
            <div className="size-14 rounded-full bg-amber-900/20 flex items-center justify-center">
              <Star size={26} className="fill-amber-900 text-amber-900" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-bold opacity-80">
              <span>{rewards.points} / 500 pts</span>
              <span>Next: ₦500 off</span>
            </div>
            <div className="mt-1 h-1.5 bg-amber-900/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-900 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat icon={<TrendingUp size={14} />} value={rewards.earned} label="EARNED" />
            <Stat icon={<Gift size={14} />} value={rewards.redeemed} label="REWARDS" />
            <Stat icon={<Zap size={14} />} value={rewards.redeemed} label="REDEEMED" />
          </div>

          <button
            onClick={doRedeem}
            disabled={rewards.points < 500}
            className="mt-4 w-full py-3 rounded-xl bg-amber-900 text-brand-yellow font-bold text-sm disabled:opacity-40"
          >
            {rewards.points >= 500 ? "Redeem ₦500 off" : "Earn 100 pts per completed job"}
          </button>
          {flash && <p className="mt-2 text-xs text-center font-bold">{flash}</p>}
        </section>

        {/* How it works */}
        <section className="mx-5 mt-5 rounded-3xl bg-card border border-border p-5">
          <h2 className="font-display font-bold text-lg">How it works</h2>
          <div className="mt-4 space-y-3">
            <HowRow
              icon={<Wrench size={20} className="text-amber-800" />}
              title="Book a Job"
              body="Request any artisan through FixNear"
            />
            <HowRow
              icon={<CheckCircle2 size={20} className="text-brand-green" />}
              title="Job Completed"
              body="Earn 100 points automatically"
            />
            <HowRow
              icon={<Gift size={20} className="text-amber-700" />}
              title="Redeem Rewards"
              body="500 pts = ₦500 off your next booking"
            />
          </div>
        </section>

        {/* Maintenance reminders */}
        <section className="mx-5 mt-5 rounded-3xl bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Maintenance Reminders</h2>
            <button
              onClick={() => setAdding((v) => !v)}
              className="size-9 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center"
              aria-label="Add reminder"
            >
              {adding ? <X size={16} /> : <Plus size={16} />}
            </button>
          </div>

          {adding && (
            <div className="mt-4 space-y-2 rounded-2xl bg-muted p-3">
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Service generator"
                className="w-full h-11 rounded-xl bg-background border border-border px-3 text-sm outline-none"
              />
              <div className="flex gap-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="flex-1 h-11 rounded-xl bg-background border border-border px-3 text-sm"
                >
                  {["Plumber", "Electrician", "Mechanic", "Painter", "Cleaner"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={form.weeks}
                  onChange={(e) => setForm((f) => ({ ...f, weeks: Number(e.target.value) }))}
                  className="w-28 h-11 rounded-xl bg-background border border-border px-3 text-sm"
                >
                  <option value={2}>In 2 wks</option>
                  <option value={4}>In 1 month</option>
                  <option value={12}>In 3 months</option>
                  <option value={26}>In 6 months</option>
                </select>
              </div>
              <button
                onClick={submit}
                className="w-full py-2.5 rounded-xl bg-brand-green text-white font-bold text-sm"
              >
                Save reminder
              </button>
            </div>
          )}

          {reminders.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center">
              <Bell size={26} className="mx-auto text-muted-foreground/60" />
              <p className="mt-2 text-sm font-bold text-muted-foreground">No active reminders.</p>
              <p className="text-xs text-muted-foreground">Tap + to schedule your first maintenance reminder.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <Bell size={16} className="text-brand-green" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.category} · due {new Date(r.dueAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeReminder(r.id)}
                    className="size-8 rounded-full bg-background flex items-center justify-center text-muted-foreground"
                    aria-label="Remove"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl bg-amber-900/10 p-2 text-center">
      <div className="flex justify-center opacity-70">{icon}</div>
      <p className="font-display font-bold text-lg leading-none mt-1">{value}</p>
      <p className="text-[9px] font-bold tracking-widest opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

function HowRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-11 rounded-xl bg-brand-yellow/20 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
