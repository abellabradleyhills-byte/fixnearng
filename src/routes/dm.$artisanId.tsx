import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import {
  getThreadByArtisan,
  markThreadRead,
  sendDirectMessage,
  startDirectThread,
  useStore,
  type MsgAttachment,
} from "@/lib/store";
import { getArtisan } from "@/lib/artisans";
import { getPrefs } from "@/lib/prefs";
import { ChatComposer, MessageBubble, TypingDots } from "@/components/ChatUI";
import { ChevronLeft, Phone, Video, ShieldCheck, Circle } from "lucide-react";

export const Route = createFileRoute("/dm/$artisanId")({
  loader: ({ params }) => {
    const a = getArtisan(params.artisanId);
    if (!a) throw notFound();
    const id = startDirectThread(params.artisanId);
    return { threadId: id, artisanId: params.artisanId };
  },
  head: () => ({ meta: [{ title: "Direct Chat — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: DMPage,
});

function DMPage() {
  const { artisanId } = Route.useLoaderData();
  const thread = useStore((s) => s.threads.find((t) => t.artisanId === artisanId));
  const artisan = getArtisan(artisanId)!;
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = getThreadByArtisan(artisanId);
    if (t) markThreadRead(t.id);
  }, [artisanId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [thread?.messages.length, typing]);

  const lastSeen = useMemo(() => (thread ? formatLastSeen(thread.lastSeenAt) : ""), [thread]);

  if (!thread) return null;

  const send = (text: string, attachment?: MsgAttachment) => {
    sendDirectMessage(thread.id, text, "customer", attachment);
    if (getPrefs().chatMessages) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        sendDirectMessage(thread.id, replyFor(text, attachment), "artisan");
      }, 1400);
    }
  };

  return (
    <PhoneFrame className="!bg-[#ECE5DD] dark:!bg-neutral-950">
      <div className="flex flex-col h-screen">
        <header className="bg-brand-green text-white px-3 pt-9 pb-3 flex items-center gap-2 shadow-lg">
          <button
            onClick={() => navigate({ to: "/messages" })}
            className="size-9 rounded-full hover:bg-white/10 flex items-center justify-center"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <Link to="/artisan/$id" params={{ id: artisan.id }} className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative">
              <img src={artisan.photo} alt={artisan.name} className="size-10 rounded-full object-cover ring-2 ring-white/40" />
              {thread.online && (
                <Circle size={10} className="absolute -bottom-0.5 -right-0.5 fill-brand-yellow text-brand-yellow" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate leading-tight">{artisan.name}</p>
              <p className="text-[10px] text-white/75 truncate">
                {typing ? "typing…" : thread.online ? "Online" : `Last seen ${lastSeen}`}
              </p>
            </div>
          </Link>
          <button className="size-9 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Voice call">
            <Phone size={18} />
          </button>
          <button className="size-9 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Video call">
            <Video size={18} />
          </button>
        </header>

        <div className="px-4 py-1.5 bg-brand-yellow/25 border-b border-brand-yellow/40 text-[10px] text-amber-900 dark:text-brand-yellow flex items-center gap-1.5 justify-center">
          <ShieldCheck size={11} /> In-app chat only · Phone numbers stay private
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {thread.messages.length === 0 && (
            <div className="text-center mt-16 px-6">
              <div className="mx-auto size-16 rounded-full bg-brand-green/15 flex items-center justify-center mb-3">
                <ShieldCheck size={24} className="text-brand-green" />
              </div>
              <p className="text-sm font-bold text-foreground">Say hello to {artisan.name.split(" ")[0]}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask about availability and rates. Book to open a job with payment protection.
              </p>
            </div>
          )}
          {thread.messages.map((m, i) => {
            const prev = thread.messages[i - 1];
            const showAvatar = m.from === "artisan" && (!prev || prev.from !== m.from);
            return (
              <MessageBubble
                key={m.id}
                msg={m}
                showAvatar={showAvatar}
                avatarSrc={artisan.photo}
                variant="dm"
              />
            );
          })}
          {typing && <TypingDots />}
        </div>

        <ChatComposer onSend={send} />
      </div>
    </PhoneFrame>
  );
}

function replyFor(text: string, a?: MsgAttachment): string {
  if (a?.kind === "image") return "I see the photo, sending you a quote shortly.";
  if (a?.kind === "voice") return "Got your voice note, oga.";
  if (a?.kind === "location") return "Location received. I'll be there.";
  if (/price|cost|charge|rate/i.test(text)) return "Depends on the work. Book so I can inspect.";
  return "Noted, sir.";
}

function formatLastSeen(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return "yesterday";
}
