import { createFileRoute } from "@tanstack/react-router";
import { denyUnlessWhitelisted } from "@/lib/access/httpGate";
import type { MemoryTurn } from "@/lib/rvgrok/phoneMemory";
import {
  applyMemoryUpdate,
  memoryKeyFromRequest,
} from "@/lib/rvgrok/phoneMemoryStore";
import { queuePendingPromptLesson } from "@/lib/rvgrok/promptLessonsStore";
import {
  lessonFromCorrection,
  userLinesForMemory,
} from "@/lib/rvgrok/sessionLearn";

/**
 * POST /api/rvgrok/memory
 *
 * Background write after a chat turn. Gated by the same unlocked phone.
 * The streaming reply never waits on this.
 */

type Body = {
  source?: string;
  messages?: Array<{ role?: string; content?: string }>;
};

export const Route = createFileRoute("/api/rvgrok/memory")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await denyUnlessWhitelisted(request);
        if (denied) return denied;

        const phoneDigits = memoryKeyFromRequest(request);
        if (!phoneDigits) {
          return Response.json({ ok: false, skipped: true }, { status: 200 });
        }

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
        });
      },
    },
  },
});
