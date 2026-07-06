import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getArtisan, type Artisan } from "@/lib/artisans";
import { PhoneFrame } from "@/components/PhoneFrame";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/book/$id")({
  loader: ({ params }) => {
    const artisan = getArtisan(params.id);
    if (!artisan) throw notFound();
    return { artisan };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Book ${loaderData.artisan.name} — FixNear` : "Booking" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookPage,
});

const DATES = ["Today", "Tomorrow", "Wed 8", "Thu 9", "Fri 10"];
const TIMES = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];

function BookPage() {
  const { artisan: a } = Route.useLoaderData() as { artisan: Artisan };
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("10:00 AM");
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <PhoneFrame>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center animate-screen-entry">
          <div className="size-20 bg-brand-green rounded-full flex items-center justify-center mb-5">
            <Check size={40} className="text-white" strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-display font-bold">Booking sent</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-[28ch]">
            {a.name} will confirm within a few minutes. You'll get a call inside the app.
          </p>
          <div className="mt-6 p-4 rounded-xl border border-border w-full text-left bg-card">
            <p className="text-xs text-muted-foreground">Booking details</p>
            <p className="font-bold mt-1">{a.name} · {a.trade}</p>
            <p className="text-sm mt-1">{date} · {time}</p>
          </div>
          <Link to="/" className="mt-6 w-full py-4 bg-brand-green text-white font-bold rounded-xl text-center">
            Back to home
          </Link>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="pb-28 animate-screen-entry">
        <header className="px-5 pt-10 pb-4 flex items-center gap-3">
          <Link to="/artisan/$id" params={{ id: a.id }} className="size-10 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-display font-bold">Book service</h1>
        </header>

        <div className="px-5">
          <div className="flex gap-3 items-center p-3 rounded-2xl border border-border bg-card">
            <img src={a.photo} alt={a.name} width={80} height={80} className="size-14 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">{a.name}</span>
                <VerifiedBadge />
              </div>
              <p className="text-xs text-muted-foreground">{a.trade}</p>
            </div>
            <span className="text-xs font-bold text-brand-green">₦{a.rateNaira.toLocaleString()}/hr</span>
          </div>

          <section className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Select date</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DATES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDate(d)}
                  className={`shrink-0 px-4 py-3 rounded-xl border text-sm font-bold ${
                    date === d ? "bg-brand-green text-white border-brand-green" : "bg-background border-border"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Select time</p>
            <div className="grid grid-cols-3 gap-2">
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold ${
                    time === t ? "bg-brand-green text-white border-brand-green" : "bg-background border-border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Describe the job</p>
            <textarea
              rows={4}
              maxLength={500}
              placeholder="e.g. Car won't start, battery seems dead. Parked at Lekki Phase 1."
              className="w-full p-3 bg-background border border-input rounded-xl text-sm outline-none focus:ring-2 ring-brand-green/20 focus:border-brand-green resize-none"
            />
          </section>

          <section className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Location</p>
            <div className="p-3 border border-border rounded-xl bg-card text-sm">
              📍 Lekki Phase 1, Lagos · <span className="text-brand-green font-bold">Use current</span>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 flex justify-center pointer-events-none">
        <div className="w-full max-w-[430px] bg-background/95 backdrop-blur border-t border-border p-4 pointer-events-auto">
          <button
            onClick={() => setConfirmed(true)}
            className="w-full py-4 bg-brand-green text-white font-bold rounded-xl"
          >
            Confirm booking
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
