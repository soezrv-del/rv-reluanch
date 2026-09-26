import { createFileRoute } from "@tanstack/react-router";
import { denyUnlessWhitelisted } from "@/lib/access/httpGate";
import type { MemoryTurn } from "@/lib/rvgrok/phoneMemory";
import {
  applyMemoryUpdate,
  memoryKeyFromRequest,
} from "@/lib/rvgrok/phoneMemoryStore";
import { queuePendingPromptLesson, upsertVoiceLesson } from "@/lib/rvgrok/promptLessonsStore";
import {
  lessonFromCorrection,
  userLinesForMemory,
} from "@/lib/rvgrok/sessionLearn";
import { lessonFromVoiceTurn } from "@/lib/rvgrok/voiceLesson";

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
          const lesson = lessonFromVoiceTurn({
            userText: raw
              .filter((turn) => turn.role === "user")
              .map((turn) => turn.text)
              .join("\n"),
            assistantText: raw
              .filter((turn) => turn.role === "assistant")
              .map((turn) => turn.text)
              .join("\n"),
            lotNotes: String(body.lotNotes || "").slice(0, 12000),
          });
          if (lesson) lessons = await upsertVoiceLesson(lesson);
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
