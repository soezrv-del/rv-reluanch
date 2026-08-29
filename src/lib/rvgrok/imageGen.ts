/** xAI Imagine image endpoint — server-only. Same key as chat. */
export const IMAGE_GENERATIONS_URL = "https://api.x.ai/v1/images/generations";

/** Cheapest working model first; 2.0 / quality only if the cheap id is rejected. */
const IMAGE_MODELS = [
  "grok-imagine-image",
  "grok-imagine-image-2.0",
  "grok-imagine-image-quality",
] as const;

export type GenerateImageResult =
  | { ok: true; url: string; format: "url" | "b64" }
  | { ok: false; error: string };

function toDataUrl(b64: string): string {
  const raw = b64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  const mime = raw.startsWith("iVBOR") ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${raw}`;
}

function isModelError(err: string): boolean {
  return /model|not found|unknown|invalid|does not exist/i.test(err);
}

async function requestImage(
  apiKey: string,
  model: string,
  prompt: string,
  responseFormat: "url" | "b64_json",
): Promise<GenerateImageResult> {
  const resp = await fetch(IMAGE_GENERATIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      resolution: "1k",
      response_format: responseFormat,
    }),
    signal: AbortSignal.timeout(90_000),
  });

  const body = (await resp.json().catch(() => null)) as {
    data?: Array<{ url?: string; b64_json?: string }>;
    error?: { message?: string } | string;
  } | null;

  if (!resp.ok) {
    const err =
      typeof body?.error === "string"
        ? body.error
        : body?.error?.message || `image API ${resp.status}`;
    return { ok: false, error: err };
  }

  const item = body?.data?.[0];
  if (item?.url) return { ok: true, url: item.url, format: "url" };
  if (item?.b64_json) {
    return { ok: true, url: toDataUrl(item.b64_json), format: "b64" };
  }
  return { ok: false, error: "image API returned no url or base64" };
}

/**
 * generate_image tool implementation.
 * POST https://api.x.ai/v1/images/generations with the existing XAI_API_KEY
 * in the Authorization header. Returns a hosted URL, or a data URL if the
 * provider sent base64.
 */
export async function generateImageFromPrompt(
  apiKey: string,
  prompt: string,
): Promise<GenerateImageResult> {
  const trimmed = prompt.trim().slice(0, 4000);
  if (!trimmed) return { ok: false, error: "prompt is required" };

  let last: GenerateImageResult = { ok: false, error: "Image generation failed" };
  for (const model of IMAGE_MODELS) {
    const viaUrl = await requestImage(apiKey, model, trimmed, "url");
    if (viaUrl.ok) return viaUrl;
    last = viaUrl;
    if (isModelError(viaUrl.error)) continue;
    const viaB64 = await requestImage(apiKey, model, trimmed, "b64_json");
    if (viaB64.ok) return viaB64;
    last = viaB64;
    if (!isModelError(viaB64.error)) return last;
  }
  return last;
}

/** True when the user is asking RvGrok to create a picture (not analyze a photo). */
export function wantsGeneratedImage(text: string): boolean {
  const t = text.toLowerCase();
  if (
    /\b(generat(e|ed|ing)|create|make|draw|render)\b[\s\S]{0,48}\b(image|picture|photo|illustration|drawing|artwork|poster|graphic)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (/\b(illustrate|visualize|sketch)\b/.test(t)) return true;
  if (/\bdraw (me|a|an|the)\b/.test(t)) return true;
  if (/\bpicture of (a|an|my|this|the)\b/.test(t)) return true;
  return false;
}

/**
 * grok-4.5 with tool_choice=auto often dumps a fake tool-call JSON blob into
 * message.content instead of returning structured tool_calls. Recover the prompt.
 */
export function parseGenerateImagePromptFromContent(
  content: string,
): string | null {
  const t = content.trim();
  if (!t) return null;
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const blobs = [fenced?.[1], t].filter(Boolean) as string[];
  for (const blob of blobs) {
    const start = blob.indexOf("{");
    const end = blob.lastIndexOf("}");
    if (start < 0 || end <= start) continue;
    try {
      const obj = JSON.parse(blob.slice(start, end + 1)) as {
        name?: string;
        arguments?: { prompt?: string } | string;
        prompt?: string;
      };
      const args =
        typeof obj.arguments === "string"
          ? (JSON.parse(obj.arguments) as { prompt?: string })
          : obj.arguments;
      const prompt = String(args?.prompt || obj.prompt || "").trim();
      if (!prompt) continue;
      if (
        obj.name === "generate_image" ||
        (obj.prompt && Object.keys(obj).length <= 3)
      ) {
        return prompt.slice(0, 4000);
      }
    } catch {
      /* next blob */
    }
  }
  return null;
}

export const GENERATE_IMAGE_TOOL = {
  type: "function" as const,
  function: {
    name: "generate_image",
    description:
      "Generate an image from a text prompt using the image API. Returns an image URL or base64. Call this when the user asks you to generate, draw, illustrate, sketch, or visualize something.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "Detailed visual description of the image to generate. Include subject, setting, style, and lighting.",
        },
      },
      required: ["prompt"],
    },
  },
};
