import { useSyncExternalStore } from "react";
import { getPrefs } from "./prefs";
import { ARTISANS, getArtisan } from "./artisans";

export type JobStatus = "pending" | "confirmed" | "enroute" | "completed" | "paid";

export type ProposalLine = { label: string; amount: number };
export type ProposalStatus = "pending" | "accepted" | "countered" | "rejected";

export type MsgAttachment =
  | { kind: "image"; url: string; caption?: string }
  | { kind: "voice"; url?: string; duration: number }
  | { kind: "location"; label: string; lat?: number; lng?: number }
  | { kind: "file"; name: string; size: number; url?: string }
  | {
      kind: "proposal";
      id: string;
      by: "customer" | "artisan";
      total: number;
      materialsUpfront: number;
      breakdown: ProposalLine[];
      note?: string;
      status: ProposalStatus;
    };

export type ChatMsg = {
  id: string;
  from: "customer" | "artisan" | "system";
  text: string;
  at: number;
  read?: boolean;
  attachment?: MsgAttachment;
  reactions?: string[];
};

export type Negotiation = {
  agreedTotal: number;
  materialsUpfront: number;
  breakdown: ProposalLine[];
  proposalId: string;
  adminStatus: "pending" | "approved" | "rejected";
  submittedAt: number;
  decidedAt?: number;
  adminNote?: string;
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
  scheduledAt?: number;
  eta?: string;
  materials?: MaterialsRequest;
  finalAmount?: number;
  finalPaid: boolean;
  review?: { rating: number; text: string };
  negotiation?: Negotiation;
  messages: ChatMsg[];
  unread?: number;
};

export type DirectThread = {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanPhoto: string;
  category: string;
  messages: ChatMsg[];
  unread: number;
  lastSeenAt: number;
  online: boolean;
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
  threads: DirectThread[];
  receipts: Receipt[];
  notifications: Notification[];
  reminders: Reminder[];
  rewards: { points: number; earned: number; redeemed: number };
};

const KEY = "fixnear:store:v3";

import mechanic from "@/assets/mechanic.jpg";
import electrician from "@/assets/electrician.jpg";
import plumber from "@/assets/plumber.jpg";

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
  threads: [
    {
      id: "dm-ifeanyi",
      artisanId: "ifeanyi-kalu",
      artisanName: "Ifeanyi Kalu",
      artisanPhoto: plumber,
      category: "Plumber",
      unread: 1,
      lastSeenAt: Date.now() - 1000 * 60 * 15,
      online: true,
      messages: [
        { id: "d1", from: "customer", text: "Hello sir, do you fix pressure pumps?", at: Date.now() - 1000 * 60 * 60, read: true },
        { id: "d2", from: "artisan", text: "Yes I do. Which brand be that?", at: Date.now() - 1000 * 60 * 58, read: true },
        { id: "d3", from: "artisan", text: "Send me a photo make I see am.", at: Date.now() - 1000 * 60 * 3, read: false },
      ],
    },
  ],
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
      unread: 1,
      eta: "8 min",
      messages: [
        { id: "m1", from: "artisan", text: "I received your SOS. Confirming location…", at: Date.now() - 1000 * 60 * 3, read: false },
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
      scheduledAt: Date.now() + 1000 * 60 * 60 * 20,
      eta: "Tomorrow 10:00 AM",
      finalAmount: 25000,
      finalPaid: false,
      unread: 0,
      materials: {
        amount: 42000,
        description: "2× 200Ah battery, MC4 connectors, 4mm² cable",
        paid: false,
        requestedAt: Date.now() - 1000 * 60 * 30,
      },
      messages: [
        { id: "m1", from: "artisan", text: "Confirmed for tomorrow 10am, sir.", at: Date.now() - 1000 * 60 * 60 * 2, read: true },
        { id: "m2", from: "artisan", text: "I've sent a materials request — please approve via FixNear Wallet.", at: Date.now() - 1000 * 60 * 30, read: true },
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
    merged.threads = (merged.threads || []).map((t) => {
      const a = getArtisan(t.artisanId);
      return a ? { ...t, artisanPhoto: a.photo, artisanName: a.name, category: a.category } : t;
    });
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

export function getThread(id: string): DirectThread | undefined {
  return state.threads.find((t) => t.id === id);
}

export function getThreadByArtisan(artisanId: string): DirectThread | undefined {
  return state.threads.find((t) => t.artisanId === artisanId);
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

// ---------- Job chat ----------
export function sendMessage(
  jobId: string,
  text: string,
  from: ChatMsg["from"] = "customer",
  attachment?: MsgAttachment,
) {
  const trimmed = text.trim();
  if (!trimmed && !attachment) return;
  const job = getJob(jobId);
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            unread: from === "artisan" ? (j.unread ?? 0) + 1 : j.unread,
            messages: [
              ...j.messages,
              { id: crypto.randomUUID(), from, text: trimmed, at: Date.now(), attachment, read: from === "customer" },
            ],
          }
        : j,
    ),
  }));
  if (job && from === "artisan") {
    pushNotification("chat", `${job.artisanName}`, trimmed || attachmentPreview(attachment), jobId);
  }
}

