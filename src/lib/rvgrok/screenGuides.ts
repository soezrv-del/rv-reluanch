/**
 * Per-screen Live Voice guides. One module: chat context, session
 * instructions, and the spoken callout all read from here.
 *
 * Checked against current main after #534 (RV Grok pill, no LIVE badge)
 * and #535 (locked 2026 Entegra Cornerstone spotlight, arrivals loop,
 * pills swipe-only).
 */

export const VIN_DECODER_SCREEN = "VIN Decoder";

/** Screens that can be active. Share is not one — it opens inside Facts. */
export const GUIDE_SCREEN_IDS = [
  "Home",
  "Facts",
  "Cal",
  "Tow",
  "Lot",
  "RV GPS",
  "Grok",
  "Premium",
  "Sold",
  VIN_DECODER_SCREEN,
] as const;

export type GuideScreenId = (typeof GUIDE_SCREEN_IDS)[number];

const SPOKEN_NAME: Record<string, string> = {
  Home: "Home",
  Facts: "Rv Facts",
  Cal: "Calculator",
  Tow: "Tow Guide",
  Lot: "Lot Inventory",
  "RV GPS": "RV GPS",
  Grok: "RV Grok chat",
  Premium: "the Premium menu",
  Sold: "Sold",
  [VIN_DECODER_SCREEN]: "VIN Decoder",
};

/** One short spoken line: the screen, then the first thing to do there. */
export const SCREEN_CALLOUT: Record<string, string> = {
  Home: "Home. Tap the 2026 Entegra Cornerstone to open it on the lot.",
  Facts: "Rv Facts. Pick a year, make, and model, then open the report.",
  Cal: "Calculator. The big number at the top is the monthly payment.",
  Tow: "Tow Guide. Pick the truck, then replace the default RV GVWR with the real sticker.",
  Lot: "Lot Inventory. Search the units on the lot, or pull down to refresh.",
  "RV GPS": "RV GPS. Set a start and a destination, then tap Go.",
  Grok: "RV Grok chat. Ask in the box, or tap the mic.",
  Premium: "Premium menu. Pick a tool, or tap Back for Rv Facts.",
  Sold: "Sold. Log a deal from an Rv Facts report, or review gross and what's owed.",
  [VIN_DECODER_SCREEN]: "VIN Decoder. Type or scan a 17-character VIN.",
};

/** Wait after the last navigation before speaking. Rapid tabs speak once. */
export const SCREEN_CALLOUT_DEBOUNCE_MS = 1500;

export const SCREEN_GUIDE_PREAMBLE = `APP SCREEN AWARENESS. You are built into the rvmax app. The app tells you which screen he has open. It appears below as ACTIVE SCREEN and updates the moment he moves.
You do not need to see his screen. ACTIVE SCREEN and SCREEN GUIDE are your view of it. Never say you can't see his screen, don't know which screen he's on, or lack a manual.
When he asks "what screen am I on", "what is this", "how do I use this", or "where is X", answer right away from SCREEN GUIDE. Name the screen, give two or three specifics (how to search, the filters, what updates live), and offer to walk him through it. Never web-search how rvmax works, and never hold ("give me one second") for an app question.
Use the button and field names exactly as written. Keep it short. If a control is not named in the guide, answer with the closest step that is, and say you are not sure that control is on this screen. Do not invent a button. Do not refuse the question.`;

export const SCREEN_SHARED = `The top bar is the finished R and the RvFOX word. Tapping it opens Home. The ⋯ button opens the Premium menu, where Appearance lives. It is not in the header brand.
Every screen except the RV Grok chat has the ask bar at the bottom:
- an "Ask RV Grok" text box, where a typed question opens the RV Grok chat with the answer
- the mic, which starts Live Voice and keeps him on the screen he's on. It shows Listening or Speaking, and tapping it again stops voice.
Under that bar is a dock of six gold line icons. All six are visible. The dock does not slide and does not auto-scroll. Left to right: FACTS (a document), CAL (a calendar), Grok (a gold sunburst in a blue ring), TOW (a crane), RV GPS (a pin), and LOT (buildings). The same icons show in White and Dark. There is no Einstein photo and no word pills.
Swiping the page (not the dock) moves between tools in this order: Rv Facts, Calculator, RV Grok, Tow Guide, RV GPS, Lot Inventory. Swiping doesn't work on Home.`;

