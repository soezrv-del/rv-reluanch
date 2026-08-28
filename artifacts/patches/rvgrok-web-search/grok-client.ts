/**
 * Grok API Client for RV MAX
 * Provides access to xAI's Grok models with built-in web search capabilities
 * Enhanced with CloudFlare resilience: retry logic, user-agent rotation, rate limiting
 */

const GROK_API_BASE_URL = 'https://api.x.ai/v1';

// ENHANCED: Expanded User-Agent pool (5 → 12) to avoid CloudFlare fingerprinting
const USER_AGENTS = [
  // Chrome variants
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  // Firefox variants
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Safari variants
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  // Edge variants
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  // Brave (Chrome-based)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/1.61',
];

// Get random User-Agent to vary requests
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Request queue to enforce spacing between calls
let lastRequestTime = 0;
const MIN_REQUEST_SPACING_MS = 300; // 300ms between requests

async function enforceRequestSpacing(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_SPACING_MS) {
    const waitTime = MIN_REQUEST_SPACING_MS - timeSinceLastRequest;
    console.log(`[GROK] ⏱️ Rate spacing: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokChatRequest {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
  /** Force JSON object mode (spec/pricing helpers only). Off by default for chat. */
  jsonMode?: boolean;
  /** Live search on chat completions (legacy path; prefer callGrokWithWebSearch). */
  searchParameters?: {
    mode?: 'off' | 'on' | 'auto';
    return_citations?: boolean;
    max_search_results?: number;
    sources?: Array<{ type: string; [k: string]: unknown }>;
  };
}

export interface GrokChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Available Grok Models (Updated July 2026)
 * - grok-4-mini-fast: Fastest, lowest cost — best for RV lookups, quick queries, chat responses
 * - grok-4-turbo: High-capability turbo model — best for deep analysis, appraisals, complex reasoning
 * - grok-4: Most capable flagship model — use sparingly for maximum accuracy
 */
export const GROK_MODELS = {
  FAST: 'grok-4-mini-fast',
  STANDARD: 'grok-4-turbo',
  FLAGSHIP: 'grok-4',
} as const;

/**
 * Call Grok API for chat completions
 */
/**
 * Enhanced Grok API call with CloudFlare resilience:
 * - Exponential backoff retry (1s → 2s → 4s → 8s)
 * - User-Agent rotation to avoid fingerprinting
 * - Request spacing to prevent rate limiting
 * - Graceful error handling with detailed logging
 */
export async function callGrok(request: GrokChatRequest): Promise<GrokChatResponse> {
  const apiKey = Deno.env.get('XAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('XAI_API_KEY not configured in backend secrets');
  }

  console.log(`[GROK] Calling model: ${request.model}`);
  console.log(`[GROK] Messages count: ${request.messages.length}`);
  
  // Enforce request spacing to prevent CloudFlare rate limits
  await enforceRequestSpacing();
  
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Rotate User-Agent per request
      const userAgent = getRandomUserAgent();
      
      // ENHANCED: Additional browser-like headers for CloudFlare realism
      const acceptLanguages = ['en-US,en;q=0.9', 'en-GB,en;q=0.9', 'en;q=0.8'];
      const randomAcceptLanguage = acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)];
      
      const response = await fetch(`${GROK_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': userAgent,
          'Accept': 'application/json',
          'Accept-Language': randomAcceptLanguage,
          'Accept-Encoding': 'gzip, deflate, br',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
        },
        body: JSON.stringify({
          model: request.model || GROK_MODELS.FAST,
          messages: request.messages,
          temperature: request.temperature ?? 0.3, // LOWERED: 0.3 for factual RV data
          max_tokens: request.max_tokens ?? 2000,
          stream: request.stream ?? false,
          // JSON mode only when explicitly requested (pricing/spec helpers)
          ...(request.jsonMode ? { response_format: { type: "json_object" } } : {}),
          ...(request.tools && { tools: request.tools }),
          ...(request.searchParameters
            ? { search_parameters: request.searchParameters }
            : {}),
        }),
      });

      // Handle CloudFlare/rate limit errors with exponential backoff + jitter
      if (response.status === 429 || response.status === 403 || response.status === 503) {
        const retryAfter = response.headers.get('Retry-After');
        const baseWait = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s
        // ENHANCED: Add ±200ms jitter to prevent thundering herd
        const jitter = Math.random() * 400 - 200; // Random -200ms to +200ms
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.max(0, baseWait + jitter);
        
        const errorType = response.status === 429 ? 'Rate Limit' : 
                         response.status === 403 ? 'CloudFlare Block' : 
                         'Service Unavailable';
        
        // ENHANCED: More detailed retry logging
        console.warn(`[GROK] ⏳ ${errorType} (status: ${response.status}) - retry ${attempt + 1}/${maxRetries} in ${Math.round(waitTime)}ms (base: ${baseWait}ms, jitter: ${Math.round(jitter)}ms)`);
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Retry
        } else {
          throw new Error(`CloudFlare: ${errorType} - exceeded max retries. Try again in a few minutes.`);
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        // ENHANCED: Detailed error logging with status code and attempt number
        console.error(`[GROK] ❌ API Error (attempt ${attempt + 1}/${maxRetries}):`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText.substring(0, 200),
          userAgent: userAgent.substring(0, 50) + '...',
        });
        throw new Error(`Grok API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as GrokChatResponse;
      
      console.log(`[GROK] ✓ Response received`);
      console.log(`[GROK] Tokens used: ${data.usage.total_tokens} (input: ${data.usage.prompt_tokens}, output: ${data.usage.completion_tokens})`);
      
      return data;
      
    } catch (error) {
      lastError = error as Error;
      
      // Only retry on network errors or 5xx server errors
      if (attempt < maxRetries - 1 && (error.message.includes('500') || error.message.includes('503') || error.message.includes('fetch'))) {
        const baseWait = Math.pow(2, attempt) * 1000;
        // ENHANCED: Add jitter to error retries too
        const jitter = Math.random() * 400 - 200;
        const waitTime = Math.max(0, baseWait + jitter);
        console.warn(`[GROK] ⏳ Error occurred - retry ${attempt + 1}/${maxRetries} in ${Math.round(waitTime)}ms (error: ${error.message.substring(0, 50)})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw error; // Re-throw if not retryable or max attempts reached
    }
  }
  
  throw lastError || new Error('Grok API call failed after retries');
}

