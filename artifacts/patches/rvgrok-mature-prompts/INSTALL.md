# RvGrok — accuracy / responsibility / maturity pack
Drop into `supabase/functions/motorhome-ai-chat/index.ts` (system string) and `_shared/grok-client.ts` (temps + models).
The XAI_API_KEY only authenticates. It does not store prompts.

## API settings (replace current)

| Path | Model | Temperature | Max tokens | Notes |
|---|---|---|---|---|
| Everyday chat | `grok-4-latest` or STANDARD (`grok-4-turbo`) | **0.2** | 3000 | Today: FAST + 0.5–0.7 — too loose |
| Tech / location / recall / year-specific | STANDARD + web_search | **0.15** | 3500 | Keep live search |
| Compare / live dossier | `grok-4-latest` | **0.1** | 4000 | Never FAST |
| Pricing / specs JSON helpers | STANDARD | **0.1** | 1500 | Today: FAST + **0.7** + jsonMode invents numbers |
| Voice | short voice instructions | 0.2 | — | Same rules, fewer words |

Do **not** fall back to Gemini for specs/recalls. If Grok fails, say so and keep catalog/year-band paint. Gemini ignores these rules.

Default in `callGrok` is `temperature ?? 0.3` and `model \|\| FAST`. Callers must pass explicit model + temp. Change `askGrokAboutRV` from 0.7 → 0.1.

## What to delete from the current system prompt

- Trophy / “CRITICAL MANUFACTURER KNOWLEDGE” Jayco–Entegra 2-year pitch (year-dependent; sounds like an ad)
- “Catch recalls dealers don’t mention” (hostile if you white-label for dealers)
- “Carfax for Motorhomes” as a product claim (trademark risk — say “verified specs + official recalls” instead)
- Origin story and tab tutorial on **every** turn — only when they ask who you are / how to use the app
- Invented national stats (“shoppers across all 50 states”) unless you can back them

## What to keep

- Year/make/model must match **that** year (no sibling powertrain)
- EST. labels; not a loan offer
- One question at a time
- Web search for battery disconnect / fuse / service / recall detail
- Never mention rvchecks.com
- Contact contact@rvfox.app
