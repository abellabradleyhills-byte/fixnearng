import { useRef, useState } from "react";
import type { ChatMsg, MsgAttachment } from "@/lib/store";
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  Mic,
  Paperclip,
  Plus,
  Send,
  Smile,
  Check,
  CheckCheck,
  X,
} from "lucide-react";

const EMOJIS = ["😀", "😂", "🙏", "👍", "❤️", "🔥", "💯", "🚀", "😢", "🎉", "👏", "🤝"];

export function MessageBubble({
  msg,
  showAvatar,
  avatarSrc,
  variant = "dm",
}: {
  msg: ChatMsg;
  showAvatar?: boolean;
  avatarSrc?: string;
  variant?: "dm" | "job";
}) {
  const mine = msg.from === "customer";
  const time = new Date(msg.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-end gap-1.5 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && (
        <div className="size-7 shrink-0">
          {showAvatar && avatarSrc && (
            <img src={avatarSrc} className="size-7 rounded-full object-cover" alt="" />
          )}
        </div>
      )}
      <div
        className={`max-w-[78%] px-2.5 py-1.5 rounded-2xl text-sm shadow-sm ${
          mine
            ? variant === "dm"
              ? "bg-[#DCF8C6] dark:bg-brand-green text-neutral-900 dark:text-white rounded-br-md"
              : "bg-brand-green text-white rounded-br-md"
            : "bg-white dark:bg-white/10 text-neutral-900 dark:text-white rounded-bl-md"
        }`}
      >
        {msg.attachment && <AttachmentView a={msg.attachment} />}
        {msg.text && <p className="whitespace-pre-wrap break-words px-1.5">{msg.text}</p>}
        <div className={`flex items-center gap-1 justify-end mt-0.5 text-[10px] ${mine ? "text-neutral-500 dark:text-white/70" : "text-neutral-500 dark:text-white/50"}`}>
          <span>{time}</span>
          {mine && (msg.read ? <CheckCheck size={12} className="text-brand-green" /> : <Check size={12} />)}
        </div>
      </div>
    </div>
  );
}

function AttachmentView({ a }: { a: MsgAttachment }) {
  if (a.kind === "image") {
    return (
      <div className="mb-1">
        <img src={a.url} alt={a.caption ?? "shared photo"} className="rounded-xl max-h-56 object-cover w-full" />
      </div>
    );
  }
  if (a.kind === "voice") {
    return (
      <div className="flex items-center gap-2 px-1 py-1 min-w-[160px]">
        <Mic size={16} className="text-brand-green" />
        <div className="flex items-end gap-0.5 h-5 flex-1">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="w-0.5 bg-current opacity-60 rounded"
              style={{ height: `${20 + Math.abs(Math.sin(i)) * 80}%` }}
            />
          ))}
        </div>
        <span className="text-[11px] opacity-70">{a.duration}s</span>
      </div>
    );
  }
  if (a.kind === "location") {
    return (
      <div className="mb-1 rounded-xl bg-brand-green/15 border border-brand-green/30 p-2 flex items-center gap-2 min-w-[200px]">
        <MapPin size={18} className="text-brand-green" />
        <div>
          <p className="text-xs font-bold">Shared location</p>
          <p className="text-[10px] opacity-75">{a.label}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-1 rounded-xl bg-black/5 dark:bg-white/10 p-2 flex items-center gap-2">
      <Paperclip size={16} />
      <div className="min-w-0">
        <p className="text-xs font-bold truncate">{a.name}</p>
        <p className="text-[10px] opacity-70">{(a.size / 1024).toFixed(0)} KB</p>
      </div>
    </div>
  );
}

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-white/10 rounded-2xl w-fit ml-8 mt-1">
      <span className="size-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="size-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="size-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "240ms" }} />
    </div>
  );
}

