import { useSyncExternalStore } from "react";
import { getPrefs } from "./prefs";

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
  type: "deposit" | "payment" | "refund" | "transfer" | "reward";
  label: string;
  amount: number;
  date: string;
};

export type Receipt = {
  id: string;
  jobId: string;
  kind: "materials" | "final";
  amount: number;
  artisanName: string;
  category: string;
  reference: string;
  at: number;
};

export type Notification = {
  id: string;
  kind: "job" | "chat" | "marketing";
  title: string;
  body: string;
  at: number;
  read: boolean;
  jobId?: string;
};

export type Reminder = {
  id: string;
  title: string;
  category: string;
  dueAt: number;
};

type State = {
  wallet: { balance: number; deposited: number; spent: number };
  txs: Tx[];
  jobs: Job[];
  receipts: Receipt[];
  notifications: Notification[];
  reminders: Reminder[];
  rewards: { points: number; earned: number; redeemed: number };
};

const KEY = "fixnear:store:v2";

import mechanic from "@/assets/mechanic.jpg";
import electrician from "@/assets/electrician.jpg";

const initial: State = {
  wallet: { balance: 0, deposited: 0, spent: 0 },
  txs: [],
  receipts: [],
  notifications: [
    {
      id: "n-welcome",
      kind: "marketing",
      title: "Welcome to FixNear",
      body: "Every artisan is NIN + BVN verified. Book with confidence.",
      at: Date.now() - 1000 * 60 * 60 * 24,
      read: false,
    },
    {
      id: "n-boot-1",
      kind: "job",
      title: "Amaka Eze confirmed your booking",
      body: "Inverter installation — tomorrow 10am.",
      at: Date.now() - 1000 * 60 * 60 * 2,
      read: false,
      jobId: "job-elec-1",
    },
  ],
  reminders: [],
  rewards: { points: 0, earned: 0, redeemed: 0 },
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
    const parsed = JSON.parse(raw) as Partial<State>;
    const merged: State = { ...initial, ...parsed } as State;
    merged.jobs = (merged.jobs || []).map((j) => ({
      ...j,
      artisanPhoto:
        j.artisanId === "chinedu-okafor"
          ? mechanic
          : j.artisanId === "amaka-eze"
            ? electrician
            : j.artisanPhoto,
    }));
    merged.receipts = merged.receipts || [];
    merged.notifications = merged.notifications || [];
    merged.reminders = merged.reminders || [];
    merged.rewards = merged.rewards || { points: 0, earned: 0, redeemed: 0 };
    return merged;
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

export function getReceipt(id: string): Receipt | undefined {
  return state.receipts.find((r) => r.id === id);
}

// ---------- Notifications ----------
export function pushNotification(
  kind: Notification["kind"],
  title: string,
  body: string,
  jobId?: string,
) {
  const prefs = getPrefs();
  const allowed =
    (kind === "job" && prefs.jobAlerts) ||
    (kind === "chat" && prefs.chatMessages) ||
    (kind === "marketing" && prefs.marketing);
  if (!allowed) return;
  set((s) => ({
    ...s,
    notifications: [
      { id: crypto.randomUUID(), kind, title, body, at: Date.now(), read: false, jobId },
      ...s.notifications,
    ].slice(0, 100),
  }));
}

export function markAllNotificationsRead() {
  set((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
}
export function markNotificationRead(id: string) {
  set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
}
export function clearNotifications() {
  set((s) => ({ ...s, notifications: [] }));
}

// ---------- Reminders ----------
export function addReminder(title: string, category: string, dueAt: number) {
  set((s) => ({
    ...s,
    reminders: [...s.reminders, { id: crypto.randomUUID(), title, category, dueAt }],
  }));
}
export function removeReminder(id: string) {
  set((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) }));
}

// ---------- Rewards ----------
export function awardPoints(pts: number, reason: string) {
  if (pts <= 0) return;
  set((s) => ({
    ...s,
    rewards: { ...s.rewards, points: s.rewards.points + pts, earned: s.rewards.earned + pts },
  }));
  pushNotification("marketing", `+${pts} FixNear points`, reason);
}
export function redeemPoints(): { ok: boolean; error?: string } {
  if (state.rewards.points < 500) return { ok: false, error: "Need 500 points to redeem." };
  set((s) => ({
    ...s,
    rewards: {
      ...s.rewards,
      points: s.rewards.points - 500,
      redeemed: s.rewards.redeemed + 1,
    },
    wallet: { ...s.wallet, balance: s.wallet.balance + 500, deposited: s.wallet.deposited + 500 },
    txs: [
      { id: crypto.randomUUID(), type: "reward", label: "Loyalty reward — ₦500 off", amount: 500, date: "Just now" },
      ...s.txs,
    ],
  }));
  pushNotification("marketing", "Reward redeemed", "₦500 credit added to your wallet.");
  return { ok: true };
}

// ---------- Wallet ----------
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

function makeReceipt(job: Job, kind: "materials" | "final", amount: number): Receipt {
  return {
    id: crypto.randomUUID(),
    jobId: job.id,
    kind,
    amount,
    artisanName: job.artisanName,
    category: job.category,
    reference: `FN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    at: Date.now(),
  };
}

// ---------- Job actions ----------
export function sendMessage(jobId: string, text: string, from: ChatMsg["from"] = "customer") {
  const trimmed = text.trim();
  if (!trimmed) return;
  const job = getJob(jobId);
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId
        ? { ...j, messages: [...j.messages, { id: crypto.randomUUID(), from, text: trimmed, at: Date.now() }] }
        : j,
    ),
  }));
  if (job && from === "artisan") {
    pushNotification("chat", `${job.artisanName}`, trimmed, jobId);
  }
}

export function payMaterials(jobId: string): { ok: boolean; error?: string; receiptId?: string } {
  const job = getJob(jobId);
  if (!job?.materials) return { ok: false, error: "No materials request" };
  if (job.materials.paid) return { ok: false, error: "Already paid" };
  const res = chargeWallet(job.materials.amount, `Materials — ${job.artisanName}`);
  if (!res.ok) return res;
  const receipt = makeReceipt(job, "materials", job.materials.amount);
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId && j.materials ? { ...j, materials: { ...j.materials, paid: true }, status: "enroute" } : j,
    ),
    receipts: [receipt, ...s.receipts],
  }));
  pushNotification("job", "Materials paid", `₦${job.materials.amount.toLocaleString()} sent to ${job.artisanName}.`, jobId);
  return { ok: true, receiptId: receipt.id };
}

export function payFinal(jobId: string): { ok: boolean; error?: string; receiptId?: string } {
  const job = getJob(jobId);
  if (!job) return { ok: false, error: "Job not found" };
  if (job.status !== "completed") return { ok: false, error: "Wait until the artisan marks the job complete." };
  if (!job.finalAmount) return { ok: false, error: "No final amount set." };
  if (job.finalPaid) return { ok: false, error: "Already paid" };
  const res = chargeWallet(job.finalAmount, `Job payment — ${job.artisanName}`);
  if (!res.ok) return res;
  const receipt = makeReceipt(job, "final", job.finalAmount);
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, finalPaid: true, status: "paid" } : j)),
    receipts: [receipt, ...s.receipts],
  }));
  pushNotification("job", "Payment confirmed", `Job complete — ₦${job.finalAmount.toLocaleString()} sent to ${job.artisanName}.`, jobId);
  awardPoints(100, `Job completed with ${job.artisanName}`);
  return { ok: true, receiptId: receipt.id };
}

export function advanceStatus(jobId: string) {
  const order: JobStatus[] = ["pending", "confirmed", "enroute", "completed", "paid"];
  const job = getJob(jobId);
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) => {
      if (j.id !== jobId) return j;
      const next = order[Math.min(order.indexOf(j.status) + 1, order.length - 1)];
      if (next === "paid") return j;
      return { ...j, status: next };
    }),
  }));
  const nextJob = getJob(jobId);
  if (job && nextJob && job.status !== nextJob.status) {
    const map: Record<JobStatus, string> = {
      pending: "Waiting for artisan",
      confirmed: "Booking confirmed",
      enroute: "Artisan is on the way",
      completed: "Job marked complete",
      paid: "Payment confirmed",
    };
    pushNotification("job", map[nextJob.status], `${nextJob.artisanName} — ${nextJob.title}`, jobId);
  }
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
  pushNotification("job", "Booking sent", `${job.artisanName} — ${job.title}`, id);
  return id;
}
