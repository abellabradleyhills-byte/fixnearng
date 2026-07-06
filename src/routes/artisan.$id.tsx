import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getArtisan, type Artisan } from "@/lib/artisans";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ArrowLeft, Phone, MessageCircle, Star, MapPin, Briefcase, ShieldCheck, Share2 } from "lucide-react";

export const Route = createFileRoute("/artisan/$id")({
  loader: ({ params }): { artisan: Artisan } => {
    const artisan = getArtisan(params.id);
    if (!artisan) throw notFound();
    return { artisan };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Artisan not found" }, { name: "robots", content: "noindex" }] };
    }
    const a = loaderData.artisan;
    return {
      meta: [
        { title: `${a.name} — ${a.trade} · FixNear` },
        { name: "description", content: `${a.rating}★ rated ${a.category.toLowerCase()} in ${a.area}. ${a.jobs} completed jobs. NIN & BVN verified.` },
        { property: "og:title", content: `${a.name} — ${a.trade}` },
        { property: "og:description", content: `${a.rating}★ · ${a.jobs} jobs · Verified on FixNear.` },
      ],
    };
  },
  component: ArtisanDetail,
});

function ArtisanDetail() {
  const { artisan: a } = Route.useLoaderData() as { artisan: Artisan };

  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry">
        {/* Hero */}
        <div className="relative h-72">
          <img
            src={a.photo}
            alt={a.name}
            width={1024}
            height={1024}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />

          <div className="absolute top-10 inset-x-5 flex justify-between">
            <Link to="/search" className="size-10 bg-background/95 backdrop-blur rounded-full flex items-center justify-center shadow">
              <ArrowLeft size={18} />
            </Link>
            <button className="size-10 bg-background/95 backdrop-blur rounded-full flex items-center justify-center shadow">
              <Share2 size={16} />
            </button>
          </div>

          <div className="absolute bottom-4 inset-x-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-display font-bold">{a.name}</h1>
              <VerifiedBadge size={18} />
            </div>
            <p className="text-sm text-white/85">{a.trade} · {a.years} years exp.</p>
            <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
              <MapPin size={11} /> {a.area}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-5 -mt-6 relative z-10 bg-card rounded-2xl border border-border shadow-[var(--shadow-paper)] grid grid-cols-3 divide-x divide-border">
          <Stat label="Rating" value={`${a.rating.toFixed(1)}★`} />
          <Stat label="Jobs" value={a.jobs.toString()} />
          <Stat label="Verified" value="NIN+BVN" accent />
        </div>

        {/* Skills */}
        <section className="px-5 mt-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {a.skills.map((s) => (
              <span key={s} className="px-3 py-1.5 bg-brand-yellow/15 border border-brand-yellow/40 text-foreground text-[11px] font-bold rounded-full">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="px-5 mt-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">About</h3>
          <p className="text-sm leading-relaxed text-foreground/80">{a.about}</p>
        </section>

        {/* Trust card */}
        <section className="px-5 mt-6">
          <div className="paper-texture rounded-2xl border border-paper-line p-4 shadow-[var(--shadow-paper)]">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-brand-green" />
              <p className="text-sm font-bold">Verification record</p>
              <span className="stamp-badge ml-auto">Cleared</span>
            </div>
            <TrustRow label="National ID (NIN)" ok />
            <TrustRow label="Bank Verification (BVN)" ok />
            <TrustRow label="Home Address" ok />
            <TrustRow label={`${a.jobs} jobs completed`} ok />
          </div>
        </section>

        {/* Rate + reviews */}
        <section className="px-5 mt-6">
          <div className="flex items-end justify-between mb-3">
            <h3 className="font-display font-bold text-lg">Reviews</h3>
            <span className="text-xs text-muted-foreground">{a.reviews} total</span>
          </div>
          <div className="space-y-3">
            {a.reviewList.map((r, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">{r.name}</span>
                  <span className="text-[10px] text-muted-foreground">{r.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} size={11} className="fill-brand-yellow text-brand-yellow" />
                  ))}
                </div>
                <p className="text-xs text-foreground/75 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 mt-6">
          <div className="flex items-center gap-2 p-4 bg-brand-green/5 border border-brand-green/20 rounded-xl">
            <Briefcase size={16} className="text-brand-green" />
            <p className="text-xs text-foreground/80">
              Starting from <span className="font-bold text-brand-green">₦{a.rateNaira.toLocaleString()}/hr</span> · Final price confirmed after job description.
            </p>
          </div>
        </section>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 flex justify-center pointer-events-none">
        <div className="w-full max-w-[430px] bg-background/95 backdrop-blur border-t border-border p-4 flex gap-2 pointer-events-auto">
          <button className="size-12 border-2 border-brand-green text-brand-green rounded-xl flex items-center justify-center shrink-0" aria-label="Call in-app">
            <Phone size={18} />
          </button>
          <button className="size-12 border-2 border-brand-green text-brand-green rounded-xl flex items-center justify-center shrink-0" aria-label="Message">
            <MessageCircle size={18} />
          </button>
          <Link
            to="/book/$id"
            params={{ id: a.id }}
            className="flex-1 bg-brand-yellow text-foreground font-bold rounded-xl flex items-center justify-center"
          >
            Book Now
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-display font-bold mt-1 ${accent ? "text-brand-green text-xs" : "text-lg"}`}>{value}</p>
    </div>
  );
}

function TrustRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="text-foreground/80">{label}</span>
      <span className={`font-bold ${ok ? "text-brand-green" : "text-muted-foreground"}`}>
        {ok ? "✓ Verified" : "—"}
      </span>
    </div>
  );
}