export function markJobRead(jobId: string) {
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId
        ? { ...j, unread: 0, messages: j.messages.map((m) => ({ ...m, read: true })) }
        : j,
    ),
  }));
}

// ---------- Direct messages ----------
function attachmentPreview(a?: MsgAttachment): string {
  if (!a) return "";
  if (a.kind === "image") return "📷 Photo";
  if (a.kind === "voice") return `🎤 Voice note · ${a.duration}s`;
  if (a.kind === "location") return `📍 ${a.label}`;
  if (a.kind === "proposal") return `💬 Price proposal · ₦${a.total.toLocaleString()}`;
  return `📎 ${a.name}`;
}

export function startDirectThread(artisanId: string): string {
  const existing = getThreadByArtisan(artisanId);
  if (existing) return existing.id;
  const a = ARTISANS.find((x) => x.id === artisanId);
  if (!a) return "";
  const id = `dm-${artisanId}`;
  set((s) => ({
    ...s,
    threads: [
      {
        id,
        artisanId,
        artisanName: a.name,
        artisanPhoto: a.photo,
        category: a.category,
        messages: [],
        unread: 0,
        lastSeenAt: Date.now(),
        online: Math.random() > 0.4,
      },
      ...s.threads,
    ],
  }));
  return id;
}

export function sendDirectMessage(
  threadId: string,
  text: string,
  from: ChatMsg["from"] = "customer",
  attachment?: MsgAttachment,
) {
  const trimmed = text.trim();
  if (!trimmed && !attachment) return;
  const thread = getThread(threadId);
  set((s) => ({
    ...s,
    threads: s.threads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            unread: from === "artisan" ? t.unread + 1 : t.unread,
            lastSeenAt: Date.now(),
            messages: [
              ...t.messages,
              { id: crypto.randomUUID(), from, text: trimmed, at: Date.now(), attachment, read: from === "customer" },
            ],
          }
        : t,
    ),
  }));
  if (thread && from === "artisan") {
    pushNotification("chat", thread.artisanName, trimmed || attachmentPreview(attachment));
  }
}

export function markThreadRead(threadId: string) {
  set((s) => ({
    ...s,
    threads: s.threads.map((t) =>
      t.id === threadId
        ? { ...t, unread: 0, messages: t.messages.map((m) => ({ ...m, read: true })) }
        : t,
    ),
  }));
}

// ---------- Price negotiation ----------
export function sendProposal(
  jobId: string,
  by: "customer" | "artisan",
  data: { breakdown: ProposalLine[]; materialsUpfront: number; note?: string },
) {
  const total = data.breakdown.reduce((s, l) => s + (l.amount || 0), 0);
  if (total <= 0) return;
  const proposalId = crypto.randomUUID();
  const attachment: MsgAttachment = {
    kind: "proposal",
    id: proposalId,
    by,
    total,
    materialsUpfront: Math.min(data.materialsUpfront, total),
    breakdown: data.breakdown,
    note: data.note,
    status: "pending",
  };
  const job = getJob(jobId);
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            messages: [
              ...j.messages,
              {
                id: crypto.randomUUID(),
                from: by,
                text: `Proposed price ₦${total.toLocaleString()} (₦${data.materialsUpfront.toLocaleString()} materials upfront).`,
                at: Date.now(),
                attachment,
                read: by === "customer",
              },
            ],
          }
        : j,
    ),
  }));
  if (job && by === "artisan") {
    pushNotification("chat", job.artisanName, `New price proposal · ₦${total.toLocaleString()}`, jobId);
  }
  // Simulate artisan counter/accept when customer proposes
  if (by === "customer" && getPrefs().chatMessages) {
    setTimeout(() => {
      const j = getJob(jobId);
      if (!j) return;
      // Accept if reasonable, else counter +10%
      if (Math.random() > 0.4) {
        respondProposal(jobId, proposalId, "accepted", "artisan");
      } else {
        respondProposal(jobId, proposalId, "countered", "artisan");
        sendProposal(jobId, "artisan", {
          breakdown: data.breakdown.map((l) => ({ ...l, amount: Math.round(l.amount * 1.1) })),
          materialsUpfront: Math.round(data.materialsUpfront * 1.1),
          note: "Slight adjustment for current material prices.",
        });
      }
    }, 1500);
  }
}

