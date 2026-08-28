# RvGrok — Live web cross-reference for technical answers

**Date:** 2026-08-20  
**Goal:** Questions like *“Where is the battery disconnect on a 2016 Newmar Ventana?”* must hit live web search, not model memory alone.

## Problem

`motorhome-ai-chat` logged “Using Grok with real-time web search” but **never enabled search**:

- No `web_search` tool
- No `search_parameters`
- Forced `response_format: json_object` on every chat call (bad for free-form answers)

## Fix

| File | Change |
|------|--------|
| `supabase/functions/_shared/grok-client.ts` | `callGrokWithWebSearch()` via `/v1/responses` + `tools: [{ type: "web_search" }]`; `callGrokChatWithSearch()` fallback; `needsWebCrossReference()` detector; `jsonMode` only when requested |
| `supabase/functions/motorhome-ai-chat/index.ts` | Technical queries → web search path; system rules require cross-check + sources; casual chat uses `search_parameters.mode: auto` |

### Detection triggers (examples)

`where is`, `how do I`, battery disconnect, fuse panel, converter, tanks, propane, awning, leveling jacks, slide-out, wiring, owner’s manual, troubleshoot, recall, NHTSA, GVWR, oil type, reset, bypass, …

## Install

1. Copy:
   - `grok-client.ts` → `supabase/functions/_shared/grok-client.ts`
   - `motorhome-ai-chat.index.ts` → `supabase/functions/motorhome-ai-chat/index.ts`
2. Deploy:
   ```bash
   supabase functions deploy motorhome-ai-chat
   ```
   (`_shared` deploys with the function.)
3. Confirm `XAI_API_KEY` is set in Edge secrets and the key has access to **Responses API** + **web_search**.

## Smoke tests

| Ask | Expect |
|-----|--------|
| Where is the battery disconnect on a 2016 Newmar Ventana? | Web-search path in logs; location guidance + sources / uncertainty label |
| How do I winterize a Class A diesel? | Procedure with web cross-check |
| What’s the HP on a 2024 Newmar Ventana? | May use auto search or catalog knowledge; year-true answer |
| Tell me your story | No forced search; Our Story answer |

## Logs to watch

```
[CHAT] 🔍 Technical query → live web_search cross-reference
[GROK] Web-search path model=grok-4-turbo
[CHAT] ✓ Web-search answer received
```

Fallback if Responses API fails:

```
[CHAT] Responses web_search failed, trying chat search_parameters
```
