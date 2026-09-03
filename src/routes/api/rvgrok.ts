import { createFileRoute } from "@tanstack/react-router";
import { RV_SYSTEM_PROMPT, AGENT_SYSTEM_PROMPT } from "@/lib/rvgrok/prompts";
import { DEFAULT_WORKER_URL } from "@/lib/rvgrok/types";
import { appendGrounding } from "@/lib/rvgrok/grounding";
import {
  CHAT_WEB_SEARCH_TIMEOUT_MS,
  fetchWebSearchNotes,
  formatWebSearchInjection,
} from "@/lib/rvgrok/webSearch";
import {
  GENERATE_IMAGE_TOOL,
  generateImageFromPrompt,
  parseGenerateImagePromptFromContent,
  wantsGeneratedImage,
} from "@/lib/rvgrok/imageGen";

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
};

function sseHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    ...extra,
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
  opts?: { feedbackContext?: string; catalogContext?: string; webNotes?: string },
) {
  let out = appendGrounding(system, opts?.catalogContext);
  out = appendFeedback(out, opts?.feedbackContext);
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

      if (opts.agentMode && opts.upstream !== "xai-direct") {
        send({ type: "agent_start", model: opts.model });
        const steps = [
          {
            step: 1,
            tool: "analyze_photo",
            input: { summary: "Reading attached image" },
            result: JSON.stringify({ status: "parsed" }),
          },
          {
            step: 2,
            tool: "analyze_requirements",
            input: { summary: "Parsing search criteria" },
            result: JSON.stringify({ status: "parsed" }),
          },
          {
            step: 3,
            tool: "search_rv_models",
            input: { source: "market" },
            result: JSON.stringify({ status: "searched" }),
          },
          {
            step: 4,
            tool: "get_model_details",
            input: { source: "specs" },
            result: JSON.stringify({ status: "loaded" }),
          },
        ];
        for (const s of steps) {
          send({
            type: "step",
            step: s.step,
            tool: s.tool,
            input: s.input,
            status: "running",
          });
          await sleep(180);
          send({
            type: "step",
            step: s.step,
            tool: s.tool,
            input: s.input,
            result: s.result,
            status: "done",
          });
          await sleep(60);
        }
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

async function runXaiWithTools(opts: {
  apiKey: string;
  model: string;
  agentMode: boolean;
  messages: ChatMessage[];
  forceImageTool: boolean;
}): Promise<Response | null> {
  const working: Array<Record<string, unknown>> = opts.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const prelude: unknown[] = [];
  let stepNo = 0;
  let lastContent = "";
  let imageCount = 0;

  for (let round = 0; round < 3; round++) {
    const resp = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: working,
        tools: [GENERATE_IMAGE_TOOL],
        tool_choice:
          opts.forceImageTool && round === 0 && imageCount === 0
            ? {
                type: "function",
                function: { name: "generate_image" },
              }
            : "auto",
        stream: false,
        temperature: 0.2,
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
    if (toolCalls.length) {
      working.push({
        role: "assistant",
        content: msg.content ?? null,
        tool_calls: toolCalls,
      });
      for (const call of toolCalls) {
        const name = call.function?.name || "";
        let args: { prompt?: string } = {};
        try {
          args = JSON.parse(call.function?.arguments || "{}") as {
            prompt?: string;
          };
        } catch {
          args = {};
        }
        stepNo += 1;
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
                    url: img.format === "b64"
                      ? "data-url (already shown to the user)"
                      : img.url,
                    format: img.format,
                  }
                : img,
            ),
          });
        } else {
          working.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({
              ok: false,
              error: `unknown tool ${name}`,
            }),
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
): Promise<Response | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const vision = hasVision(messages);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastPlain = lastUser ? contentToPlain(lastUser.content) : "";
  const forceImageTool = wantsGeneratedImage(lastPlain);
  const MODELS = vision
    ? ["grok-4.6", "grok-4.5", "grok-4-latest", "grok-2-vision-1212", "grok-3"]
    : ["grok-4.6", "grok-4-1-fast-reasoning", "grok-4-latest", "grok-4.5", "grok-3"];

  const system = withGrounding(
    (agentMode ? AGENT_SYSTEM_PROMPT : RV_SYSTEM_PROMPT) +
      (vision
        ? "\n\nA photo is attached. You CAN see it. Describe exactly what is visible (panels, screens, labels, damage, coach exterior). Never claim you cannot see images. Never invent a different scene."
        : "") +
      (forceImageTool
        ? "\n\nThe user asked for a generated image. You MUST call the generate_image tool with a detailed visual prompt. Do not write a JSON tool call in your content."
        : ""),
    { feedbackContext, catalogContext, webNotes },
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
                { feedbackContext, catalogContext, webNotes },
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
              (agentMode ? "grok-4.5 · Agent" : "grok-4.5"),
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
        model: model || (vision ? "grok-vision" : "grok-4.5"),
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
        const feedbackContext = body.feedbackContext;
        const catalogContext = body.catalogContext;
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const lastPlain = lastUser ? contentToPlain(lastUser.content) : "";

        let webNotes: string | undefined;
        if (body.wantsWebFallback) {
          const researched = await fetchWebSearchNotes({
            apiKey: process.env.XAI_API_KEY,
            query: lastPlain.slice(0, 400),
            catalogBlock: catalogContext,
            timeoutMs: CHAT_WEB_SEARCH_TIMEOUT_MS,
            profile: "chat",
          });
          webNotes = formatWebSearchInjection(researched);
        }

        // xAI first when the key is present so generate_image (and vision) work.
        const fromXai = await tryXaiDirect(
          messages,
          agentMode,
          feedbackContext,
          catalogContext,
          webNotes,
        );
        if (fromXai) return fromXai;
        const fromWorker = await tryCloudflareWorker(
          messages,
          agentMode,
          feedbackContext,
          catalogContext,
          webNotes,
        );
        if (fromWorker) return fromWorker;

        return demoStream(messages, agentMode);
      },
    },
  },
});
