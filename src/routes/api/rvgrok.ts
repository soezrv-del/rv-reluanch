import { createFileRoute } from "@tanstack/react-router";
import { denyUnlessWhitelisted } from "@/lib/access/httpGate";
import { RV_SYSTEM_PROMPT, AGENT_SYSTEM_PROMPT } from "@/lib/rvgrok/prompts";
import { injectStandingLessons } from "@/lib/rvgrok/promptLessons";
import { readStandingLessonsBlock } from "@/lib/rvgrok/promptLessonsStore";
import { visitorPersonalizationBlock } from "@/lib/rvgrok/speechPolicy";
import {
  loadVisitorMemoryBlockFromRequest,
  memoryKeyFromRequest,
  rememberAfterSseResponse,
} from "@/lib/rvgrok/phoneMemoryStore";
import type { MemoryTurn } from "@/lib/rvgrok/phoneMemory";
import { DEFAULT_WORKER_URL } from "@/lib/rvgrok/types";
import {
  appendGrounding,
  askNamesCoachIdentity,
  buildChatGrounding,
  lookupGroundedSpecs,
} from "@/lib/rvgrok/grounding";
import {
  looksLikeCoachCompareQuestion,
  parseCoachFromText,
} from "@/lib/rvgrok/parseCoach";
import {
  formatCoachReportTimeoutReply,
  looksLikeCoachReportAsk,
} from "@/lib/rvgrok/coachReport";
import {
  looksLikeMarketValueQuestion,
  looksLikeSpecQuestion,
} from "@/lib/rvgrok/webIntent";
import {
  formatOwnLotBlock,
  loadOwnLotSnapshot,
  looksLikeOwnLotStockQuestion,
  shouldSkipWebForOwnLot,
} from "@/lib/rvgrok/ownLotInventory";
import { looksLikeDeskSheetAsk } from "@/lib/rvgrok/deskSheetPolicy";
import {
  formatChatSpecMissReply,
  getCoachFacts,
  isUnpinnedWeightReply,
  isWeightSpecAsk,
  type CoachFactsToolResult,
} from "@/lib/rvgrok/chatSpecBlock";
import {
  researchTimeoutMs,
  WEB_SEARCH_MAX_TOOL_CALLS,
  formatWebSearchInjection,
} from "@/lib/rvgrok/webSearch";
import { executeWebResearch } from "@/lib/rvgrok/webResearchTelemetry";
import { getResearchOrderOverride } from "@/lib/rvgrok/researchOrderStore";
import { getResearchProviderOverride } from "@/lib/rvgrok/researchProviderStore";
import {
  GENERATE_IMAGE_TOOL,
  generateImageFromPrompt,
  parseGenerateImagePromptFromContent,
  wantsGeneratedImage,
} from "@/lib/rvgrok/imageGen";
import {
  executeRvGrokTool,
  parseTalkMode,
  requiredToolForAsk,
  type TalkMode,
} from "@/lib/rvgrok/chatTools";
import { evaluateTowMatch } from "@/lib/tow/towMatch";
import { computeLoan } from "@/lib/rv/rvCal";
import { parseCreditBand, type CreditBand } from "@/lib/rv/lendersCatalog";
import { resolveLendersResponse } from "@/lib/rv/rateApiLenders";
import { givesTradeInTaxCredit, lookupTaxByZip } from "@/lib/rv/zipTax";

/**
 * POST /api/rvgrok
 *
 * Proxy order:
 * 1. Cloudflare Worker (CLOUDFLARE_WORKER_URL)
 * 2. Direct xAI (XAI_API_KEY) — vision-capable models when images present
 * 3. Demo SSE stream
 *
 * Supports OpenAI/xAI multimodal message content:
 *   content: string | [{ type:'text', text }, { type:'image_url', image_url:{ url } }]
 */

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: string } };

type ChatMessage = {
  role: string;
  content: string | ContentPart[];
};

type Body = {
  messages?: ChatMessage[];
  agentMode?: boolean;
  feedbackContext?: string;
  catalogContext?: string;
  wantsWebFallback?: boolean;
  visitorFirstName?: string;
  /** Lot is the default. Coach only when the UI says so. */
  mode?: TalkMode;
};

function sseHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    ...extra,
  };
}

function answerSampling(text: string): { temperature: number; max_tokens: number } {
  const specTurn =
    isWeightSpecAsk(text) ||
    looksLikeSpecQuestion(text) ||
    looksLikeMarketValueQuestion(text) ||
    looksLikeCoachReportAsk(text) ||
    /\b(recalls?|nhtsa)\b/i.test(text);
  const long =
    looksLikeCoachReportAsk(text) ||
    looksLikeDeskSheetAsk(text) ||
    looksLikeCoachCompareQuestion(text) ||
    /\b(go deep|deep cut|walkthrough)\b/i.test(text);
  return {
    temperature: specTurn ? 0.2 : 0.7,
    max_tokens: long ? 1800 : 700,
  };
}

