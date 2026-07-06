import { useSyncExternalStore } from "react";

export type JobStatus = "pending" | "confirmed" | "enroute" | "completed" | "paid";

export type ChatMsg = {
  id: string;
  from: "customer" | "artisan";
  text: string;
  at: number;
};

export type MaterialsRequest = {
  amount: number;
  description: string;
  paid: boolean;
  requestedAt: number;
};

export type Job = {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanPhoto: string;
  category: string;
  title: string;
  location: string;
  isEmergency: boolean;
  status: JobStatus;
  createdAt: number;
  materials?: MaterialsRequest;
  finalAmount?: number;
  finalPaid: boolean;
  review?: { rating: number; text: string };
  messages: ChatMsg[];
};

export type Tx = {
  id: string;
  type: "deposit" | "payment" | "refund" | "transfer";
  label: string;
  amount: number; // positive = credit, negative = debit
  date: string;
};

type State = {
  wallet: { balance: number; deposited: number; spent: number };
  txs: Tx[];
  jobs: Job[];
};

const KEY = "fixnear:store:v1";

import mechanic from "@/assets/mechanic.jpg";
import electrician from "@/assets/electrician.jpg";

const initial: State = {
  wallet: { balance: 0, deposited: 0, spent: 0 },
  txs: [],
  jobs: [
    {
      id: "job-sos-1",
      artisanId: "chinedu-okafor",
      artisanName: "Chinedu Okafor",
      artisanPhoto: mechanic,
      category: "Mechanic",
      title: "EMERGENCY — Mechanic: Car space (SOS Broadcast)",
      location: "Current Location (GPS)",
      isEmergency: true,
      status: "pending",
      createdAt: Date.now() - 1000 * 60 * 4,
      finalPaid: false,
      messages: [
        { id: "m1", from: "artisan", text: "I received your SOS. Confirming location…", at: Date.now() - 1000 * 60 * 3 },
      ],
    },
    {
      id: "job-elec-1",
      artisanId: "amaka-eze",
      artisanName: "Amaka Eze",
      artisanPhoto: electrician,
      category: "Electrician",
      title: "Inverter installation — 2 bedroom flat",
      location: "Lekki Phase 1, Lagos",
      isEmergency: false,
      status: "confirmed",
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
      finalAmount: 25000,
      finalPaid: false,
      materials: {
        amount: 42000,
        description: "2× 200Ah battery, MC4 connectors, 4mm² cable",
        paid: false,
        requestedAt: Date.now() - 1000 * 60 * 30,
      },
      messages: [
        { id: "m1", from: "artisan", text: "Confirmed for tomorrow 10am, sir.", at: Date.now() - 1000 * 60 * 60 * 2 },
        { id: "m2", from: "artisan", text: "I've sent a materials request — please approve via FixNear Wallet.", at: Date.now() - 1000 * 60 * 30 },
      ],
    },
  ],
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as State;
    // hydrate photos from asset imports (URLs may change between builds)
    parsed.jobs = parsed.jobs.map((j) => ({
      ...j,
      artisanPhoto:
        j.artisanId === "chinedu-okafor"
          ? mechanic
          : j.artisanId === "amaka-eze"
            ? electrician
            : j.artisanPhoto,
    }));
    return parsed;
  } catch {
    return initial;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initial),
  );
}

export function getJob(id: string): Job | undefined {
  return state.jobs.find((j) => j.id === id);
}

// ---------- Wallet actions ----------
export function addMoney(amount: number, label = "Wallet top-up") {
  if (amount <= 0) return;
  set((s) => ({
    ...s,
    wallet: { ...s.wallet, balance: s.wallet.balance + amount, deposited: s.wallet.deposited + amount },
    txs: [{ id: crypto.randomUUID(), type: "deposit", label, amount, date: "Just now" }, ...s.txs],
  }));
}

export function chargeWallet(amount: number, label: string): { ok: boolean; error?: string } {
  if (amount <= 0) return { ok: false, error: "Invalid amount" };
  if (state.wallet.balance < amount) return { ok: false, error: "Insufficient balance. Please add money first." };
  set((s) => ({
    ...s,
    wallet: { ...s.wallet, balance: s.wallet.balance - amount, spent: s.wallet.spent + amount },
    txs: [{ id: crypto.randomUUID(), type: "payment", label, amount: -amount, date: "Just now" }, ...s.txs],
  }));
  return { ok: true };
}

// ---------- Job actions ----------
export function sendMessage(jobId: string, text: string, from: ChatMsg["from"] = "customer") {
  const trimmed = text.trim();
  if (!trimmed) return;
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId
        ? { ...j, messages: [...j.messages, { id: crypto.randomUUID(), from, text: trimmed, at: Date.now() }] }
        : j,
    ),
  }));
}

export function payMaterials(jobId: string): { ok: boolean; error?: string } {
  const job = getJob(jobId);
  if (!job?.materials) return { ok: false, error: "No materials request" };
  if (job.materials.paid) return { ok: false, error: "Already paid" };
  const res = chargeWallet(job.materials.amount, `Materials — ${job.artisanName}`);
  if (!res.ok) return res;
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId && j.materials ? { ...j, materials: { ...j.materials, paid: true }, status: "enroute" } : j,
    ),
  }));
  return { ok: true };
}

export function payFinal(jobId: string): { ok: boolean; error?: string } {
  const job = getJob(jobId);
  if (!job) return { ok: false, error: "Job not found" };
  if (job.status !== "completed") return { ok: false, error: "Wait until the artisan marks the job complete." };
  if (!job.finalAmount) return { ok: false, error: "No final amount set." };
  if (job.finalPaid) return { ok: false, error: "Already paid" };
  const res = chargeWallet(job.finalAmount, `Job payment — ${job.artisanName}`);
  if (!res.ok) return res;
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, finalPaid: true, status: "paid" } : j)),
  }));
  return { ok: true };
}

export function advanceStatus(jobId: string) {
  const order: JobStatus[] = ["pending", "confirmed", "enroute", "completed", "paid"];
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) => {
      if (j.id !== jobId) return j;
      const next = order[Math.min(order.indexOf(j.status) + 1, order.length - 1)];
      // Can't jump to "paid" without payment
      if (next === "paid") return j;
      return { ...j, status: next };
    }),
  }));
}

export function submitReview(jobId: string, rating: number, text: string): { ok: boolean; error?: string } {
  const job = getJob(jobId);
  if (!job) return { ok: false, error: "Job not found" };
  if (!job.finalPaid) return { ok: false, error: "Payment must be confirmed in the app before you can review." };
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, review: { rating, text } } : j)),
  }));
  return { ok: true };
}

export function createJob(job: Omit<Job, "id" | "createdAt" | "status" | "finalPaid" | "messages">): string {
  const id = crypto.randomUUID();
  set((s) => ({
    ...s,
    jobs: [
      {
        ...job,
        id,
        createdAt: Date.now(),
        status: "pending",
        finalPaid: false,
        messages: [],
      },
      ...s.jobs,
    ],
  }));
  return id;
}
