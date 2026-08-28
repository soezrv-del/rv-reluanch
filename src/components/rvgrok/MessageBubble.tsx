import { useState } from "react";
import { Check, Loader2, Square, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import type { Message } from "@/lib/rvgrok/types";
import { parseCoachFromText } from "@/lib/rvgrok/answerFeedback";
import { formatTime, cn } from "@/lib/utils";
import { AgentBadge, AgentStepsCard } from "./AgentStepsCard";

function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("|") && line.includes("|")) {
      return (
        <div
          key={i}
          className="my-1 overflow-x-auto font-mono text-[11px] text-white"
        >
          {line}
        </div>
      );
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className={cn("min-h-[0.4em] leading-relaxed", i > 0 && "mt-1")}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
            return (
              <em key={j} className="text-white not-italic">
                {part.slice(1, -1)}
              </em>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}

export type GrokFeedbackPayload = {
  rating: "up" | "down";
  correction?: string;
  year?: string;
  make?: string;
  model?: string;
  floorplan?: string;
};

export function MessageBubble({
  message,
  onSpeak,
  speakingId,
  priorQuery,
  onFeedback,
}: {
  message: Message;
  onSpeak?: (id: string, text: string) => void;
  speakingId?: string | null;
  priorQuery?: string;
  onFeedback?: (messageId: string, payload: GrokFeedbackPayload) => void;
}) {
  const isUser = message.role === "user";
  const hasAgentSteps =
    !isUser && message.isAgentMode && (message.agentSteps?.length ?? 0) > 0;
  const isSpeaking = speakingId === message.id;
  const showFeedback =
    !isUser &&
    !!message.content &&
    !message.streaming &&
    !!onFeedback &&
    !message.content.startsWith("Error:");

  const parsed = parseCoachFromText(
    `${priorQuery || ""} ${message.content || ""}`,
  );
  const [downOpen, setDownOpen] = useState(false);
  const [year, setYear] = useState(parsed.year);
  const [make, setMake] = useState(parsed.make);
  const [model, setModel] = useState(parsed.model);
  const [floorplan, setFloorplan] = useState(parsed.floorplan);
  const [correction, setCorrection] = useState("");
  const [savedNote, setSavedNote] = useState(false);

  const voted = message.feedback;

  return (
    <div
      className={cn(
        "flex w-full gap-2.5",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="relative mt-1 size-9 shrink-0 overflow-hidden rounded-full border border-ruby-border bg-black shadow-[0_0_16px_rgba(212,37,53,0.35)]">
          <img
            src="/assets/brand/icon-rvgrok.png"
            alt=""
            className="size-full object-contain"
          />
        </div>
      )}

      <div
        className={cn(
          "max-w-[min(100%,28rem)] rounded-[var(--radius-lg)] px-3.5 py-3 text-sm",
          isUser
            ? "rounded-br-sm bg-ruby text-white shadow-[0_4px_20px_rgba(212,37,53,0.35)]"
            : "rounded-bl-sm border border-border-strong bg-surface/90 text-white shadow-[var(--shadow-panel)]",
        )}
      >
        {hasAgentSteps ? (
          <div className="mb-2">
            <AgentBadge />
            <AgentStepsCard steps={message.agentSteps!} />
          </div>
        ) : null}

        {message.imageDataUrl ? (
          <div className="mb-2 overflow-hidden rounded-lg border border-white/20">
            <img
              src={message.imageDataUrl}
              alt="Attached photo"
              className="max-h-52 w-full object-cover"
            />
          </div>
        ) : null}

        {message.unverified ? (
          <p className="mb-2 rounded-md border border-amber-400/35 bg-amber-500/15 px-2.5 py-1.5 text-[11px] leading-snug text-amber-100">
            Unverified reply — not catalog truth. Engine, HP, chassis, and fuel
            stay on the Facts report. This chat never writes those numbers into
            Facts.
          </p>
        ) : null}

        {message.streaming && !message.content ? (
          <p className="flex items-center gap-2 text-white/80">
            <Loader2 className="size-3.5 animate-spin" />
            Thinking…
          </p>
        ) : (
          renderContent(message.content || "")
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] opacity-60">
            {formatTime(
              message.timestamp instanceof Date
                ? message.timestamp
                : new Date(message.timestamp),
            )}
          </span>
          {!isUser && message.content && onSpeak ? (
            <button
              type="button"
              onClick={() => onSpeak(message.id, message.content)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold opacity-80 hover:opacity-100"
            >
              {isSpeaking ? (
                <Square className="size-3" />
              ) : (
                <Volume2 className="size-3" />
              )}
              {isSpeaking ? "Stop" : "Speak"}
            </button>
          ) : null}
        </div>

        {showFeedback ? (
          <div className="mt-2.5 border-t border-white/10 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-[10px] text-white/45">Helpful?</span>
              <button
                type="button"
                aria-label="Thumbs up"
                aria-pressed={voted === "up"}
                disabled={voted === "up"}
                onClick={() => {
                  onFeedback?.(message.id, { rating: "up" });
                  setDownOpen(false);
                }}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full border transition",
                  voted === "up"
                    ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-emerald-400/40 hover:text-emerald-200",
                )}
              >
                <ThumbsUp className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Thumbs down"
                aria-pressed={voted === "down"}
                onClick={() => {
                  if (voted === "down" && savedNote) return;
                  setYear((v) => v || parsed.year);
                  setMake((v) => v || parsed.make);
                  setModel((v) => v || parsed.model);
                  setFloorplan((v) => v || parsed.floorplan);
                  setDownOpen(true);
                }}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full border transition",
                  voted === "down"
                    ? "border-ruby/50 bg-ruby/20 text-rose-300"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-rose-400/40 hover:text-rose-200",
                )}
              >
                <ThumbsDown className="size-3.5" />
              </button>
              {voted === "up" ? (
                <span className="text-[10px] text-emerald-300">Thanks</span>
              ) : voted === "down" && !downOpen ? (
                <span className="text-[10px] text-white/55">Saved</span>
              ) : null}
            </div>

            {downOpen && voted !== "down" ? (
              <form
                className="mt-2 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const note = correction.trim();
                  if (!note) return;
                  onFeedback?.(message.id, {
                    rating: "down",
                    correction: note,
                    year: year.trim(),
                    make: make.trim(),
                    model: model.trim(),
                    floorplan: floorplan.trim(),
                  });
                  setSavedNote(true);
                  setDownOpen(false);
                }}
              >
                <p className="text-[11px] leading-snug text-white/70">
                  What should it have said? We’ll use this the next time this
                  year / make / model comes up.
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Year"
                    inputMode="numeric"
                    className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[12px] text-white outline-none placeholder:text-white/35"
                  />
                  <input
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="Make"
                    className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[12px] text-white outline-none placeholder:text-white/35"
                  />
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Model"
                    className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[12px] text-white outline-none placeholder:text-white/35"
                  />
                  <input
                    value={floorplan}
                    onChange={(e) => setFloorplan(e.target.value)}
                    placeholder="Floorplan"
                    className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[12px] text-white outline-none placeholder:text-white/35"
                  />
                </div>
                <textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. 2021 Kountry Star 37BH is Cummins L9 380 HP, not Ford 7.3"
                  className="w-full rounded-md border border-white/15 bg-black/40 px-2.5 py-2 text-[12px] text-white outline-none placeholder:text-white/35"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!correction.trim()}
                    className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-full bg-ruby px-3 text-[12px] font-bold text-white disabled:opacity-40"
                  >
                    <Check className="size-3.5" />
                    Save correction
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownOpen(false)}
                    className="rounded-full border border-white/15 px-3 text-[12px] font-bold text-white/70"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