function encodeSse(obj: unknown) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

function appendFeedback(system: string, ctx?: string) {
  const t = (ctx || "").trim();
  if (!t) return system;
  return `${system}\n\n═══════════════════════════════════════\nUSER-VERIFIED CORRECTIONS (ground truth)\n═══════════════════════════════════════\n${t}\nUse these for that exact year/make/model/floorplan. Do not repeat the old wrong claim.`;
}

function withGrounding(
  system: string,
  opts?: {
    feedbackContext?: string;
    catalogContext?: string;
    webNotes?: string;
    ownLotNotes?: string;
    visitorFirstName?: string;
    visitorMemory?: string;
    standingLessons?: string;
    mode?: TalkMode;
  },
) {
  let out = injectStandingLessons(system, opts?.standingLessons);
  out = `${out}\n\nMODE: ${parseTalkMode(opts?.mode)}`;
  out = appendGrounding(out, opts?.catalogContext);
  const personal = visitorPersonalizationBlock(opts?.visitorFirstName);
  if (personal) out = `${out}\n\n${personal}`;
  const memory = (opts?.visitorMemory || "").trim();
  if (memory) out = `${out}\n\n${memory}`;
  out = appendFeedback(out, opts?.feedbackContext);
  const lot = (opts?.ownLotNotes || "").trim();
  if (lot) {
    out = `${out}\n\n═══════════════════════════════════════\nOWN-LOT INVENTORY (RV Country)\n═══════════════════════════════════════\n${lot}`;
  }
  const web = (opts?.webNotes || "").trim();
  if (web) {
    out = `${out}\n\n═══════════════════════════════════════\nWEB RESEARCH\n═══════════════════════════════════════\n${web}`;
  }
  return out;
}

function workerBase() {
  return (
    process.env.CLOUDFLARE_WORKER_URL ||
    process.env.VITE_CLOUDFLARE_WORKER_URL ||
    DEFAULT_WORKER_URL
  ).replace(/\/$/, "");
}

function floorplanAlreadyInThread(text: string): string {
  let floorplan = "";
  for (const chunk of text.split(/\n+/)) {
    const parsed = parseCoachFromText(chunk);
    if (!parsed.floorplan) continue;
    if (!parsed.make && !parsed.model) floorplan = parsed.floorplan;
    else if (parsed.model) floorplan = parsed.floorplan;
  }
  return floorplan;
}

function contentToPlain(content: string | ContentPart[]): string {
  if (typeof content === "string") return content;
  return content
    .map((p) => {
      if (p.type === "text") return p.text;
      if (p.type === "image_url") return "[photo attached]";
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function hasVision(messages: ChatMessage[]): boolean {
  return messages.some((m) => {
    if (typeof m.content === "string") return false;
    return m.content.some((p) => p.type === "image_url");
  });
}

function extractTextFromJson(data: unknown): {
  content: string;
  model?: string;
} {
  const d = data as {
    model?: string;
    choices?: Array<{
      message?: { content?: string };
      delta?: { content?: string };
      text?: string;
    }>;
    content?: string;
    message?: string;
    error?: string | { message?: string };
  };

  const content =
    d?.choices?.[0]?.message?.content ||
    d?.choices?.[0]?.delta?.content ||
    d?.choices?.[0]?.text ||
    d?.content ||
    d?.message ||
    (typeof d?.error === "string" ? d.error : d?.error?.message) ||
    "";

  return { content: String(content), model: d?.model };
}

function jsonToSseStream(opts: {
  content: string;
  model: string;
  agentMode: boolean;
  upstream: string;
  prelude?: unknown[];
}): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(encodeSse(obj)));
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      if (opts.prelude?.length) {
        for (const ev of opts.prelude) send(ev);
      }

      const text =
        opts.content ||
        "No response content returned from the AI upstream.";
      const chunkSize = 12;
      for (let i = 0; i < text.length; i += chunkSize) {
        const piece = text.slice(i, i + chunkSize);
        if (opts.agentMode) {
          send({ type: "delta", content: piece });
        } else {
          send({ choices: [{ delta: { content: piece } }] });
        }
        await sleep(8);
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: sseHeaders({
      "X-Model-Used": opts.agentMode
        ? `${opts.model} · Agent`
        : opts.model,
      "X-Upstream": opts.upstream,
    }),
  });
}