const GUIDES: Record<string, string> = {
  Home: `Home is the showroom. Light mode is one full-bleed lot photo of the stocked 2026 Entegra Cornerstone. Dark mode is that same coach, one studio cutout, on a black ground. The page loads only the photo that theme uses.
- Year, make, and model sit on the image in large type. Price and stock are quiet lines on the image, not a second card. The model number is Cornerstone 45D and the stock number is Stock 45282 when that unit is on the lot.
- One button: Open coach. It opens that unit in Lot Inventory. There is no Learn more button. Tapping it does not open Rv Facts.
- Under the hero, the printed lot count from the lot sheet is a small frozen number. It does not count down.
- "Newest arrivals" is a still row of up to six recent lot units. He pushes it with a finger. It does not auto-loop. Each card has a photo (or a covered-coach drawing when the unit has no photo) and a price. Tapping one opens Lot Inventory already searched to that unit.
Next step: tap Open coach, or push Newest arrivals.`,

  Facts: `Rv Facts is the spec report for one coach: specs, ratings, market value, and NHTSA recalls.
Search, in the RV Search card:
- Type (optional), then Year (required). Make reads "Pick a year first" until a year is picked. The make sheet says "Or type any make". Then Model, and then Floorplan (optional).
- The "Year range" button opens an optional filter that narrows the year list.
- The big button reads Search, then changes to "Open report" once the coach is picked.
- With no exact match, "DID YOU MEAN?" lists suggestions. With no results, the empty state is titled "No match" and "Ask RvGrok" hands the coach to the chat.
- A search with several hits lists "N RESULT" or "N RESULTS", with Compare. "SAVED UNITS" lists saved coaches with Sold and compare toggles.
The report runs top to bottom:
1. Vehicle Overview: make, model, floorplan, type, the RvFOX rating with stars, and Length, Slideouts, and Sleeps.
2. Vehicle specifications, which show only once a floorplan is picked: length, width, height, ceiling, engine, horsepower, torque, transmission, chassis, tow capacity, generator, A/C, tires, MPG, fuel, GVWR, UVW, CCC, warranty, and the fresh, gray, and black tanks and propane. It has a Check tow button.
3. Ratings: Quality, Reliability, and Customer satisfaction, plus a Power to weight row. That row is the torque-to-weight ratio (torque divided by UVW, or by GVWR when UVW is missing), colored red under a score of 2, yellow from 2 up to 7, and green at 7 and up.
4. Market value (tap to open), Local inventory, Floorplans this year, Reliability & ownership, Sample owner notes, NHTSA safety, Maintenance, and Share kit.
The report's action menu has Save to list, Compare, Log as Sold, Check payment, Check tow, and PDF.
- Check payment opens the Calculator with this coach's price.
- Check tow opens Tow Guide with this coach.
- Compare puts up to three coaches side by side.
Share kit builds a brochure summary for a customer. He picks the market prices to include and sets price, down payment, term, and rate to show a monthly payment. He can include a video and edit the strengths. Then he taps Share kit, or Copy.
Honesty rules:
- A published pin shows as a number.
- "Confirm brochure" or GAP means nothing published was found for that cell. A saved pin is the best available answer. Use the closest saved pin when one exists, and otherwise answer from web search. Never refuse, stall, or skip the spec because the match is not perfect. Do not put a web-found number into CCC, hitch, or tow math.
- GVWR shows the exact published figure when one exists. Otherwise it can show a label like "22,000 lbs · smallest in series · confirm sticker". That is the smallest figure in the model line, not this coach's sticker, and it isn't used for CCC, hitch, or tow math. The engine can carry the same "smallest in series" label.
- A small spinner on a spec means a live search is filling it right now, so the report updates live.
- "Something look off? Tap to correct" saves a correction on this device only.
- Pulling down refreshes Facts.`,

  Cal: `The Calculator gives an estimated monthly payment.
- The big number at the top is the MONTHLY payment. He can type a target payment there ("TARGET /MO"), and it works back to a price. The line under it shows term, APR, down, and the amount financed.
- PRICE has a Purchase / Financed toggle, so he can enter the sticker price or the amount financed.
- LOAN has a Select / Manual control. The button label is the mode it will switch to.
  - Select uses picker menus for CREDIT, APR, TERM, and DOWN.
  - Manual has typed boxes for CREDIT score, APR % (Auto restores the credit-based rate), TERM (YRS), and DOWN %.
- TRADE has VALUE and PAYOFF. Owing less than the value counts as trade equity. Owing more adds negative equity, labeled "Neg. equity".
- ZIP fills in the state and TAX %. He can type over the tax, and the small Reset next to TAX % goes back to the ZIP rate.
- BREAKDOWN shows Price, Tax, Fees, Trade equity or Neg. equity, and Down.
- "Payment report" opens a printable payment summary to save or share.
- LENDERS opens sample lender rates for his credit range, amount, and term, with a monthly payment for each.
- Pulling down on the page resets the whole Calculator.
These are estimates, not a loan offer. Confirm with the lender.
The usual way in is Check payment on an Rv Facts report, which carries that coach's price. The coach chip at the top shows which coach it is.`,

  Tow: `Tow Guide answers "can this truck pull that coach?" from the OEM tow table.
- Pick Truck or SUV, then YEAR, MAKE, MODEL, and TRIM / ENGINE / CONFIGURATION. Year changes which ratings apply. "Custom vehicle" lets him type his own numbers. Clear removes the vehicle, and Reset puts the defaults back.
- Results show MAX TOW, PAYLOAD, and GCWR, plus REC. TOW, which is about 80% of max tow. Planning uses about 85% of payload.
- RV TYPE is 5th Wheel or Travel Trailer. TRUCK BED LENGTH appears for a 5th wheel on a truck. A non-truck is held on Travel Trailer.
- "RV GVWR (lbs)" is required. It starts at 14,000 as a default, so tell him to replace it with the real sticker or published GVWR.
- PIN WEIGHT or TONGUE WEIGHT is optional. Left blank, it estimates 20% of GVWR for a pin and 12% for a tongue.
Coming from Check tow on a trailer, "Can I tow this coach?" lists TRUCKS THAT FIT, and "Show more fits" adds more.
Coming from a motorhome, it shows the coach's own max tow for a car behind it. "Match a different trailer instead" switches back.
"Use for trip alerts" sends the truck and coach to RV GPS.
There's no VIN field on Tow, even though the banner says "VIN decode". VIN decoding is in Premium → VIN Decoder.`,

  Lot: `Lot Inventory is the RV Country in-stock lot. These are actual units on the lot, not the brochure catalog. The header shows the total unit count, and a Premium button that opens the Premium menu.
- Search: the box ("Impression, Entegra, 45282, Fife…") filters as he types. It matches make, model, year, floorplan/trim, stock number, VIN, town/location, type, condition, and status. Several words must all match, for example "2022 Tiffin".
- Filters: the type chips, starting with All, narrow by body type. Tapping the same chip again clears it. The x in the search box clears the search.
- The line under the chips reads how many are shown, and "N of M shown" once a search or type filter is on, then "as of" the snapshot time.
- FEATURED REPORT is the first match. "On the lot" lists the rest, and more load as he scrolls.
- Tapping a unit opens its card: Stock, Location, Type, Condition, and when open, Year, Make, Model, Trim, Price, VIN, and any other lot-sheet fields.
- Live updates: the list doesn't refresh on its own. It loads the latest snapshot when the screen opens, and pulling down refreshes it. If "as of" looks old, pull down.
- With no match, "No units match" appears. Clear the search. It never fills in from the catalog.
- Blank or GAP fields weren't on the lot sheet. For full specs, look the coach up in Rv Facts.`,

  "RV GPS": `RV GPS routes the trip with the RV's size in mind.
- FROM is the start: "Use my location", or type a city or address in the box labeled Starting from (placeholder "City or address"). "Where to?" is the destination. Tap Stop to add an overnight stop (the box placeholder is Overnight), then tap Go.
- Results show Miles and Time. "Start Turn-by-Turn" begins navigation with voice guidance, which he can mute ("Mute voice guidance"). "Stop navigation" ends it.
- During navigation the map follows his GPS and says "Off route — recalculating" if he leaves the route.
- Along the route it lists CAMPS, DUMPS, and FUEL. "Route via" adds a stop, and "Route here" goes straight there. Some camps offer "Reserve a Space". Streets / Satellite switches the map.
- The Profile control holds the RV's year, make, model, and floorplan. "Lock profile for map" keeps it on this device. Without a profile it asks "Add an RV profile?".
- Route alerts are text hints, or HERE Truck notices when available. They aren't a clearance database, so he should watch posted signs.
- The Dumps chip lists free sewer dumps ("FREE SEWER DUMPS"), searchable by city, highway, or name, sorted by his location. He should confirm hours.
- A route can be saved with Save.`,

  Grok: `This is the RV Grok chat. It has no bottom ask bar. It has its own "Ask RV Grok" box, the mic for Live Voice, and the camera button: tap to take a photo, or hold to pick from the library. A separate live-camera control stays on while he talks.
Across the top are Chat history, Agent (deeper research), Voice settings, New chat (once a thread is open), and ⋯.
- Name a year, make, and model to get a spec report card. GAP fields stay empty, and nothing is invented.
- After a report, Grok offers extras one at a time with Yes / No thanks: ratings, a video, NHTSA recalls, market bands, owner reviews, the maintenance list, a VIN decode, and sharing.
- In Live Voice, CUT stops Grok mid-sentence and keeps listening. STOP ends the session.
- Pause stops a reply. "Next unit" starts a fresh chat with a sample starter coach, not the next lot unit.`,

  Premium: `Premium is the suite menu. Back returns to Rv Facts.
- YOUR ACTIVITY: Searches (the tile subtitle says RvFax) and Saved RVs (both open Rv Facts), and RV GPS.
- TOOLS:
  - RvGrok Voice Settings (voice, hands-free, speed)
  - Ask RvGrok
  - VIN Decoder
  - RvCal financing (Calculator)
  - RvShare (Share kit on the open report)
  - Sold (Pro only)
  - RvTow match (Tow Guide)
- NHTSA RECALL LOOKUP: enter YEAR, MAKE, and MODEL, then tap "Check NHTSA recalls".
- SUPPORT: Help & FAQ, Send Feedback, and "NHTSA.gov — Official Recalls".
- LEGAL & PRIVACY: Privacy Policy, Support, Terms & Copyright, and Contact.
- FULL SUITE: everything is included, with no in-app purchases.
Opening VIN Decoder switches the active screen to the VIN Decoder guide. Closing it returns here.`,

  Sold: `Sold is his deal book.
To log a deal, use Log as Sold on an Rv Facts report. Customer name is optional: Next continues with or without a name. Skip or Back returns to Rv Facts without logging. Then enter Gross amount (required) and the deal split, and tap Log deal.
The list shows TOTAL GROSS and OWED, with GROSS and SPLIT on each deal. Each deal can be deleted (swipe left or tap Delete).
For sold comps, open the coach in Rv Facts, then Market value.`,

  [VIN_DECODER_SCREEN]: `The VIN Decoder decodes a 17-character VIN through NHTSA. It opens on top of Premium.
- He can type it in "Enter 17-character VIN" or tap Scan to use the camera. "Practice scan" and "Fill sample VIN" let him try it.
- It shows whether the check digit passed ("Check digit OK" or "Check digit fail") and a POSITION MAP, then:
  - IDENTITY & MANUFACTURER (manufacturer, make, model, year, series, trim, body, GVWR, plant)
  - POWERTRAIN (engine, displacement, cylinders, horsepower, fuel, drive, transmission)
  - SAFETY & EQUIPMENT (airbags, belts, TPMS, brakes, ABS)
  - ADDITIONAL NHTSA FIELDS, when NHTSA sent more
  - NHTSA RECALLS
- On a motorhome, decode the chassis VIN, as the screen says ("Decode the chassis VIN on motorhomes."). The GVWR here is NHTSA's chassis rating, not the coach brochure or sticker.
Close it with the x to go back to Premium.`,
};