/**
 * Simplified helper for single-turn RV queries with web search context
 */
/**
 * CRITICAL: Estimate token count to prevent >120k context errors
 * Rough estimate: ~4 chars = 1 token
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function askGrokAboutRV(
  query: string,
  systemPrompt?: string
): Promise<string> {
  const messages: GrokMessage[] = [];
  
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }
  
  messages.push({
    role: 'user',
    content: query,
  });

  // CRITICAL FIX: Estimate context size to avoid >120k token disruption
  const totalContent = systemPrompt + query;
  const estimatedTokens = estimateTokens(totalContent);
  
  console.log(`[GROK] Estimated prompt tokens: ~${estimatedTokens.toLocaleString()}`);
  
  // GUARD: If prompt alone is >100k tokens, truncate systemPrompt
  if (estimatedTokens > 100000) {
    console.warn('[GROK] ⚠️ Prompt >100k tokens - truncating system prompt to prevent API disruption');
    const maxSystemPromptLength = 50000; // ~12.5k tokens
    if (systemPrompt && systemPrompt.length > maxSystemPromptLength) {
      messages[0].content = systemPrompt.substring(0, maxSystemPromptLength) + '\n\n[Truncated due to length]';
      console.log('[GROK] System prompt truncated from', systemPrompt.length, 'to', maxSystemPromptLength, 'chars');
    }
  }

  const response = await callGrok({
    model: GROK_MODELS.FAST,
    messages,
    temperature: 0.7,
    max_tokens: 3000,
    jsonMode: true, // pricing/review/spec helpers expect JSON
  });

  return response.choices[0].message.content;
}

/**
 * Get current market pricing for an RV using Grok's web search
 * SIMPLIFIED: Reduced prompt size to avoid >120k token disruption
 */