type ToolCall = {
  id: string;
  type?: string;
  function?: { name?: string; arguments?: string };
};

type ChatCompletionMessage = {
  role?: string;
  content?: string | null;
  tool_calls?: ToolCall[];
};

const toolFn = (
  name: string,
  description: string,
  properties: Record<string, unknown>,
  required: string[] = [],
) => ({
  type: "function" as const,
  function: {
    name,
    description,
    parameters: { type: "object", properties, required },
  },
});

const XAI_CHAT_TOOLS = [
  GENERATE_IMAGE_TOOL,
  toolFn(
    "get_coach_facts",
    "Catalog lock for a year, make, model, and floorplan. Specs and weights. Does not check recalls.",
    {
      year: { type: "string" },
      make: { type: "string" },
      model: { type: "string" },
      floorplan: { type: "string" },
    },
  ),
  toolFn(
    "check_recalls",
    "NHTSA campaigns for a year, make, and model.",
    {
      year: { type: "string" },
      make: { type: "string" },
      model: { type: "string" },
    },
    ["year", "make", "model"],
  ),
  toolFn(
    "search_listings",
    "Live asking prices for a year, make, model, and ZIP.",
    {
      year: { type: "string" },
      make: { type: "string" },
      model: { type: "string" },
      zip: { type: "string" },
      radius: { type: "string" },
    },
    ["make", "model", "zip"],
  ),
  toolFn(
    "estimate_payment",
    "Payment estimate from price, ZIP, term, and credit band. An estimate, not a loan offer.",
    {
      price: { type: "number" },
      zip: { type: "string" },
      term_months: { type: "number" },
      credit: { type: "string" },
      down_payment: { type: "number" },
    },
    ["price"],
  ),
  toolFn(
    "check_tow",
    "Truck max tow, payload, and hitch against trailer GVWR. Does not invent a missing rating.",
    {
      trailer_gvwr_lb: { type: "number" },
      truck_max_tow_lb: { type: "number" },
      truck_payload_lb: { type: "number" },
      truck_gcwr_lb: { type: "number" },
      hitch_lb: { type: "number" },
      rv_type: { type: "string" },
      bed: { type: "string" },
    },
  ),
  toolFn(
    "get_own_lot",
    "RV Country lot snapshot. Only for an explicit stock ask or a stock number. Returns every match; matched is the full count. Each unit is year|make|model|trim|stock|price|location|body.",
    { query: { type: "string" } },
  ),
];

function toolNum(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toolStr(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : value == null
      ? ""
      : String(value).trim();
}

function coachArgs(args: Record<string, unknown>, userText: string) {
  const hinted = [
    toolStr(args.year),
    toolStr(args.make),
    toolStr(args.model),
    toolStr(args.floorplan),
  ]
    .filter(Boolean)
    .join(" ");
  const parsed = parseCoachFromText(`${hinted} ${userText}`.trim());
  return {
    year: toolStr(args.year) || parsed.year,
    make: toolStr(args.make) || parsed.make,
    model: toolStr(args.model) || parsed.model,
    floorplan: toolStr(args.floorplan) || parsed.floorplan,
  };
}

async function fetchOwnJson(
  requestOrigin: string | undefined,
  path: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const origin = (requestOrigin || "").replace(/\/$/, "");
  if (!origin) return { ok: false, error: "request origin missing" };
  const url = new URL(path, origin);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    const body = (await resp.json().catch(() => null)) as unknown;
    if (!resp.ok) {
      const err =
        body && typeof body === "object" && "error" in body
          ? String((body as { error?: unknown }).error || "")
          : "";
      return { ok: false, error: err || `${path} failed`, status: resp.status };
    }
    if (!body || typeof body !== "object") {
      return { ok: false, error: `${path} returned no JSON` };
    }
    return { ok: true, ...(body as Record<string, unknown>) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : `${path} failed`,
    };
  }
}

