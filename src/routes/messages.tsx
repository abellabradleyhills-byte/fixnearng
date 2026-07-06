import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ARTISANS } from "@/lib/artisans";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — FixNear" }, { name: "robots", content: "noindex" }] }),
  component: Messages,
});

function Messages() {
  return (
    <PhoneFrame>
      <div className="pb-32 animate-screen-entry">
        <header className="px-5 pt-10 pb-4">
          <h1 className="text-2xl font-display font-bold">Messages</h1>
          <p className="text-xs text-muted-foreground">In-app chat keeps your number private.</p>
        </header>
        <div className="px-5 space-y-2">
          {ARTISANS.slice(0, 3).map((a, i) => (
            <Link
              to="/artisan/$id"
              params={{ id: a.id }}
              key={a.id}
              className="flex gap-3 p-3 rounded-2xl border border-border bg-card items-center"
            >
              <img src={a.photo} alt={a.name} width={80} height={80} className="size-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{a.name}</span>
                  <span className="text-[10px] text-muted-foreground">{i === 0 ? "2m" : i === 1 ? "1h" : "Yesterday"}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {["I'm 5 minutes away, sir.", "Confirmed for tomorrow 10am.", "Job completed — thank you!"][i]}
                </p>
              </div>
              {i === 0 && <span className="size-2 rounded-full bg-brand-green" />}
            </Link>
          ))}
          <div className="mt-8 flex flex-col items-center text-center text-muted-foreground">
            <MessageCircle size={28} className="mb-2 opacity-40" />
            <p className="text-xs">No other conversations yet</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
