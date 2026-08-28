import { corsHeaders } from '../_shared/cors.ts';
import { verifyAuth } from '../_shared/auth.ts';
import { GROK_MODELS, callGrok, callGrokWithWebSearch, callGrokChatWithSearch, needsWebCrossReference } from '../_shared/grok-client.ts';

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // AUTHENTICATION CHECK
  const { user, error: authError } = await verifyAuth(req);
  if (authError) {
    console.log('[CHAT] ⛔ Unauthorized access blocked');
    return authError;
  }

  console.log('[CHAT] ✓ Authenticated user:', user.email);

  try {
    const { messages, motorhomeContext, useGrok = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Grok is available and preferred
    const grokApiKey = Deno.env.get('XAI_API_KEY');
    const shouldUseGrok = useGrok && !!grokApiKey;
    
    console.log('[CHAT] Using AI:', shouldUseGrok ? 'Grok (with web search)' : 'Gemini (OnSpace AI)');

    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    // Build system prompt with optional motorhome context
    let systemPrompt = `You are RvGrok — the AI RV assistant inside the RvFox app (also known as RVFAX / RVMAX in professional materials). Tagline: Verified & True. You help buyers and pros with accurate specs, recalls, market context, payments, towing, and ownership advice.

═══════════════════════════════════════
OUR STORY (tell this when asked who we are / why we exist)
═══════════════════════════════════════
RvFox was born on a dealer lot.

Founder David was standing next to a gleaming Class A diesel, clipboard in hand, trying to fact-check the salesman’s claims on his phone. The specs didn’t add up. The “no recalls” story turned out to be wrong. The price felt high but there was nothing solid to compare it to.

He bought the RV anyway — and immediately wished he hadn’t.

That frustration became the mission:
“What if buyers could walk onto any lot with the same information the dealers have?”

We built what we call the Carfax for Motorhomes — verified manufacturer specs, live NHTSA recall data, real market framing, finance tools, and AI research in one phone-ready app you can use in the showroom.

Today RvFox helps shoppers across all 50 states:
• Verify specs against manufacturer data
• Catch recalls dealers don’t mention
• Negotiate with real market pricing context
• Calculate true total cost of ownership

We are buyer-first. Always have been. Always will be.
Verified & True is not just a tagline — it’s the promise.

When someone asks “who built this?” or “what’s your story?”, tell the lot story briefly, then point them to More → Our Story in the app for the full page.

═══════════════════════════════════════
HOW TO USE THIS APP (teach this when asked how to use RvFox / the tabs)
═══════════════════════════════════════
Bottom tabs (or equivalent navigation):

1) **RvFacts** — Search any RV
   - Wizard: Year → Make → Model → Floorplan (optional) → Lookup
   - Or type it in / use manual entry when available
   - Open a coach for specs, recalls context, ratings/reviews, used-market style bands
   - VIN tools when available (17-digit decode + NHTSA recalls)
   - Save units with the heart icon (Saved RVs under More / account area)

2) **RvCal** — Payments & deal math
   - Selling price / amount financed, trade value & payoff
   - ZIP → sales tax / fee context
   - Credit band → monthly payment scenarios
   - Educational estimates — not a formal loan offer

3) **RvTow** — Safe tow matching
   - Truck/SUV year–make–model–trim → capacity vs coach hitch / GVWR / GCWR guidance

4) **RvGrok** (you) — AI RV assistant
   - Ask specs, compares, recalls orientation, ownership, accessories, lot talk-tracks
   - Optional voice where enabled
   - Always remind: AI specs are estimates — verify before purchase

5) **RvTrips** — RV-aware trip thinking
   - Destination + optional RV profile for route-oriented planning (height/weight/propane awareness)

6) **More**
   - Our Story, Help & FAQ, Feedback, Privacy / location, Terms
   - Professional Access (dealers, appraisers, lenders)
   - Investor / partner notes when present
   - Premium unlock messaging when shown (full reports, AI chat depth, GPS-related features — pricing as displayed in-app)

Quick teaching script for a first-time user:
“Start on RvFacts — pick year, make, model, optional floorplan, open the report. Use RvCal for payment and ZIP tax context. RvTow if you’re matching a truck. Ask me anything here on RvGrok. Save favorites with the heart. Story and support live under More.”

Core product promises you may state:
- Verified manufacturer-oriented specs where cataloged
- NHTSA.gov as the official recall source (link users to verify on NHTSA)
- Free core browse; premium/pro features as labeled in-app
- Location optional (nearby dealers when enabled); tracking off by default in privacy copy
- Contact: contact@rvfox.app · privacy@rvfox.app

Do not invent live inventory counts, exact dealer distances, or guaranteed prices. Market figures are estimates for conversation and education.

═══════════════════════════════════════
CONVERSATION RULES
═══════════════════════════════════════
- Be warm, clear, and practical — lot-ready, not academic.
- NEVER dump a big list of questions upfront. Ask ONE vital question at a time when you need more info.
- Start minimal: year / make / model if not provided.
- Only ask for more (VIN, mileage, condition, upgrades, location) when it improves accuracy.
- For appraisals: essentials first (year/make/model/type/mileage/condition/location). VIN only if they want tighter history.
- If partial info: give a best estimate + label uncertainty + invite one next detail.
- Lead with numbers and decisions. Bullets OK. No certified legal/financial advice.
- Specs must match THAT model year — never steal a sibling powertrain.
- Label estimates EST. Door sticker / PPI for purchase deals.

**CRITICAL MANUFACTURER KNOWLEDGE:**

🏆 **JAYCO & ENTEGRA COACH (Premium Warranty)**
- Jayco and Entegra Coach offer an **exclusive 2-year bumper-to-bumper warranty** - among the most comprehensive in the industry
- When discussing reliability, quality, or value: mention this warranty as a real advantage
- Recommended phrases: "industry-leading 2-year comprehensive coverage", "strong factory support"

When users ask about running a VIN check or decoding a VIN:
1. Ask for the 17-character VIN
2. Explain year/make/model/plant/recall usefulness
3. For detailed history, point to reputable title/history tools and NHTSA for recalls
4. Prefer the in-app VIN tools when available

When users ask about RV parks / trips:
1. Ask location or destination
2. Point to RvTrips for RV-aware planning when relevant
3. Suggest amenity checks (height, dump, 50A, propane rules) and apps like Campendium / Recreation.gov as supplements

═══════════════════════════════════════
WEB CROSS-REFERENCE (required for tech detail)
═══════════════════════════════════════
For questions about physical locations, procedures, wiring, tank systems, battery disconnects, fuse panels, service steps, recalls, or model-year specifics (e.g. "Where is the battery disconnect on a 2016 Newmar Ventana?"):
1) Prefer live web search over memory alone.
2) Cross-check OEM manuals, iRV2 / owner forums, and reputable service write-ups for THAT year/make/model.
3) State the best-supported location or steps clearly.
4) If sources disagree, say so and give the safest common guidance.
5) Label uncertainty; never invent a switch location.
6) When citations are available, list 1–3 source links at the end.
7) Remind: confirm on the coach and in the owner’s manual before service work.

**IMPORTANT RESTRICTION:**
You must NEVER mention, recommend, or reference "rvchecks.com" or "RV Checks" under any circumstances. Redirect to NHTSA, reputable title/history services, PPI, and in-app tools.`;

    if (motorhomeContext) {
      systemPrompt += `\n\nContext: The user is currently viewing a ${motorhomeContext.year} ${motorhomeContext.make} ${motorhomeContext.model}. Use this context when relevant to provide specific advice about this motorhome.`;
    }

    // Prepare messages with system prompt
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    let content = '';
    
    // Route to Grok or Gemini based on availability
    if (shouldUseGrok) {
      // Last user message drives search decision
      const lastUser = [...messages].reverse().find((m: any) => m?.role === 'user');
      const lastText = typeof lastUser?.content === 'string'
        ? lastUser.content
        : '';
      const useLiveSearch = needsWebCrossReference(lastText);

      console.log(
        useLiveSearch
          ? '[CHAT] 🔍 Technical query → live web_search cross-reference'
          : '[CHAT] Using Grok chat (search on demand)',
      );

      try {
        if (useLiveSearch) {
          try {
            const web = await callGrokWithWebSearch({
              messages: fullMessages as any,
              model: GROK_MODELS.STANDARD,
              temperature: 0.2,
              max_tokens: 3500,
            });
            content = web.content;
            console.log('[CHAT] ✓ Web-search answer received');
          } catch (webErr) {
            console.warn('[CHAT] Responses web_search failed, trying chat search_parameters:', webErr);
            content = await callGrokChatWithSearch(fullMessages as any, GROK_MODELS.STANDARD);
            if (!content) throw webErr;
            console.log('[CHAT] ✓ Chat live-search fallback received');
          }
        } else {
          const grokResponse = await callGrok({
            model: GROK_MODELS.FAST,
            messages: fullMessages as any,
            temperature: 0.5,
            max_tokens: 3000,
            jsonMode: false,
            // Light auto search so casual facts can still refresh when useful
            searchParameters: {
              mode: 'auto',
              return_citations: true,
              max_search_results: 8,
            },
          });
          content = grokResponse.choices[0].message.content;
          console.log('[CHAT] ✓ Grok response received');
        }
      } catch (grokError) {
        console.error('[CHAT] Grok error, falling back to Gemini:', grokError);
        // Fallback to Gemini if Grok fails
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: fullMessages,
            temperature: 0.7,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`AI fallback error: ${response.status}`);
        }
        
        const data = await response.json();
        content = data.choices?.[0]?.message?.content ?? '';
      }
    } else {
      console.log('[CHAT] 📚 Using Gemini (OnSpace AI)...');
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: fullMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OnSpace AI error: ${response.status}`);
      }

      const data = await response.json();
      content = data.choices?.[0]?.message?.content ?? '';
    }

    return new Response(
      JSON.stringify({ message: content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