async function runRegisteredTool(
  name: string,
  args: Record<string, unknown>,
  ctx: { userText: string; requestOrigin?: string },
): Promise<Record<string, unknown>> {
  if (name === "get_coach_facts") {
    const id = coachArgs(args, ctx.userText);
    return getCoachFacts(id);
  }

  if (name === "check_recalls") {
    const id = coachArgs(args, ctx.userText);
    if (!/^\d{4}$/.test(id.year) || !id.make || !id.model) {
      return {
        ok: false,
        error: "year, make, and model required",
        missing: ["year", "make", "model"].filter(
          (k) => !id[k as "year" | "make" | "model"],
        ),
      };
    }
    return fetchOwnJson(ctx.requestOrigin, "/api/nhtsa/recalls", {
      year: id.year,
      make: id.make,
      model: id.model,
    });
  }

  if (name === "search_listings") {
    const id = coachArgs(args, ctx.userText);
    const zip = toolStr(args.zip).replace(/\D/g, "").slice(0, 5);
    if (!id.make || !id.model || !zip) {
      return {
        ok: false,
        error: "make, model, and zip required",
        missing: [
          !id.make ? "make" : "",
          !id.model ? "model" : "",
          !zip ? "zip" : "",
        ].filter(Boolean),
      };
    }
    return fetchOwnJson(ctx.requestOrigin, "/api/marketcheck/search", {
      year: id.year,
      make: id.make,
      model: id.model,
      zip,
      radius: toolStr(args.radius),
    });
  }

  if (name === "estimate_payment") {
    const price = toolNum(args.price);
    if (price == null || price <= 0) {
      return { ok: false, estimate: false, missing: ["price"], error: "price required" };
    }
    const term = toolNum(args.term_months) ?? 240;
    const down = toolNum(args.down_payment) ?? 0;
    const credit = parseCreditBand(toolStr(args.credit) || null) as CreditBand;
    const zip = toolStr(args.zip);
    const tax = zip ? lookupTaxByZip(zip) : null;
    const lenders = await resolveLendersResponse({
      amount: price,
      termMonths: term,
      credit,
      zip: zip || undefined,
    });
    const quote =
      lenders.lenders.find((row) => row.eligible) ?? lenders.lenders[0] ?? null;
    const apr = quote?.estimatedApr ?? 0;
    const loan = computeLoan({
      price,
      downPayment: down,
      apr,
      termMonths: term,
      taxRate: tax?.taxRate ?? 0,
      registrationFees: tax?.registrationFees ?? 0,
      applyTradeInTaxCredit: tax ? givesTradeInTaxCredit(tax.abbr) : true,
    });
    return {
      ok: true,
      estimate: true,
      not_a_loan_offer: true,
      price,
      down_payment: down,
      term_months: term,
      term_assumed: toolNum(args.term_months) == null,
      credit,
      monthly_usd: Math.round(loan.monthlyPayment),
      amount_financed: Math.round(loan.amountFinanced),
      tax_amount: loan.taxAmount,
      tax_rate: tax?.taxRate ?? null,
      tax_state: tax?.abbr ?? null,
      tax_unverified: !tax,
      apr,
      apr_source: lenders.source,
      lender: quote?.name ?? null,
    };
  }

  if (name === "check_tow") {
    const gvwr = toolNum(args.trailer_gvwr_lb);
    const maxTow = toolNum(args.truck_max_tow_lb);
    const payload = toolNum(args.truck_payload_lb);
    const missing = [
      gvwr == null || gvwr <= 0 ? "gvwr" : "",
      maxTow == null || maxTow <= 0 ? "max_tow" : "",
      payload == null || payload <= 0 ? "payload" : "",
    ].filter(Boolean);
    if (missing.length) return { ok: false, missing };
    const gcwr = toolNum(args.truck_gcwr_lb);
    const verdict = evaluateTowMatch({
      hasVehicle: true,
      rvType: toolStr(args.rv_type) || "Travel Trailer",
      gvwrLbs: gvwr!,
      hitchLbs: toolNum(args.hitch_lb) ?? undefined,
      maxTow: maxTow!,
      payload: payload!,
      gcwr: gcwr != null && gcwr > 0 ? gcwr : 0,
      bed: toolStr(args.bed) || undefined,
    });
    return {
      ok: true,
      tow_ok: verdict.towOk,
      hitch_ok: verdict.hitchOk,
      hitch_skipped: verdict.hitchSkipped,
      gcwr_ok: verdict.gcwrOk,
      gcwr_skipped: verdict.gcwrSkipped,
      overall_ok: verdict.overallOk,
      hitch_lb: verdict.hitchLoad,
      hitch_kind: verdict.hitchKind,
      hitch_estimated: verdict.hitchEstimated,
      checks: verdict.checks.map((c) => ({
        id: c.id,
        level: c.level,
        title: c.title,
      })),
    };
  }

  if (name === "get_own_lot") {
    return executeRvGrokTool(name, args, ctx);
  }

  return { ok: false, error: `unknown tool ${name}` };
}

