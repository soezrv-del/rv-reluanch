import { History, MessageSquarePlus, Trash2, X } from "lucide-react";
import type { ChatSession } from "@/lib/rvgrok/types";
import { formatRelativeTime, cn } from "@/lib/utils";
import { useKeyboardInset } from "@/lib/hooks/useKeyboardInset";

export function HistoryPanel({
  open,
  sessions,
  onClose,
  onLoad,
  onDelete,
  onNewChat,
}: {
  open: boolean;
  sessions: ChatSession[];
  onClose: () => void;
  onLoad: (s: ChatSession) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}) {
  const kb = useKeyboardInset();
  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-end justify-center sm:items-center"
      style={{
        height: kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100dvh",
        top: kb.vvOffsetTop || 0,
        paddingBottom: kb.open
          ? `max(0.75rem, ${kb.inset + 12}px)`
          : "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Close history"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex w-full max-w-md flex-col rounded-t-[var(--radius-2xl)] border border-border-strong bg-bg-elevated shadow-[var(--shadow-panel)] sm:rounded-[var(--radius-2xl)]"
        style={{
          maxHeight: kb.open
            ? `min(85dvh, calc(var(--vv-height, 100dvh) - ${kb.inset + 32}px))`
            : "min(85dvh, var(--vv-height, 85dvh))",
        }}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <History className="size-4 text-ruby" />
          <h2 className="flex-1 text-sm font-semibold">Chat History</h2>
          {sessions.length > 0 && (
            <span className="rounded-full bg-ruby-soft px-2 py-0.5 text-[10px] font-bold text-ruby">
              {sessions.length}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white transition hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-ruby-border bg-ruby-soft px-3 py-2.5 text-sm font-semibold text-ruby transition hover:bg-ruby-mid"
          >
            <MessageSquarePlus className="size-4" />
            New chat
          </button>
        </div>

        <div className="rv-scroll flex-1 overflow-y-auto px-3 py-2">
          {sessions.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-white">
              No saved conversations yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {sessions.map((s) => (
                <li key={s.id}>
                  <div
                    className={cn(
                      "group flex items-start gap-2 rounded-[var(--radius-md)] border border-transparent bg-surface/60 px-3 py-2.5 transition hover:border-ruby-border/40 hover:bg-surface",
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        onLoad(s);
                        onClose();
                      }}
                    >
                      <p className="truncate text-sm font-medium text-white">
                        {s.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white">
                        {formatRelativeTime(s.updated_at)} ·{" "}
                        {s.messages?.length ?? 0} messages
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-label="Delete chat"
                      onClick={() => onDelete(s.id)}
                      className="rounded-md p-1.5 text-white opacity-70 transition hover:bg-ruby-soft hover:text-ruby group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
