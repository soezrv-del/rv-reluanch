# RvGrok — Our Story + How to Use the App

**Date:** 2026-08-20  
**Target:** `supabase/functions/motorhome-ai-chat/index.ts` (system prompt)

## What this does

Teaches **RvGrok** to:

1. Tell **Our Story** (David on the dealer lot → “Carfax for Motorhomes” → Verified & True)
2. **Teach others how to use the app** (RvFacts · RvCal · RvTow · RvGrok · RvTrips · More)
3. Keep existing chat rules (one question at a time, year-true specs, no competitor name-drops)

## Install

1. Open your project’s Edge Function:
   `supabase/functions/motorhome-ai-chat/index.ts`
2. Replace the entire file with  
   `patches/rvgrok-story-and-guide/motorhome-ai-chat.index.ts`  
   **or** replace only the `systemPrompt` template string (from `let systemPrompt = \`` through the closing `` `; `` before `if (motorhomeContext)`).
3. Redeploy the function:
   ```bash
   supabase functions deploy motorhome-ai-chat
   ```
4. Smoke test in **RvGrok** tab:
   - “What’s your story?” / “Who built this?”
   - “How do I use this app?” / “What does each tab do?”
   - “How do I look up a 2024 Newmar Ventana?”

## Optional (web Build shell)

If your web shell uses `src/lib/rvgrok/prompts.ts` instead of this Edge Function, paste the same **OUR STORY** and **HOW TO USE THIS APP** blocks into `RV_SYSTEM_PROMPT` / `AGENT_SYSTEM_PROMPT`.

## Note on About screen

`app/about.tsx` currently emphasizes the RVMAX product narrative (problem → solution → AI orchestration). It does **not** yet include David’s dealer-lot origin story. Consider adding that hero paragraph under **Our Story** so the UI and RvGrok stay consistent.