async function runXaiWithTools(opts: {
  apiKey: string;
  model: string;
  agentMode: boolean;
  messages: ChatMessage[];
  forceImageTool: boolean;
  requiredTool: string | null;
  userText: string;
  requestOrigin?: string;
}): Promise<Response | null> {
  const working: Array<Record<string, unknown>> = opts.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const prelude: unknown[] = [];
  let stepNo = 0;
  let lastContent = "";
  let imageCount = 0;
  console.info(
    `[rvgrok] tool-loop ${opts.model} ${opts.requiredTool || "auto"}`,
  );

  for (let round = 0; round < 3; round++) {
    const forced =
      round === 0 && imageCount === 0
        ? opts.forceImageTool
          ? "generate_image"
          : opts.requiredTool
        : null;
    const resp = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: working,
        tools: XAI_CHAT_TOOLS,
        tool_choice:
          forced === "generate_image"
            ? { type: "function", function: { name: "generate_image" } }
            : "auto",
        stream: false,
        ...answerSampling(opts.userText),
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!resp.ok) {
      if (round === 0) return null;
      break;
    }

    const data = (await resp.json()) as {
      choices?: Array<{
        message?: ChatCompletionMessage;
        finish_reason?: string;
      }>;
    };
    const msg = data.choices?.[0]?.message;
    if (!msg) {
      if (round === 0) return null;
      break;
    }

    let toolCalls = msg.tool_calls ?? [];
    if (!toolCalls.length && msg.content) {
      const synPrompt = parseGenerateImagePromptFromContent(String(msg.content));
      if (synPrompt) {
        toolCalls = [
          {
            id: `call-synth-${round}`,
            type: "function",
            function: {
              name: "generate_image",
              arguments: JSON.stringify({ prompt: synPrompt }),
            },
          },
        ];
      }
    }
    if (
      !toolCalls.length &&
      round === 0 &&
      forced &&
      forced !== "generate_image"
    ) {
      toolCalls = [
        {
          id: `call-required-${round}`,
          type: "function",
          function: { name: forced, arguments: "{}" },
        },
      ];
    }
    if (toolCalls.length) {
      working.push({
        role: "assistant",
        content: msg.content ?? null,
        tool_calls: toolCalls,
      });
      for (const call of toolCalls) {
        const name = call.function?.name || "";
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function?.arguments || "{}") as Record<
            string,
            unknown
          >;
        } catch {
          args = {};
        }
        stepNo += 1;
        console.info(`[rvgrok] tool ${name}`, JSON.stringify(args).slice(0, 240));
        if (name === "generate_image") {
          if (imageCount >= 2) {
            working.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify({
                ok: false,
                error: "Image limit reached for this turn (max 2).",
              }),
            });
            continue;
          }
          const prompt = String(args.prompt || "").trim();
          prelude.push({
            type: "step",
            step: stepNo,
            tool: "generate_image",
            input: { prompt: prompt.slice(0, 180) },
            status: "running",
          });
          const img = await generateImageFromPrompt(opts.apiKey, prompt);
          prelude.push({
            type: "step",
            step: stepNo,
            tool: "generate_image",
            input: { prompt: prompt.slice(0, 180) },
            result: JSON.stringify(
              img.ok
                ? { status: "ok", format: img.format }
                : { status: "error", error: img.error },
            ),
            status: "done",
          });
          if (img.ok) {
            imageCount += 1;
            prelude.push({ type: "image", url: img.url });
          }
          working.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(
              img.ok
                ? {
                    ok: true,
                    url:
                      img.format === "b64"
                        ? "data-url (already shown to the user)"
                        : img.url,
                    format: img.format,
                  }
                : img,
            ),
          });
        } else {
          prelude.push({
            type: "step",
            step: stepNo,
            tool: name,
            input: args,
            status: "running",
          });
          const result = await runRegisteredTool(name, args, {
            userText: opts.userText,
            requestOrigin: opts.requestOrigin,
          });
          prelude.push({
            type: "step",
            step: stepNo,
            tool: name,
            input: args,
            result: JSON.stringify(result),
            status: "done",
          });
          working.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result),
          });
        }
      }
      continue;
    }

    lastContent = String(msg.content || "");
    break;
  }

  return jsonToSseStream({
    content:
      lastContent ||
      (imageCount
        ? "Here's the generated image."
        : "No response content returned from the AI upstream."),
    model: opts.model,
    agentMode: opts.agentMode,
    upstream: "xai-direct",
    prelude,
  });
}

