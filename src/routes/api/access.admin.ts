import { createFileRoute } from "@tanstack/react-router";
import {
  ADMIN_PASSWORD_UNSET_CODE,
  ADMIN_PASSWORD_UNSET_MESSAGE,
} from "@/lib/access/adminAuth";
import { denyAccessAdmin } from "@/lib/access/adminHttp";
import {
  adminCookie,
  adminPasswordConfigured,
  clearAdminCookie,
  issueAdminToken,
  verifyAdminPassword,
} from "@/lib/access/adminSession";
import {
  addWhitelistEntry,
  listAccessRequests,
  listWhitelist,
  removeWhitelistEntry,
} from "@/lib/access/store";
import { researchProviderStatus } from "@/lib/rvgrok/geminiResearch";
import { clearPhoneMemory } from "@/lib/rvgrok/phoneMemoryStore";
import { researchOrderStatus } from "@/lib/rvgrok/researchOrder";
import {
  getResearchOrderOverride,
  setResearchOrderOverride,
} from "@/lib/rvgrok/researchOrderStore";
import {
  getResearchProviderOverride,
  setResearchProviderOverride,
} from "@/lib/rvgrok/researchProviderStore";
import {
  addPromptLesson,
  deletePromptLesson,
  readPromptLessonsStatus,
} from "@/lib/rvgrok/promptLessonsStore";

type Body = {
  action?: string;
  password?: string;
  phone?: string;
  name?: string;
  notes?: string;
  isAdmin?: boolean;
  id?: string;
  provider?: string;
  researchOrder?: string;
  order?: string;
  text?: string;
};

async function researchProviderPayload() {
  const override = await getResearchProviderOverride();
  return researchProviderStatus({ override });
}

async function researchOrderPayload() {
  const override = await getResearchOrderOverride();
  return researchOrderStatus({ override });
}

export const Route = createFileRoute("/api/access/admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const blocked = denyAccessAdmin(request);
        if (blocked) return blocked;
        const [entries, requests, researchProvider, researchOrder, promptLessons] =
          await Promise.all([
            listWhitelist(),
            listAccessRequests(),
            researchProviderPayload(),
            researchOrderPayload(),
            readPromptLessonsStatus(),
          ]);
        return Response.json({
          entries,
          requests,
          researchProvider,
          researchOrder,
          promptLessons,
        });
      },
      PATCH: async ({ request }) => {
        const blocked = denyAccessAdmin(request);
        if (blocked) return blocked;
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        if (body.researchOrder != null || body.order != null) {
          const saved = await setResearchOrderOverride(
            String(body.researchOrder ?? body.order ?? ""),
          );
          if (!saved.ok) {
            return Response.json(
              { error: saved.error },
              { status: saved.unavailable ? 503 : 400 },
            );
          }
          return Response.json({
            ok: true,
            researchOrder: researchOrderStatus({ override: saved.override }),
            researchProvider: await researchProviderPayload(),
          });
        }
        const saved = await setResearchProviderOverride(String(body.provider ?? ""));
        if (!saved.ok) {
          return Response.json(
            { error: saved.error },
            { status: saved.unavailable ? 503 : 400 },
          );
        }
        return Response.json({
          ok: true,
          researchProvider: researchProviderStatus({ override: saved.override }),
          researchOrder: await researchOrderPayload(),
        });
      },
      POST: async ({ request }) => {
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const action = String(body.action ?? "");

        if (action === "login") {
          if (!adminPasswordConfigured()) {
            return Response.json(
              {
                error: "WHITELIST_ADMIN_PASSWORD is not set.",
                code: ADMIN_PASSWORD_UNSET_CODE,
                message: ADMIN_PASSWORD_UNSET_MESSAGE,
                passwordConfigured: false,
              },
              { status: 503 },
            );
          }
          if (!verifyAdminPassword(String(body.password ?? ""))) {
            return Response.json(
              { error: "Wrong admin password." },
              { status: 401 },
            );
          }
          const token = issueAdminToken();
          return Response.json(
            { ok: true, token },
            { headers: { "Set-Cookie": adminCookie(token) } },
          );
        }

        if (action === "logout") {
          return Response.json(
            { ok: true },
            { headers: { "Set-Cookie": clearAdminCookie() } },
          );
        }

        const blocked = denyAccessAdmin(request);
        if (blocked) return blocked;

        if (action === "research-order") {
          const saved = await setResearchOrderOverride(
            String(body.researchOrder ?? body.order ?? ""),
          );
          if (!saved.ok) {
            return Response.json(
              { error: saved.error },
              { status: saved.unavailable ? 503 : 400 },
            );
          }
          return Response.json({
            ok: true,
            researchOrder: researchOrderStatus({ override: saved.override }),
            researchProvider: await researchProviderPayload(),
          });
        }

        if (action === "prompt-lesson-add") {
          const saved = await addPromptLesson(String(body.text ?? ""));
          if (!saved.ok) {
            return Response.json(
              { error: saved.error },
              { status: saved.unavailable ? 503 : 400 },
            );
          }
          return Response.json({
            ok: true,
            promptLessons: saved.status,
          });
        }

        if (action === "prompt-lesson-delete") {
          const saved = await deletePromptLesson(String(body.id ?? ""));
          if (!saved.ok) {
            return Response.json(
              { error: saved.error },
              { status: saved.unavailable ? 503 : 400 },
            );
          }
          return Response.json({
            ok: true,
            promptLessons: saved.status,
          });
        }

        if (action === "research-provider") {
          const saved = await setResearchProviderOverride(
            String(body.provider ?? ""),
          );
          if (!saved.ok) {
            return Response.json(
              { error: saved.error },
              { status: saved.unavailable ? 503 : 400 },
            );
          }
          return Response.json({
            ok: true,
            researchProvider: researchProviderStatus({ override: saved.override }),
            researchOrder: await researchOrderPayload(),
          });
        }

        if (action === "add") {
          const result = await addWhitelistEntry({
            phone: String(body.phone ?? ""),
            name: String(body.name ?? ""),
            notes: String(body.notes ?? ""),
            isAdmin: Boolean(body.isAdmin),
          });
          if (!result.ok) {
            return Response.json({ error: result.error }, { status: 400 });
          }
          return Response.json({ ok: true, entry: result.entry });
        }

        if (action === "remove") {
          const result = await removeWhitelistEntry(String(body.id ?? ""));
          if (!result.ok) {
            return Response.json({ error: result.error }, { status: 400 });
          }
          return Response.json({ ok: true });
        }

        if (action === "clear_memory") {
          let raw = String(body.phone ?? "");
          if (!raw && body.id) {
            const entries = await listWhitelist();
            const row = entries.find((e) => e.id === body.id);
            raw = row?.phoneDigits || "";
          }
          const result = await clearPhoneMemory(raw);
          if (!result.ok) {
            return Response.json({ error: result.error }, { status: 400 });
          }
          return Response.json({
            ok: true,
            cleared: true,
            phoneDigits: result.phoneDigits,
          });
        }

        return Response.json({ error: "Unknown action." }, { status: 400 });
      },
    },
  },
});
