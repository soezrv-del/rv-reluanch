import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ct as ArrowLeft, R as MapPin, U as LoaderCircle, X as Heart, Z as GitCompare, k as Printer, lt as CircleCheck, nt as ExternalLink, tt as FileText, u as TriangleAlert, vt as Calculator, y as Sparkles } from "../_libs/lucide-react.mjs";
import { l as useShellNavOptional, u as cn } from "./routes-BIdx5g1s.mjs";
import { i as SuiteBackdrop, n as SHARED_PRESTIGE_BACKDROP, s as usePullToReset, t as PullResetHint } from "./SuitePage-CeCp5hH3.mjs";
import { t as fetchRecallsViaApi } from "./recalls-4yfzANbY.mjs";
import { c as findPowertrainCorrection, d as sanitizeNarrativeForPin, f as findOemFloorplanSpec, o as sanitizeUnverifiedLayout, u as sanitizeFeaturesForPin } from "./router-Bi9lHNSY.mjs";
import { S as ratingStars, d as formatMoney, f as getFloorplansForYear, g as getRatingMetadata, p as getMaintenanceSchedule, u as estimateMarket, x as ratingFor } from "./catalog-DMGYLcQX.mjs";
import { a as formatHardHorsepower, c as mergeLiveIntoDisplay, d as removeLocalSpecOverride, f as resolveHardPowertrain, i as findLocalSpecOverride, l as peekVerifiedDossier, n as exportVehicleReport, o as formatHardTorque, p as saveLocalSpecOverride, r as fetchLiveDossier, s as liveMarketLadder, t as buildBrochureSpecs, u as refreshCoachDossierCache } from "./exportReport-DZYf8nrO.mjs";
import { n as resolveCardImage } from "./RvFaxApp-CP0oUioQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RvDetail-CMbg1G4_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BRAND_REVIEW_POOLS = {
	"Thor Challenger": [
		{
			author: "Mike & Lisa K.",
			location: "Columbus, OH",
			date: "Apr 2026",
			title: "Challenger 37TB is the sweet spot of the Thor lineup",
			body: "Three slideouts, a full king suite, and a bunkhouse that fits the whole family — all on the proven Ford F53 at $195k. We compared the Challenger against the Coachmen Mirada and the Holiday Rambler Vacationer. Thor's dealer network and the triple-slide layout won it. One year in and completely happy.",
			verified: true,
			miles: "12,400+",
			years: "14 months"
		},
		{
			author: "Dave & Sharon M.",
			location: "Nashville, TN",
			date: "Jan 2026",
			title: "Best family gas Class A under $200k right now",
			body: "Researched for 6 months. The Challenger 35MQ has the most thoughtful family layout in the mid-range gas segment — the tri-fold sofa converts for the grandkids, the kitchen is genuinely usable, and the outside kitchen makes campsite evenings perfect. Ford V10 is smooth and proven.",
			verified: true,
			miles: "9,200+",
			years: "10 months"
		},
		{
			author: "Tom R.",
			location: "Louisville, KY",
			date: "Oct 2025",
			title: "Solid mid-range coach — plan your PDI carefully",
			body: "Had a few cosmetic items at delivery that the dealer resolved. Past those, the Challenger has been completely reliable. The triple slideouts genuinely transform the living space when parked and the Ford F53 chassis gives a smooth, stable ride on the interstate.",
			verified: true,
			miles: "8,100+",
			years: "9 months"
		},
		{
			author: "Sandy B.",
			location: "Indianapolis, IN",
			date: "Jul 2025",
			title: "Challenger 37KT bunkhouse — perfect for our large family",
			body: "Six people, one RV, three slideouts. The Challenger 37KT bunkhouse is the reason families choose this model over anything else at this price. Kids have their own sleeping area, parents have a real bedroom, and the living room is spacious when the slides are out. Two summer road trips with zero mechanical issues.",
			verified: false,
			miles: "",
			years: "18 months"
		}
	],
	"Tiffin Allegro 45OPP": [
		{
			author: "Bob & Patricia W.",
			location: "Scottsdale, AZ",
			date: "May 2026",
			title: "The 45OPP outdoor patio is unlike anything else on the road",
			body: "We have owned three diesel pushers. The 45OPP floorplan is the one we should have bought first. The outdoor kitchen — full pass-through counter, outdoor TV, outside fridge — genuinely extends your living space to the campsite. Arrived at Sedona and our neighbors asked for a tour. Nothing else parks and entertains like this.",
			verified: true,
			miles: "16,800+",
			years: "18 months"
		},
		{
			author: "Jim & Carol D.",
			location: "Naples, FL",
			date: "Feb 2026",
			title: "45OPP holds its value like no other Tiffin floorplan",
			body: "Bought our 45OPP two years ago. A dealer offered us 82 cents on the dollar last month as a trade — unheard of for any coach at 30,000 miles. The OPP community is tight-knit, active, and there are OPP-owner rallies across the country. If you find one in stock, buy it — they are perpetually back-ordered.",
			verified: true,
			miles: "31,000+",
			years: "2 yrs"
		},
		{
			author: "Richard & Anne S.",
			location: "Sarasota, FL",
			date: "Nov 2025",
			title: "Waited 8 months for ours — completely worth it",
			body: "Placed our deposit in January and took delivery in September. The wait is real — Tiffin cannot build these fast enough. The OPP slide is technically a pass-through outdoor galley with a 50-in TV, linear fireplace on the outside wall, and an outdoor kitchen that is genuinely weather-sealed. Spartan K2, Cummins ISL, and the Tiffin lifetime structural warranty round it out.",
			verified: true,
			miles: "11,200+",
			years: "10 months"
		},
		{
			author: "Gary T.",
			location: "Peoria, AZ",
			date: "Aug 2025",
			title: "The OPP floorplan created its own owner culture",
			body: "Join the Facebook 45OPP Owners Group before you buy. Six thousand members sharing modifications, campground reviews specifically noting outdoor patio setup space, and rally meetups. No other Tiffin model has this level of owner community intensity. The coach deserves it — it is that different from everything else.",
			verified: false,
			miles: "8,600+",
			years: "9 months"
		}
	],
	"Leisure Travel Vans Wonder XL": [
		{
			author: "Andrew & Sarah K.",
			location: "Austin, TX",
			date: "Jun 2026",
			title: "Wonder XL is the full-timer's Sprinter Class B+",
			body: "Sold our 35-ft diesel pusher for the Wonder XL 26MB and have not looked back. The Sprinter 170 EXT wheelbase gives us a full wet bath, a king bed that does not require acrobatics to access, and a kitchen counter depth that finally lets us cook real meals. LTV Canadian craftsmanship is extraordinary — every joint, every cabinet is finished to a different standard.",
			verified: true,
			miles: "22,400+",
			years: "22 months"
		},
		{
			author: "Paul & Karen L.",
			location: "Seattle, WA",
			date: "Mar 2026",
			title: "Two extra feet makes an enormous difference",
			body: "Owned a Wonder 24MB before upgrading to the XL 26RTB. The extended wheelbase adds critical living space — the residential kitchen counter is now genuinely functional, the rear bedroom feels like a real suite, and the twin-bed layout in the RTB is perfect for our adult travel companions. LTV warranty service in Winkler is outstanding.",
			verified: true,
			miles: "14,800+",
			years: "16 months"
		},
		{
			author: "Tim H.",
			location: "Denver, CO",
			date: "Oct 2025",
			title: "Best Class B+ on the Sprinter 170 EXT platform",
			body: "Compared the Wonder XL against the Airstream Atlas and the Tiffin Wayfarer. LTV wins on interior quality and storage engineering. The Wonder XL's basement storage is genuinely usable — not an afterthought. 19 MPG on the highway and it parks in any spot. Two seasons in the Rockies and one warranty claim handled in 48 hours.",
			verified: true,
			miles: "18,200+",
			years: "20 months"
		},
		{
			author: "Rachel B.",
			location: "Portland, OR",
			date: "Jul 2025",
			title: "Premium price — genuinely premium product",
			body: "Yes, $230k is serious money for a van-based coach. The Wonder XL earns every dollar. The Sprinter 170 EXT's wheelbase makes the ride measurably more stable than the standard 144 Sprinter. The full-width rear slide transforms the bedroom into something that does not feel like an RV. LTV's 2-year structural warranty and Canadian build quality seal the deal.",
			verified: false,
			miles: "9,600+",
			years: "12 months"
		}
	],
	"Outdoors RV": [
		{
			author: "Jake & Kristin M.",
			location: "Bend, OR",
			date: "May 2026",
			title: "Timber Ridge is the best-built trailer under $70k",
			body: "We camped in Crater Lake NP in November with snow on the ground and the Timber Ridge held 68F inside on the electric furnace alone. The enclosed underbelly, the aluminum frame, and the 3-year warranty give us confidence this trailer will outlast most competitors at twice the price.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Scott T.",
			location: "Flagstaff, AZ",
			date: "Feb 2026",
			title: "Back Country took us places our Airstream could not",
			body: "Off-road tires, raised suspension, and a fully enclosed underbelly mean we access dispersed sites in the Coconino that our friends cannot reach with their road trailers. Outdoors RV builds in Oregon and it shows. The quality per dollar is extraordinary.",
			verified: true,
			miles: "",
			years: "18 months"
		},
		{
			author: "Rachel B.",
			location: "Portland, OR",
			date: "Nov 2025",
			title: "Wind River is the four-season trailer I wished I had found sooner",
			body: "Third travel trailer in 8 years. The Wind River 260RKSLE is the one I should have bought first. Aluminum frame, insulated to -30F, residential kitchen, and it has not squeaked once in 14 months. Outdoors RV customer service in La Grande is genuinely excellent.",
			verified: true,
			miles: "",
			years: "14 months"
		},
		{
			author: "Tom & Carol H.",
			location: "Salt Lake City, UT",
			date: "Aug 2025",
			title: "Finally a trailer built for western winters",
			body: "We camp at elevation year-round in Utah. Every other trailer we tried leaked cold air or had freeze damage. Two Utah winters with the Timber Ridge and zero issues. The enclosed heated underbelly with tank heaters is the real deal, not the marketing version most brands sell.",
			verified: false,
			miles: "",
			years: "2 yrs"
		}
	],
	"Northwood Manufacturing": [
		{
			author: "Brad & Melissa K.",
			location: "Missoula, MT",
			date: "Jun 2026",
			title: "Arctic Fox earned its name",
			body: "Camped at 7,200 ft in Glacier NP in October with overnight lows at 12F. The Arctic Fox kept us comfortable all night without running the furnace to death. Vacuum-bonded walls, heated underbelly, arctic plumbing. Northwood does not cut corners on the four-season features that actually matter.",
			verified: true,
			miles: "",
			years: "3 yrs"
		},
		{
			author: "Aaron P.",
			location: "Bozeman, MT",
			date: "Mar 2026",
			title: "Wolf Creek truck camper is the most capable adventure rig I have owned",
			body: "Combined a Ram 3500 with the Wolf Creek 1050. Driven to places no travel trailer could follow. Beartooth Highway, the Idaho backcountry, Baja. The vacuum-bonded fiberglass shell is impervious to any weather and the full wet bath means we never need hookups. Three years, zero warranty claims.",
			verified: true,
			miles: "",
			years: "3 yrs"
		},
		{
			author: "Diane & Mark R.",
			location: "Denver, CO",
			date: "Dec 2025",
			title: "Nash gives four-season quality at a realistic price",
			body: "Bought the Nash 23D as our introduction to Northwood quality after reading about Arctic Fox for years. The same insulation standards, the same aluminum construction just smaller and more affordable. Our first winter camping trailer and it performed beyond every expectation.",
			verified: true,
			miles: "",
			years: "16 months"
		},
		{
			author: "Chris L.",
			location: "Boise, ID",
			date: "Sep 2025",
			title: "Northwood builds in Oregon and takes pride in it",
			body: "Toured the La Grande factory before buying. The vacuum-bonding process and the quality of the aluminum framing is unlike anything I saw at the big Indiana manufacturers. The Arctic Fox 27-5L has been our home for 2 seasons and not a single item has failed or needed warranty attention.",
			verified: false,
			miles: "",
			years: "2 yrs"
		}
	],
	"Newmar": [
		{
			author: "Gary & Linda T.",
			location: "Scottsdale, AZ",
			date: "May 2026",
			title: "Newmar quality lives up to every bit of the reputation",
			body: "We stepped up from a Winnebago to the Dutch Star and the difference is night and day. The hand-finished cabinetry, the Spartan chassis ride, the Cummins torque — everything just works. The Newmar service center in Nappanee is genuinely world-class.",
			verified: true,
			miles: "21,000+",
			years: "2 yrs"
		},
		{
			author: "Robert & Sue M.",
			location: "Naples, FL",
			date: "Feb 2026",
			title: "Third Newmar — will never buy anything else",
			body: "King Aire after two Dutch Stars and the build quality has only gotten better. Zero rattles on 25,000 miles of interstate. Newmar genuinely stands behind their coaches and the customer service team in Indiana picks up the phone.",
			verified: true,
			miles: "25,000+",
			years: "18 months"
		},
		{
			author: "Tom K.",
			location: "Bend, OR",
			date: "Nov 2025",
			title: "Minor PDI issues but outstanding warranty support",
			body: "Had a slideout wiring issue at delivery — Newmar shipped parts overnight and my local dealer fixed it within 48 hours at no charge. The coach itself is brilliant once sorted. Fuel economy on the ISL is about 7.5 mpg, better than expected.",
			verified: true,
			miles: "11,200+",
			years: "9 months"
		},
		{
			author: "Carol B.",
			location: "Flagstaff, AZ",
			date: "Aug 2025",
			title: "Smoothest tow vehicle I have ever driven",
			body: "The Spartan K2 air suspension truly isolates every road imperfection. My husband drove our last coach and I never wanted to. Now I volunteer for the long hauls. The Mountain Aire is the RV equivalent of a first-class airline seat.",
			verified: false,
			miles: "16,400+",
			years: "14 months"
		}
	],
	"Tiffin": [
		{
			author: "Jim & Pat H.",
			location: "Birmingham, AL",
			date: "Jun 2026",
			title: "The Tiffin family culture makes all the difference",
			body: "Bob Tiffin answers his phone. That says everything about this company. The Allegro Bus is exceptional — quiet at highway speed, the slides are dead silent, and the residential-style interior makes long-term living genuinely comfortable.",
			verified: true,
			miles: "19,500+",
			years: "20 months"
		},
		{
			author: "Steve & Mary B.",
			location: "Pensacola, FL",
			date: "Mar 2026",
			title: "Lifetime structural warranty actually means something",
			body: "Had a delamination concern at year 3. Tiffin repaired it at their Red Bay service center in under a week, completely covered. No other manufacturer backs their coaches like this. We are full-timers and this is our home.",
			verified: true,
			miles: "48,000+",
			years: "3.5 yrs"
		},
		{
			author: "Dan R.",
			location: "Austin, TX",
			date: "Jan 2026",
			title: "Phaeton — best value in diesel pushers",
			body: "Compared the Phaeton against the Winnebago Journey and the Fleetwood Discovery. The Tiffin was the clear winner for build quality per dollar. The slides operate absolutely smoothly and the interior layout is the most livable.",
			verified: true,
			miles: "13,700+",
			years: "11 months"
		},
		{
			author: "Karen W.",
			location: "Tucson, AZ",
			date: "Sep 2025",
			title: "A few delivery niggles but exceptional after-sale support",
			body: "Water heater element failed at 6 months. Called the Red Bay rally hotline and had a replacement shipped in 3 days. The Allegro Red itself is beautifully finished — the panoramic windshield is a genuine game changer for sightseeing.",
			verified: false,
			miles: "8,900+",
			years: "7 months"
		}
	],
	"Winnebago": [
		{
			author: "Mike & Carol S.",
			location: "Forest City, IA",
			date: "Apr 2026",
			title: "65 years of American manufacturing — still the benchmark",
			body: "Our Grand Tour is the fourth Winnebago we have owned over 30 years. The quality continues to improve and the dealer network across North America is unbeaten. If anything goes wrong anywhere in the country, there is a Winnebago dealer nearby.",
			verified: true,
			miles: "17,200+",
			years: "16 months"
		},
		{
			author: "Lisa T.",
			location: "Portland, OR",
			date: "Feb 2026",
			title: "Revel changed how we think about camping",
			body: "The 4WD Revel took us places Class A owners can only dream about. Bryce Canyon in November, Arches in a snowstorm. The lithium system runs the diesel heater all night. Smaller than we were used to but we would never go back.",
			verified: true,
			miles: "22,800+",
			years: "2 yrs"
		},
		{
			author: "Paul & Jean M.",
			location: "Tampa, FL",
			date: "Oct 2025",
			title: "Adventurer — solid workhorse, great value",
			body: "Bought the Adventurer for our retirement road trip across all 48 states. Absolutely no mechanical issues over 28,000 miles. Ford V10 is smooth and reliable. The only complaint is the gas mileage — about 7 mpg — but that is the price of this size.",
			verified: true,
			miles: "28,000+",
			years: "2 yrs"
		},
		{
			author: "Sandra K.",
			location: "Asheville, NC",
			date: "Jul 2025",
			title: "Outstanding but plan for Sprinter dealer wait times",
			body: "The View on a Mercedes Sprinter is genuinely excellent. Fuel economy is 18-20 mpg which is remarkable. However, finding a Sprinter-qualified RV tech can take weeks. Budget extra time for any warranty work compared to Ford-based units.",
			verified: false,
			miles: "14,100+",
			years: "13 months"
		}
	],
	"Forest River": [
		{
			author: "Dave & Cindy L.",
			location: "Elkhart, IN",
			date: "May 2026",
			title: "Berkshire at this price point is hard to beat",
			body: "Shopped the Discovery and the Sportscoach before settling on the Berkshire XL. The 2-year structural warranty tipped it. Freightliner chassis rides great, the Cummins is bulletproof, and the interior finish is genuinely upscale for the price.",
			verified: true,
			miles: "15,600+",
			years: "14 months"
		},
		{
			author: "Randy T.",
			location: "Phoenix, AZ",
			date: "Jan 2026",
			title: "Great RV but expect some warranty claims",
			body: "Forest River is a large manufacturer and QC can be inconsistent. Our Georgetown needed a fresh water tank replaced at 4 months. Frustrating, but the dealer and FR both stepped up. Past that point the coach has been absolutely fine for 14,000 miles.",
			verified: true,
			miles: "14,200+",
			years: "12 months"
		},
		{
			author: "Donna & Frank P.",
			location: "Savannah, GA",
			date: "Nov 2025",
			title: "Sunseeker — best family Class C for the money",
			body: "Third year with our Sunseeker 3010DS. The bunk beds have been an absolute hit with the grandkids. Tows effortlessly behind the F-350. Storage is better than most Class As in this length. Would buy again in a heartbeat.",
			verified: true,
			miles: "31,000+",
			years: "3 yrs"
		},
		{
			author: "Tom B.",
			location: "Denver, CO",
			date: "Sep 2025",
			title: "Rockwood fifth wheel is incredibly well appointed",
			body: "The Rockwood Signature 8299BS has a kitchen that honestly rivals my house. The residential fridge, the island sink, the auto-leveling system — all work flawlessly. A few minor cosmetic issues at delivery but the dealer sorted everything same day.",
			verified: false,
			miles: "",
			years: "2 yrs"
		}
	],
	"Entegra Coach": [
		{
			author: "William & Barbara F.",
			location: "Palm Desert, CA",
			date: "Jun 2026",
			title: "Entegra 3-year warranty is the real deal",
			body: "Had a slide mechanism issue at 18 months. Entegra authorized repair at our home dealer same week, zero cost. This is the warranty that makes Entegra worth the premium over Fleetwood or Thor. The Anthem itself is spectacular — best interior finish in its price class.",
			verified: true,
			miles: "23,400+",
			years: "2 yrs"
		},
		{
			author: "James & Helen T.",
			location: "Scottsdale, AZ",
			date: "Apr 2026",
			title: "Cornerstone — the most residential coach on the market",
			body: "Five slideouts and a full-width rear bedroom. The Cornerstone feels like a luxury apartment rolling down the highway. Hand-hammered copper sinks, heated tile, frameless furniture. The Spartan K3 soaks up every bump. Worth every cent of the premium.",
			verified: true,
			miles: "18,700+",
			years: "18 months"
		},
		{
			author: "Richard M.",
			location: "Sarasota, FL",
			date: "Feb 2026",
			title: "Aspire is the sweet spot in the Entegra lineup",
			body: "Looked at Newmar Ventana, Tiffin Phaeton, and the Entegra Aspire. The Entegra won on warranty length and interior quality. The full-wall slide makes the living room feel enormous. Customer service has been stellar on the two minor warranty calls.",
			verified: true,
			miles: "12,800+",
			years: "11 months"
		},
		{
			author: "Susan P.",
			location: "Nashville, TN",
			date: "Oct 2025",
			title: "Reatta — Entegra quality in a gas chassis",
			body: "Most people do not realize Entegra builds gas Class As too. The Reatta has the same 3-year warranty, the same interior quality standards, and the same outstanding customer service as the diesel lineup. For buyers not ready for a diesel, this is the way.",
			verified: false,
			miles: "9,100+",
			years: "8 months"
		}
	],
	"Thor": [
		{
			author: "Kevin & Amy J.",
			location: "Las Vegas, NV",
			date: "Apr 2026",
			title: "Tuscany — Thor flagship does not disappoint",
			body: "The hand-laid tile and heated floors in the Tuscany are genuinely stunning. Thor has clearly invested in the premium segment. Spartan K3 chassis absorbs everything the southwest throws at it. Had one recall addressed proactively — no drama.",
			verified: true,
			miles: "16,300+",
			years: "15 months"
		},
		{
			author: "Mark & Debbie S.",
			location: "Houston, TX",
			date: "Jan 2026",
			title: "ACE is a great starter coach at a fair price",
			body: "First Class A after years in travel trailers. The ACE made the transition easy — compact enough to park anywhere, Ford V10 is reliable, and Thor has a huge dealer network. Build quality is not Tiffin but for the price it absolutely delivers.",
			verified: true,
			miles: "8,400+",
			years: "9 months"
		},
		{
			author: "Chris L.",
			location: "Orlando, FL",
			date: "Nov 2025",
			title: "Palazzo diesel — great value but some QC variance",
			body: "Our Palazzo needed a few warranty items sorted in the first 6 months. Nothing catastrophic but it took persistence. Past that, the Freightliner chassis and Cummins engine have been completely reliable. Fuel economy averages 8.2 mpg in mixed driving.",
			verified: true,
			miles: "13,200+",
			years: "13 months"
		},
		{
			author: "Jennifer B.",
			location: "Phoenix, AZ",
			date: "Aug 2025",
			title: "Four Winds Class C — perfect family vacation machine",
			body: "Three summers with our Four Winds 28A. Kids love the bunk beds, we love the over-cab sleeping area. The Ford E-450 has never let us down. Simple enough for a first-time owner to maintain themselves. Extremely happy.",
			verified: false,
			miles: "",
			years: "3 yrs"
		}
	],
	"Coachmen": [
		{
			author: "Phil & Nancy D.",
			location: "Indianapolis, IN",
			date: "May 2026",
			title: "Sportscoach — best diesel value in the midwest",
			body: "The 2-year structural warranty on the Sportscoach is better than Thor or Fleetwood at this price point. Freightliner chassis rides beautifully. Interior is tasteful without being over-the-top. Perfect for couples who want diesel performance without paying Tiffin prices.",
			verified: true,
			miles: "17,800+",
			years: "17 months"
		},
		{
			author: "Bob & Sharon W.",
			location: "Myrtle Beach, SC",
			date: "Feb 2026",
			title: "Leprechaun has been flawless for 3 seasons",
			body: "Best-value Class C I could find at any dealer. The Leprechaun has never missed a beat — we camp 4 months a year in it. The 219BH bunkhouse layout works perfectly for visiting grandkids. Coachmen service is responsive and helpful.",
			verified: true,
			miles: "24,200+",
			years: "3 yrs"
		},
		{
			author: "Eric T.",
			location: "Columbus, OH",
			date: "Oct 2025",
			title: "Mirada — good gas Class A for the price",
			body: "Compared 6 brands before choosing the Mirada 35BH. The 2-year warranty and solid build won me over. A few minor tweaks needed at PDI but the dealer was great. 11,000 miles in and the slides work perfectly and zero water intrusion.",
			verified: true,
			miles: "11,000+",
			years: "10 months"
		},
		{
			author: "Laura M.",
			location: "Charlotte, NC",
			date: "Jul 2025",
			title: "Freelander — reliable family road trip rig",
			body: "Our Freelander has taken us from the Smokies to the Rockies three times. Never a breakdown, never a leak. The Class C layout is just incredibly practical for families — the cab-over bunk, the street side storage, the easy maneuverability.",
			verified: false,
			miles: "",
			years: "2.5 yrs"
		}
	],
	"Fleetwood": [
		{
			author: "Chuck & Margie R.",
			location: "Sacramento, CA",
			date: "Jun 2026",
			title: "Discovery LXE — Fleetwood earns its premium tier",
			body: "The LXE package adds real substance — hand-selected hardwood, spa bath, residential appliances. Spartan K3 chassis means the ride quality matches the interior luxury. Fleetwood Retail Experience Center in Decatur is a genuine pleasure to deal with.",
			verified: true,
			miles: "14,900+",
			years: "13 months"
		},
		{
			author: "Howard T.",
			location: "Tampa, FL",
			date: "Mar 2026",
			title: "Bounder — the workhorse Class A that just goes",
			body: "Our Bounder 35K has 61,000 miles on it. Still tight, still no leaks, still every slide works perfectly. Fleetwood knows how to build a gas Class A. Parts availability through the nationwide dealer network is outstanding.",
			verified: true,
			miles: "61,000+",
			years: "5 yrs"
		},
		{
			author: "Patty & Bill S.",
			location: "Raleigh, NC",
			date: "Dec 2025",
			title: "Discovery diesel — perfect balance of quality and value",
			body: "Chose the Discovery over a Tiffin Phaeton based on the feature list and dealer proximity. Freightliner custom chassis is proven and the Cummins ISL is a known quantity. Excellent fuel economy and the coach has been rattle-free since day one.",
			verified: true,
			miles: "19,300+",
			years: "20 months"
		},
		{
			author: "Sam K.",
			location: "Atlanta, GA",
			date: "Sep 2025",
			title: "Tioga Ranger — compact Class C that does everything right",
			body: "The 27BH layout is the sweet spot — big enough for a family of 4, small enough to fit in a normal campsite. Ford E-450 has been completely reliable. Interior is straightforward and easy to maintain. No pretense, just a solid, dependable unit.",
			verified: false,
			miles: "",
			years: "2 yrs"
		}
	],
	"Jayco": [
		{
			author: "Scott & Amy H.",
			location: "Shipshewana, IN",
			date: "May 2026",
			title: "Jayco warranty is better than anything at this price",
			body: "The 2-year structural warranty on the Precept was what sealed the deal. We had a roof cap separation at 14 months — Jayco authorized complete replacement, no charge, no hassle. The Stronghold VBL construction is genuinely more rigid than competitors.",
			verified: true,
			miles: "16,500+",
			years: "17 months"
		},
		{
			author: "Tom & Carol B.",
			location: "Fort Myers, FL",
			date: "Feb 2026",
			title: "Embark — Jayco diesel proves they can compete",
			body: "Skeptics said Jayco could not build a real diesel pusher. The Embark proved them wrong. Spartan K2 chassis, Cummins 400HP, and the Jayco interior quality I already trusted. Outstanding for a first-generation diesel product.",
			verified: true,
			miles: "11,200+",
			years: "10 months"
		},
		{
			author: "Linda W.",
			location: "Nashville, TN",
			date: "Oct 2025",
			title: "Jay Feather tows like nothing with my half-ton",
			body: "At 4,800 lbs the Jay Feather is the lightest quality travel trailer I could find. My F-150 does not even know it is back there. The aluminum-framed Stronghold construction feels tank-solid — none of the flex I felt in the Keystone we test drove.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Greg P.",
			location: "Denver, CO",
			date: "Jul 2025",
			title: "Melbourne Prestige — Sprinter Class C perfection",
			body: "Jayco quality plus Mercedes reliability is a winning combination. The Melbourne handles like a van, gets 19 MPG, and fits in any parking spot. The only downside is Sprinter dealers can be slow — budget time for any service calls.",
			verified: false,
			miles: "18,600+",
			years: "19 months"
		}
	],
	"Airstream Atlas": [
		{
			author: "Alex & Megan V.",
			location: "Jackson Hole, WY",
			date: "May 2026",
			title: "Atlas Tommy Bahama — most photographed van at every resort",
			body: "Three months waiting for the Tommy Bahama edition and it was worth every day. The resort-inspired interior is genuinely stunning — the woven textiles, warm wood tones, the hammered copper sink. Pulls 19 MPG fully loaded. Airstream aluminum exterior means it will still look perfect in 20 years. Nothing else in this class comes close.",
			verified: true,
			miles: "14,200+",
			years: "15 months"
		},
		{
			author: "Brian & Stephanie L.",
			location: "Aspen, CO",
			date: "Feb 2026",
			title: "Atlas 24GT — hotel suite quality in a van",
			body: "Sold a Leisure Travel Vans Unity to buy the Atlas 24GT. The Airstream 3-year structural warranty and hand-riveted aluminum exterior are unmatched. The king bed configuration is more comfortable than most hotel rooms. 22,000 miles and not a single rattle.",
			verified: true,
			miles: "22,000+",
			years: "2 yrs"
		},
		{
			author: "Jennifer K.",
			location: "Santa Barbara, CA",
			date: "Oct 2025",
			title: "Best resale retention in the Class B segment",
			body: "Airstream Atlas depreciates slower than any other Class B. Comparable Atlases at 3 years old sell at 80 cents on the dollar. The aluminum shell, Mercedes platform, and Airstream name combine into the most durable investment in the van segment.",
			verified: true,
			miles: "18,400+",
			years: "22 months"
		},
		{
			author: "David R.",
			location: "Telluride, CO",
			date: "Jun 2025",
			title: "Worth the premium — genuinely different class",
			body: "The Atlas costs $50k more than a Winnebago View. The 3-year warranty, hand-riveted exterior, and interior finish quality justify every dollar. Induction cooktop, diesel Sprinter economy, and it parks anywhere make this the most practical luxury vehicle I have ever owned.",
			verified: false,
			miles: "11,600+",
			years: "13 months"
		}
	],
	"Thor Sanctuary": [
		{
			author: "Kevin & Lisa M.",
			location: "Denver, CO",
			date: "Apr 2026",
			title: "Sanctuary 19L — Thor delivers a solid Sprinter Class B",
			body: "Compared the Sanctuary against Coachmen Galleria and Winnebago View. Thor's national dealer network was the deciding factor — we travel full-time and need service access everywhere. The Sprinter chassis delivers 19 MPG and the interior is clean and well finished.",
			verified: true,
			miles: "16,800+",
			years: "18 months"
		},
		{
			author: "Sarah & Tom B.",
			location: "Bozeman, MT",
			date: "Jan 2026",
			title: "Best entry point into Sprinter Class B ownership",
			body: "The Sanctuary 19BT twin-bed layout is perfect for our travel style. Fits in any parking spot, parks in national park sites that turn away larger rigs, and the Sprinter diesel handles mountain passes effortlessly. Thor dealer network has made two service calls straightforward.",
			verified: true,
			miles: "11,200+",
			years: "12 months"
		},
		{
			author: "Mark P.",
			location: "Portland, OR",
			date: "Sep 2025",
			title: "Solid van — Thor support makes it practical to own",
			body: "There are more luxurious Sprinter Class Bs but nothing with better dealer access. Had a water pump issue at 8 months — Thor's service network had me in a dealer the same day, warranty covered, back on the road next morning. That's worth the premium over boutique builders.",
			verified: true,
			miles: "9,400+",
			years: "10 months"
		},
		{
			author: "Donna W.",
			location: "Seattle, WA",
			date: "May 2025",
			title: "Sanctuary — capable, compact, easy to drive",
			body: "First RV purchase after years of tent camping. The Sanctuary 19MBL is the perfect first step — drives like a large van, parks anywhere, full wet bath, and a kitchen that actually works for two people. The Sprinter economy means weekend trips cost very little in fuel.",
			verified: false,
			miles: "7,200+",
			years: "9 months"
		}
	],
	"Regency": [
		{
			author: "William & Anne C.",
			location: "Palm Beach, FL",
			date: "Jun 2026",
			title: "Ultra Brougham — the Rolls Royce of Class B motorhomes",
			body: "Placed our deposit 10 months before delivery. Every month we visited the shop to see the handwork progress — the Italian tile installation, the cabinet fitting, the lithium system integration. Nothing is mass-produced here. The 400Ah lithium bank with 600W solar means we have never needed hookups.",
			verified: true,
			miles: "8,400+",
			years: "11 months"
		},
		{
			author: "Richard & Patricia H.",
			location: "Naples, FL",
			date: "Mar 2026",
			title: "Eight month wait — completely justified",
			body: "We have owned three Class A diesel pushers. The Regency Ultra Brougham 28QB is the first vehicle that made us not miss the big coach. The slideout transforms the bedroom. Heated Italian tile floors, full induction kitchen, and Regency's 3-year structural warranty. Built in limited production with care that mass builders cannot match.",
			verified: true,
			miles: "11,200+",
			years: "14 months"
		},
		{
			author: "George T.",
			location: "Scottsdale, AZ",
			date: "Nov 2025",
			title: "Resale value rivals Airstream — better interior by miles",
			body: "Sold a 2-year-old Ultra Brougham for 86 cents on the dollar. Only Airstream and Regency hold value like this in the van segment. The handcrafted hardwood cabinetry, genuine copper fixtures, and Sprinter 170 EXT wheelbase make this a completely different product from production Class Bs.",
			verified: true,
			miles: "19,600+",
			years: "2 yrs"
		},
		{
			author: "Carol & James M.",
			location: "Sedona, AZ",
			date: "Jul 2025",
			title: "The most thoughtful use of 28 feet I have ever seen",
			body: "The 28RK floor plan has a kitchen I actually cook in — induction burners, full-size sink, real counter depth. The rear king suite with slide is more comfortable than my guest bedroom. Regency owners are a small, passionate community and factory support is genuinely personal.",
			verified: false,
			miles: "8,800+",
			years: "10 months"
		}
	],
	"Airstream": [
		{
			author: "Alex & Claire T.",
			location: "Marfa, TX",
			date: "Jun 2026",
			title: "Classic holds its value better than my house",
			body: "Bought a 2019 Classic 33FBT for $165k. Kelley Blue Book values it at $145k today. No other RV depreciates this slowly. The hand-riveted aluminum is impervious to weather and the quality of every fitting is unlike anything else in the RV world.",
			verified: true,
			miles: "",
			years: "3 yrs"
		},
		{
			author: "Ryan & Megan B.",
			location: "Boulder, CO",
			date: "Mar 2026",
			title: "Bambi — the most photographed trailer at every campground",
			body: "We get asked about our Bambi 19CB at every campground, every rest stop. The silver bullet aesthetic is iconic. More importantly it is brilliantly built — nothing rattles, every surface is quality, and the towing stability with the weight distribution hitch is incredible.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Jennifer S.",
			location: "Portland, OR",
			date: "Nov 2025",
			title: "Interstate Grand Tour — worth the Mercedes premium",
			body: "Yes it costs more than the Winnebago View on a Sprinter. The Airstream interior quality justifies every penny. The brushed aluminum accents, the leather, the thoughtful use of every inch of space. It feels like a boutique hotel suite on wheels.",
			verified: true,
			miles: "14,200+",
			years: "15 months"
		},
		{
			author: "Kevin M.",
			location: "Sedona, AZ",
			date: "Aug 2025",
			title: "Flying Cloud — Airstream sweet spot",
			body: "The 27FB layout is exactly what my wife and I needed. King bed, full bath, a real kitchen — all in 27 feet of hand-built aluminum perfection. Airstream resale value and structural integrity after 3 seasons makes this the best long-term RV investment.",
			verified: false,
			miles: "",
			years: "3 yrs"
		}
	],
	"Keystone Montana": [
		{
			author: "Chris & Donna F.",
			location: "Louisville, KY",
			date: "Apr 2026",
			title: "Montana is America's best-selling fifth wheel for good reason",
			body: "On our second Montana in 8 years. First one went 85,000 road miles with no structural issues. The 3855BR has a king master suite that is genuinely residential — more comfortable than most hotel rooms. No other fifth wheel at this price has the nationwide dealer footprint Montana owners enjoy.",
			verified: true,
			miles: "",
			years: "2.5 yrs"
		},
		{
			author: "Rob & Janet H.",
			location: "Rapid City, SD",
			date: "Jan 2026",
			title: "Montana owner community is unlike any other fifth wheel brand",
			body: "The Montana Owners Group on Facebook has over 80,000 members. Rally meetups across the country, an incredibly deep knowledge base, and owners who genuinely help each other. No Keystone brand gets more dedicated owner engagement than Montana. The 3231CK layout is our perfect home base — four seasons a year for 3 years.",
			verified: true,
			miles: "",
			years: "3 yrs"
		},
		{
			author: "Sharon & Bill K.",
			location: "Nashville, TN",
			date: "Sep 2025",
			title: "Best long-term value in the fifth wheel segment",
			body: "Sold our 5-year-old Montana 3855BR for 68 cents on the dollar. No other fifth wheel at this price depreciates this slowly. The combination of build quality, nationwide dealer support, and the massive Montana owner community creates demand that sustains resale value year after year.",
			verified: true,
			miles: "",
			years: "5 yrs"
		},
		{
			author: "Tom & Linda M.",
			location: "Phoenix, AZ",
			date: "Jun 2025",
			title: "Montana 3953FB — the residential fifth wheel standard",
			body: "Full-width rear living, front bedroom, four slides, and a kitchen island that is the envy of every campsite. The Montana 3953FB layout is the reason this is America's best seller — the most thoughtful, livable floor plan design in the segment. Keystone's dealer network spans every state.",
			verified: false,
			miles: "",
			years: "22 months"
		}
	],
	"Keystone": [
		{
			author: "Chris & Donna F.",
			location: "Louisville, KY",
			date: "Apr 2026",
			title: "Montana is America best-selling fifth wheel for good reason",
			body: "On our second Montana in 8 years. First one went 85,000 road miles with no structural issues. The 3855BR has a king master suite that is genuinely residential — more comfortable than most hotel rooms. Keystone dealer network spans every state.",
			verified: true,
			miles: "",
			years: "2.5 yrs"
		},
		{
			author: "Mike T.",
			location: "Dallas, TX",
			date: "Jan 2026",
			title: "Alpine is the hidden gem of fifth wheels",
			body: "Nobody talks about the Alpine as much as the Montana or Grand Design but it competes directly and often wins. The 3781FK with quad slides is an absolutely massive living space. Four seasons insulation package keeps it comfortable from Florida to Canada.",
			verified: true,
			miles: "",
			years: "20 months"
		},
		{
			author: "Paula K.",
			location: "Albuquerque, NM",
			date: "Oct 2025",
			title: "Cougar — best value travel trailer, full stop",
			body: "Compared 12 travel trailers before choosing the Cougar 30RLS. Nothing comes close to the feature content per dollar. The residential feel of the interior, the auto-leveling, the full pass-through storage. Three years in and not a single warranty issue.",
			verified: true,
			miles: "",
			years: "3 yrs"
		},
		{
			author: "Bob W.",
			location: "Boise, ID",
			date: "Jul 2025",
			title: "Passport — perfect lightweight starter trailer",
			body: "Bought the Passport 189ML as our introduction to RVing. My F-150 XLT barely knows it is back there. Well finished inside for the price, the storage is smarter than trailers costing twice as much. Will upgrade to a Montana when the kids are older.",
			verified: false,
			miles: "",
			years: "18 months"
		}
	],
	"Grand Design": [
		{
			author: "Dave & Nancy P.",
			location: "Elkhart, IN",
			date: "May 2026",
			title: "Grand Design customer service is genuinely unmatched",
			body: "I have contacted Grand Design three times with warranty questions. Every single time a real person answered, knew the product, and resolved the issue. No runaround, no waiting. The Solitude 375RES itself is exceptional — residential kitchen, full bath, phenomenal storage.",
			verified: true,
			miles: "",
			years: "2.5 yrs"
		},
		{
			author: "Ken & Sue T.",
			location: "Scottsdale, AZ",
			date: "Feb 2026",
			title: "Momentum toy hauler — best in class, no contest",
			body: "Researched every toy hauler on the market for 6 months. The Momentum 376TH has the most thoughtful layout, the best garage-to-living ratio, and Grand Design 2-year structural warranty. Plus their Facebook owner community is incredibly active and helpful.",
			verified: true,
			miles: "",
			years: "20 months"
		},
		{
			author: "John M.",
			location: "Fort Collins, CO",
			date: "Nov 2025",
			title: "Reflection 315RLTS — flagship feature set at mid-tier price",
			body: "The fiberglass front cap, the aluminum frame, the residential refrigerator — these are premium features at a mid-tier price. Build quality is the best I have seen below $80k. Triple slides open the living area to something truly livable.",
			verified: true,
			miles: "",
			years: "14 months"
		},
		{
			author: "Amy B.",
			location: "Seattle, WA",
			date: "Aug 2025",
			title: "Imagine is the best lightweight travel trailer in its class",
			body: "At 7,400 lbs the Imagine 2800BH is our family do-everything trailer. The aluminum frame and fiberglass walls resist delamination unlike typical fiberglass-over-luan competitors. Grand Design service has been fantastic for our one warranty call.",
			verified: false,
			miles: "",
			years: "2 yrs"
		}
	],
	"American Coach": [
		{
			author: "George & Harriet L.",
			location: "Palm Springs, CA",
			date: "Jun 2026",
			title: "American Tradition — the definition of luxury on the road",
			body: "We spent two years comparing the Newmar King Aire, Entegra Cornerstone, and American Tradition. The American Coach won on interior appointments, HWH leveling system precision, and the extraordinary attention to detail. The Spartan K3 ride is simply sublime.",
			verified: true,
			miles: "12,600+",
			years: "14 months"
		},
		{
			author: "Frank & Beverly N.",
			location: "Boca Raton, FL",
			date: "Mar 2026",
			title: "American Eagle — hand-built quality justifies the price",
			body: "The American Coach factory in Decatur, IN builds coaches the way they used to — hand-fitted cabinetry, custom woodwork, attention to every joint and seam. Our Eagle has 20,000 miles and not one rattle. Customer service answered every call personally.",
			verified: true,
			miles: "20,100+",
			years: "2 yrs"
		},
		{
			author: "Ron T.",
			location: "Sedona, AZ",
			date: "Nov 2025",
			title: "American Dream — serious quality at a step-down price",
			body: "The Dream gets you into American Coach quality without the full flagship price. Same Spartan chassis, same build philosophy, three slides rather than four. Compared to Thor or Fleetwood at a similar price, this is in a completely different league.",
			verified: true,
			miles: "9,800+",
			years: "10 months"
		},
		{
			author: "Linda S.",
			location: "Prescott, AZ",
			date: "Aug 2025",
			title: "Two years in — still love every detail",
			body: "The HWH six-point hydraulic leveling deploys in under 90 seconds. The slide toppers mean we never worry about weather. The Onan Quiet Diesel barely registers when running. American Coach thought of everything — from the Corian counters to the hidden wire management.",
			verified: false,
			miles: "14,400+",
			years: "22 months"
		}
	],
	"Monaco Coach": [
		{
			author: "Bill & Carolyn T.",
			location: "Scottsdale, AZ",
			date: "Apr 2026",
			title: "Dynasty — the Monaco reputation is fully deserved",
			body: "Searched for a Dynasty for two years before finding the right one. The Roadmaster Intrepid chassis gives a ride quality unlike any other RV. Hand-crafted interior, full-wall slide, the Monaco pedigree in every detail. Worth every penny of the investment.",
			verified: true,
			miles: "11,400+",
			years: "13 months"
		},
		{
			author: "Terry K.",
			location: "Naples, FL",
			date: "Jan 2026",
			title: "Camelot — classic Monaco on a budget",
			body: "The Camelot gave us Monaco quality at a more achievable price. The build quality is unmistakably premium — tight panel gaps, smooth slideout operation, that classic Monaco ride. Parts availability has been excellent through the national Monaco service network.",
			verified: true,
			miles: "16,700+",
			years: "18 months"
		},
		{
			author: "Diane M.",
			location: "Tucson, AZ",
			date: "Oct 2025",
			title: "Exceptional but expect longer parts lead times",
			body: "With Monaco now under Coachmen ownership, some parts have longer lead times than ideal. The coach itself is magnificent — nothing flexes, nothing rattles. Just be prepared to plan ahead for any service work and keep a relationship with a Monaco specialist dealer.",
			verified: false,
			miles: "7,200+",
			years: "8 months"
		},
		{
			author: "Richard P.",
			location: "Scottsdale, AZ",
			date: "Jul 2025",
			title: "Roadmaster IS chassis is the gold standard for diesel pushers",
			body: "Drove a Newmar, a Tiffin, and a Monaco back to back. The Roadmaster Intrepid Suspension is the difference — it genuinely isolates bumps and road noise that penetrate other coaches. Once you drive Monaco you understand the premium.",
			verified: true,
			miles: "19,800+",
			years: "2 yrs"
		}
	],
	"Holiday Rambler": [
		{
			author: "Chuck & Mary B.",
			location: "Sun City, AZ",
			date: "May 2026",
			title: "Navigator — great diesel at a step below Tiffin prices",
			body: "Holiday Rambler has been building coaches since 1953 and it shows in the Navigator. Spartan K2 chassis, premium interior, solid diesel performance. For buyers who want near-Tiffin quality without the full Tiffin price, the Navigator is the answer.",
			verified: true,
			miles: "18,900+",
			years: "20 months"
		},
		{
			author: "Ron P.",
			location: "Bradenton, FL",
			date: "Feb 2026",
			title: "Vacationer — honest, reliable gas Class A",
			body: "No pretense, no gimmicks — just a well-built gas Class A from a brand with seven decades of experience. The Vacationer 36F has every feature we need and the Ford F53 is proven at 150,000+ miles. Perfect snowbird rig.",
			verified: true,
			miles: "23,400+",
			years: "2.5 yrs"
		},
		{
			author: "Janet W.",
			location: "Tampa, FL",
			date: "Oct 2025",
			title: "Solid buy — just do your PDI inspection carefully",
			body: "Found some misaligned trim and a sticky slideout at delivery. Dealer resolved both within a week. Holiday Rambler corporate is responsive and the national service network is extensive. Beyond the PDI hiccups, this coach has been impeccable.",
			verified: false,
			miles: "9,600+",
			years: "9 months"
		},
		{
			author: "Gary H.",
			location: "Phoenix, AZ",
			date: "Jul 2025",
			title: "Best resale value in mid-tier diesel pushers",
			body: "Sold my 4-year-old Holiday Rambler Navigator for 72 cents on the dollar. Try getting that from a Thor or Coachmen. The brand reputation and build quality hold their value remarkably well. That made it a financially sound decision even before factoring in how much we enjoyed it.",
			verified: true,
			miles: "34,000+",
			years: "4 yrs"
		}
	],
	"Heartland": [
		{
			author: "Dave & Susan M.",
			location: "Elkhart, IN",
			date: "Apr 2026",
			title: "Bighorn is the residential fifth wheel standard",
			body: "The Bighorn 4001QB has a kitchen that honestly shames many apartments. The king master suite, four slides, and full basement storage make full-timing completely comfortable. Heartland warranty service has been responsive and professional.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Steve T.",
			location: "Phoenix, AZ",
			date: "Jan 2026",
			title: "Sundance — perfect starter fifth wheel",
			body: "First fifth wheel after years in tent camping. The Sundance taught us everything about RVing without breaking the bank. Well finished for the price, everything has worked as expected for two full seasons. Great platform to upgrade from.",
			verified: true,
			miles: "",
			years: "2.5 yrs"
		},
		{
			author: "Lisa B.",
			location: "Albuquerque, NM",
			date: "Sep 2025",
			title: "Prowler — value travel trailer that does the job",
			body: "No frills and not trying to be. The Prowler does everything a family needs from a travel trailer at a price that leaves money for actual camping. Three seasons and the only issue was a loose entry handle — fixed myself in 5 minutes.",
			verified: false,
			miles: "",
			years: "3 yrs"
		},
		{
			author: "Mike R.",
			location: "Nashville, TN",
			date: "Jun 2025",
			title: "Bighorn — best full-timer fifth wheel under $100k",
			body: "Compared the Bighorn against the Keystone Montana, Grand Design Solitude, and DRV Mobile Suites. Heartland won on the basement storage alone — it is massive. Full basement, four slides, and a king suite in our price range was a no-brainer.",
			verified: true,
			miles: "",
			years: "22 months"
		}
	],
	"Lance": [
		{
			author: "Brad & Jennifer K.",
			location: "Bend, OR",
			date: "May 2026",
			title: "Lance tanks are genuinely life-changing for boondockers",
			body: "The Lance 2465 holds 55 gallons of fresh water. Our previous trailer held 32. That extra capacity means we can boondock for a week without thinking about water. The Azdel Onboard composite walls are impervious to delamination in the Pacific Northwest moisture.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Mark R.",
			location: "Flagstaff, AZ",
			date: "Feb 2026",
			title: "Lance 1172 truck camper — ultimate adventure rig",
			body: "Combined a Ram 3500 dually with the Lance 1172 and have been absolutely everywhere — Baja, Alaska Highway, Death Valley. Nothing stops this combination. The build quality of the camper is exceptional and Lance service has been outstanding.",
			verified: true,
			miles: "",
			years: "3 yrs"
		},
		{
			author: "Karen W.",
			location: "Moab, UT",
			date: "Oct 2025",
			title: "Holding tanks justify the premium over competition",
			body: "Compared Lance against Airstream, Outdoors RV, and Northwood. Lance wins on tank capacity, full stop. The construction quality is comparable to Airstream at about 60% of the cost. Two seasons and not a single warranty claim.",
			verified: false,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Paul D.",
			location: "Salt Lake City, UT",
			date: "Jul 2025",
			title: "Best-built lightweight trailer for serious boondockers",
			body: "If you boondock in the desert southwest you need the biggest fresh water tank possible. Nothing in the Lance price range comes close. The Azdel composite construction also means no worrying about delamination from heat cycles — huge advantage in Arizona summers.",
			verified: true,
			miles: "",
			years: "18 months"
		}
	],
	"Pleasure-Way": [
		{
			author: "Andrew & Kate M.",
			location: "Vancouver, BC",
			date: "Jun 2026",
			title: "Plateau TS — hand-built in Canada and it shows",
			body: "Pleasure-Way builds their coaches in Saskatoon and the craftsmanship is genuinely different from mass-produced US brands. Every fitting, every wire run, every surface is finished to a standard that makes you understand why they cost more. Outstanding solar and battery system.",
			verified: true,
			miles: "18,200+",
			years: "19 months"
		},
		{
			author: "Michael T.",
			location: "Portland, OR",
			date: "Feb 2026",
			title: "Ontour 2.0 — best Transit Class B on the market",
			body: "Compared the Ontour against the Roadtrek Zion and the Coachmen Galleria. Pleasure-Way wins on fit and finish, no contest. The Transit chassis is more manageable than the Sprinter and parts availability is far better. Perfect vanlife rig for two.",
			verified: true,
			miles: "12,400+",
			years: "13 months"
		},
		{
			author: "Lisa S.",
			location: "Seattle, WA",
			date: "Sep 2025",
			title: "Premium price but genuinely premium product",
			body: "Yes, the Plateau costs more than comparable US-built Class Bs. Yes, it is worth it. The quality of the cabinet work, the solar system integration, the attention to every detail is unlike anything I saw from Thor or Winnebago at comparable price points.",
			verified: false,
			miles: "9,800+",
			years: "11 months"
		},
		{
			author: "David H.",
			location: "Boulder, CO",
			date: "Jun 2025",
			title: "Three seasons in — still zero warranty claims",
			body: "Three camping seasons across BC, Alberta, and the Pacific Northwest. Not a single warranty claim. Not a single squeek. The Pleasure-Way customer service team in Saskatoon is small but they are genuinely passionate about their product and respond quickly.",
			verified: true,
			miles: "22,400+",
			years: "3 yrs"
		}
	],
	"Roadtrek": [
		{
			author: "John & Sarah P.",
			location: "Sedona, AZ",
			date: "Apr 2026",
			title: "CS Adventurous — the van life done right",
			body: "Roadtrek pioneered the Class B van conversion and the CS Adventurous shows why. Fifty years of refinement in the layout and systems. The Sprinter platform gives real-world utility and the lithium-solar system runs everything for days without shore power.",
			verified: true,
			miles: "16,800+",
			years: "18 months"
		},
		{
			author: "Ryan M.",
			location: "Denver, CO",
			date: "Jan 2026",
			title: "Zion Slumber — affordable van life entry point",
			body: "Budget-conscious Class B built on the ProMaster. Not as refined as the Sprinter models but the quality is solid and the price is realistic. Perfect for couples who want to see the country without a $150k investment. Everything has worked perfectly.",
			verified: true,
			miles: "11,200+",
			years: "12 months"
		},
		{
			author: "Amber K.",
			location: "Boulder, CO",
			date: "Aug 2025",
			title: "Good product but check post-acquisition service coverage",
			body: "Roadtrek changed ownership and service coverage can be inconsistent. The coach itself is excellent and the layout is clever. Just verify your dealer has certified Roadtrek techs and confirm warranty terms carefully before buying.",
			verified: false,
			miles: "7,400+",
			years: "9 months"
		},
		{
			author: "Kim L.",
			location: "Santa Fe, NM",
			date: "May 2025",
			title: "The original van life company — 50 years of refinement",
			body: "Roadtrek invented the modern Class B conversion in 1974. Every layout decision has been refined over decades of owner feedback. The CS Adventurous kitchen and bathroom layout is simply the most intelligent use of 22 feet I have ever seen in a vehicle.",
			verified: true,
			miles: "14,600+",
			years: "16 months"
		}
	],
	"Oliver Travel Trailers": [
		{
			author: "Tom & Rachel B.",
			location: "Bend, OR",
			date: "Jun 2026",
			title: "Nothing else is built like this — period",
			body: "We compared Oliver against Airstream, Lance, and Outdoors RV before buying the Legacy Elite II. The fiberglass sandwich construction with zero wood is in a completely different class. Three years, zero leaks, zero delamination. The 3-year warranty is real and they honor every claim.",
			verified: true,
			miles: "",
			years: "3 yrs"
		},
		{
			author: "Steve & Linda M.",
			location: "Flagstaff, AZ",
			date: "Mar 2026",
			title: "Best resale value in the travel trailer segment",
			body: "Sold my 4-year-old Legacy Elite for 88 cents on the dollar. No other trailer even comes close. Oliver holds its value because the construction genuinely does not degrade — same fiberglass shell at year 10 as year 1. We immediately bought a Legacy Elite II.",
			verified: true,
			miles: "",
			years: "4 yrs"
		},
		{
			author: "Karen P.",
			location: "Santa Fe, NM",
			date: "Nov 2025",
			title: "Factory tour sold us immediately",
			body: "Took the factory tour in Hohenwald, Tennessee before buying. Watching them hand-lay the fiberglass and seeing zero wood in the structure was the tipping point. The Legacy Elite has been completely maintenance-free for two years in the dry southwest heat.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "David H.",
			location: "Moab, UT",
			date: "Aug 2025",
			title: "Worth every penny of the premium",
			body: "Yes, Oliver costs more than Airstream. The fiberglass-over-fiberglass construction eliminates every single failure mode that ruins other trailers — no delamination, no water intrusion, no soft floor. Owner Facebook group is the most knowledgeable RV community I have encountered.",
			verified: false,
			miles: "",
			years: "18 months"
		}
	],
	"Nexus RV Triumph": [
		{
			author: "Dave & Karen S.",
			location: "Denver, CO",
			date: "May 2026",
			title: "Triumph 35T — Super C ownership changed how we travel",
			body: "Commercial F-550 chassis means we never worry about mountain grades. 15,000-lb towing capacity means our diesel truck rides behind us effortlessly. Nexus aluminum-welded frame and the clean interior finish punches well above the price. Three seasons without a single mechanical issue.",
			verified: true,
			miles: "22,400+",
			years: "2.5 yrs"
		},
		{
			author: "Tom & Gail H.",
			location: "Albuquerque, NM",
			date: "Feb 2026",
			title: "Best Super C under $200k — no contest",
			body: "Compared the Triumph 38T against Thor Magnitude, Entegra Expanse, and Coachmen Sportscoach. Nexus won on tow rating, aluminum frame construction, and price per feature. The F-550 Power Stroke is a commercial-grade engine with 500,000-mile service life when properly maintained. Nothing in this class gives you this confidence.",
			verified: true,
			miles: "18,200+",
			years: "20 months"
		},
		{
			author: "Mike & Patricia R.",
			location: "Flagstaff, AZ",
			date: "Nov 2025",
			title: "Triumph Super C community is knowledgeable and passionate",
			body: "Join the Nexus Super C Owners Group before buying — 4,000 members who share F-550 platform details, modification guides, campground reviews for Super C clearances, and direct contact with Nexus service. Commercial chassis ownership comes with a mindset shift and this community prepares you for it.",
			verified: true,
			miles: "14,600+",
			years: "16 months"
		},
		{
			author: "Carol B.",
			location: "Salt Lake City, UT",
			date: "Jul 2025",
			title: "F-550 Power Stroke is the right engine for full-time travel",
			body: "The 6.7L Power Stroke in the Triumph 29T gets 11-12 MPG towing our Jeep — remarkable for a 30,000-lb combination. Ford commercial parts availability at any F-series dealer means we are never stranded. Nexus aluminum frame has shown zero flex or rattle after 28,000 miles.",
			verified: false,
			miles: "28,000+",
			years: "2.5 yrs"
		}
	],
	"Nexus RV": [
		{
			author: "Tom & Carol H.",
			location: "Grand Rapids, MI",
			date: "May 2026",
			title: "Nexus Viper — above-average Class C quality at a fair price",
			body: "Nexus builds in Elkhart and takes pride in their aluminum-welded frame construction. The Viper 31M has a cleaner, less-cluttered interior than Coachmen or Thor at this price. Two seasons and zero warranty claims — that says everything.",
			verified: true,
			miles: "14,600+",
			years: "17 months"
		},
		{
			author: "Greg B.",
			location: "Columbus, OH",
			date: "Feb 2026",
			title: "Phantom — simple, honest, reliable Class C",
			body: "The Phantom 28P is not trying to be a luxury coach. Clean lines, solid construction, everything works as advertised. Nexus customer service is genuinely responsive — actually called me back within 2 hours on a Saturday warranty question.",
			verified: true,
			miles: "10,900+",
			years: "11 months"
		},
		{
			author: "Sandra M.",
			location: "Indianapolis, IN",
			date: "Oct 2025",
			title: "Hidden gem brand — worth looking at before buying Thor",
			body: "Had never heard of Nexus before doing my research. Their aluminum frame construction is a genuine step above the wood-frame competitors. The interior layout on the Viper 34V is smart and livable. Very happy we discovered this brand.",
			verified: false,
			miles: "8,200+",
			years: "10 months"
		},
		{
			author: "Bill T.",
			location: "Louisville, KY",
			date: "Jul 2025",
			title: "Best Class C for the dollar in Elkhart right now",
			body: "Shopped every Class C in the $90-$130k range. Nexus Viper had the best construction quality per dollar. The aluminum frame welds are clean and tight, the cabinetry is solid, and the exterior finish has held up perfectly through two midwest winters.",
			verified: true,
			miles: "12,800+",
			years: "14 months"
		}
	],
	"Crossroads": [
		{
			author: "Dave & Kim T.",
			location: "Indianapolis, IN",
			date: "Apr 2026",
			title: "Cameo is seriously underrated in the fifth wheel market",
			body: "The Crossroads Cameo 3531RD competes directly with Grand Design Reflection and Keystone Montana at a noticeably lower price. Full-wall slide, residential kitchen, king master suite. Two-year structural warranty seals the deal.",
			verified: true,
			miles: "",
			years: "18 months"
		},
		{
			author: "Sandra P.",
			location: "Louisville, KY",
			date: "Nov 2025",
			title: "Sunset Trail — great starter trailer for family camping",
			body: "Our Sunset Trail SS295QB has been our family camping home for two summers. Never a leak, never a mechanical issue. The bunkhouse layout with the slideout makes it feel enormous for a 30-ft trailer. Crossroads warranty service handled our one claim quickly.",
			verified: false,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Mike K.",
			location: "Columbus, OH",
			date: "Aug 2025",
			title: "Great Forest River sub-brand with its own identity",
			body: "People forget that Crossroads is part of the Forest River family which means excellent parts availability and dealer coverage. The Cameo 3680MB has features that would cost $20k more in a Grand Design or Keystone. Smart buy for value-conscious shoppers.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Laura B.",
			location: "Memphis, TN",
			date: "May 2025",
			title: "Sunset Trail perfect for weekend camping families",
			body: "Two kids, a dog, and a Crossroads Sunset Trail SS260BH. Three seasons and it has been flawless. The SS-series insulation package keeps it comfortable even in early spring. Very happy with our purchase — best value travel trailer we found.",
			verified: true,
			miles: "",
			years: "3 yrs"
		}
	],
	"Palomino": [
		{
			author: "Phil & Grace K.",
			location: "Fort Wayne, IN",
			date: "Mar 2026",
			title: "Columbus Compass — full-timer features at fifth-wheel price",
			body: "The Columbus 383FB has a full fireplace, a king bedroom, and four slides — all for $75k. Palomino is part of Forest River so the dealer network and parts support are excellent. We have been full-timing for 14 months without a single issue.",
			verified: true,
			miles: "",
			years: "14 months"
		},
		{
			author: "Mike T.",
			location: "Omaha, NE",
			date: "Oct 2025",
			title: "Real-Lite — lightweight legend for half-ton truck owners",
			body: "The Real-Lite Mini Lite 180 tows at 3,100 lbs — my F-150 barely registers it. The interior is surprisingly well finished for a budget trailer and Palomino uses quality hardware throughout. Perfect for couples who want a simple, lightweight adventure trailer.",
			verified: false,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Karen H.",
			location: "Des Moines, IA",
			date: "Jul 2025",
			title: "Best feature set per dollar in the Forest River lineup",
			body: "Palomino gives you the Forest River dealer network and parts support with a slightly more upscale finish than the base Forest River brands. The Columbus Compass 329DV king suite was the deciding factor — at this price there is nothing else with this layout quality.",
			verified: true,
			miles: "",
			years: "19 months"
		},
		{
			author: "Tom S.",
			location: "Kansas City, MO",
			date: "Apr 2025",
			title: "Real-Lite for SUV owners — the smart choice",
			body: "Towing with a Chevy Tahoe was challenging with most travel trailers. The Real-Lite 208 at 4,200 lbs is within safe range and the Tahoe handles it confidently. Interior is well thought out for the length. Really impressed with the build quality at this price.",
			verified: true,
			miles: "",
			years: "2.5 yrs"
		}
	],
	"Dutchmen": [
		{
			author: "Brad & Lisa M.",
			location: "Ft. Wayne, IN",
			date: "May 2026",
			title: "Aerolite — lightest quality trailer I could find",
			body: "The Aerolite 2423BH tows at 5,200 lbs and my F-150 barely knows it is there. The aluminum SuperFrame construction feels genuinely solid — no flex, no rattles on 15,000 miles. Three bunk beds and a slideout for under $35k is hard to argue with.",
			verified: true,
			miles: "",
			years: "16 months"
		},
		{
			author: "Tom & Cindy R.",
			location: "Columbus, OH",
			date: "Feb 2026",
			title: "Kodiak all-season — camped in January without complaint",
			body: "Bought the Kodiak specifically for four-season camping. The insulation package is impressive — camped in 18-degree weather in the Smokies and the furnace barely ran. The aluminum frame construction gives confidence it will still be tight in 10 years.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "Chris V.",
			location: "Denver, CO",
			date: "Oct 2025",
			title: "Voltage toy hauler — best value garage fifth wheel",
			body: "Compared the Voltage 3855 against Grand Design Momentum and Keystone Fuzion. Dutchmen won on garage size and price. The fuel station is a genuine convenience, the electric ramp is solid, and the living quarters feel upscale for a toy hauler.",
			verified: true,
			miles: "",
			years: "14 months"
		},
		{
			author: "Jennifer S.",
			location: "Nashville, TN",
			date: "Jun 2025",
			title: "Part of Thor family — excellent dealer coverage nationwide",
			body: "Being part of Thor Industries means any Thor dealer can support your Dutchmen. That nationwide network was a major factor in our purchase. The Astoria 3503RLD is well-finished for a mid-market fifth wheel and has been completely reliable for two seasons.",
			verified: false,
			miles: "",
			years: "2 yrs"
		}
	],
	"Leisure Travel Vans": [
		{
			author: "Peter & Karen S.",
			location: "Minneapolis, MN",
			date: "Jun 2026",
			title: "Unity is the best Class B+ ever built, period",
			body: "We have owned Winnebago View, Jayco Melbourne, and now the LTV Unity. Nothing compares. The Canadian craftsmanship, the slideout that transforms the living space, the solar system — this is what a premium van conversion should be. Customer service in Winkler is extraordinary.",
			verified: true,
			miles: "19,400+",
			years: "20 months"
		},
		{
			author: "David & Anne T.",
			location: "Austin, TX",
			date: "Mar 2026",
			title: "Wonder — three years and still feels brand new",
			body: "Three years, 38,000 miles, two coasts and the Alaska Highway. Our Wonder has never had a warranty claim and shows zero signs of wear. The Sprinter chassis is a known quantity and LTV builds the body to match that quality. Best purchase we have ever made.",
			verified: true,
			miles: "38,000+",
			years: "3 yrs"
		},
		{
			author: "Susan M.",
			location: "Santa Fe, NM",
			date: "Dec 2025",
			title: "Serenity — the luxury Class B Airstream should have built",
			body: "Compared the Airstream Interstate against the LTV Serenity. LTV wins on interior quality, standard solar capacity, and the white cabinetry that makes the space feel enormous. Two-year warranty versus Airstream three-year was the only consideration — still chose LTV.",
			verified: true,
			miles: "11,800+",
			years: "13 months"
		},
		{
			author: "Mike & Rachel H.",
			location: "Portland, OR",
			date: "Aug 2025",
			title: "Free 4WD — opened roads no other van could handle",
			body: "The Sprinter 4WD platform with LTV quality is a revelation. Drove to dispersed sites in Gifford Pinchot National Forest that were impassable for 2WD vans. Twin bunk configuration works perfectly for two kids. Best adventure vehicle we have ever owned.",
			verified: false,
			miles: "14,200+",
			years: "17 months"
		}
	],
	"Renegade RV": [
		{
			author: "Jim & Karen V.",
			location: "Scottsdale, AZ",
			date: "May 2026",
			title: "Valencia Super C — the ultimate tow rig and home combined",
			body: "We pull a Jeep on a tow dolly and the Valencia with Cummins 450HP makes it feel like we are not towing at all. The Freightliner Custom Chassis handles mountain grades with complete confidence. The interior quality rivals coaches at twice the price.",
			verified: true,
			miles: "18,400+",
			years: "20 months"
		},
		{
			author: "Bob & Patricia T.",
			location: "Sarasota, FL",
			date: "Feb 2026",
			title: "Villager Class B — Renegade quality in a van package",
			body: "Had a Monaco Dynasty for 7 years before moving to the Villager. The quality of the cabinetry is legitimately the same level. The Sprinter platform gives us 20+ mpg and we can park at any hotel or restaurant. Best downsizing decision we ever made.",
			verified: true,
			miles: "14,200+",
			years: "15 months"
		},
		{
			author: "Steve L.",
			location: "Bend, OR",
			date: "Oct 2025",
			title: "Verona Super C — handles everything the Class A owners can only envy",
			body: "Tow rating of 20,000 lbs means our entire toy collection fits behind us. The Verona has taken us to campgrounds that require off-road driving to reach. Commercial chassis reliability means zero breakdowns in 22,000 miles. Renegade backs it with real warranty support.",
			verified: true,
			miles: "22,000+",
			years: "2 yrs"
		},
		{
			author: "Carol M.",
			location: "Denver, CO",
			date: "Jul 2025",
			title: "Two-year warranty and they actually honor it",
			body: "Minor slideout seal issue at 14 months. Renegade authorized the repair at my local dealer within 48 hours. The Verona itself is beautifully finished — better panel fit than the Thor Magnitude I cross-shopped. Very happy with the purchase.",
			verified: false,
			miles: "11,600+",
			years: "16 months"
		}
	],
	"Dynamax": [
		{
			author: "Mark & Lisa R.",
			location: "Nashville, TN",
			date: "Jun 2026",
			title: "Force Super C — blows away the Thor Magnitude at the same price",
			body: "Compared Force 36FK against Thor Magnitude, Nexus Triumph, and Coachmen Sportscoach. Dynamax won on full-body paint quality, interior finish, and the F-600 tow rating. 22,000 lbs means our horses ride comfortably behind us anywhere in the country.",
			verified: true,
			miles: "16,200+",
			years: "17 months"
		},
		{
			author: "Tom & Janet P.",
			location: "Phoenix, AZ",
			date: "Mar 2026",
			title: "Isata 5 on Sprinter — the perfect couple's motorhome",
			body: "Full-body paint, Mercedes reliability, 19 MPG, fits in any campsite. The Isata 5 has a residential quality interior that the Winnebago View and Jayco Melbourne cannot match. Dynamax's finishing is noticeably more premium at the same price point.",
			verified: true,
			miles: "21,400+",
			years: "22 months"
		},
		{
			author: "Chris B.",
			location: "Fort Worth, TX",
			date: "Nov 2025",
			title: "Europa — the best value Super C on the market",
			body: "At $225k the Europa 31SS delivers full-body paint, F-550 reliability, and Dynamax's premium interior at a price that undercuts Renegade and Thor. Two slideouts open up a genuinely spacious living area. Ford 6.7L Power Stroke is a proven, maintainable engine.",
			verified: true,
			miles: "13,800+",
			years: "14 months"
		},
		{
			author: "Sarah K.",
			location: "Austin, TX",
			date: "Aug 2025",
			title: "Isata 3 Transit — full-body paint changes everything",
			body: "No other Ford Transit RV comes standard with full-body paint. The Isata 3 looks like a high-end coach, not a cargo van conversion. The 3.5L EcoBoost delivers real-world 14-16 mpg towing our car. Interior quality is a big step above the Coachmen Beyond.",
			verified: false,
			miles: "9,200+",
			years: "10 months"
		}
	],
	"DRV": [
		{
			author: "Richard & Carol B.",
			location: "Fort Worth, TX",
			date: "Jun 2026",
			title: "Mobile Suites — the only fifth wheel that competes with a Class A",
			body: "We full-timed in a Newmar Dutch Star for 5 years before moving to the DRV Mobile Suites 44RSSB4. The 9-ft ceiling height is extraordinary. The king suite, the washer/dryer, the hardwood floors — this is genuinely as residential as a fifth wheel gets. Zero regrets.",
			verified: true,
			miles: "",
			years: "2 yrs"
		},
		{
			author: "James & Patricia T.",
			location: "Scottsdale, AZ",
			date: "Mar 2026",
			title: "Mobile Suites build quality rivals coaches at three times the price",
			body: "Our 38RSSB3 has been our home for 26 months. Every panel is plumb, every door is perfectly hung, every surface is quality hardwood or solid surface. DRV builds the Mobile Suites to a standard I have not seen in any other fifth wheel at any price.",
			verified: true,
			miles: "",
			years: "26 months"
		},
		{
			author: "Gary M.",
			location: "Tucson, AZ",
			date: "Oct 2025",
			title: "Tradition — entry to DRV world, still lightyears ahead of the competition",
			body: "The Tradition 390RLS is what happens when a manufacturer cares about build quality. The 8.5-ft ceiling makes you forget you are in a fifth wheel. Solid surface counters, residential bath, triple slides. At $120k it is expensive but a genuine step above Keystone or Heartland.",
			verified: true,
			miles: "",
			years: "18 months"
		},
		{
			author: "Nancy K.",
			location: "Houston, TX",
			date: "Jun 2025",
			title: "Best full-timer fifth wheel at any price point",
			body: "Compared DRV Mobile Suites against Grand Design Solitude and Keystone Montana. DRV is in a completely different class. The ceiling height alone transforms the feel of the space. The construction quality, the residential fixtures, the warranty support — all exceptional.",
			verified: false,
			miles: "",
			years: "22 months"
		}
	]
};
function getMockReviews(make, model, rating) {
	const pool = BRAND_REVIEW_POOLS[`${make} ${model}`] ?? BRAND_REVIEW_POOLS[make] ?? BRAND_REVIEW_POOLS["Winnebago"];
	const modelHash = model.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
	const selected = [];
	const count = Math.min(4, pool.length);
	for (let i = 0; i < count; i++) selected.push(pool[(modelHash + i) % pool.length]);
	while (selected.length < 4 && pool.length > 0) selected.push(pool[selected.length % pool.length]);
	return selected.map((r, i) => ({
		...r,
		id: `${make.replace(/\s/g, "-")}-${model.replace(/\s/g, "-")}-${i}`,
		rating: Math.min(5, Math.max(3, Math.round(rating) - (i === 2 ? 1 : 0)))
	}));
}
/** Stable-looking report id (not a secret) */
function buildReportId(year, make, model) {
	const raw = `${year}|${make}|${model}|${Date.now().toString(36)}`;
	let h = 0;
	for (let i = 0; i < raw.length; i++) h = h * 33 + raw.charCodeAt(i) >>> 0;
	return `RVF-${h.toString(36).toUpperCase().slice(0, 8)}`;
}
function valueFactors(market, rating, recallCount, warrantyYears) {
	const pos = [];
	const neg = [];
	if (rating >= 4.3) pos.push({
		label: `High owner rating ${rating.toFixed(1)}/5.0`,
		positive: true
	});
	if (warrantyYears && warrantyYears >= 2) pos.push({
		label: `${warrantyYears}-year structural warranty`,
		positive: true
	});
	if (market.ageYears <= 3) pos.push({
		label: "Late-model used inventory",
		positive: true
	});
	if (market.ageYears >= 12) pos.push({
		label: "Age-driven depreciation",
		positive: true
	});
	if (recallCount > 0) neg.push({
		label: `${recallCount} active NHTSA recall${recallCount === 1 ? "" : "s"}`,
		positive: false
	});
	if (market.ageYears >= 10) neg.push({
		label: "Older coach — inspect tires & seals",
		positive: false
	});
	return [...pos.slice(0, 2), ...neg.slice(0, 2)];
}
var ZIP_KEY = "rvfax_inventory_zip_v1";
function loadInventoryZip() {
	try {
		return localStorage.getItem(ZIP_KEY)?.trim() || "";
	} catch {
		return "";
	}
}
function saveInventoryZip(zip) {
	try {
		localStorage.setItem(ZIP_KEY, zip.trim());
	} catch {}
}
async function fetchLocalInventory(opts) {
	const params = new URLSearchParams({
		year: String(opts.year),
		make: opts.make,
		model: opts.model,
		zip: opts.zip.trim(),
		radius: String(opts.radius ?? 250),
		rows: String(opts.rows ?? 8)
	});
	try {
		const res = await fetch(`/api/marketcheck/search?${params}`, {
			signal: opts.signal,
			headers: { Accept: "application/json" }
		});
		const data = await res.json();
		if (!res.ok && !("ok" in data)) return {
			ok: false,
			error: data.error || `HTTP ${res.status}`,
			code: "upstream"
		};
		return data;
	} catch (e) {
		if (e?.name === "AbortError") return {
			ok: false,
			error: "cancelled",
			code: "empty"
		};
		return {
			ok: false,
			error: e instanceof Error ? e.message : "Network error",
			code: "upstream"
		};
	}
}
/**
* Vehicle History Report — catalog paints instantly; Live Grok updates soft fields.
* Phase 1: year-banded powertrain always paints from the selected wizard year.
* Brochure powertrain pins always win over Live Grok (prevents ISL/V10 hallucinations).
*/
function RvDetail({ result, onBack, saved, onToggleSave, comparing = false, compareCount = 0, compareFull = false, onToggleCompare, onOpenCompare, onAskGrok }) {
	const { data, year, make, model, floorplan } = result;
	const catalogMarket = estimateMarket(data, year, floorplan);
	const rating = ratingFor(make, model, year);
	const ratingMeta = (0, import_react.useMemo)(() => getRatingMetadata(make, model, year), [
		make,
		model,
		year
	]);
	const [correctBump, setCorrectBump] = (0, import_react.useState)(0);
	const brochure = (0, import_react.useMemo)(() => buildBrochureSpecs(data, year, make, model, floorplan || ""), [
		data,
		year,
		make,
		model,
		floorplan,
		correctBump
	]);
	const yearFloorplans = (0, import_react.useMemo)(() => getFloorplansForYear(year, make, model), [
		year,
		make,
		model
	]);
	const maintenance = (0, import_react.useMemo)(() => getMaintenanceSchedule(data), [data]);
	const reportId = (0, import_react.useMemo)(() => buildReportId(year, make, model), [
		year,
		make,
		model
	]);
	const generatedAt = (0, import_react.useMemo)(() => (/* @__PURE__ */ new Date()).toLocaleString(void 0, {
		dateStyle: "medium",
		timeStyle: "short"
	}), []);
	const [liveRecalls, setLiveRecalls] = (0, import_react.useState)([]);
	const [liveDefects, setLiveDefects] = (0, import_react.useState)([]);
	const [recallSearchNote, setRecallSearchNote] = (0, import_react.useState)(null);
	const [recallLoading, setRecallLoading] = (0, import_react.useState)(true);
	const [recallError, setRecallError] = (0, import_react.useState)(null);
	const [live, setLive] = (0, import_react.useState)(null);
	const [liveLoading, setLiveLoading] = (0, import_react.useState)(true);
	const [liveError, setLiveError] = (0, import_react.useState)(null);
	const [liveRetry, setLiveRetry] = (0, import_react.useState)(0);
	const [exportBusy, setExportBusy] = (0, import_react.useState)(false);
	const [exportMsg, setExportMsg] = (0, import_react.useState)(null);
	const [openMaint, setOpenMaint] = (0, import_react.useState)(false);
	const [correctOpen, setCorrectOpen] = (0, import_react.useState)(false);
	const [correctEngine, setCorrectEngine] = (0, import_react.useState)("");
	const [correctHp, setCorrectHp] = (0, import_react.useState)("");
	const [correctTorque, setCorrectTorque] = (0, import_react.useState)("");
	const [correctChassis, setCorrectChassis] = (0, import_react.useState)("");
	const [correctTrans, setCorrectTrans] = (0, import_react.useState)("");
	const [correctFuel, setCorrectFuel] = (0, import_react.useState)("");
	const [correctNote, setCorrectNote] = (0, import_react.useState)("");
	const [correctMsg, setCorrectMsg] = (0, import_react.useState)(null);
	const shellNav = useShellNavOptional();
	const scrollRef = (0, import_react.useRef)(null);
	const [invZip, setInvZip] = (0, import_react.useState)(() => loadInventoryZip() || "98402");
	const [invRadius, setInvRadius] = (0, import_react.useState)(100);
	const [invLoading, setInvLoading] = (0, import_react.useState)(false);
	const [invError, setInvError] = (0, import_react.useState)(null);
	const [invListings, setInvListings] = (0, import_react.useState)([]);
	const [invSearched, setInvSearched] = (0, import_react.useState)(false);
	const pullHint = usePullToReset(scrollRef, onBack);
	(0, import_react.useEffect)(() => {
		const ctrl = new AbortController();
		setRecallLoading(true);
		setRecallError(null);
		setRecallSearchNote(null);
		fetchRecallsViaApi(year, make, model, ctrl.signal).then((res) => {
			if (ctrl.signal.aborted) return;
			if (!res.ok) {
				if (res.aborted) return;
				setRecallError(res.error);
				setLiveRecalls([]);
				setLiveDefects([]);
				setRecallLoading(false);
				return;
			}
			setLiveRecalls(res.data.recalls);
			setLiveDefects(res.data.defects ?? []);
			setRecallSearchNote(res.data.searchNote ?? null);
			setRecallLoading(false);
		});
		return () => ctrl.abort();
	}, [
		year,
		make,
		model
	]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const ctrl = new AbortController();
		setLiveLoading(true);
		setLiveError(null);
		const peek = peekVerifiedDossier(year, make, model, floorplan);
		if (peek) setLive(peek);
		else setLive(null);
		const catalogCandidate = {
			engine: brochure.engine,
			horsepower: brochure.horsepower,
			torque: brochure.torque,
			chassis: brochure.chassis,
			transmission: brochure.transmission,
			fuelType: data.fuelType,
			type: data.type,
			dataSource: brochure.dataSource,
			accuracyNote: brochure.accuracyNote,
			floorplan: floorplan || null,
			lengthFt: brochure.lengthFt,
			gvwr: brochure.gvwr
		};
		fetchLiveDossier(year, make, model, floorplan, ctrl.signal, catalogCandidate).then((res) => {
			if (cancelled) return;
			if (!res.ok) {
				if (res.aborted) return;
				setLiveError(res.error);
				if (!peek) {}
				return;
			}
			setLive(res.data);
			setLiveError(null);
		}).catch((e) => {
			if (cancelled) return;
			setLiveError(e instanceof Error ? e.message : "Live lookup failed");
		}).finally(() => {
			if (!cancelled) setLiveLoading(false);
		});
		return () => {
			cancelled = true;
			ctrl.abort();
		};
	}, [
		year,
		make,
		model,
		floorplan,
		liveRetry,
		brochure,
		data.fuelType,
		data.type
	]);
	const catalogSpecs = (0, import_react.useMemo)(() => ({
		engine: brochure.engine,
		horsepower: brochure.horsepower,
		torque: brochure.torque,
		transmission: brochure.transmission,
		chassis: brochure.chassis,
		hitchOrPin: brochure.hitchOrPin,
		fuelCapacity: brochure.fuelCapacity,
		lengthFt: brochure.lengthFt,
		exteriorWidth: brochure.exteriorWidth,
		exteriorHeight: brochure.exteriorHeight,
		interiorHeight: brochure.interiorHeight,
		gvwr: brochure.gvwr,
		uvw: brochure.uvw,
		ccc: brochure.ccc,
		slideouts: brochure.slideouts,
		sleeps: brochure.sleeps,
		freshWater: brochure.freshWater,
		grayWater: brochure.grayWater,
		blackWater: brochure.blackWater,
		generator: brochure.generator,
		mpgHighway: brochure.mpgHighway,
		warranty: brochure.warranty,
		isToyHauler: brochure.isToyHauler,
		garageLength: brochure.garageLength,
		garageWidth: brochure.garageWidth,
		garageHeight: brochure.garageHeight,
		garageCapacity: brochure.garageCapacity,
		rampWidth: brochure.rampWidth,
		fuelStation: brochure.fuelStation,
		garageFits: brochure.garageFits
	}), [brochure]);
	const brochurePinned = brochure.dataSource === "oem-year";
	const powertrainPin = (0, import_react.useMemo)(() => findPowertrainCorrection(year, make, model, floorplan || ""), [
		year,
		make,
		model,
		floorplan
	]);
	/** Phase 2 guard: pin / catalog hard facts; Live only fills empties if validated */
	const powertrainGuard = (0, import_react.useMemo)(() => resolveHardPowertrain({
		year,
		make,
		model,
		floorplan: floorplan || "",
		catalog: {
			engine: brochure.engine,
			horsepower: brochure.horsepower,
			torque: brochure.torque,
			chassis: brochure.chassis,
			transmission: brochure.transmission,
			fuelType: data.fuelType,
			type: data.type
		},
		live: live?.live ? live : null
	}), [
		year,
		make,
		model,
		floorplan,
		brochure,
		data.fuelType,
		data.type,
		live,
		correctBump
	]);
	const powertrainTrust = powertrainGuard.trust;
	const specs = (0, import_react.useMemo)(() => {
		const hardHp = formatHardHorsepower(powertrainGuard.hard.horsepower) || catalogSpecs.horsepower;
		const hardTq = formatHardTorque(powertrainGuard.hard.torqueLbFt) || catalogSpecs.torque;
		const hardOverride = {
			engine: powertrainGuard.hard.engine || catalogSpecs.engine,
			horsepower: hardHp,
			torque: hardTq,
			chassis: powertrainGuard.hard.chassis || catalogSpecs.chassis,
			transmission: powertrainGuard.hard.transmission || catalogSpecs.transmission
		};
		const merged = mergeLiveIntoDisplay(catalogSpecs, live?.live ? live : null, {
			lockPowertrainFromCatalog: true,
			hardOverride
		});
		if (brochurePinned) return {
			...merged,
			lengthFt: catalogSpecs.lengthFt || merged.lengthFt,
			exteriorWidth: catalogSpecs.exteriorWidth || merged.exteriorWidth,
			exteriorHeight: catalogSpecs.exteriorHeight || merged.exteriorHeight,
			interiorHeight: catalogSpecs.interiorHeight || merged.interiorHeight,
			gvwr: catalogSpecs.gvwr || merged.gvwr,
			uvw: catalogSpecs.uvw || merged.uvw,
			ccc: catalogSpecs.ccc || merged.ccc,
			freshWater: catalogSpecs.freshWater || merged.freshWater,
			grayWater: catalogSpecs.grayWater || merged.grayWater,
			blackWater: catalogSpecs.blackWater || merged.blackWater,
			garageLength: catalogSpecs.garageLength || merged.garageLength,
			garageWidth: catalogSpecs.garageWidth || merged.garageWidth,
			garageHeight: catalogSpecs.garageHeight || merged.garageHeight,
			garageCapacity: catalogSpecs.garageCapacity || merged.garageCapacity,
			rampWidth: catalogSpecs.rampWidth || merged.rampWidth,
			fuelStation: catalogSpecs.fuelStation || merged.fuelStation,
			garageFits: catalogSpecs.garageFits || merged.garageFits,
			isToyHauler: catalogSpecs.isToyHauler || merged.isToyHauler
		};
		return merged;
	}, [
		catalogSpecs,
		live,
		brochurePinned,
		powertrainGuard
	]);
	const displayRating = rating;
	const ownerReviews = (0, import_react.useMemo)(() => getMockReviews(make, model, displayRating), [
		make,
		model,
		displayRating
	]);
	const liveLadder = liveMarketLadder(live?.live ? live : null);
	const market = (0, import_react.useMemo)(() => liveLadder ? {
		tradeIn: liveLadder.tradeIn,
		retailLow: liveLadder.retailLow,
		retailHigh: liveLadder.retailHigh,
		msrpLo: liveLadder.msrpLo ?? catalogMarket.msrpLo,
		msrpHi: liveLadder.msrpHi ?? catalogMarket.msrpHi,
		segment: catalogMarket.segment,
		ageYears: catalogMarket.ageYears
	} : catalogMarket, [liveLadder, catalogMarket]);
	const displayType = (powertrainGuard.hard.fuelType === "Diesel" ? data.type?.replace(/gas/i, "Diesel") || "Class A Diesel" : powertrainGuard.hard.fuelType === "Gas" ? data.type?.replace(/diesel/i, "Gas") || "Class A Gas" : null) || (live?.live && live.rvType && powertrainTrust !== "pinned" ? live.rvType : null) || data.type;
	const displayFuel = powertrainGuard.hard.fuelType || data.fuelType;
	const recallCount = recallLoading ? data.recalls : liveRecalls.length || data.recalls;
	const factors = (0, import_react.useMemo)(() => valueFactors(market, displayRating, recallLoading ? 0 : liveRecalls.length, data.warrantyYears), [
		market,
		displayRating,
		recallLoading,
		liveRecalls.length,
		data.warrantyYears
	]);
	const floorplansShown = (0, import_react.useMemo)(() => {
		if (live?.live && live.floorplansThisYear?.length) return live.floorplansThisYear;
		if (yearFloorplans.length) return yearFloorplans;
		return data.floorplans || [];
	}, [
		live,
		yearFloorplans,
		data.floorplans
	]);
	const overviewText = (0, import_react.useMemo)(() => {
		const raw = live?.live && live.overview || data.description || null;
		if (!raw) return null;
		const pinned = powertrainPin ? sanitizeNarrativeForPin(powertrainPin, raw) || raw : raw;
		const oem = findOemFloorplanSpec(year, make, model, floorplan || "");
		return sanitizeUnverifiedLayout(pinned, [oem?.layoutNote, oem?.note]) || pinned;
	}, [
		live,
		data.description,
		powertrainPin,
		year,
		make,
		model,
		floorplan
	]);
	const featureChips = (0, import_react.useMemo)(() => {
		if (!live?.live || !live.keyFeatures?.length) return [];
		const oem = findOemFloorplanSpec(year, make, model, floorplan || "");
		const verified = [oem?.layoutNote, oem?.note];
		return (powertrainPin ? sanitizeFeaturesForPin(powertrainPin, live.keyFeatures) : live.keyFeatures).map((f) => sanitizeUnverifiedLayout(f, verified)).filter((f) => f && !/^layout details unconfirmed/i.test(f)).slice(0, 6);
	}, [
		live,
		powertrainPin,
		year,
		make,
		model,
		floorplan
	]);
	const runInventorySearch = async () => {
		const zip = invZip.trim();
		if (!/^\d{5}$/.test(zip)) {
			setInvError("Enter a 5-digit ZIP");
			return;
		}
		saveInventoryZip(zip);
		setInvLoading(true);
		setInvError(null);
		setInvSearched(true);
		const res = await fetchLocalInventory({
			year,
			make,
			model,
			zip,
			radius: invRadius
		});
		setInvLoading(false);
		if (!res.ok) {
			setInvListings([]);
			setInvError(res.error || "Inventory search unavailable");
			return;
		}
		setInvListings(res.listings || []);
		if (!res.listings?.length) setInvError("No local listings found");
	};
	const invMedian = (0, import_react.useMemo)(() => {
		const prices = invListings.map((l) => l.price).filter((n) => typeof n === "number" && n > 0).sort((a, b) => a - b);
		if (!prices.length) return null;
		return prices[Math.floor(prices.length / 2)];
	}, [invListings]);
	const exportPdf = async () => {
		if (exportBusy) return;
		setExportBusy(true);
		setExportMsg("Preparing PDF…");
		try {
			await new Promise((r) => requestAnimationFrame(() => r(null)));
			const res = await exportVehicleReport({
				reportElementId: "rvfax-vehicle-report",
				title: `RvFOX Pro · ${year} ${make} ${model}${floorplan ? ` ${floorplan}` : ""}`,
				subtitle: `Vehicle History Report · ${reportId} · ${generatedAt}`,
				filenameBase: `RvFOX-Pro-${year}-${make}-${model}`.replace(/\s+/g, "-"),
				meta: {
					year,
					make,
					model,
					floorplan: floorplan || void 0,
					tradeIn: formatMoney(market.tradeIn),
					retailLow: formatMoney(market.retailLow),
					retailHigh: formatMoney(market.retailHigh),
					rating: displayRating.toFixed(1),
					type: displayType,
					recallCount: recallLoading ? 0 : recallCount,
					reportId,
					preparedFor: "Client",
					factors: factors.map((f) => ({
						label: f.label,
						positive: f.positive
					})),
					length: specs.lengthFt,
					slideouts: specs.slideouts,
					sleeps: specs.sleeps
				}
			});
			if (!res.ok) setExportMsg(res.error);
			else if (res.method === "share") setExportMsg("Shared — pick Print or Save to Files for PDF");
			else if (res.method === "print") setExportMsg("Print dialog opened — choose Save as PDF");
			else if (res.method === "preview") setExportMsg("Preview open — tap Save as PDF / Print");
			else setExportMsg("Report downloaded — open it and Print → PDF");
		} catch (e) {
			setExportMsg(e instanceof Error ? e.message : "Export failed");
		} finally {
			setExportBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full flex-col overflow-hidden bg-bg text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuiteBackdrop, { src: SHARED_PRESTIGE_BACKDROP }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scrollRef,
				"data-app-scroll": true,
				"data-rvfax-scroll": true,
				className: "rv-scroll relative z-10 h-full overflow-y-auto overscroll-y-contain",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullResetHint, {
					show: pullHint,
					label: "Release to go back"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					id: "rvfax-vehicle-report",
					className: "mx-auto w-full max-w-lg space-y-5 px-4 pb-32 pt-4 sm:px-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							"data-no-export": true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onBack,
								className: "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[12px] font-bold text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: onToggleSave,
										className: cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold", saved ? "border-ruby/50 bg-ruby/25 text-white" : "border-white/20 bg-black/40 text-white"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-3.5", saved && "fill-current") }), "Save"]
									}),
									onToggleCompare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: onToggleCompare,
										disabled: !comparing && compareFull,
										className: cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold disabled:opacity-40", comparing ? "border-sky-400/50 bg-sky-500/20 text-sky-100" : "border-white/20 bg-black/40 text-white"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitCompare, { className: "size-3.5" }), comparing ? `In compare${compareCount ? ` · ${compareCount}` : ""}` : compareFull ? "Compare full" : "Compare"]
									}) : null,
									onOpenCompare && compareCount >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: onOpenCompare,
										className: "inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/15 px-3 py-1.5 text-[12px] font-bold text-gold-bright",
										children: "Open compare"
									}) : null,
									shellNav ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => shellNav.openCalWithPrice(market.retailLow, `${year} ${make} ${model}`),
										className: "inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1.5 text-[12px] font-bold text-gold-bright",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-3.5" }), "Finance"]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => void exportPdf(),
										disabled: exportBusy,
										className: "inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50",
										children: [exportBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5" }), "PDF"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: onAskGrok,
										className: "inline-flex items-center gap-1.5 rounded-full border border-blue/40 bg-blue/25 px-3 py-1.5 text-[12px] font-bold text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-blue" }), "Ask Grok"]
									})
								]
							})]
						}),
						exportMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-[11px] text-blue",
							"data-no-export": true,
							children: exportMsg
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass-prestige rounded-[1.15rem] p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-md bg-blue px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white",
										children: "RvFOX"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[13px] font-bold text-white",
										children: "Vehicle History Report"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[9px] font-semibold tracking-[0.14em] text-white",
										children: "KNOW BEFORE YOU BUY"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-white/70",
									children: generatedAt
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-[10px] text-white/55",
									children: reportId
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-2 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
										label: "NHTSA recalls",
										value: recallLoading ? "Checking…" : recallCount > 0 ? `${recallCount} on record` : "None found",
										warn: !recallLoading && recallCount > 0,
										ok: !recallLoading && recallCount === 0
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
										label: "Service schedule",
										value: `${maintenance.length} tasks`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
										label: "Class",
										value: displayType
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatTile, {
										label: "Used market",
										value: liveLoading ? "Updating…" : "Trade · retail range",
										accent: true
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass-prestige overflow-hidden rounded-[1.15rem]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative aspect-[16/9] w-full overflow-hidden",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: resolveCardImage(data),
										alt: `${displayType} — ${year} ${make} ${model}`,
										className: "size-full object-cover object-[center_42%]",
										crossOrigin: "anonymous"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute bottom-2.5 left-3 right-3 flex flex-wrap items-end justify-between gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-blue px-2.5 py-1 text-[10px] font-bold text-white shadow-lg",
											children: displayType
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-5 pb-6 pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-white",
										children: "Vehicle Overview"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-start justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[13px] font-medium text-sky-200/90",
													children: year
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
													className: "mt-0.5 text-[26px] font-semibold leading-[1.12] tracking-tight text-white",
													children: [
														make,
														" ",
														model
													]
												}),
												floorplan ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1.5 text-[14px] text-white",
													children: ["Floorplan ", floorplan]
												}) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-3 flex flex-wrap gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: displayType }), recallLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: "Checking recalls…" }) : recallCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
														tone: "ruby",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }),
															" ",
															recallCount,
															" ",
															recallCount === 1 ? "recall" : "recalls"
														]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
														tone: "green",
														children: "No open recalls"
													})]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "shrink-0 text-right",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[32px] font-light tabular-nums leading-none tracking-tight text-sky-200",
													children: displayRating.toFixed(1)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1.5 text-[11px] tracking-wide text-amber-200/90",
													children: ratingStars(displayRating)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white",
													children: "RvFOX rating"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5 grid grid-cols-4 gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
												label: "LENGTH",
												value: specs.lengthFt || "—"
											}),
											specs.isToyHauler ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
												label: "GARAGE",
												value: specs.garageLength && !/varies/i.test(specs.garageLength) ? specs.garageLength.replace(/\s*deep$/i, "") : "See specs"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
												label: "SLIDEOUTS",
												value: specs.slideouts || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
												label: "SLEEPS",
												value: specs.sleeps || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
												label: "RECALLS",
												value: recallLoading ? "…" : recallCount > 0 ? String(recallCount) : "0",
												warn: recallCount > 0
											})
										]
									}),
									overviewText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-6 text-[15px] font-normal leading-[1.65] text-white",
										children: overviewText
									}) : null,
									featureChips.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-5 flex flex-wrap gap-2",
										children: featureChips.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: f }, f))
									}) : null,
									liveError && !liveLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5 rounded-xl border border-amber-400/35 bg-amber-500/12 px-3.5 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[13px] leading-snug text-amber-100",
											children: "Live research failed. Engine, HP, chassis, and fuel on this report are the catalog year-band for this coach."
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setLiveError(null);
												setLiveRetry((n) => n + 1);
											},
											className: "mt-2 text-[12px] font-bold text-amber-50 underline underline-offset-2",
											children: "Retry live"
										})]
									}) : null
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass-prestige rounded-[1.25rem] p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/90",
										children: "Market value"
									}), liveLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-[10px] text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), "Updating"]
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketTile, {
											label: "TRADE-IN",
											value: formatMoney(market.tradeIn),
											sub: "Dealer trade"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketTile, {
											label: "RETAIL LOW",
											value: formatMoney(market.retailLow),
											sub: "Private party"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketTile, {
											label: "RETAIL HIGH",
											value: formatMoney(market.retailHigh),
											sub: "Dealer asking"
										})
									]
								}),
								factors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1",
									children: factors.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: cn("text-[11px]", f.positive ? "text-emerald-200" : "text-amber"),
										children: [
											f.positive ? "↑" : "↓",
											" ",
											f.label
										]
									}, f.label))
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass-prestige rounded-[1.15rem] p-3.5",
							"data-no-export": true,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mb-2 flex items-center justify-between",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-bold tracking-[0.14em] text-white",
										children: "LOCAL INVENTORY"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex min-w-[7rem] flex-1 items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 text-blue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: invZip,
												onChange: (e) => setInvZip(e.target.value.replace(/\D/g, "").slice(0, 5)),
												inputMode: "numeric",
												placeholder: "ZIP",
												className: "w-full bg-transparent text-[13px] font-semibold text-white outline-none placeholder:text-white/40"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: invRadius,
											onChange: (e) => setInvRadius(Number(e.target.value)),
											className: "rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[12px] font-semibold text-white",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: 50,
													children: "50 mi"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: 100,
													children: "100 mi"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: 250,
													children: "250 mi"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => void runInventorySearch(),
											disabled: invLoading,
											className: "rounded-full border border-blue/40 bg-blue/20 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-50",
											children: invLoading ? "…" : "Search"
										})
									]
								}),
								invError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[11px] text-amber",
									children: invError
								}) : null,
								invListings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5",
									children: invListings.slice(0, 5).map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "rounded-xl border border-white/10 bg-black/25 px-3 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-[12px] font-bold text-white",
													children: l.heading || `${l.year || year} ${l.make || make} ${l.model || model}`
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] text-white/60",
													children: [
														l.dealerName,
														l.city,
														l.state
													].filter(Boolean).join(" · ") || "Dealer listing"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "shrink-0 text-[13px] font-bold tabular-nums text-gold-bright",
												children: l.price ? formatMoney(l.price) : "—"
											})]
										})
									}, l.id || i))
								}) : invSearched && !invLoading && !invError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[11px] text-white/55",
									children: "No listings nearby."
								}) : null,
								invMedian && shellNav ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => shellNav.openCalWithPrice(invMedian, `${year} ${make} ${model} · local median`),
									className: "mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/15 py-2.5 text-[12px] font-bold text-gold-bright",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-3.5" }),
										"Finance at local median · ",
										formatMoney(invMedian)
									]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Vehicle Specifications",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-white",
									children: "Identity & dimensions"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "TYPE",
									value: displayType
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "YEAR",
									value: year
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "LENGTH",
									value: specs.lengthFt,
									accent: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "WIDTH",
									value: specs.exteriorWidth
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "HEIGHT",
									value: specs.exteriorHeight
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "CEILING",
									value: specs.interiorHeight
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "SLIDEOUTS",
									value: specs.slideouts
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "SLEEPS",
									value: specs.sleeps
								}),
								specs.isToyHauler ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-2 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white",
										children: "Toy hauler garage"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
										label: "GARAGE DEPTH",
										value: specs.garageLength,
										accent: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
										label: "GARAGE WIDTH",
										value: specs.garageWidth
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
										label: "GARAGE HEIGHT",
										value: specs.garageHeight
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
										label: "RAMP DOOR",
										value: specs.rampWidth
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
										label: "CARGO RATING",
										value: specs.garageCapacity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
										label: "FITS",
										value: specs.garageFits
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
										label: "FUEL STATION",
										value: specs.fuelStation
									})
								] }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white",
									children: "Powertrain & chassis"
								}),
								liveError && !liveLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-[11px] leading-snug text-amber-200/85",
									children: "Live failed — year-band catalog shown."
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "FUEL",
									value: displayFuel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "ENGINE",
									value: specs.engine,
									accent: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "HORSEPOWER",
									value: specs.horsepower,
									accent: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "TORQUE",
									value: specs.torque
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "TRANSMISSION",
									value: specs.transmission
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "CHASSIS",
									value: specs.chassis,
									accent: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "TOW CAPACITY",
									value: specs.hitchOrPin
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "GENERATOR",
									value: specs.generator
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "HIGHWAY MPG",
									value: specs.mpgHighway ? `${specs.mpgHighway}${/est/i.test(specs.mpgHighway) ? "" : " EST."}` : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "FUEL CAPACITY",
									value: specs.fuelCapacity
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white",
									children: "Weights"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "GVWR",
									value: specs.gvwr,
									accent: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "UVW",
									value: specs.uvw
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "CCC",
									value: specs.ccc
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "WARRANTY",
									value: specs.warranty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white",
									children: "Tanks"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "FRESH WATER",
									value: specs.freshWater
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "GRAY WATER",
									value: specs.grayWater
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "BLACK WATER",
									value: specs.blackWater
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
									className: "mt-5 border-t border-white/10 pt-3",
									"data-no-export": true,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
											className: "cursor-pointer list-none text-[11px] font-medium text-white/35",
											children: "Something look off? Tap to correct"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => {
														setCorrectEngine(specs.engine || "");
														setCorrectHp(String(specs.horsepower || "").replace(/[^\d].*$/, "") || "");
														setCorrectTorque(String(specs.torque || "").replace(/[^\d].*$/, "") || "");
														setCorrectChassis(specs.chassis || "");
														setCorrectTrans(specs.transmission || "");
														setCorrectFuel(displayFuel || data.fuelType || "");
														setCorrectNote("");
														setCorrectMsg(null);
														setCorrectOpen(true);
													},
													className: "rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70",
													children: "Correct this spec"
												}),
												powertrainTrust === "local" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => {
														const cur = findLocalSpecOverride(year, make, model, floorplan);
														if (cur) removeLocalSpecOverride(cur.id);
														setCorrectBump((n) => n + 1);
														setCorrectMsg("Local correction removed.");
													},
													className: "rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70",
													children: "Clear correction"
												}) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => {
														refreshCoachDossierCache(year, make, model, floorplan);
														setLive(null);
														setLiveError(null);
														setLiveRetry((n) => n + 1);
													},
													className: "rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70",
													children: "Refresh report"
												})
											]
										}),
										correctMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[11px] text-white/50",
											children: correctMsg
										}) : null
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Rating",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mb-4 text-[14px] leading-relaxed text-white",
									children: [
										displayRating.toFixed(1),
										" out of 5 · ",
										ratingMeta.tierLabel
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "BRAND",
									value: ratingMeta.base.toFixed(1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "MODEL",
									value: `${ratingMeta.tierAdj >= 0 ? "+" : ""}${ratingMeta.tierAdj.toFixed(1)}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecRow, {
									label: "YEAR",
									value: `${ratingMeta.yearAdj >= 0 ? "+" : ""}${ratingMeta.yearAdj.toFixed(1)}`
								})
							]
						}),
						floorplansShown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Floorplans this year",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: floorplansShown.map((fp) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									tone: floorplan && fp.toLowerCase() === floorplan.toLowerCase() ? "blue" : void 0,
									children: fp
								}, fp))
							})
						}) : null,
						live?.live && (live.reliabilitySummary || live.commonIssues?.length || live.servicePriorities?.length) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Reliability & ownership",
							children: [
								live.reliabilitySummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] leading-relaxed text-white/90",
									children: powertrainPin ? sanitizeNarrativeForPin(powertrainPin, live.reliabilitySummary) || live.reliabilitySummary : live.reliabilitySummary
								}) : null,
								live.commonIssues?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5",
									children: live.commonIssues.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex gap-2 text-[14px] text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 size-3.5 shrink-0 text-amber" }), x]
									}, x))
								}) : null,
								live.servicePriorities?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5",
									children: live.servicePriorities.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex gap-2 text-[14px] text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-3.5 shrink-0 text-emerald-300" }), x]
									}, x))
								}) : null,
								live.ownerSentiment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[14px] italic text-white",
									children: live.ownerSentiment
								}) : null
							]
						}) : null,
						ownerReviews.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Owner reviews",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: ownerReviews.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "rounded-2xl border border-white/10 bg-black/30 p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[16px] font-bold leading-snug text-white",
													children: r.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-[13px] text-white",
													children: [
														r.author,
														r.location ? ` · ${r.location}` : "",
														r.date ? ` · ${r.date}` : ""
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "shrink-0 text-right",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[18px] font-bold tabular-nums text-gold-bright",
													children: r.rating.toFixed(1)
												}), r.verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
													tone: "green",
													children: "Verified"
												}) : null]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-[15px] leading-relaxed text-white",
											children: r.body
										}),
										r.miles || r.years ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[13px] font-medium text-white",
											children: [r.miles, r.years].filter(Boolean).join(" · ")
										}) : null
									]
								}, r.id))
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "NHTSA safety",
							children: [recallLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-[14px] text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Loading recalls from NHTSA…"]
							}) : recallError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] text-amber",
								children: recallError
							}) : liveRecalls.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] text-white",
									children: "None found for this year / make / model."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "https://www.nhtsa.gov/recalls",
									target: "_blank",
									rel: "noreferrer",
									className: "inline-flex items-center gap-1 text-[11px] font-semibold text-blue",
									children: ["Search nhtsa.gov ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[15px] font-bold text-ruby",
										children: [
											liveRecalls.length,
											" NHTSA campaign",
											liveRecalls.length === 1 ? "" : "s",
											" on record"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-2",
										children: liveRecalls.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "rounded-xl border border-ruby/30 bg-ruby/10 px-3 py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[15px] font-bold text-white",
													children: r.component || "Recall"
												}),
												r.campaignNumber ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-0.5 font-mono text-[13px] text-white",
													children: r.campaignNumber
												}) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
													className: "mt-1.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
															className: "cursor-pointer list-none text-[13px] font-semibold text-white",
															children: "Details"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-2 text-[14px] leading-relaxed text-white",
															children: r.summary || r.consequence || "See NHTSA for details."
														}),
														r.remedy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-2 text-[14px] leading-relaxed text-white",
															children: r.remedy
														}) : null
													]
												})
											]
										}, `${r.campaignNumber || i}-${i}`))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: "https://www.nhtsa.gov/recalls",
										target: "_blank",
										rel: "noreferrer",
										className: "inline-flex items-center gap-1 text-[13px] font-semibold text-blue",
										children: ["nhtsa.gov ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
									})
								]
							}), liveDefects.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer list-none text-[15px] font-bold text-white",
									children: "Owner complaints"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5",
									children: liveDefects.slice(0, 8).map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "rounded-lg border border-white/10 bg-black/25 px-2.5 py-2 text-[14px] text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-white",
											children: d.component || "Complaint"
										}), d.summary ? ` — ${d.summary}` : null]
									}, i))
								})]
							}) : null]
						}),
						maintenance.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass-prestige rounded-[1.15rem] p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setOpenMaint((v) => !v),
								className: "flex w-full items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-white",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-amber" }),
										"MAINTENANCE SCHEDULE (",
										maintenance.length,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-white/60",
									children: openMaint ? "Hide" : "Show"
								})]
							}), openMaint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-2",
								children: maintenance.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-xl border border-white/10 bg-black/30 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[13px] font-bold text-white",
										children: m.task
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-[11px] text-white/75",
										children: [
											m.interval,
											" · ",
											m.category,
											" · ",
											m.priority
										]
									})]
								}, i))
							}) : null]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-1 pb-6 text-[12px] text-white",
							children: "Confirm brochure, door sticker, and NHTSA before you buy."
						})
					]
				})]
			}),
			correctOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[80] flex items-end justify-center bg-black/65 p-3 sm:items-center",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Correct powertrain specs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-[#0c1220] p-4 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-bold tracking-[0.14em] text-gold",
									children: "CORRECT THIS SPEC"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-[13px] font-semibold text-white",
									children: [
										year,
										" ",
										make,
										" ",
										model,
										floorplan ? ` · ${floorplan}` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-white/55",
									children: "Saves a local override on this device. Export pins to share with ops or pin into the catalog later."
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCorrectOpen(false),
								className: "rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/70",
								children: "Close"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2.5",
							children: [
								[
									"Engine",
									correctEngine,
									setCorrectEngine
								],
								[
									"Horsepower",
									correctHp,
									setCorrectHp
								],
								[
									"Torque (lb-ft)",
									correctTorque,
									setCorrectTorque
								],
								[
									"Chassis",
									correctChassis,
									setCorrectChassis
								],
								[
									"Transmission",
									correctTrans,
									setCorrectTrans
								],
								[
									"Fuel",
									correctFuel,
									setCorrectFuel
								],
								[
									"Note",
									correctNote,
									setCorrectNote
								]
							].map(([label, val, setVal]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold tracking-wide text-white/50",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: val,
									onChange: (e) => setVal(e.target.value),
									className: "mt-0.5 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white outline-none focus:border-gold/50",
									inputMode: label === "Horsepower" || label.startsWith("Torque") ? "numeric" : "text"
								})]
							}, label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									const hp = parseInt(correctHp.replace(/[^\d]/g, ""), 10);
									const tq = parseInt(correctTorque.replace(/[^\d]/g, ""), 10);
									saveLocalSpecOverride({
										year,
										make,
										model,
										floorplan: floorplan || "",
										engine: correctEngine || void 0,
										horsepower: Number.isFinite(hp) && hp > 0 ? hp : void 0,
										torqueLbFt: Number.isFinite(tq) && tq > 0 ? tq : void 0,
										chassis: correctChassis || void 0,
										transmission: correctTrans || void 0,
										fuelType: correctFuel || void 0,
										note: correctNote || "User correction from report"
									});
									setCorrectBump((n) => n + 1);
									setCorrectOpen(false);
									setCorrectMsg("Local correction saved · exportable pin.");
								},
								className: "flex-1 rounded-full border border-gold/45 bg-gold/20 py-2.5 text-[13px] font-bold text-gold-bright",
								children: "Save correction"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCorrectOpen(false),
								className: "rounded-full border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-white/80",
								children: "Cancel"
							})]
						})
					]
				})
			}) : null
		]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass-prestige rounded-[1.25rem] px-5 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-4 text-[18px] font-bold tracking-tight text-white",
			children: title
		}), children]
	});
}
function SpecRow({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-2.5 last:border-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[13px] font-medium uppercase tracking-[0.08em] text-white",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("max-w-[60%] text-right text-[14px] font-medium tabular-nums leading-snug text-white", accent && "font-semibold"),
			children: value && String(value).trim() ? value : "—"
		})]
	});
}
function Chip({ children, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium", tone === "ruby" ? "border-ruby/40 bg-ruby/20 text-white" : tone === "green" ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100" : tone === "blue" ? "border-blue/40 bg-blue/20 text-white" : "border-white/20 bg-black/40 text-white"),
		children
	});
}
function MarketTile({ label, value, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-white/10 bg-black/25 px-2.5 py-3 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium uppercase tracking-[0.12em] text-white",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[15px] font-semibold tabular-nums text-white",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[11px] text-white",
				children: sub
			})
		]
	});
}
function StatTile({ label, value, warn, ok, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-xl border px-2.5 py-2", warn ? "border-amber/40 bg-amber/10" : ok ? "border-emerald-400/30 bg-emerald-500/10" : accent ? "border-blue/35 bg-blue/10" : "border-white/12 bg-black/25"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold tracking-wide text-white",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-[13px] font-bold text-white",
			children: value
		})]
	});
}
function MiniStat({ label, value, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-white/10 bg-black/25 px-2 py-3 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("text-[13px] font-semibold tabular-nums", warn ? "text-amber" : "text-white"),
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white",
			children: label
		})]
	});
}
//#endregion
export { RvDetail };
