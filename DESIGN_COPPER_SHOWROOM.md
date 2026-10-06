# Copper showroom redesign (2026-10-05)

Coordinates every suite screen with the home showroom mock.

## Visual language

| Token | Value | Role |
|-------|--------|------|
| Void | `#000000` | App field / showroom floor |
| Glass | dark gradient + 1px hairline + top copper glow | Cards, sheets, docks |
| Copper CTA | metallic gradient `#8b5e3c → #e8c090` + glow | **One** primary action |
| Serif | Fraunces / display | Model names only |
| Sans | SF Pro / system | Everything else |
| Dock | Facts · Inventory · Chat · More | Four equal tabs |

## North star (unchanged)

> void + one light + perfect type + one action + trust that whispers

Copper replaces sapphire as the **primary CTA metal**. Sapphire remains for secondary accents (field focus, live badges) where trust-blue is still useful.

## Code touchpoints

- `src/components/shell/HomeScreen.tsx` — centered placard, spec strip, copper **Ask RV Grok**
- `src/styles.css` — `--color-copper*`, `--gradient-copper`, `.showroom-home-card`, `.suite-glass`, `.suite-cta-copper`
- `src/components/shell/BottomTabs.tsx` — labels Facts / Inventory / Chat / More
- `src/components/shell/dock.css` — darker plate
- Lot / Grok landing / More — copper primary accents

## Preview kit

Open `artifacts/rvfox-screen-redesign-kit.html` (or workspace root copy) for side-by-side:

Home · Facts · Inventory · Chat · More · Cal

## Do not

- Invent floorplans or drivetrains for the spec strip — brochure values only
- Reintroduce orange launchpad as the default home door without product sign-off
- Put sapphire back on the primary full-width CTA

## Pass 2 — Tow / Trips / Detail / Cal (2026-10-05)

| Screen | Changes |
|--------|---------|
| **Tow** | `suite-glass` on hero + vehicle panels; sky CTAs → copper border/fill; display title |
| **Trips** | Primary **Plan route** / start-nav → `suite-cta-copper` |
| **Detail** | Full-width report CTAs → copper; report cards → `suite-glass` |
| **Cal** | Payment + input panels → `suite-glass` (gold numbers kept as finance accent) |
| **CSS** | Shared hairline glow on `.suite-glass.glass-prestige*`; tow blue labels → copper-bright |

Map route paint stays sapphire/blue for legibility. Copper is the **one action**, not the basemap.

## Pass 3 — Palette lock (PR #670) · layout unchanged

Home mock is the **only** UI palette:

| Role | Values |
|------|--------|
| Void | `#000000`, glass greys `#0a0a0c` / `#12141a` / `#18181c` |
| Ink | `#ffffff`, muted foam |
| Copper | `#8b5e3c` · `#b07a4e` · `#c48a5e` · `#d4a06a` · `#e8c090` |

**What changed (colors only):**
- All design tokens (`sapphire`, `blue`, `gold`, `amber`, `ruby`, `green`, ink navy) remap onto void/white/copper
- Page accents (sapphire/ruby/gold) all resolve to copper
- Hardcoded hex blues in Grok/MessageBubble/dock/map/OG image → copper
- Blueish `rgba(...)` glows in CSS → copper-tinted
- Shell override for fixed Tailwind `sky-*` / `emerald-*` utilities
- Tests updated for new hex SoT

**What did not change:** layout, spacing, component structure, catalog data.