async function tryXaiDirect(
  messages: ChatMessage[],
  agentMode: boolean,
  feedbackContext?: string,
  catalogContext?: string,
  webNotes?: string,
  ownLotNotes?: string,
  visitorFirstName?: string,
  visitorMemory?: string,
  standingLessons?: string,
  mode?: TalkMode,
  requestOrigin?: string,
): Promise<Response | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const vision = hasVision(messages);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastPlain = lastUser ? contentToPlain(lastUser.content) : "";
  const forceImageTool = wantsGeneratedImage(lastPlain);
  const requiredTool = forceImageTool ? null : requiredToolForAsk(lastPlain);
  const MODELS = vision
    ? ["grok-4.7", "grok-4.6", "grok-4.5", "grok-4-latest", "grok-2-vision-1212", "grok-3"]
    : ["grok-4.7", "grok-4.6", "grok-4-latest", "grok-4.5", "grok-3"];

  const system = withGrounding(
    (agentMode ? AGENT_SYSTEM_PROMPT : RV_SYSTEM_PROMPT) +
      (vision
        ? "\n\nA photo is attached. You CAN see it. Describe exactly what is visible (panels, screens, labels, damage, coach exterior). Never claim you cannot see images. Never invent a different scene."
        : "") +
      (forceImageTool
        ? "\n\nThe user asked for a generated image. You MUST call the generate_image tool with a detailed visual prompt. Do not write a JSON tool call in your content."
        : ""),
    {
      feedbackContext,
      catalogContext,
      webNotes,
      ownLotNotes,
      visitorFirstName,
      visitorMemory,
      standingLessons,
      mode,
    },
  );
  const fullMessages: ChatMessage[] = [
    { role: "system", content: system },
    ...messages,
  ];

  for (const model of MODELS) {
    try {
      const result = await runXaiWithTools({
        apiKey,
        model,
        agentMode,
        messages: fullMessages,
        forceImageTool,
        requiredTool,
        userText: lastPlain,
        requestOrigin,
      });
      if (result) return result;
    } catch {
      /* next model */
    }
  }
  return null;
}

/**
 * Worker first is fine for text; for photos prefer xAI vision if key exists,
 * because many workers strip multimodal content and invent answers.
 */
async function tryCloudflareWorker(
  messages: ChatMessage[],
  agentMode: boolean,
  feedbackContext?: string,
  catalogContext?: string,
  webNotes?: string,
  ownLotNotes?: string,
  visitorFirstName?: string,
  visitorMemory?: string,
  standingLessons?: string,
  mode?: TalkMode,
): Promise<Response | null> {
  const base = workerBase();
  const candidates = agentMode
    ? [`${base}/agent`, `${base}/rvgrok-agent`, `${base}/chat`, `${base}/`]
    : [`${base}/chat`, `${base}/rvgrok-chat`, `${base}/`];

  const vision = hasVision(messages);
  const systemExtra = vision
    ? "\n\nThe latest user message includes an image. You CAN see it. Describe what is actually in the photo. Never claim you lack eyes. Never invent a different coach if the image is a panel/screen/close-up."
    : "";

  for (const url of candidates) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: withGrounding(
                (agentMode ? AGENT_SYSTEM_PROMPT : RV_SYSTEM_PROMPT) +
                  systemExtra,
                {
                  feedbackContext,
                  catalogContext,
                  webNotes,
                  ownLotNotes,
                  visitorFirstName,
                  visitorMemory,
                  standingLessons,
                  mode,
                },
              ),
            },
            ...messages,
          ],
          agentMode,
          stream: false,
          vision,
        }),
      });

      if (resp.status === 404 || resp.status === 405) continue;
      if (!resp.ok) continue;

      const ctype = resp.headers.get("content-type") || "";

      if (ctype.includes("text/event-stream") && resp.body) {
        return new Response(resp.body, {
          headers: sseHeaders({
            "X-Model-Used":
              resp.headers.get("X-Model-Used") ||
              (agentMode ? "grok-4.7 · Agent" : "grok-4.7"),
            "X-Upstream": "cloudflare-worker",
          }),
        });
      }

      const data = await resp.json();
      const { content, model } = extractTextFromJson(data);
      if (!content) continue;
      // Reject obvious non-vision stubs when a photo was sent
      if (
        vision &&
        /could not reach|demo mode|I received your photo attachment|live vision needs/i.test(
          content,
        )
      ) {
        continue;
      }

      return jsonToSseStream({
        content,
        model: model || (vision ? "grok-vision" : "grok-4.7"),
        agentMode,
        upstream: "cloudflare-worker",
      });
    } catch {
      /* try next */
    }
  }
  return null;
}

