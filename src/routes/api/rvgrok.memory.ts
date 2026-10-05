import { createFileRoute } from "@tanstack/react-router";
import { denyUnlessWhitelisted } from "@/lib/access/httpGate";
import type { MemoryTurn } from "@/lib/rvgrok/phoneMemory";
import {
  applyMemoryUpdate,
  memoryKeyFromRequest,
} from "@/lib/rvgrok/phoneMemoryStore";
import { queuePendingPromptLesson, upsertVoiceLesson } from "@/lib/rvgrok/promptLessonsStore";
import {
  chatCorrectionForPending,
  lessonFromCorrection,
  userLinesForMemory,
} from "@/lib/rvgrok/sessionLearn";
import { lessonFromVoiceTurn } from "@/lib/rvgrok/voiceLesson";
import { learnVoiceLessonFromPost } from "@/lib/rvgrok/voiceLessonVerify";
import { loadOwnLotSnapshot } from "@/lib/rvgrok/ownLotInventory";

/**
 * POST /api/rvgrok/memory
 *
 * Background write after a chat turn. Gated by the same unlocked phone.
 * The streaming reply never waits on this.
 */

type Body = {
  source?: string;
  lotNotes?: string;
  messages?: Array<{ role?: string; content?: string }>;
};

export const Route = createFileRoute("/api/rvgrok/memory")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await denyUnlessWhitelisted(request);
        if (denied) return denied;

        const phoneDigits = memoryKeyFromRequest(request);

        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const raw: MemoryTurn[] = (body.messages || [])
          .filter((m) => m && (m.role === "user" || m.role === "assistant"))
          .map((m) => ({
            role: String(m.role),
            text: String(m.content || "").slice(0, 800),
          }));
        const voice = body.source === "voice";
        let lessons = "";
        if (voice) {
          const userText = raw
            .filter((turn) => turn.role === "user")
            .map((turn) => turn.text)
            .join("\n");
          const assistantText = raw
            .filter((turn) => turn.role === "assistant")
            .map((turn) => turn.text)
            .join("\n");
          // Phone text and lotNotes are not trusted for the global store.
          // This lesson can only go to pending.
          const clientLesson = lessonFromVoiceTurn({
            userText,
            assistantText,
            lotNotes: String(body.lotNotes || "").slice(0, 12000),
          });
          let requestOrigin = "";
          try {
            requestOrigin = new URL(request.url).origin;
          } catch {
            requestOrigin = "";
          }
          const learned = await learnVoiceLessonFromPost(
            { userText, assistantText, clientLesson },
            {
              loadSnapshot: () => loadOwnLotSnapshot({ requestOrigin }),
              upsertVoiceLesson,
              queuePendingPromptLesson,
            },
          );
          lessons = learned.lessons;
        }

        if (!phoneDigits) {
          return Response.json(
            { ok: Boolean(lessons), skipped: !lessons, lessons },
            { status: 200 },
          );
        }

        const turns: MemoryTurn[] = voice
          ? userLinesForMemory(
              raw.filter((t) => t.role === "user").map((t) => t.text),
            ).map((text) => ({ role: "user", text }))
          : raw;

        if (voice) {
          for (const turn of turns) {
            const lesson = lessonFromCorrection(turn.text);
            if (lesson) await queuePendingPromptLesson(lesson);
          }
        }

        // Typed chat: queue a correction for desk review only. Never promoted
        // here; `lessons` stays empty for chat. Same-turn inject is in run()
        // (rvgrok.ts), not this after-reply path.
        if (!voice) {
          const typed = chatCorrectionForPending(raw);
          if (typed) {
            await queuePendingPromptLesson(typed.lesson, {
              trigger: typed.trigger,
              phoneDigits,
              source: "chat",
            });
          }
        }

        const saved = await applyMemoryUpdate({ phoneDigits, turns });
        return Response.json({
          ok: true,
          updated: Boolean(saved),
          lessons,
        });
      },
    },
  },
});