export async function getRVMarketPricing(
  year: number,
  make: string,
  model: string
): Promise<{ min: number; max: number; average: number; sources: string[] }> {
  // SIMPLIFIED PROMPT (50% smaller)
  const systemPrompt = `RV pricing expert. Return JSON only:
{
  "min": <lowest price>,
  "max": <highest price>,
  "average": <calculated average>,
  "sources": ["source1", "source2"]
}`;

  const query = `Find market pricing for ${year} ${make} ${model}. Search RVTrader, Camping World. Return JSON with min/max/average prices and sources.`;

  try {
    const response = await askGrokAboutRV(query, systemPrompt);
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const pricing = JSON.parse(cleanResponse);
    console.log('[GROK] Market pricing found:', pricing);
    return pricing;
  } catch (error) {
    console.error('[GROK] Error getting market pricing:', error);
    return {
      min: 0,
      max: 0,
      average: 0,
      sources: ['Pricing unavailable - using estimates'],
    };
  }
}

/**
 * Get real owner reviews and feedback from X/Twitter and RV forums
 * SIMPLIFIED: Reduced prompt size to avoid >120k token disruption
 */
export async function getRVOwnerReviews(
  year: number,
  make: string,
  model: string
): Promise<{ summary: string; positives: string[]; negatives: string[]; sources: string[] }> {
  // SIMPLIFIED PROMPT (60% smaller)
  const systemPrompt = `RV review analyst. Return JSON only:
{
  "summary": "<2-3 sentences>",
  "positives": ["<point 1>", "<point 2>"],
  "negatives": ["<point 1>", "<point 2>"],
  "sources": ["<source1>"]
}`;

  const query = `Find owner reviews for ${year} ${make} ${model}. Search X/Twitter, RV.net, Reddit. Summarize reliability, quality, value. Return JSON.`;

  try {
    const response = await askGrokAboutRV(query, systemPrompt);
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const reviews = JSON.parse(cleanResponse);
    console.log('[GROK] Owner reviews found from:', reviews.sources);
    return reviews;
  } catch (error) {
    console.error('[GROK] Error getting owner reviews:', error);
    return {
      summary: 'Unable to retrieve owner reviews at this time.',
      positives: [],
      negatives: [],
      sources: [],
    };
  }
}

/**
 * NEW: Get REAL manufacturer specifications from official sources
 * SIMPLIFIED: Reduced prompt size to avoid >120k token disruption
 */
export async function getRVManufacturerSpecs(
  year: number,
  make: string,
  model: string
): Promise<{
  found: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  specs: {
    length?: string;
    width?: string;
    height?: string;
    dryWeight?: string;
    gvwr?: string;
    freshWater?: string;
    grayWater?: string;
    blackWater?: string;
    fuelCapacity?: string;
    sleeps?: number;
    engine?: string;
    chassis?: string;
    [key: string]: any;
  };
  sources: string[];
}> {
  // SIMPLIFIED PROMPT (70% smaller)
  const systemPrompt = `RV spec researcher. Return JSON only:
{
  "found": true/false,
  "confidence": "HIGH"|"MEDIUM"|"LOW",
  "specs": {"length": "XX ft", "gvwr": "XXXXX lbs", "sleeps": N, ...},
  "sources": ["source1"]
}
HIGH=official sources, MEDIUM=partial, LOW=none. Return null for unknown specs.`;

  const query = `Find specs for ${year} ${make} ${model}. Search ${make} website, dealers, NADA. Return JSON with length, gvwr, tanks, engine, sleeps, sources. No guessing - null if unknown.`;

  try {
    const response = await askGrokAboutRV(query, systemPrompt);
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanResponse);
    if (!result.confidence) result.confidence = result.found ? 'MEDIUM' : 'LOW';
    console.log(`[GROK] Manufacturer specs: ${result.found ? '✅ FOUND' : '❌ NOT FOUND'} (confidence: ${result.confidence})`);
    if (result.sources && result.sources.length > 0) console.log('[GROK] Sources:', result.sources.join(', '));
    return result;
  } catch (error) {
    console.error('[GROK] Error getting manufacturer specs:', error);
    return { found: false, confidence: 'LOW', specs: {}, sources: ['Error: ' + (error.message || 'Unknown error')] };
  }
}

/**
 * NEW: Verify RV model existence before generating data
 * SIMPLIFIED: Reduced prompt size to avoid >120k token disruption
 */