export function respondProposal(
  jobId: string,
  proposalId: string,
  response: "accepted" | "countered" | "rejected",
  by: "customer" | "artisan",
) {
  let accepted: MsgAttachment | null = null;
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        messages: j.messages.map((m) => {
          if (m.attachment?.kind === "proposal" && m.attachment.id === proposalId) {
            const updated = { ...m.attachment, status: response } as MsgAttachment;
            if (response === "accepted") accepted = updated;
            return { ...m, attachment: updated };
          }
          return m;
        }),
      };
    }),
  }));
  const job = getJob(jobId);
  if (!job) return;
  const label =
    response === "accepted" ? "accepted the price" : response === "rejected" ? "rejected the proposal" : "sent a counter-offer";
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            messages: [
              ...j.messages,
              {
                id: crypto.randomUUID(),
                from: "system",
                text: `${by === "customer" ? "You" : job.artisanName} ${label}.`,
                at: Date.now(),
                read: true,
              },
            ],
          }
        : j,
    ),
  }));
  if (response === "accepted" && accepted && accepted.kind === "proposal") {
    submitAgreementForApproval(jobId, accepted);
  }
}

function submitAgreementForApproval(jobId: string, p: Extract<MsgAttachment, { kind: "proposal" }>) {
  const negotiation: Negotiation = {
    agreedTotal: p.total,
    materialsUpfront: p.materialsUpfront,
    breakdown: p.breakdown,
    proposalId: p.id,
    adminStatus: "pending",
    submittedAt: Date.now(),
  };
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            negotiation,
            messages: [
              ...j.messages,
              {
                id: crypto.randomUUID(),
                from: "system",
                text: `Agreed price ₦${p.total.toLocaleString()} sent to FixNear admin for approval.`,
                at: Date.now(),
                read: true,
              },
            ],
          }
        : j,
    ),
  }));
  pushNotification("job", "Price sent for approval", `₦${p.total.toLocaleString()} awaiting FixNear review.`, jobId);
  // Simulate admin approval
  setTimeout(() => adminDecide(jobId, "approved"), 3000);
}

export function adminDecide(jobId: string, decision: "approved" | "rejected", note?: string) {
  const job = getJob(jobId);
  if (!job?.negotiation) return;
  const neg = job.negotiation;
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) => {
      if (j.id !== jobId || !j.negotiation) return j;
      const updated: Job = {
        ...j,
        negotiation: { ...j.negotiation, adminStatus: decision, decidedAt: Date.now(), adminNote: note },
      };
      if (decision === "approved") {
        const materialsAmount = neg.materialsUpfront;
        updated.materials = {
          amount: materialsAmount,
          description: neg.breakdown.filter((l) => /material|part/i.test(l.label)).map((l) => l.label).join(", ") || "Materials & parts",
          paid: false,
          requestedAt: Date.now(),
        };
        updated.finalAmount = Math.max(0, neg.agreedTotal - materialsAmount);
      }
      updated.messages = [
        ...j.messages,
        {
          id: crypto.randomUUID(),
          from: "system",
          text:
            decision === "approved"
              ? `FixNear admin approved the price. Pay ₦${neg.materialsUpfront.toLocaleString()} materials upfront to begin.`
              : `FixNear admin rejected the price${note ? `: ${note}` : "."}`,
          at: Date.now(),
          read: false,
        },
      ];
      return updated;
    }),
  }));
  pushNotification(
    "job",
    decision === "approved" ? "Price approved" : "Price rejected",
    decision === "approved" ? "Pay materials upfront to start the job." : note || "Please negotiate again.",
    jobId,
  );
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

export function markJobCompleted(jobId: string) {
  const job = getJob(jobId);
  if (!job) return;
  if (job.status === "completed" || job.status === "paid") return;
  set((s) => ({
    ...s,
    jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: "completed" } : j)),
  }));
  pushNotification("job", "Job marked complete", `${job.artisanName} — pay to finish.`, jobId);
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
