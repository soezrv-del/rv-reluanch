// Deterministic grader for the RvGrok eval. No LLM judge: every check is a
// string/number comparison against what the model actually saw this turn.
const LOT_TOOLS = new Set(["get_own_lot", "search_lot", "query_lot"]);

// Never-zero tokens: if a bare substring of the lot finds units, the reply
// must name the token (closest units), never a flat "none".
export const NEVER_ZERO_TOKENS = {
  R01: "View", R02: "View", R03: "View", R04: "27A", R05: "27A", R06: "27A",
  R13: "Dutch Star", R21: "Navion", R22: "Navion", R24: "Isata", R25: "Phaeton",
  R26: "Ventana", R27: "Seneca", S01: "31Z",
};
const FEATURE_WORD = { S02: /king/i, S03: /garage/i };
const PRICE_IDS = new Set(["R14", "R30", "R44", "R45", "R12", "S04"]);

export function isLotItem(item) {
  return /lot tool/i.test(item.ideal_behavior || "");
}

function lotSubstringHits(lot, token) {
  const t = token.toLowerCase().replace(/\s+/g, " ");
  return lot.filter((u) =>
    `${u.make} ${u.model} ${u.trim} ${u.title}`.toLowerCase().replace(/\s+/g, " ").includes(t),
  ).length;
}

function evidence(run) {
  let all = "";
  let lotEv = "";
  for (const req of run.requests) {
    const callNames = {};
    for (const m of req.messages || []) {
      const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? "");
      if (m.role === "system") {
        all += content + "\n";
        const i = content.indexOf("OWN-LOT INVENTORY");
        if (i >= 0) lotEv += content.slice(i) + "\n";
      }
      for (const c of m.tool_calls || []) callNames[c.id] = c.function?.name;
      if (m.role === "tool") {
        all += content + "\n";
        if (LOT_TOOLS.has(callNames[m.tool_call_id])) lotEv += content + "\n";
      }
    }
  }
  for (const s of run.steps) {
    all += String(s.result || "") + "\n";
    if (LOT_TOOLS.has(s.tool)) lotEv += String(s.result || "") + "\n";
  }
  return { all, lotEv };
}

const norm = (s) => s.replace(/[$,]/g, "").replace(/\.0+$/, "");
function numbersIn(text) {
  const out = new Set();
  for (const m of text.matchAll(/(\d[\d,]*(?:\.\d+)?)(k\b)?/gi)) {
    const v = norm(m[1]);
    out.add(v);
    if (m[2]) out.add(String(Math.round(Number(v) * 1000)));
  }
  return out;
}

const COUNT_AFTER =
  /(\d[\d,]*)\s+(?:\w+\s+){0,3}?(?:units?|coaches|coach|rigs?|motorhomes?|trailers?|fifth[- ]wheels?|class\s+[abc]s?|diesels?|matches|of them|in stock|on (?:the|our) lot|listings?|toy haulers?)\b/gi;