function demoStream(messages: ChatMessage[], agentMode: boolean): Response {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const plain = lastUser ? contentToPlain(lastUser.content) : "Hello";
  const vision = hasVision(messages);

  const text = vision
    ? [
        "**RvGrok · unverified demo**",
        "",
        "Live chat is temporarily unavailable. This is a placeholder so the tab is not dead.",
        plain
          ? `You asked: “${plain.slice(0, 140)}”`
          : "No text question — photo only.",
        "",
        "This reply is UNVERIFIED. It is not catalog truth.",
        "I will not invent engine, horsepower, chassis, or fuel from this photo.",
        "Open the Facts report for year-band powertrain. Do not treat this message as a spec sheet.",
      ].join("\n")
    : [
        "**RvGrok · unverified demo**",
        "",
        `You asked: “${plain.slice(0, 140)}”`,
        "",
        "Live chat is temporarily unavailable. This is a placeholder so the tab is not dead.",
        "",
        "This reply is UNVERIFIED. It is not catalog truth.",
        "I will not invent engine, horsepower, chassis, or fuel.",
        "Open the Facts report for year-band powertrain. Chat never writes those numbers into Facts.",
      ].join("\n");

  return jsonToSseStream({
    content: text,
    model: vision ? "demo-vision" : "demo",
    agentMode,
    upstream: "demo",
  });
}