export async function verifyRVModelExists(
  year: number,
  make: string,
  model: string
): Promise<{
  exists: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string[];
  suggestion?: string;
}> {
  // SIMPLIFIED PROMPT (65% smaller)
  const systemPrompt = `RV model verifier. Return JSON only:
{
  "exists": true/false,
  "confidence": "HIGH"|"MEDIUM"|"LOW",
  "evidence": ["source1", "source2"],
  "suggestion": "alternate model" or null
}
HIGH=official catalogs/listings, MEDIUM=forums, LOW=none`;

  const query = `Verify ${year} ${make} ${model} exists. Search ${make} catalogs, dealer listings, forums. Check for misspellings/year errors. Return JSON.`;

  try {
    const response = await askGrokAboutRV(query, systemPrompt);
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanResponse);
    console.log('[GROK] Model verification:', result.exists ? '✅ EXISTS' : '❌ NOT FOUND', `(${result.confidence} confidence)`);
    if (result.evidence && result.evidence.length > 0) console.log('[GROK] Evidence:', result.evidence.join(', '));
    if (result.suggestion) console.log('[GROK] Did you mean:', result.suggestion);
    return result;
  } catch (error) {
    console.error('[GROK] Error verifying model:', error);
    return { exists: true, confidence: 'LOW', evidence: ['Verification service unavailable'] };
  }
}

/**
 * NEW: Get REAL dealer inventory photos and descriptions
 * SIMPLIFIED: Reduced prompt size to avoid >120k token disruption
 */
export async function getRVDealerInventory(
  year: number,
  make: string,
  model: string
): Promise<{
  found: boolean;
  listings: Array<{
    dealerName: string;
    price: number;
    mileage?: number;
    location: string;
    description: string;
    url: string;
  }>;
}> {
  // SIMPLIFIED PROMPT (60% smaller)
  const systemPrompt = `RV inventory researcher. Return JSON only:
{
  "found": true/false,
  "listings": [{"dealerName": "name", "price": N, "location": "City, ST", "description": "text", "url": "url"}]
}
Return up to 5 listings. If none, set found:false.`;

  const query = `Find dealer listings for ${year} ${make} ${model}. Search RVTrader, Camping World. Return JSON with prices, locations, URLs.`;

  try {
    const response = await askGrokAboutRV(query, systemPrompt);
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanResponse);
    if (result.found && result.listings.length > 0) {
      console.log('[GROK] ✅ Found', result.listings.length, 'dealer listings');
    } else {
      console.log('[GROK] ⚠️ No dealer inventory found');
    }
    return result;
  } catch (error) {
    console.error('[GROK] Error getting dealer inventory:', error);
    return { found: false, listings: [] };
  }
}


/**
 * Detect questions that need live web cross-reference
 * (locations, procedures, wiring, recalls currency, model-year specifics).
 */
export function needsWebCrossReference(text: string): boolean {
  const t = (text || '').toLowerCase();
  if (!t.trim()) return false;
  const patterns = [
    /\bwhere (is|are|do|does|can)\b/,
    /\bhow (do|to|can|does)\b/,
    /\blocate\b/,
    /\blocation of\b/,
    /\bbattery disconnect\b/,
    /\bdisconnect switch\b/,
    /\bfuse (box|panel|block)\b/,
    /\bbreaker (panel|box)\b/,
    /\bwater pump\b/,
    /\bconverter\b/,
    /\binverter\b/,
    /\bcity water\b/,
    /\bfresh water tank\b/,
    /\bblack tank\b/,
    /\bgray tank\b|\bgrey tank\b/,
    /\bpropano?\b/,
    /\bawning\b/,
    /\bleveling (jacks|system)\b/,
    /\bslide[- ]?out\b/,
    /\bwiring\b/,
    /\bschema(tic)?\b/,
    /\bowner.?s? manual\b/,
    /\bservice manual\b/,
    /\btroubleshoot\b/,
    /\brecall\b/,
    /\bTSB\b/,
    /\bNHTSA\b/,
    /\bfloorplan\b/,
    /\bgvwr\b|\bgcwr\b|\buvw\b/,
    /\btorque\b/,
    /\boil (type|capacity|filter)\b/,
    /\bfilter location\b/,
    /\bresets?\b/,
    /\bbypass\b/,
  ];
  return patterns.some((re) => re.test(t));
}

