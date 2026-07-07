import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { getJob, sendMessage, useStore } from "@/lib/store";
import { getPrefs } from "@/lib/prefs";
import { ChevronLeft, Send, ShieldCheck, Wallet as WalletIcon } from "lucide-react";


export const Route = createFileRoute("/chat/$jobId")({
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    return { jobId: params.jobId };
  },
  head: () => ({ meta: [{ title: "Chat — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { jobId } = Route.useLoaderData();
  const job = useStore((s) => s.jobs.find((j) => j.id === jobId));
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [job?.messages.length]);

  if (!job) return null;

  const materialsDue = !!job.materials && !job.materials.paid;
  const finalDue = job.status === "completed" && !job.finalPaid && !!job.finalAmount;
  const payDue = materialsDue || finalDue;

  const submit = () => {
    if (!text.trim()) return;
    sendMessage(job.id, text, "customer");
    setText("");
    // Only simulate an artisan reply if the user has chat notifications on
    if (getPrefs().chatMessages) {
      setTimeout(() => sendMessage(job.id, "Noted, sir. I dey come.", "artisan"), 1200);
    }
  };

  return (
    <PhoneFrame className="!bg-neutral-950 text-white">
      <div className="flex flex-col h-screen">
        <header className="px-4 pt-8 pb-3 flex items-center gap-3 border-b border-white/10">
          <Link
            to="/jobs"
            className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </Link>
          <img src={job.artisanPhoto} alt={job.artisanName} className="size-10 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{job.artisanName}</p>
            <p className="text-[11px] text-white/50 truncate">{job.category} · {job.location}</p>
          </div>
          <button
            disabled={!payDue}
            onClick={() =>
              payDue &&
              navigate({
                to: "/pay/$jobId",
                params: { jobId: job.id },
                search: { kind: materialsDue ? "materials" : "final" },
              })
            }
            className="size-10 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={payDue ? "Pay with FixNear Wallet" : "No payment due"}
            title={payDue ? "Pay with FixNear Wallet" : "No payment due yet"}
          >
            <WalletIcon size={18} />
          </button>
        </header>

        <div className="px-4 py-2 bg-brand-green/10 border-b border-brand-green/20 text-[11px] text-brand-green flex items-center gap-1.5">
          <ShieldCheck size={12} /> Your phone number stays private. All chat is in-app.
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {job.messages.length === 0 && (
            <p className="text-center text-xs text-white/40 mt-8">Say hello to {job.artisanName.split(" ")[0]}.</p>
          )}
          {job.messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "customer" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  m.from === "customer"
                    ? "bg-brand-green text-white rounded-br-sm"
                    : "bg-white/10 text-white rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="p-3 border-t border-white/10 flex gap-2 items-center"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 h-11 rounded-full bg-white/5 border border-white/10 px-4 text-sm outline-none focus:border-brand-green"
          />
          <button
            type="submit"
            className="size-11 rounded-full bg-brand-green flex items-center justify-center text-white shrink-0"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </PhoneFrame>
  );
}