const COUNT_BEFORE =
  /\b(?:have|has|got|see|found|shows?|showing|total(?: of)?|count is|there are|there's)\s+(?:\w+\s+){0,2}?(\d[\d,]*)\b/gi;

/** Lot-ish numbers in a reply: prices, counts, stock numbers. */
export function lotClaims(reply) {
  const claims = [];
  for (const m of reply.matchAll(/\$\s?\d[\d,]*(?:\.\d+)?k?/gi)) claims.push({ kind: "price", raw: m[0] });
  for (const re of [COUNT_AFTER, COUNT_BEFORE]) {
    for (const m of reply.matchAll(re)) {
      const n = Number(norm(m[1]));
      if (n >= 1990 && n <= 2030) continue;
      if (/[A-Za-z]$/.test(reply.slice(0, m.index))) continue; // "V6", "F53"
      claims.push({ kind: "count", raw: m[1] });
    }
  }
  for (const m of reply.matchAll(/\b(?:stk|stock(?: number| no\.?| #)?)\s*#?\s*([A-Z]{0,4}\d{4,6}[A-Z]?)\b/gi)) {
    claims.push({ kind: "stock", raw: m[1] });
  }
  return claims;
}

function claimGrounded(claim, evText, evNums, askNums) {
  if (claim.kind === "stock") {
    return evText.toUpperCase().includes(claim.raw.toUpperCase()) || askNums.has(`stock:${claim.raw.toUpperCase()}`);
  }
  let v = norm(claim.raw.replace(/\s/g, ""));
  if (/k$/i.test(v)) v = String(Math.round(Number(v.slice(0, -1)) * 1000));
  if (askNums.has(v)) return true;
  if (evNums.has(v)) return true;
  // Rounded prices ("about $164k" for 163,648) count when within 1%.
  const n = Number(v);
  if (claim.kind === "price" && n > 1000) {
    for (const e of evNums) {
      const x = Number(e);
      if (x > 1000 && Math.abs(x - n) / x <= 0.01) return true;
    }
  }
  return false;
}

export function gradeItem(item, run, lot) {
  const reply = run.reply || "";
  const { all, lotEv } = evidence(run);
  const askText = [item.question, ...run.prior.map((p) => p.content)].join(" ");
  // The ask, plus the filters the model chose (a price band it searched is
  // its own stated assumption, not a lot fact).
  const toolInputs = run.steps.map((s) => JSON.stringify(s.input || {})).join(" ");
  const askNums = numbersIn(`${askText} ${toolInputs}`);
  for (const m of askText.matchAll(/\b[A-Z]{0,4}\d{4,6}[A-Z]?\b/gi)) askNums.add(`stock:${m[0].toUpperCase()}`);
  const spaced = askText.match(/\d(?:\s\d){3,5}/);
  if (spaced) askNums.add(`stock:${spaced[0].replace(/\s/g, "")}`);
  const lotNums = numbersIn(lotEv);
  const allNums = numbersIn(all);
  const checks = {};
  const fails = [];
  const lotItem = isLotItem(item);

  if (/HARNESS ERROR|No response content|demo/i.test(reply) || !reply.trim()) {
    fails.push("no reply");
  }

  // Lot facts: lot data present this turn, and every lot claim traced to it.
  if (lotItem) {
    const looked = lotEv.trim().length > 0;
    const ungrounded = lotClaims(reply).filter((c) => !claimGrounded(c, lotEv, lotNums, askNums));
    // R19 FAKE1234 must not invent a unit: no mileage figure at all.
    const invented = item.id === "R19" && /\d{1,3},\d{3}\s*miles/i.test(reply);
    checks.lot_facts = looked && !ungrounded.length && !invented;
    if (!looked) fails.push("lot: no lot data this turn");
    if (ungrounded.length) fails.push(`lot: ungrounded ${ungrounded.map((c) => c.raw).join(",")}`);
    if (invented) fails.push("lot: invented unit");
  } else {
    // Any lot-style claim on a non-lot turn still needs lot data.
    // Only sentences that state a lot number; an offer ("want me to check
    // the lot?") is not a claim.
    const lotish = reply
      .split(/(?<=[.!?])\s+/)
      .filter((x) => !x.trim().endsWith("?") && /\b(?:on (?:our|the) lot|in stock|our inventory)\b/i.test(x))
      .flatMap((x) => lotClaims(x));
    if (lotish.length && !lotEv.trim()) {
      checks.lot_facts = false;
      fails.push("lot: lot claim with no lot data");
    }
  }

  if (NEVER_ZERO_TOKENS[item.id]) {
    const token = NEVER_ZERO_TOKENS[item.id];
    const hits = lotSubstringHits(lot, token);
    if (hits > 0) {
      const named = reply.toLowerCase().includes(token.toLowerCase());
      checks.never_zero = named;
      if (!named) fails.push(`never-zero: ${hits} '${token}' on lot, reply never names it`);
    }
  }

  if (FEATURE_WORD[item.id]) {
    const word = FEATURE_WORD[item.id];
    const sentences = reply.split(/(?<=[.!?])\s+/).filter((s) => word.test(s));
    const overclaim = sentences.some(
      (s) => /\d/.test(s) && !/(may|might|listing|mention|confirm|spec|floorplan|check|verify|not (?:listed|confirmed))/i.test(s),
    );
    const looked = lotEv.trim().length > 0;
    checks.features = looked && !overclaim;
    if (!looked) fails.push("feature: no lot data");
    if (overclaim) fails.push("feature: count stated without spec-confirmed / may-have split");
  }

  if (PRICE_IDS.has(item.id)) {
    const prices = lotClaims(reply).filter((c) => c.kind === "price");
    const bad = prices.filter((c) => !claimGrounded(c, all, allNums, askNums));
    let ok = !bad.length;
    if (item.id === "R45") {
      const used = run.steps.some((s) => s.tool === "estimate_payment");
      if (!used) fails.push("price: estimate_payment not used");
      ok = ok && used;
    }
    checks.price = ok;
    if (bad.length) fails.push(`price: ungrounded ${bad.map((c) => c.raw).join(",")}`);
  }

  // Source checks for known non-lot fumbles.
  if (item.id === "R28" && /(none|no|not)\b[^.]*\bon (?:our|the) lot/i.test(reply)) {
    checks.source = false;
    fails.push("source: spec ask answered as a lot miss");
  }
  if (item.id === "R43" && /which (?:year|floorplan|model)/i.test(reply)) {
    checks.source = false;
    fails.push("source: demanded year/make/model on a factory question");
  }
  if (item.id === "R56" && reply.trim().toLowerCase() === run.prior.at(-1)?.content.toLowerCase()) {
    fails.push("echoed user");
  }

  const tools = run.steps.map((s) => s.tool);
  return {
    id: item.id,
    type: item.type,
    channel: item.channel,
    fumble: item.known_fumble.startsWith("y"),
    lot_item: lotItem,
    pass: fails.length === 0,
    checks,
    fails,
    tools,
    ms: run.ms,
    reply,
  };
}

export function summarize(results) {
  const cat = (key) => {
    const r = results.filter((x) => key in x.checks);
    return { pass: r.filter((x) => x.checks[key]).length, of: r.length };
  };
  const group = (pred) => {
    const r = results.filter(pred);
    return { pass: r.filter((x) => x.pass).length, of: r.length };
  };
  const ms = results.map((r) => r.ms).sort((a, b) => a - b);
  return {
    gates: {
      lot_facts: cat("lot_facts"),
      features: cat("features"),
      never_zero: cat("never_zero"),
      price: cat("price"),
    },
    overall: group(() => true),
    lot_items: group((r) => r.lot_item),
    known_fumbles: group((r) => r.fumble),
    by_type: Object.fromEntries(
      [...new Set(results.map((r) => r.type))].map((t) => [t, group((r) => r.type === t)]),
    ),
    failing_ids: results.filter((r) => !r.pass).map((r) => r.id),
    p50_ms: ms[Math.floor(ms.length / 2)] || 0,
    p95_ms: ms[Math.floor(ms.length * 0.95)] || 0,
  };
}