export const Route = createFileRoute("/api/rvgrok")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await denyUnlessWhitelisted(request);
        if (denied) return denied;
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json(
            { error: "Invalid JSON body" },
            { status: 400 },
          );
        }

        const messages = body.messages;
        if (!messages || !Array.isArray(messages)) {
          return Response.json(
            { error: "messages array is required" },
            { status: 400 },
          );
        }

        // Basic size guard on base64 images
        const rawSize = JSON.stringify(messages).length;
        if (rawSize > 8_000_000) {
          return Response.json(
            {
              error:
                "Image too large. Try a closer crop or lower-resolution photo.",
            },
            { status: 413 },
          );
        }

        const agentMode = Boolean(body.agentMode);
        const talkMode = parseTalkMode(body.mode);
        const feedbackContext = body.feedbackContext;
        const visitorFirstName =
          typeof body.visitorFirstName === "string"
            ? body.visitorFirstName
            : "";
        const phoneKey = memoryKeyFromRequest(request);
        const [visitorMemory, standingLessons] = await Promise.all([
          phoneKey ? loadVisitorMemoryBlockFromRequest(request) : "",
          readStandingLessonsBlock(),
        ]);
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const lastPlain = lastUser ? contentToPlain(lastUser.content) : "";
        const memoryTurns: MemoryTurn[] = messages.map((m) => ({
          role: m.role,
          text: contentToPlain(m.content).slice(0, 800),
        }));
        const finish = (response: Response) =>
          rememberAfterSseResponse(response, {
            phoneDigits: phoneKey,
            turns: memoryTurns,
          });

        // Server re-grounds the latest ask so a phone/API probe without
        // client catalogContext still locks Lineage Series M (and friends).
        // Spec / GVWR / engine / pricing / YMM asks browse first; the
        // catalog lock is injected so notes cannot invent a "not in catalog"
        // story. If this turn names a different coach, do not keep a stale
        // client Lineage (etc.) lock from a previous Facts / session coach.
        const priorUserText = messages
          .filter((m) => m.role === "user")
          .map((m) => contentToPlain(m.content))
          .join("\n");
        const serverGrounded = buildChatGrounding({
          query: lastPlain,
          extraText: priorUserText,
          agentMode,
        });
        const threadFloorplan = floorplanAlreadyInThread(priorUserText);
        if (
          serverGrounded.identity &&
          !serverGrounded.identity.floorplan &&
          threadFloorplan
        ) {
          serverGrounded.identity = {
            ...serverGrounded.identity,
            floorplan: threadFloorplan,
            source: "mixed",
          };
        }
        const lastNamesCoach = askNamesCoachIdentity(
          parseCoachFromText(lastPlain),
        );
        const catalogContext = lastNamesCoach
          ? serverGrounded.block || ""
          : serverGrounded.block || body.catalogContext || "";

        const specWeightAsk = isWeightSpecAsk(lastPlain);
        if (
          specWeightAsk &&
          serverGrounded.identity?.make &&
          serverGrounded.identity.model
        ) {
          const tool = await runRegisteredTool(
            "get_coach_facts",
            {
              year: serverGrounded.identity.year,
              make: serverGrounded.identity.make,
              model: serverGrounded.identity.model,
              floorplan: serverGrounded.identity.floorplan,
            },
            { userText: priorUserText || lastPlain },
          );
          const reply = formatChatSpecMissReply({
            query: lastPlain,
            year: serverGrounded.identity.year,
            make: serverGrounded.identity.make,
            model: serverGrounded.identity.model,
            floorplan:
              serverGrounded.identity.floorplan ||
              (typeof tool.floorplan === "string" ? tool.floorplan : ""),
            tool: tool as CoachFactsToolResult,
          });
          if (reply && !isUnpinnedWeightReply(reply)) {
            return finish(
              jsonToSseStream({
                content: reply,
                model: "catalog-pin",
                agentMode,
                upstream: "coach-facts",
              }),
            );
          }
          if (reply && serverGrounded.identity?.floorplan) {
            const researched = await executeWebResearch({
              apiKey: process.env.XAI_API_KEY,
              query: lastPlain.slice(0, 400),
              catalogBlock: catalogContext,
              timeoutMs: researchTimeoutMs("chat", lastPlain),
              profile: "chat",
              skipGate: true,
              requestOrigin: (() => {
                try {
                  return new URL(request.url).origin;
                } catch {
                  return "";
                }
              })(),
              maxAttempts: WEB_SEARCH_MAX_TOOL_CALLS,
              researchProvider:
                (await getResearchProviderOverride()) ?? undefined,
              researchOrder: (await getResearchOrderOverride()) ?? undefined,
              identity: serverGrounded.identity,
            });
            const researchedReply = formatChatSpecMissReply({
              query: lastPlain,
              year: serverGrounded.identity.year,
              make: serverGrounded.identity.make,
              model: serverGrounded.identity.model,
              floorplan: serverGrounded.identity.floorplan,
              tool: tool as CoachFactsToolResult,
              researchNotes: researched.ok ? researched.notes : "",
            });
            return finish(
              jsonToSseStream({
                content: researchedReply || reply,
                model: "web-research",
                agentMode,
                upstream: "web-research",
              }),
            );
          }
        }

        let requestOrigin = "";
        try {
          requestOrigin = new URL(request.url).origin;
        } catch {
          requestOrigin = "";
        }

        let ownLotNotes: string | undefined;
        let skipWebForLot = false;
        if (looksLikeOwnLotStockQuestion(lastPlain)) {
          const snapshot = await loadOwnLotSnapshot({ requestOrigin });
          ownLotNotes = formatOwnLotBlock(snapshot, lastPlain);
          skipWebForLot = shouldSkipWebForOwnLot(lastPlain, snapshot);
        }

        // Memory first. Await research only for a true external ask
        // (repair, market, inventory, weather). Coach and spec asks stream
        // from memory and the catalog without this hold.
        const wantsWebFallback =
          !skipWebForLot &&
          (serverGrounded.needsWeb ||
            (!serverGrounded.identity && Boolean(body.wantsWebFallback)));

        let webNotes: string | undefined;
        if (wantsWebFallback) {
          const researched = await executeWebResearch({
            apiKey: process.env.XAI_API_KEY,
            query: lastPlain.slice(0, 400),
            catalogBlock: catalogContext,
            timeoutMs: researchTimeoutMs("chat", lastPlain),
            profile: "chat",
            skipGate: true,
            requestOrigin,
            maxAttempts: WEB_SEARCH_MAX_TOOL_CALLS,
            // Server-persisted admin override (not a client header).
            researchProvider:
              (await getResearchProviderOverride()) ?? undefined,
            researchOrder:
              (await getResearchOrderOverride()) ?? undefined,
            identity: serverGrounded.identity,
          });
          const reportText = looksLikeDeskSheetAsk(lastPlain)
            ? formatCoachReportTimeoutReply({
                notes: researched.ok ? researched.notes : "",
                catalogBlock: catalogContext,
                query: lastPlain,
              })
            : "";
          if (reportText) {
            return finish(
              jsonToSseStream({
                content: reportText,
                model:
                  researched.ok && "model" in researched && researched.model
                    ? researched.model
                    : "catalog-pin",
                agentMode,
                upstream: "coach-report",
              }),
            );
          }
          webNotes = formatWebSearchInjection(researched, {
            query: lastPlain,
            catalogBlock: catalogContext,
          });
        }

        // xAI first when the key is present so generate_image (and vision) work.
        const fromXai = await tryXaiDirect(
          messages,
          agentMode,
          feedbackContext,
          catalogContext,
          webNotes,
          ownLotNotes,
          visitorFirstName,
          visitorMemory,
          standingLessons,
          talkMode,
          requestOrigin,
        );
        if (fromXai) return finish(fromXai);
        const fromWorker = await tryCloudflareWorker(
          messages,
          agentMode,
          feedbackContext,
          catalogContext,
          webNotes,
          ownLotNotes,
          visitorFirstName,
          visitorMemory,
          standingLessons,
          talkMode,
        );
        if (fromWorker) return finish(fromWorker);

        return finish(demoStream(messages, agentMode));
      },
    },
  },
});
