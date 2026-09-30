import { createFileRoute } from "@tanstack/react-router";
import { denyUnlessWhitelisted } from "@/lib/access/httpGate";
import {
  answerQueryLotFromSnapshot,
  type LotMemory,
} from "@/lib/rvgrok/lotMemory";
import { loadOwnLotSnapshot } from "@/lib/rvgrok/ownLotInventory";
import { spokenLotPayload } from "@/lib/rvgrok/voiceTurnGate";

/**
 * POST /api/rvgrok/query-lot
 *
 * Live Voice `query_lot` tool. Runs the own-lot snapshot, not the web.
 */

type Body = {
  args?: Record<string, unknown>;
  lotMemory?: LotMemory | null;
  utterance?: string;
};

function readMemory(value: unknown): LotMemory | null {
  if (!value || typeof value !== "object") return null;
  const filter = (value as LotMemory).filter;
  if (!filter || typeof filter !== "object") return null;
  return value as LotMemory;
}

export const Route = createFileRoute("/api/rvgrok/query-lot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await denyUnlessWhitelisted(request);
        if (denied) return denied;
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        let requestOrigin = "";
        try {
          requestOrigin = new URL(request.url).origin;
        } catch {
          requestOrigin = "";
        }
        const args =
          body.args && typeof body.args === "object" ? body.args : {};
        const utterance = typeof body.utterance === "string" ? body.utterance : "";
        const snapshot = await loadOwnLotSnapshot({ requestOrigin });
        const answer = answerQueryLotFromSnapshot(
          snapshot,
          args,
          readMemory(body.lotMemory),
          utterance,
        );
        return Response.json(spokenLotPayload(answer));
      },
    },
  },
});
