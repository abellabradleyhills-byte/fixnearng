import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, Check, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Join FixNear — Secure onboarding" },
      { name: "description", content: "Register as a customer or verify with NIN and BVN as an artisan." },
    ],
  }),
  component: Register,
});

type Role = "customer" | "artisan";

function Register() {
  const [role, setRole] = useState<Role>("customer");
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-background pb-10 animate-screen-entry">
        {/* Header */}
        <header className="px-5 pt-10 pb-4 flex items-center gap-3">
          <Link to="/" className="size-10 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-8 bg-brand-green rounded-lg flex items-center justify-center">
              <div className="size-3.5 bg-brand-yellow rounded-sm" />
            </div>
            <span className="font-display text-lg font-bold">FixNear</span>
          </div>
        </header>

        <div className="px-5">
          <h1 className="text-3xl font-display font-bold leading-tight">Secure onboarding</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how you'll use FixNear. Artisans complete government-ID verification for community safety.
          </p>

          {/* Role toggle */}
          <div className="mt-5 grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl border border-border">
            <button
              onClick={() => { setRole("customer"); setStep(1); }}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                role === "customer" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              I need a service
            </button>
            <button
              onClick={() => { setRole("artisan"); setStep(1); }}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                role === "artisan" ? "bg-brand-green text-white shadow-sm" : "text-muted-foreground"
              }`}
            >
              I'm an artisan
            </button>
          </div>

          {role === "customer" ? <CustomerForm /> : <ArtisanForm step={step} setStep={setStep} />}
        </div>
      </div>
    </div>
  );
}

function CustomerForm() {
  return (
    <div className="mt-6 space-y-4 animate-screen-entry">
      <Field label="Full Name" placeholder="Adebayo Okonkwo" />
      <Field label="Phone Number" placeholder="+234 803 000 0000" icon={<Phone size={16} />} />
      <Field label="Location / Area" placeholder="Lekki Phase 1, Lagos" icon={<MapPin size={16} />} />

      <div className="paper-texture rounded-xl border border-paper-line p-3 flex items-center gap-2 text-xs">
        <ShieldCheck size={14} className="text-brand-green shrink-0" />
        <span className="text-muted-foreground">
          We never share your number with artisans. All calls happen inside the app.
        </span>
      </div>

      <Link
        to="/"
        className="block text-center w-full mt-6 py-4 bg-brand-green text-white font-bold rounded-xl shadow-lg shadow-brand-green/20"
      >
        Create account
      </Link>
    </div>
  );
}

function ArtisanForm({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  return (
    <div className="mt-6 space-y-5 animate-screen-entry">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all ${step >= n ? "bg-brand-green" : ""}`}
              style={{ width: step >= n ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Step {step} of 3 · {step === 1 ? "Identity" : step === 2 ? "Address" : "Skills"}
      </p>

      {step === 1 && (
        <>
          {/* Verification document card — paper texture */}
          <div className="paper-texture rounded-2xl border-2 border-brand-green/30 p-5 shadow-[var(--shadow-paper)] relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
                  Federal Verification
                </p>
                <p className="font-display font-bold text-lg mt-0.5">Identity Documents</p>
              </div>
              <span className="stamp-badge">Required</span>
            </div>

            <Field label="Full Name (as on NIN)" placeholder="Adebayo Chinedu Okonkwo" />
            <Field label="NIN (11 digits)" placeholder="0000 0000 000" />
            <Field label="BVN (11 digits)" placeholder="2223 4445 000" />

            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck size={12} className="text-brand-green" />
              Verified in real-time via NIMC & NIBSS. Never shown publicly.
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 bg-brand-green text-white font-bold rounded-xl shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2"
          >
            <span>Verify identity</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Safety First</span>
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="paper-texture rounded-2xl border-2 border-brand-green/30 p-5 shadow-[var(--shadow-paper)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Home Address</p>
                <p className="font-display font-bold text-lg mt-0.5">Where do you live?</p>
              </div>
              <span className="stamp-badge">Verified</span>
            </div>
            <Field label="Street Address" placeholder="12 Adeola Odeku Street" />
            <Field label="City / LGA" placeholder="Victoria Island" />
            <Field label="State" placeholder="Lagos" />
            <p className="mt-3 text-[11px] text-muted-foreground">
              A verification agent may visit to confirm — this keeps customers safe.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 py-4 border border-border font-bold rounded-xl">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-[2] py-4 bg-brand-green text-white font-bold rounded-xl shadow-lg shadow-brand-green/20"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="rounded-2xl border border-border p-5 bg-card">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Your work</p>
            <p className="font-display font-bold text-lg mt-0.5 mb-4">Skills & rates</p>
            <Field label="Primary Trade" placeholder="Mechanic" />
            <Field label="Years of experience" placeholder="8" />
            <Field label="Rate per hour (₦)" placeholder="4,000" />
          </div>

          <div className="rounded-2xl bg-brand-green/5 border border-brand-green/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check size={16} className="text-brand-green" />
              <span className="text-sm font-bold text-brand-green">Almost there</span>
            </div>
            <p className="text-xs text-muted-foreground">
              After submission, your verified badge will appear on your profile within 24 hours.
            </p>
          </div>

          <Link
            to="/"
            className="block text-center w-full py-4 bg-brand-green text-white font-bold rounded-xl shadow-lg shadow-brand-green/20"
          >
            Submit for verification
          </Link>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  placeholder,
  icon,
}: {
  label: string;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1 mb-3 last:mb-0">
      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-green">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full h-11 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 ring-brand-green/20 focus:border-brand-green ${
            icon ? "pl-9 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
}
