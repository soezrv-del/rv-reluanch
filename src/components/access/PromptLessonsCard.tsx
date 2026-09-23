import { useEffect, useState, type FormEvent } from "react";
import { BookOpen, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/access/client";
import type { PromptLessonsStatus } from "@/lib/rvgrok/promptLessons";

/** Admin-only standing lessons. Same card on ACCESS and in the list sheet. */
export function PromptLessonsCard({
  surface,
}: {
  surface: "more" | "sheet";
}) {
  const [status, setStatus] = useState<PromptLessonsStatus | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError("");
      try {
        const res = await adminFetch("/api/access/admin");
        const data = (await res.json()) as {
          promptLessons?: PromptLessonsStatus;
          error?: string;
          message?: string;
        };
        if (!res.ok) {
          throw new Error(data.message || data.error || "Could not load.");
        }
        if (!cancelled) setStatus(data.promptLessons ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load standing lessons.",
          );
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNote("");
    setBusy(true);
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "POST",
        body: JSON.stringify({ action: "prompt-lesson-add", text: draft }),
      });
      const data = (await res.json()) as {
        promptLessons?: PromptLessonsStatus;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message || data.error || "Could not add.");
      }
      if (data.promptLessons) setStatus(data.promptLessons);
      setDraft("");
      setNote("Saved. This lesson is now standing process for everyone.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add the lesson.",
      );
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    setError("");
    setNote("");
    setBusy(true);
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "POST",
        body: JSON.stringify({ action: "prompt-lesson-delete", id }),
      });
      const data = (await res.json()) as {
        promptLessons?: PromptLessonsStatus;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message || data.error || "Could not delete.");
      }
      if (data.promptLessons) setStatus(data.promptLessons);
      setNote("Removed from the standing block.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete the lesson.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      data-prompt-lessons
      data-prompt-lessons-surface={surface}
      data-prompt-lessons-count={status?.lessons.length ?? 0}
      className="glass-prestige space-y-3 rounded-[1.25rem] p-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <BookOpen className="size-4 text-amber" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.16em] text-white/90">
            STANDING LESSONS
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/80">
            Process for every RV Grok chat, voice, and agent. Not per-phone
            memory. Desk SoT — visitors cannot write this.
          </p>
        </div>
      </div>
      <p
        data-prompt-lessons-usage
        className="text-[12px] font-semibold text-white"
      >
        {status
          ? `${status.lessons.length} active · ${status.used}/${status.cap} chars`
          : error
            ? "Standing lessons: unavailable"
            : "Standing lessons: …"}
      </p>
      <ul data-prompt-lessons-list className="space-y-2">
        {(status?.lessons ?? []).map((lesson) => (
          <li
            key={lesson.id}
            data-prompt-lesson-id={lesson.id}
            data-prompt-lesson-source={lesson.source}
            className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
          >
            <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-white">
              {lesson.text}
            </p>
            <button
              type="button"
              data-prompt-lesson-delete={lesson.id}
              disabled={busy || !status}
              onClick={() => void onDelete(lesson.id)}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-60"
              aria-label={`Delete lesson ${lesson.id}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => void onAdd(e)} className="space-y-2">
        <label className="block">
          <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
            ADD LESSON
          </span>
          <input
            data-prompt-lesson-draft
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="glass-field w-full rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
            placeholder="Short imperative — one process rule"
            maxLength={280}
          />
        </label>
        <button
          type="submit"
          data-prompt-lesson-add
          disabled={busy || !status || !draft.trim()}
          className="w-full rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Add standing lesson"}
        </button>
      </form>
      {note ? (
        <p
          data-prompt-lessons-saved
          className="text-[12px] font-semibold text-white"
        >
          {note}
        </p>
      ) : null}
      {error ? (
        <p
          data-prompt-lessons-error
          className="text-[12px] font-semibold text-ruby"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