/**
 * Extract assistant text from Responses API payload (web_search path).
 */
function extractResponsesText(data: any): string {
  if (!data) return '';
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts: string[] = [];
  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    if (!item) continue;
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const c of item.content) {
        if (c?.type === 'output_text' && c.text) parts.push(String(c.text));
        else if (c?.type === 'text' && c.text) parts.push(String(c.text));
        else if (typeof c?.text === 'string') parts.push(c.text);
      }
    } else if (typeof item.text === 'string') {
      parts.push(item.text);
    } else if (item.type === 'output_text' && item.text) {
      parts.push(String(item.text));
    }
  }
  if (parts.length) return parts.join('\n').trim();
  const choice = data.choices?.[0]?.message?.content;
  if (typeof choice === 'string') return choice.trim();
  return '';
}

function formatCitations(data: any): string {
  const cites: string[] = [];
  if (Array.isArray(data?.citations)) {
    for (const c of data.citations) {
      if (typeof c === 'string') cites.push(c);
      else if (c?.url) cites.push(String(c.url));
      else if (c?.web_citation?.url) cites.push(String(c.web_citation.url));
    }
  }
  if (Array.isArray(data?.sources)) {
    for (const s of data.sources) {
      if (typeof s === 'string') cites.push(s);
      else if (s?.url) cites.push(String(s.url));
    }
  }
  const uniq = [...new Set(cites.filter(Boolean))].slice(0, 6);
  if (!uniq.length) return '';
  return '\n\nSources:\n' + uniq.map((u, i) => `${i + 1}. ${u}`).join('\n');
}

/**
 * Agent path: /v1/responses + built-in web_search tool.
 * Use for technical / location / procedure questions so answers are
 * cross-checked against live web (forums, OEM, manuals), not memory alone.
 */
export async function callGrokWithWebSearch(opts: {
  messages: GrokMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<{ content: string; model: string }> {
  const apiKey = Deno.env.get('XAI_API_KEY');
  if (!apiKey) {
    throw new Error('XAI_API_KEY not configured in backend secrets');
  }

  const model = opts.model || GROK_MODELS.STANDARD;
  console.log(`[GROK] Web-search path model=${model}`);

  await enforceRequestSpacing();

  const input = opts.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const body = {
    model,
    input,
    tools: [{ type: 'web_search' }],
    temperature: opts.temperature ?? 0.2,
    max_output_tokens: opts.max_tokens ?? 3500,
  };

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const userAgent = getRandomUserAgent();
      const response = await fetch(`${GROK_API_BASE_URL}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': userAgent,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429 || response.status === 403 || response.status === 503) {
        const baseWait = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 400 - 200;
        const waitTime = Math.max(0, baseWait + jitter);
        console.warn(`[GROK] Web-search retry ${attempt + 1}/${maxRetries} in ${Math.round(waitTime)}ms (${response.status})`);
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }
        throw new Error(`Web search blocked (${response.status}) after retries`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GROK] Web-search API error:', response.status, errorText.substring(0, 300));
        throw new Error(`Grok web-search error (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      let content = extractResponsesText(data);
      const citeBlock = formatCitations(data);
      if (citeBlock && content && !/sources:/i.test(content)) {
        content = content + citeBlock;
      }
      if (!content) {
        throw new Error('Empty web-search response');
      }
      console.log(`[GROK] ✓ Web-search answer (${content.length} chars)`);
      return { content, model };
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1 && /fetch|500|503|Empty/i.test(String((error as Error).message))) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Grok web-search failed after retries');
}

/**
 * Chat Completions fallback with live search_parameters (mode: on).
 */
export async function callGrokChatWithSearch(
  messages: GrokMessage[],
  model?: string,
): Promise<string> {
  const response = await callGrok({
    model: model || GROK_MODELS.STANDARD,
    messages,
    temperature: 0.25,
    max_tokens: 3500,
    jsonMode: false,
    searchParameters: {
      mode: 'on',
      return_citations: true,
      max_search_results: 12,
      sources: [{ type: 'web' }, { type: 'x' }],
    },
  });
  return response.choices[0]?.message?.content || '';
}
