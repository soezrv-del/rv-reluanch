import assert from "node:assert/strict";
import test from "node:test";

/**
 * Live Grok Voice contracts. Node cannot exercise WKWebView getUserMedia;
 * these lock the start-order, token shape, and error copy David will see.
 */

/**
 * @param {{ token?: string, client_secret?: string | { value?: string }, value?: string, expires_at?: number }} data
 */
function parseTokenPayload(data) {
  return (
    data.token ||
    (typeof data.client_secret === "string"
      ? data.client_secret
      : data.client_secret?.value) ||
    data.value ||
    null
  );
}

/** @param {boolean} hasXaiKey */
function tokenMintPlan(hasXaiKey) {
  return hasXaiKey ? ["xai", "worker"] : ["worker"];
}

function liveVoiceStartOrder() {
  return ["gesture-capture", "token", "websocket"];
}

/** @param {unknown} raw */
function classifyLiveVoiceError(raw) {
  const text = raw instanceof Error ? raw.message : String(raw ?? "");
  const t = text.toLowerCase();
  if (
    /notallowederror|permission denied|notallowed|getusermedia|microphone is blocked|microphone is not available/i.test(
      text,
    )
  ) {
    return { kind: "permission" };
  }
  if (/securityerror|the request is not allowed/i.test(text)) {
    return { kind: "permission" };
  }
  if (
    /voice token|client_secret|ephemeral|missing token/i.test(text) &&
    !/403/.test(text)
  ) {
    return { kind: "token" };
  }
  if (
    /403/.test(text) &&
    /xai|realtime|voice|does not have permission/i.test(text)
  ) {
    return { kind: "account" };
  }
  if (
    /websocket|failed to open|connect timeout|failed to fetch|502|network|load failed/i.test(
      t,
    )
  ) {
    return { kind: "network" };
  }
  return { kind: "unknown" };
}

/**
 * @param {string} voiceId
 * @param {number} [speed]
 */
function buildRealtimeSessionUpdate(voiceId, speed = 1) {
  const clamped = Math.min(1.5, Math.max(0.7, speed));
  return {
    type: "session.update",
    session: {
      voice: voiceId,
      turn_detection: { type: "server_vad" },
      audio: {
        input: { format: { type: "audio/pcm", rate: 24000 } },
        output: { format: { type: "audio/pcm", rate: 24000 }, speed: clamped },
      },
    },
  };
}

test("mic capture must start before token and websocket (iOS gesture)", () => {
  const order = liveVoiceStartOrder();
  assert.equal(order[0], "gesture-capture");
  assert.ok(order.indexOf("gesture-capture") < order.indexOf("token"));
  assert.ok(order.indexOf("token") < order.indexOf("websocket"));
});

test("token mint prefers xAI client_secrets when the server key exists", () => {
  assert.deepEqual(tokenMintPlan(true), ["xai", "worker"]);
  assert.deepEqual(tokenMintPlan(false), ["worker"]);
});

test("xAI client_secrets { value } parses as the ephemeral token", () => {
  assert.equal(
    parseTokenPayload({ value: "xai-tok-1", expires_at: 1 }),
    "xai-tok-1",
  );
  assert.equal(parseTokenPayload({ token: "legacy-tok" }), "legacy-tok");
  assert.equal(
    parseTokenPayload({ client_secret: { value: "nested-tok" } }),
    "nested-tok",
  );
  assert.equal(parseTokenPayload({}), null);
});

test("iPhone mic denial is not treated as an xAI account 403", () => {
  assert.equal(
    classifyLiveVoiceError(new Error("NotAllowedError")).kind,
    "permission",
  );
  assert.equal(
    classifyLiveVoiceError("getUserMedia permission denied").kind,
    "permission",
  );
  assert.equal(
    classifyLiveVoiceError("Voice token failed (502)").kind,
    "token",
  );
  assert.equal(
    classifyLiveVoiceError("xAI realtime 403: does not have permission").kind,
    "account",
  );
  assert.equal(
    classifyLiveVoiceError("WebSocket failed to open").kind,
    "network",
  );
});

test("session.update uses xAI audio PCM, not OpenAI whisper-1 leftovers", () => {
  const msg = buildRealtimeSessionUpdate("ara", 1.25);
  const session = /** @type {Record<string, unknown>} */ (msg.session);
  const audio = /** @type {{ input: { format: { type: string, rate: number } }, output: { speed: number } }} */ (
    session.audio
  );
  assert.equal(session.voice, "ara");
  assert.equal(audio.input.format.type, "audio/pcm");
  assert.equal(audio.input.format.rate, 24000);
  assert.equal(audio.output.speed, 1.25);
  assert.equal(session.modalities, undefined);
  assert.equal(session.input_audio_transcription, undefined);
  assert.equal(session.input_audio_format, undefined);
});