export function ChatComposer({
  onSend,
  extraLeading,
}: {
  onSend: (text: string, attachment?: MsgAttachment) => void;
  extraLeading?: React.ReactNode;
}) {
  const [text, setText] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recTimer = useRef<number | null>(null);

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    setShowEmoji(false);
  };

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    onSend("", { kind: "image", url });
    setShowAttach(false);
    e.target.value = "";
  };

  const shareLocation = () => {
    setShowAttach(false);
    if (!navigator.geolocation) {
      onSend("", { kind: "location", label: "Lagos, Nigeria" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => onSend("", { kind: "location", label: `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`, lat: p.coords.latitude, lng: p.coords.longitude }),
      () => onSend("", { kind: "location", label: "Lagos, Nigeria" }),
      { timeout: 3000 },
    );
  };

  const startRecording = () => {
    setRecording(0);
    recTimer.current = window.setInterval(() => setRecording((r) => (r ?? 0) + 1), 1000);
  };

  const stopRecording = (cancel = false) => {
    if (recTimer.current) window.clearInterval(recTimer.current);
    const secs = recording ?? 0;
    setRecording(null);
    if (!cancel && secs > 0) onSend("", { kind: "voice", duration: secs });
  };

  return (
    <div className="border-t border-black/10 dark:border-white/10 bg-background">
      {showEmoji && (
        <div className="px-3 py-2 grid grid-cols-6 gap-2 border-b border-black/5 dark:border-white/10">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setText((t) => t + e)}
              className="text-2xl hover:bg-black/5 dark:hover:bg-white/10 rounded-lg py-1"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      {showAttach && (
        <div className="px-4 py-3 grid grid-cols-4 gap-3 border-b border-black/5 dark:border-white/10">
          <AttachBtn icon={<ImageIcon size={22} />} label="Gallery" color="bg-purple-500" onClick={() => fileRef.current?.click()} />
          <AttachBtn icon={<Camera size={22} />} label="Camera" color="bg-pink-500" onClick={() => fileRef.current?.click()} />
          <AttachBtn icon={<MapPin size={22} />} label="Location" color="bg-brand-green" onClick={shareLocation} />
          <AttachBtn icon={<Paperclip size={22} />} label="Document" color="bg-blue-500" onClick={() => onSend("", { kind: "file", name: "quote.pdf", size: 84000 })} />
        </div>
      )}

      <div className="p-2 flex items-end gap-2">
        {extraLeading}
        {recording !== null ? (
          <div className="flex-1 flex items-center gap-3 h-11 rounded-full bg-emergency/10 border border-emergency/40 px-4">
            <span className="size-2.5 rounded-full bg-emergency animate-pulse" />
            <span className="text-sm font-bold text-emergency">Recording {recording}s</span>
            <button onClick={() => stopRecording(true)} className="ml-auto text-emergency" aria-label="Cancel">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-end gap-1 bg-muted rounded-3xl px-2 py-1 min-h-11">
            <button
              onClick={() => {
                setShowAttach((v) => !v);
                setShowEmoji(false);
              }}
              className="size-9 flex items-center justify-center text-muted-foreground shrink-0"
              aria-label="Attach"
            >
              <Plus size={20} className={showAttach ? "rotate-45 transition-transform" : "transition-transform"} />
            </button>
            <textarea
              value={text}
              rows={1}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Message"
              className="flex-1 bg-transparent resize-none outline-none text-sm py-2 max-h-24"
            />
            <button
              onClick={() => {
                setShowEmoji((v) => !v);
                setShowAttach(false);
              }}
              className="size-9 flex items-center justify-center text-muted-foreground shrink-0"
              aria-label="Emoji"
            >
              <Smile size={20} />
            </button>
          </div>
        )}

        {text.trim() ? (
          <button
            onClick={submit}
            className="size-11 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0 shadow-md"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            onPointerDown={startRecording}
            onPointerUp={() => stopRecording(false)}
            onPointerLeave={() => recording !== null && stopRecording(false)}
            className={`size-11 rounded-full text-white flex items-center justify-center shrink-0 shadow-md ${
              recording !== null ? "bg-emergency" : "bg-brand-green"
            }`}
            aria-label="Hold to record voice note"
          >
            <Mic size={18} />
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
      </div>
    </div>
  );
}

function AttachBtn({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <span className={`size-12 rounded-full ${color} text-white flex items-center justify-center shadow`}>
        {icon}
      </span>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </button>
  );
}