/**
 * Chat-context names for Calculator, Tow Guide, and Lot Inventory.
 * Guide text stays keyed by Cal / Tow / Lot. Chip labels stay as written.
 */
const CHAT_SCREEN_ALIAS: Record<string, string> = {
  CAL: "Cal",
  TOW: "Tow",
  LOT: "Lot",
};

/** Guide id for a chat-context screen name. Facts stays Facts. */
export function canonicalScreenId(screen: string): string {
  const name = screen.trim();
  return CHAT_SCREEN_ALIAS[name] || name;
}

export function spokenScreenName(screen: string): string {
  const name = canonicalScreenId(screen);
  return SPOKEN_NAME[name] || name;
}

export function screenGuideFor(screen: string): string | null {
  const guide = GUIDES[canonicalScreenId(screen)];
  return guide ?? null;
}

export function screenCalloutLine(screen: string): string | null {
  const line = SCREEN_CALLOUT[canonicalScreenId(screen)];
  return line ?? null;
}

const SCREEN_BLOCK_RE =
  /\n*SCREEN CONTEXT START\n[\s\S]*?\nSCREEN CONTEXT END\n*/g;

/** Drop a previous screen block so a route change replaces it. */
export function stripScreenContext(text: string): string {
  return text.replace(SCREEN_BLOCK_RE, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Active screen plus the shared chrome and that screen's guide.
 * Chat asks and Live Voice both inject this. Voice adds the preamble above it.
 */
export function formatScreenContext(screen: string): string {
  const name = screen.trim();
  if (!name) return "";
  const spoken = spokenScreenName(name);
  const guide = screenGuideFor(name);
  const lines = [
    `ACTIVE SCREEN: ${name}. Spoken name: ${spoken}.`,
    `SHARED CHROME:\n${SCREEN_SHARED}`,
  ];
  if (guide) lines.push(`SCREEN GUIDE:\n${guide}`);
  else {
    lines.push(
      "No separate guide is published for this id. Do not invent buttons.",
    );
  }
  return `SCREEN CONTEXT START\n${lines.join("\n\n")}\nSCREEN CONTEXT END`;
}

/**
 * How to deliver a callout that has already passed the debounce.
 * An assistant reply already playing is never cancelled; the line waits
 * in the queue until reply-done flushes it.
 */
export function planCalloutDelivery(
  line: string,
  assistantSpeaking: boolean,
): { speakNow: string | null; queued: string | null; cancel: false } {
  if (assistantSpeaking) return { speakNow: null, queued: line, cancel: false };
  return { speakNow: line, queued: null, cancel: false };
}

/** Spoken callout: one line, then stop. Does not invite a second sentence. */
export function screenCalloutSpeechInstructions(line: string): string {
  return `SCREEN CALLOUT. Say exactly this one line, then stop. Do not answer a question. Do not add a second sentence. Do not say you cannot see the screen.\n${line}`;
}

export type ScreenCalloutState = {
  pending: string;
  pendingAt: number;
  lastSpoken: string;
  userSpeaking: boolean;
  /** He spoke while a callout was waiting. Let that reply finish. */
  waitForReply: boolean;
};

export function initialScreenCalloutState(): ScreenCalloutState {
  return {
    pending: "",
    pendingAt: 0,
    lastSpoken: "",
    userSpeaking: false,
    waitForReply: false,
  };
}

export type ScreenCalloutEvent =
  | { type: "navigate"; screen: string; now: number }
  | { type: "tick"; now: number }
  | { type: "user-start" }
  | { type: "user-stop" }
  | { type: "reply-done"; now: number };

export type ScreenCalloutResult = {
  state: ScreenCalloutState;
  speak: string | null;
};

function clearPending(state: ScreenCalloutState): ScreenCalloutState {
  return { ...state, pending: "", pendingAt: 0, waitForReply: false };
}

function trySpeak(
  state: ScreenCalloutState,
  now: number,
  debounceMs: number,
): ScreenCalloutResult {
  if (!state.pending) return { state, speak: null };
  if (now - state.pendingAt < debounceMs) return { state, speak: null };
  if (state.userSpeaking || state.waitForReply) return { state, speak: null };
  if (state.pending === state.lastSpoken) {
    return { state: clearPending(state), speak: null };
  }
  const line = screenCalloutLine(state.pending);
  if (!line) return { state: clearPending(state), speak: null };
  return {
    state: { ...clearPending(state), lastSpoken: state.pending },
    speak: line,
  };
}

/**
 * Debounced screen callout. Rapid navigations keep only the final screen.
 * The same screen is not spoken twice in a row. Nothing is spoken while
 * he is mid-sentence, or until the reply to that sentence has finished.
 */
export function reduceScreenCallout(
  state: ScreenCalloutState,
  event: ScreenCalloutEvent,
  debounceMs = SCREEN_CALLOUT_DEBOUNCE_MS,
): ScreenCalloutResult {
  switch (event.type) {
    case "navigate": {
      const screen = event.screen.trim();
      if (!screen) return { state, speak: null };
      return {
        state: {
          ...state,
          pending: screen,
          pendingAt: event.now,
          waitForReply: state.userSpeaking,
        },
        speak: null,
      };
    }
    case "tick":
      return trySpeak(state, event.now, debounceMs);
    case "user-start":
      return {
        state: {
          ...state,
          userSpeaking: true,
          waitForReply: state.pending ? true : state.waitForReply,
        },
        speak: null,
      };
    case "user-stop":
      return { state: { ...state, userSpeaking: false }, speak: null };
    case "reply-done":
      if (state.userSpeaking) {
        return { state: { ...state, waitForReply: true }, speak: null };
      }
      return trySpeak(
        { ...state, waitForReply: false },
        event.now,
        debounceMs,
      );
    default:
      return { state, speak: null };
  }
}
