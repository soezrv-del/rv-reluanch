import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { Dt as ArrowLeftRight, St as Building2, Y as Info, _t as ChevronDown, b as Sparkles, it as ExternalLink, lt as DollarSign, pt as CircleAlert, q as Landmark, rt as FileText, v as Star, vt as Check, x as SlidersHorizontal, yt as Car, z as MapPin } from "../_libs/lucide-react.mjs";
import { l as useShellNavOptional, u as cn } from "./routes-JaTqMLOZ.mjs";
import { a as SuitePage } from "./SuitePage-zyyPjbxm.mjs";
import { v as LENDERS_CATALOG } from "./router-Bh7U7VPB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RvCalApp-zzTNVlWA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** States where trade-in value reduces the taxable amount (tax on price − trade). */
var TRADE_IN_TAX_CREDIT_STATES = /* @__PURE__ */ new Set([
	"AK",
	"DE",
	"MT",
	"NH",
	"OR",
	"AZ",
	"CO",
	"ID",
	"NM",
	"NV",
	"UT",
	"WA",
	"WY",
	"IA",
	"IL",
	"IN",
	"KS",
	"MN",
	"MO",
	"ND",
	"NE",
	"OH",
	"SD",
	"WI",
	"AL",
	"AR",
	"FL",
	"GA",
	"LA",
	"MS",
	"NC",
	"OK",
	"SC",
	"TN",
	"TX",
	"WV",
	"CT",
	"MA",
	"ME",
	"NJ",
	"NY",
	"PA",
	"RI",
	"VT"
]);
/** States that generally tax the full selling price (no trade-in deduction). */
var NO_TRADE_IN_TAX_CREDIT_STATES = /* @__PURE__ */ new Set([
	"CA",
	"HI",
	"KY",
	"MD",
	"MI",
	"VA",
	"DC"
]);
var ZIP_TO_STATE = {
	"200": {
		state: "District of Columbia",
		code: "DC",
		tax: 6,
		regBase: 180
	},
	"202": {
		state: "District of Columbia",
		code: "DC",
		tax: 6,
		regBase: 180
	},
	"203": {
		state: "District of Columbia",
		code: "DC",
		tax: 6,
		regBase: 180
	},
	"204": {
		state: "District of Columbia",
		code: "DC",
		tax: 6,
		regBase: 180
	},
	"205": {
		state: "District of Columbia",
		code: "DC",
		tax: 6,
		regBase: 180
	},
	"995": {
		state: "Alaska",
		code: "AK",
		tax: 0,
		regBase: 100
	},
	"996": {
		state: "Alaska",
		code: "AK",
		tax: 0,
		regBase: 100
	},
	"997": {
		state: "Alaska",
		code: "AK",
		tax: 0,
		regBase: 100
	},
	"998": {
		state: "Alaska",
		code: "AK",
		tax: 0,
		regBase: 100
	},
	"999": {
		state: "Alaska",
		code: "AK",
		tax: 0,
		regBase: 100
	},
	"350": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"351": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"352": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"353": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"354": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"355": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"356": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"357": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"358": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"359": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"360": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"361": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"362": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"363": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"364": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"365": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"366": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"367": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"368": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"369": {
		state: "Alabama",
		code: "AL",
		tax: 2,
		regBase: 60
	},
	"850": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"851": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"852": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"853": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"855": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"856": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"857": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"859": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"860": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"863": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"864": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"865": {
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	"716": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"717": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"718": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"719": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"720": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"721": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"722": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"723": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"724": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"725": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"726": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"727": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"728": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"729": {
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	"900": {
		state: "California",
		code: "CA",
		tax: 7.25,
		regBase: 250
	},
	"901": {
		state: "California",
		code: "CA",
		tax: 10.25,
		regBase: 280
	},
	"902": {
		state: "California",
		code: "CA",
		tax: 9.5,
		regBase: 270
	},
	"903": {
		state: "California",
		code: "CA",
		tax: 9.5,
		regBase: 270
	},
	"904": {
		state: "California",
		code: "CA",
		tax: 9.5,
		regBase: 270
	},
	"905": {
		state: "California",
		code: "CA",
		tax: 10.25,
		regBase: 285
	},
	"906": {
		state: "California",
		code: "CA",
		tax: 10.25,
		regBase: 285
	},
	"907": {
		state: "California",
		code: "CA",
		tax: 10.25,
		regBase: 285
	},
	"908": {
		state: "California",
		code: "CA",
		tax: 10.25,
		regBase: 285
	},
	"912": {
		state: "California",
		code: "CA",
		tax: 10.25,
		regBase: 280
	},
	"913": {
		state: "California",
		code: "CA",
		tax: 9,
		regBase: 260
	},
	"920": {
		state: "California",
		code: "CA",
		tax: 7.75,
		regBase: 250
	},
	"921": {
		state: "California",
		code: "CA",
		tax: 7.75,
		regBase: 250
	},
	"922": {
		state: "California",
		code: "CA",
		tax: 7.75,
		regBase: 250
	},
	"941": {
		state: "California",
		code: "CA",
		tax: 8.625,
		regBase: 265
	},
	"945": {
		state: "California",
		code: "CA",
		tax: 9.25,
		regBase: 275
	},
	"800": {
		state: "Colorado",
		code: "CO",
		tax: 2.9,
		regBase: 45
	},
	"801": {
		state: "Colorado",
		code: "CO",
		tax: 8.81,
		regBase: 60
	},
	"802": {
		state: "Colorado",
		code: "CO",
		tax: 2.9,
		regBase: 45
	},
	"060": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"061": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"197": {
		state: "Delaware",
		code: "DE",
		tax: 0,
		regBase: 50
	},
	"198": {
		state: "Delaware",
		code: "DE",
		tax: 0,
		regBase: 50
	},
	"199": {
		state: "Delaware",
		code: "DE",
		tax: 0,
		regBase: 50
	},
	"320": {
		state: "Florida",
		code: "FL",
		tax: 6,
		regBase: 250
	},
	"321": {
		state: "Florida",
		code: "FL",
		tax: 6,
		regBase: 250
	},
	"322": {
		state: "Florida",
		code: "FL",
		tax: 6,
		regBase: 250
	},
	"325": {
		state: "Florida",
		code: "FL",
		tax: 6,
		regBase: 250
	},
	"326": {
		state: "Florida",
		code: "FL",
		tax: 6,
		regBase: 250
	},
	"327": {
		state: "Florida",
		code: "FL",
		tax: 8,
		regBase: 270
	},
	"328": {
		state: "Florida",
		code: "FL",
		tax: 7.5,
		regBase: 270
	},
	"329": {
		state: "Florida",
		code: "FL",
		tax: 7.5,
		regBase: 265
	},
	"330": {
		state: "Florida",
		code: "FL",
		tax: 7,
		regBase: 265
	},
	"331": {
		state: "Florida",
		code: "FL",
		tax: 7,
		regBase: 265
	},
	"332": {
		state: "Florida",
		code: "FL",
		tax: 7,
		regBase: 265
	},
	"333": {
		state: "Florida",
		code: "FL",
		tax: 7,
		regBase: 265
	},
	"334": {
		state: "Florida",
		code: "FL",
		tax: 7.5,
		regBase: 265
	},
	"335": {
		state: "Florida",
		code: "FL",
		tax: 7.5,
		regBase: 265
	},
	"336": {
		state: "Florida",
		code: "FL",
		tax: 7.5,
		regBase: 265
	},
	"337": {
		state: "Florida",
		code: "FL",
		tax: 7.5,
		regBase: 265
	},
	"338": {
		state: "Florida",
		code: "FL",
		tax: 7.5,
		regBase: 265
	},
	"339": {
		state: "Florida",
		code: "FL",
		tax: 7,
		regBase: 265
	},
	"341": {
		state: "Florida",
		code: "FL",
		tax: 6.5,
		regBase: 255
	},
	"342": {
		state: "Florida",
		code: "FL",
		tax: 6.5,
		regBase: 255
	},
	"346": {
		state: "Florida",
		code: "FL",
		tax: 6,
		regBase: 250
	},
	"347": {
		state: "Florida",
		code: "FL",
		tax: 6.5,
		regBase: 255
	},
	"349": {
		state: "Florida",
		code: "FL",
		tax: 6,
		regBase: 250
	},
	"300": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"301": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"302": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"303": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"304": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"305": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"306": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"307": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"308": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"309": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"310": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"311": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"312": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"313": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"314": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"315": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"316": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"317": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"318": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"319": {
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	"967": {
		state: "Hawaii",
		code: "HI",
		tax: 4,
		regBase: 45
	},
	"968": {
		state: "Hawaii",
		code: "HI",
		tax: 4,
		regBase: 45
	},
	"832": {
		state: "Idaho",
		code: "ID",
		tax: 6,
		regBase: 45
	},
	"833": {
		state: "Idaho",
		code: "ID",
		tax: 6,
		regBase: 45
	},
	"834": {
		state: "Idaho",
		code: "ID",
		tax: 6,
		regBase: 45
	},
	"835": {
		state: "Idaho",
		code: "ID",
		tax: 6,
		regBase: 45
	},
	"836": {
		state: "Idaho",
		code: "ID",
		tax: 6,
		regBase: 45
	},
	"837": {
		state: "Idaho",
		code: "ID",
		tax: 6,
		regBase: 45
	},
	"838": {
		state: "Idaho",
		code: "ID",
		tax: 6,
		regBase: 45
	},
	"600": {
		state: "Illinois",
		code: "IL",
		tax: 10.25,
		regBase: 175
	},
	"601": {
		state: "Illinois",
		code: "IL",
		tax: 10.25,
		regBase: 175
	},
	"602": {
		state: "Illinois",
		code: "IL",
		tax: 10.25,
		regBase: 175
	},
	"606": {
		state: "Illinois",
		code: "IL",
		tax: 6.25,
		regBase: 160
	},
	"610": {
		state: "Illinois",
		code: "IL",
		tax: 8,
		regBase: 165
	},
	"460": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"461": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"462": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"463": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"464": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"465": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"466": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"467": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"468": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"469": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"470": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"471": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"472": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"473": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"474": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"475": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"476": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"477": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"478": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"479": {
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	"500": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"501": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"502": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"503": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"504": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"505": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"506": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"507": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"508": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"509": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"510": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"511": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"512": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"513": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"514": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"515": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"516": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"520": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"521": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"522": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"523": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"524": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"525": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"526": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"527": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"528": {
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	"660": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"661": {
		state: "Kansas",
		code: "KS",
		tax: 8.95,
		regBase: 60
	},
	"662": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"664": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"665": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"666": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"667": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"668": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"669": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"670": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"671": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"672": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"673": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"674": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"675": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"676": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"677": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"678": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"679": {
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	"400": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"401": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"402": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"403": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"404": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"405": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"406": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"407": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"408": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"409": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"410": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"411": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"412": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"413": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"414": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"415": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"416": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"417": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"418": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"420": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"421": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"422": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"423": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"424": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"425": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"426": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"427": {
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	"700": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"701": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"703": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"704": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"705": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"706": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"707": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"708": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"710": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"711": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"712": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"713": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"714": {
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	"039": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"040": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"041": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"042": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"043": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"044": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"045": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"046": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"047": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"048": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"049": {
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	"206": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"207": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"208": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"209": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"210": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"211": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"212": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"214": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"215": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"216": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"217": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"218": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"219": {
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	"010": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"011": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"012": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"013": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"014": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"015": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"016": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"017": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"018": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"019": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"020": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"021": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"022": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"023": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"024": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"025": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"026": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"027": {
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	"480": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"481": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"482": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"483": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"484": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"485": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"486": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"487": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"488": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"489": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"490": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"491": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"492": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"493": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"494": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"495": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"496": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"497": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"498": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"499": {
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	"550": {
		state: "Minnesota",
		code: "MN",
		tax: 6.875,
		regBase: 85
	},
	"551": {
		state: "Minnesota",
		code: "MN",
		tax: 6.875,
		regBase: 85
	},
	"553": {
		state: "Minnesota",
		code: "MN",
		tax: 7.875,
		regBase: 90
	},
	"386": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"387": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"388": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"389": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"390": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"391": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"392": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"393": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"394": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"395": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"396": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"397": {
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	"630": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"631": {
		state: "Missouri",
		code: "MO",
		tax: 9.679,
		regBase: 60
	},
	"633": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"634": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"635": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"636": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"637": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"638": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"639": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"640": {
		state: "Missouri",
		code: "MO",
		tax: 9.1,
		regBase: 58
	},
	"641": {
		state: "Missouri",
		code: "MO",
		tax: 9.1,
		regBase: 58
	},
	"644": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"645": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"646": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"647": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"648": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"650": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"651": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"652": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"653": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"654": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"655": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"656": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"657": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"658": {
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	"590": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"591": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"592": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"593": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"594": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"595": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"596": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"597": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"598": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"599": {
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	"680": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"681": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"683": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"684": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"685": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"686": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"687": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"688": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"689": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"690": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"691": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"692": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"693": {
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	"889": {
		state: "Nevada",
		code: "NV",
		tax: 8.375,
		regBase: 180
	},
	"890": {
		state: "Nevada",
		code: "NV",
		tax: 8.375,
		regBase: 180
	},
	"891": {
		state: "Nevada",
		code: "NV",
		tax: 8.375,
		regBase: 180
	},
	"030": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"031": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"032": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"033": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"034": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"035": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"036": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"037": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"038": {
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	"070": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"071": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"072": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"073": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"074": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"075": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"076": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"077": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"078": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"079": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"080": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"081": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"082": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"083": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"084": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"085": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"086": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"087": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"088": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"089": {
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	"870": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"871": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"872": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"873": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"874": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"875": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"877": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"878": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"879": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"880": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"881": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"882": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"883": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"884": {
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	"100": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"101": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"102": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"103": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"104": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"105": {
		state: "New York",
		code: "NY",
		tax: 8.375,
		regBase: 180
	},
	"106": {
		state: "New York",
		code: "NY",
		tax: 8.375,
		regBase: 180
	},
	"107": {
		state: "New York",
		code: "NY",
		tax: 8.375,
		regBase: 180
	},
	"108": {
		state: "New York",
		code: "NY",
		tax: 8.375,
		regBase: 180
	},
	"109": {
		state: "New York",
		code: "NY",
		tax: 8.375,
		regBase: 180
	},
	"110": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"111": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"112": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"113": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"114": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"115": {
		state: "New York",
		code: "NY",
		tax: 8.875,
		regBase: 185
	},
	"116": {
		state: "New York",
		code: "NY",
		tax: 8.625,
		regBase: 180
	},
	"117": {
		state: "New York",
		code: "NY",
		tax: 8.625,
		regBase: 180
	},
	"118": {
		state: "New York",
		code: "NY",
		tax: 8.625,
		regBase: 180
	},
	"119": {
		state: "New York",
		code: "NY",
		tax: 8.625,
		regBase: 180
	},
	"120": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"121": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"122": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"123": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"124": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"125": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"126": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"127": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"128": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"129": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"130": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"131": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"132": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"133": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"134": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"135": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"136": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"137": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"138": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"139": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"140": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"141": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"142": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"143": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"144": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"145": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"146": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"147": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"148": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"149": {
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	"270": {
		state: "North Carolina",
		code: "NC",
		tax: 3,
		regBase: 35
	},
	"271": {
		state: "North Carolina",
		code: "NC",
		tax: 3,
		regBase: 35
	},
	"272": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"273": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"274": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"275": {
		state: "North Carolina",
		code: "NC",
		tax: 7.25,
		regBase: 58
	},
	"276": {
		state: "North Carolina",
		code: "NC",
		tax: 7.25,
		regBase: 58
	},
	"277": {
		state: "North Carolina",
		code: "NC",
		tax: 7.25,
		regBase: 58
	},
	"278": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"279": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"280": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"281": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"282": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"283": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"284": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"285": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"286": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"287": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"288": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"289": {
		state: "North Carolina",
		code: "NC",
		tax: 7,
		regBase: 55
	},
	"580": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"581": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"582": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"583": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"584": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"585": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"586": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"587": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"588": {
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	"430": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"431": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"432": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"433": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"434": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"435": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"436": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"437": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"438": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"439": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"440": {
		state: "Ohio",
		code: "OH",
		tax: 7.75,
		regBase: 92
	},
	"441": {
		state: "Ohio",
		code: "OH",
		tax: 8,
		regBase: 93
	},
	"442": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"443": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"444": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"445": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"446": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"447": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"448": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"449": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"450": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"451": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"452": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"453": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"454": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"455": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"456": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"457": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"458": {
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	"730": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"731": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"734": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"735": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"736": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"737": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"738": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"739": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"740": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"741": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"743": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"744": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"745": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"746": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"747": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"748": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"749": {
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	"970": {
		state: "Oregon",
		code: "OR",
		tax: 0,
		regBase: 75
	},
	"971": {
		state: "Oregon",
		code: "OR",
		tax: 0,
		regBase: 75
	},
	"972": {
		state: "Oregon",
		code: "OR",
		tax: 0,
		regBase: 75
	},
	"973": {
		state: "Oregon",
		code: "OR",
		tax: 0,
		regBase: 75
	},
	"974": {
		state: "Oregon",
		code: "OR",
		tax: 0,
		regBase: 75
	},
	"975": {
		state: "Oregon",
		code: "OR",
		tax: 0,
		regBase: 75
	},
	"150": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"151": {
		state: "Pennsylvania",
		code: "PA",
		tax: 8,
		regBase: 100
	},
	"152": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"153": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"154": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"155": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"156": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"157": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"158": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"159": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"160": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"161": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"162": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"163": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"164": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"165": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"166": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"167": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"168": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"169": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"170": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"171": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"172": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"173": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"174": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"175": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"176": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"177": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"178": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"179": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"180": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"181": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"182": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"183": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"184": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"185": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"186": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"187": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"188": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"189": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"190": {
		state: "Pennsylvania",
		code: "PA",
		tax: 8,
		regBase: 100
	},
	"191": {
		state: "Pennsylvania",
		code: "PA",
		tax: 8,
		regBase: 100
	},
	"192": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"193": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"194": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"195": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"196": {
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	"028": {
		state: "Rhode Island",
		code: "RI",
		tax: 7,
		regBase: 120
	},
	"029": {
		state: "Rhode Island",
		code: "RI",
		tax: 7,
		regBase: 120
	},
	"290": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"291": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"292": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"293": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"294": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"295": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"296": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"297": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"298": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"299": {
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	"570": {
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	"571": {
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	"572": {
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	"573": {
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	"574": {
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	"575": {
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	"576": {
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	"577": {
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	"370": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"371": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"372": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"373": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"374": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"375": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"376": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"377": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"378": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"379": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"380": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"381": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"382": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"383": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"384": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"385": {
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	"750": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"751": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"752": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"753": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"760": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"761": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"770": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"771": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"772": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"775": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"776": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"778": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"780": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"781": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"782": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"783": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"785": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"786": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"787": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"788": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"789": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"790": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"791": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"793": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"794": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"795": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"796": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"797": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"798": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"799": {
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	"840": {
		state: "Utah",
		code: "UT",
		tax: 6.85,
		regBase: 70
	},
	"841": {
		state: "Utah",
		code: "UT",
		tax: 7.25,
		regBase: 75
	},
	"842": {
		state: "Utah",
		code: "UT",
		tax: 6.85,
		regBase: 70
	},
	"843": {
		state: "Utah",
		code: "UT",
		tax: 6.85,
		regBase: 70
	},
	"844": {
		state: "Utah",
		code: "UT",
		tax: 6.85,
		regBase: 70
	},
	"845": {
		state: "Utah",
		code: "UT",
		tax: 6.85,
		regBase: 70
	},
	"846": {
		state: "Utah",
		code: "UT",
		tax: 6.85,
		regBase: 70
	},
	"847": {
		state: "Utah",
		code: "UT",
		tax: 6.85,
		regBase: 70
	},
	"050": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"051": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"052": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"053": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"054": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"056": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"057": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"058": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"059": {
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	"062": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"063": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"064": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"065": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"066": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"067": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"068": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"069": {
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	"220": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"221": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"222": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"223": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"224": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"225": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"226": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"227": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"228": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"229": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"230": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"231": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"232": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"233": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"234": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"235": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"236": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"237": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"238": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"239": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"240": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"241": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"242": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"243": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"244": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"245": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"246": {
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	"980": {
		state: "Washington",
		code: "WA",
		tax: 10.25,
		regBase: 185
	},
	"981": {
		state: "Washington",
		code: "WA",
		tax: 10.25,
		regBase: 185
	},
	"982": {
		state: "Washington",
		code: "WA",
		tax: 10.25,
		regBase: 185
	},
	"983": {
		state: "Washington",
		code: "WA",
		tax: 10.25,
		regBase: 185
	},
	"984": {
		state: "Washington",
		code: "WA",
		tax: 10.25,
		regBase: 185
	},
	"985": {
		state: "Washington",
		code: "WA",
		tax: 10.25,
		regBase: 185
	},
	"986": {
		state: "Washington",
		code: "WA",
		tax: 8.1,
		regBase: 175
	},
	"988": {
		state: "Washington",
		code: "WA",
		tax: 8.1,
		regBase: 175
	},
	"989": {
		state: "Washington",
		code: "WA",
		tax: 8.1,
		regBase: 175
	},
	"990": {
		state: "Washington",
		code: "WA",
		tax: 8.9,
		regBase: 180
	},
	"991": {
		state: "Washington",
		code: "WA",
		tax: 8.9,
		regBase: 180
	},
	"992": {
		state: "Washington",
		code: "WA",
		tax: 8.9,
		regBase: 180
	},
	"993": {
		state: "Washington",
		code: "WA",
		tax: 8.9,
		regBase: 180
	},
	"994": {
		state: "Washington",
		code: "WA",
		tax: 8.9,
		regBase: 180
	},
	"247": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"248": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"249": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"250": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"251": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"252": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"253": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"254": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"255": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"256": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"257": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"258": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"259": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"260": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"261": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"262": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"263": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"264": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"265": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"266": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"267": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"268": {
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	"530": {
		state: "Wisconsin",
		code: "WI",
		tax: 5,
		regBase: 110
	},
	"531": {
		state: "Wisconsin",
		code: "WI",
		tax: 5,
		regBase: 110
	},
	"532": {
		state: "Wisconsin",
		code: "WI",
		tax: 5,
		regBase: 110
	},
	"534": {
		state: "Wisconsin",
		code: "WI",
		tax: 5.5,
		regBase: 115
	},
	"535": {
		state: "Wisconsin",
		code: "WI",
		tax: 5,
		regBase: 110
	},
	"537": {
		state: "Wisconsin",
		code: "WI",
		tax: 5.5,
		regBase: 115
	},
	"538": {
		state: "Wisconsin",
		code: "WI",
		tax: 5.5,
		regBase: 115
	},
	"820": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"821": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"822": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"823": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"824": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"825": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"826": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"827": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"828": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"829": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"830": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	"831": {
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	}
};
function givesTradeInTaxCredit(stateAbbr) {
	const code = stateAbbr.toUpperCase();
	if (NO_TRADE_IN_TAX_CREDIT_STATES.has(code)) return false;
	if (TRADE_IN_TAX_CREDIT_STATES.has(code)) return true;
	return true;
}
var ZIP_RANGE_FALLBACK = [
	{
		min: 1,
		max: 27,
		state: "Massachusetts",
		code: "MA",
		tax: 6.25,
		regBase: 120
	},
	{
		min: 28,
		max: 29,
		state: "Rhode Island",
		code: "RI",
		tax: 7,
		regBase: 120
	},
	{
		min: 30,
		max: 38,
		state: "New Hampshire",
		code: "NH",
		tax: 0,
		regBase: 60
	},
	{
		min: 39,
		max: 49,
		state: "Maine",
		code: "ME",
		tax: 5.5,
		regBase: 80
	},
	{
		min: 50,
		max: 59,
		state: "Vermont",
		code: "VT",
		tax: 6,
		regBase: 85
	},
	{
		min: 60,
		max: 69,
		state: "Connecticut",
		code: "CT",
		tax: 6.35,
		regBase: 140
	},
	{
		min: 70,
		max: 89,
		state: "New Jersey",
		code: "NJ",
		tax: 6.625,
		regBase: 145
	},
	{
		min: 100,
		max: 149,
		state: "New York",
		code: "NY",
		tax: 8,
		regBase: 175
	},
	{
		min: 150,
		max: 196,
		state: "Pennsylvania",
		code: "PA",
		tax: 6,
		regBase: 95
	},
	{
		min: 197,
		max: 199,
		state: "Delaware",
		code: "DE",
		tax: 0,
		regBase: 50
	},
	{
		min: 200,
		max: 205,
		state: "District of Columbia",
		code: "DC",
		tax: 6,
		regBase: 180
	},
	{
		min: 206,
		max: 219,
		state: "Maryland",
		code: "MD",
		tax: 6,
		regBase: 130
	},
	{
		min: 220,
		max: 246,
		state: "Virginia",
		code: "VA",
		tax: 6,
		regBase: 95
	},
	{
		min: 247,
		max: 268,
		state: "West Virginia",
		code: "WV",
		tax: 6,
		regBase: 70
	},
	{
		min: 270,
		max: 289,
		state: "North Carolina",
		code: "NC",
		tax: 3,
		regBase: 35
	},
	{
		min: 290,
		max: 299,
		state: "South Carolina",
		code: "SC",
		tax: 5,
		regBase: 60
	},
	{
		min: 300,
		max: 319,
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	{
		min: 320,
		max: 349,
		state: "Florida",
		code: "FL",
		tax: 6,
		regBase: 250
	},
	{
		min: 350,
		max: 369,
		state: "Alabama",
		code: "AL",
		tax: 4,
		regBase: 60
	},
	{
		min: 370,
		max: 385,
		state: "Tennessee",
		code: "TN",
		tax: 9.75,
		regBase: 80
	},
	{
		min: 386,
		max: 397,
		state: "Mississippi",
		code: "MS",
		tax: 7,
		regBase: 60
	},
	{
		min: 398,
		max: 399,
		state: "Georgia",
		code: "GA",
		tax: 7,
		regBase: 90
	},
	{
		min: 400,
		max: 427,
		state: "Kentucky",
		code: "KY",
		tax: 6,
		regBase: 60
	},
	{
		min: 430,
		max: 458,
		state: "Ohio",
		code: "OH",
		tax: 7.5,
		regBase: 90
	},
	{
		min: 460,
		max: 479,
		state: "Indiana",
		code: "IN",
		tax: 7,
		regBase: 65
	},
	{
		min: 480,
		max: 499,
		state: "Michigan",
		code: "MI",
		tax: 6,
		regBase: 100
	},
	{
		min: 500,
		max: 528,
		state: "Iowa",
		code: "IA",
		tax: 6,
		regBase: 55
	},
	{
		min: 530,
		max: 549,
		state: "Wisconsin",
		code: "WI",
		tax: 5,
		regBase: 110
	},
	{
		min: 550,
		max: 567,
		state: "Minnesota",
		code: "MN",
		tax: 6.875,
		regBase: 85
	},
	{
		min: 570,
		max: 577,
		state: "South Dakota",
		code: "SD",
		tax: 4.5,
		regBase: 45
	},
	{
		min: 580,
		max: 588,
		state: "North Dakota",
		code: "ND",
		tax: 5,
		regBase: 40
	},
	{
		min: 590,
		max: 599,
		state: "Montana",
		code: "MT",
		tax: 0,
		regBase: 35
	},
	{
		min: 600,
		max: 629,
		state: "Illinois",
		code: "IL",
		tax: 6.25,
		regBase: 160
	},
	{
		min: 630,
		max: 658,
		state: "Missouri",
		code: "MO",
		tax: 4.225,
		regBase: 50
	},
	{
		min: 660,
		max: 679,
		state: "Kansas",
		code: "KS",
		tax: 6.5,
		regBase: 50
	},
	{
		min: 680,
		max: 693,
		state: "Nebraska",
		code: "NE",
		tax: 7,
		regBase: 55
	},
	{
		min: 700,
		max: 714,
		state: "Louisiana",
		code: "LA",
		tax: 9.45,
		regBase: 100
	},
	{
		min: 716,
		max: 729,
		state: "Arkansas",
		code: "AR",
		tax: 6.5,
		regBase: 75
	},
	{
		min: 730,
		max: 749,
		state: "Oklahoma",
		code: "OK",
		tax: 4.5,
		regBase: 55
	},
	{
		min: 750,
		max: 799,
		state: "Texas",
		code: "TX",
		tax: 8.25,
		regBase: 150
	},
	{
		min: 800,
		max: 816,
		state: "Colorado",
		code: "CO",
		tax: 2.9,
		regBase: 45
	},
	{
		min: 820,
		max: 831,
		state: "Wyoming",
		code: "WY",
		tax: 4,
		regBase: 50
	},
	{
		min: 832,
		max: 838,
		state: "Idaho",
		code: "ID",
		tax: 6,
		regBase: 45
	},
	{
		min: 840,
		max: 847,
		state: "Utah",
		code: "UT",
		tax: 6.85,
		regBase: 70
	},
	{
		min: 850,
		max: 865,
		state: "Arizona",
		code: "AZ",
		tax: 5.6,
		regBase: 120
	},
	{
		min: 870,
		max: 884,
		state: "New Mexico",
		code: "NM",
		tax: 4.875,
		regBase: 70
	},
	{
		min: 889,
		max: 898,
		state: "Nevada",
		code: "NV",
		tax: 8.375,
		regBase: 180
	},
	{
		min: 900,
		max: 961,
		state: "California",
		code: "CA",
		tax: 7.25,
		regBase: 250
	},
	{
		min: 967,
		max: 968,
		state: "Hawaii",
		code: "HI",
		tax: 4,
		regBase: 45
	},
	{
		min: 970,
		max: 979,
		state: "Oregon",
		code: "OR",
		tax: 0,
		regBase: 75
	},
	{
		min: 980,
		max: 994,
		state: "Washington",
		code: "WA",
		tax: 10.25,
		regBase: 185
	},
	{
		min: 995,
		max: 999,
		state: "Alaska",
		code: "AK",
		tax: 0,
		regBase: 100
	}
];
function lookupTaxByZip(zip) {
	const digits = zip.replace(/\D/g, "");
	if (digits.length < 3) return null;
	const prefix5 = digits.slice(0, 5);
	const prefix3 = digits.slice(0, 3);
	let row = (digits.length >= 5 ? ZIP_TO_STATE[prefix5] : void 0) ?? ZIP_TO_STATE[prefix3];
	let matched = ZIP_TO_STATE[prefix5] ? prefix5 : prefix3;
	if (!row) {
		const num = parseInt(prefix3, 10);
		if (Number.isFinite(num)) {
			for (const r of ZIP_RANGE_FALLBACK) if (num >= r.min && num <= r.max) {
				row = {
					state: r.state,
					code: r.code,
					tax: r.tax,
					regBase: r.regBase
				};
				matched = `${r.min}-${r.max}`;
				break;
			}
		}
	}
	if (!row) return null;
	return {
		state: row.state,
		abbr: row.code,
		taxRate: row.tax,
		registrationFees: Math.round(row.regBase * 2.2 + 80),
		zipPrefix: matched
	};
}
/** Digits only, first 5 then optional +4. */
function formatZipInput(raw) {
	const digits = raw.replace(/\D/g, "").slice(0, 9);
	if (digits.length <= 5) return digits;
	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
/**
* Require a complete 5-digit US ZIP before tax lookup.
* ZIP+4 is accepted; tax uses the first five digits.
*/
function validateUsZip(raw) {
	const digits = raw.replace(/\D/g, "").slice(0, 9);
	if (digits.length === 0) return {
		digits,
		zip5: "",
		status: "empty",
		info: null,
		message: ""
	};
	if (digits.length < 5) {
		const left = 5 - digits.length;
		return {
			digits,
			zip5: digits,
			status: "incomplete",
			info: null,
			message: `${left} more digit${left === 1 ? "" : "s"} needed for a US ZIP`
		};
	}
	const zip5 = digits.slice(0, 5);
	const info = lookupTaxByZip(zip5);
	if (!info) return {
		digits,
		zip5,
		status: "invalid",
		info: null,
		message: "Not a recognized US ZIP — check the number"
	};
	const plus4 = digits.length > 5 ? `-${digits.slice(5)}` : "";
	const extra = digits.length > 5 && digits.length < 9 ? " · +4 incomplete" : "";
	return {
		digits,
		zip5,
		status: "valid",
		info,
		message: `${formatZipTaxLabel(info)}${plus4 ? ` · ${zip5}${plus4}` : ""}${extra}`
	};
}
function formatZipTaxLabel(info) {
	return `${info.state} (${info.abbr}) — ${info.taxRate.toFixed(2)}% sales tax`;
}
function clampNumber(n, min = 0, max = Number.MAX_SAFE_INTEGER) {
	if (!Number.isFinite(n)) return min;
	return Math.min(max, Math.max(min, n));
}
function monthlyPayment(principal, aprPercent, termMonths) {
	const P = clampNumber(principal);
	const n = Math.max(1, Math.round(termMonths));
	if (P <= 0) return 0;
	const r = clampNumber(aprPercent) / 100 / 12;
	if (r === 0) return P / n;
	const pow = Math.pow(1 + r, n);
	return P * r * pow / (pow - 1);
}
function computeLoan(input) {
	const price = clampNumber(input.price);
	const tradeValue = clampNumber(input.tradeValue ?? 0);
	const tradePayoff = clampNumber(input.tradePayoff ?? 0);
	const registrationFees = clampNumber(input.registrationFees ?? 0);
	const fees = clampNumber(input.fees ?? 0);
	const down = clampNumber(input.downPayment, 0, price * 2);
	const taxRate = clampNumber(input.taxRate, 0, 25);
	const termMonths = Math.max(1, Math.round(input.termMonths));
	const apr = clampNumber(input.apr, 0, 40);
	const equity = tradeValue - tradePayoff;
	const negativeEquity = equity < 0 ? Math.abs(equity) : 0;
	const tradeCredit = input.applyTradeInTaxCredit === false ? 0 : tradeValue;
	const taxableAmount = Math.max(0, price - tradeCredit);
	const taxAmount = Math.round(taxableAmount * taxRate / 100);
	const gross = price + taxAmount + registrationFees + fees - equity;
	const amountFinanced = Math.max(0, gross - down);
	const payment = monthlyPayment(amountFinanced, apr, termMonths);
	const totalPaid = payment * termMonths;
	return {
		taxableAmount,
		taxAmount,
		registrationFees,
		fees,
		tradeValue,
		tradePayoff,
		equity,
		negativeEquity,
		amountFinanced,
		monthlyPayment: payment,
		totalPaid,
		totalInterest: Math.max(0, totalPaid - amountFinanced),
		downPayment: down,
		price,
		termMonths,
		apr,
		paymentToIncome: (monthlyIncome) => {
			const inc = clampNumber(monthlyIncome);
			if (inc <= 0 || payment <= 0) return null;
			return payment / inc * 100;
		}
	};
}
/**
* Invert monthly payment → principal (amount financed).
*/
function principalFromPayment(monthly, aprPercent, termMonths) {
	const M = clampNumber(monthly);
	const n = Math.max(1, Math.round(termMonths));
	if (M <= 0) return 0;
	const r = clampNumber(aprPercent) / 100 / 12;
	if (r === 0) return M * n;
	const pow = Math.pow(1 + r, n);
	return M * (pow - 1) / (r * pow);
}
/**
* Reverse solve: desired monthly payment → purchase price, given
* down %, APR, term, tax, trade, fees (same stack as computeLoan).
*/
function priceForTargetPayment(targetMonthly, downPct, opts) {
	const target = clampNumber(targetMonthly);
	if (target <= 0) return 0;
	const AF = principalFromPayment(target, opts.apr, opts.termMonths);
	const t = clampNumber(opts.taxRate, 0, 25) / 100;
	const d = clampNumber(downPct, 0, 100) / 100;
	const tradeValue = clampNumber(opts.tradeValue ?? 0);
	const tradePayoff = clampNumber(opts.tradePayoff ?? 0);
	const registrationFees = clampNumber(opts.registrationFees ?? 0);
	const fees = clampNumber(opts.fees ?? 0);
	const equity = tradeValue - tradePayoff;
	const tradeCredit = opts.applyTradeInTaxCredit === false ? 0 : tradeValue;
	const denom = 1 + t - d;
	if (denom <= .01) return 0;
	const price = (AF + tradeCredit * t - registrationFees - fees + equity) / denom;
	if (!Number.isFinite(price) || price < 0) return 0;
	return Math.round(Math.min(5e6, Math.max(0, price)));
}
/**
* Reverse solve: desired amount financed → purchase price, given
* down %, tax, trade, fees (same stack as computeLoan).
*/
function priceForTargetAmountFinanced(targetAmountFinanced, downPct, opts) {
	const AF = clampNumber(targetAmountFinanced);
	if (AF <= 0) return 0;
	const t = clampNumber(opts.taxRate, 0, 25) / 100;
	const d = clampNumber(downPct, 0, 100) / 100;
	const tradeValue = clampNumber(opts.tradeValue ?? 0);
	const tradePayoff = clampNumber(opts.tradePayoff ?? 0);
	const registrationFees = clampNumber(opts.registrationFees ?? 0);
	const fees = clampNumber(opts.fees ?? 0);
	const equity = tradeValue - tradePayoff;
	const tradeCredit = opts.applyTradeInTaxCredit === false ? 0 : tradeValue;
	const denom = 1 + t - d;
	if (denom <= .01) return 0;
	const price = (AF + tradeCredit * t - registrationFees - fees + equity) / denom;
	if (!Number.isFinite(price) || price < 0) return 0;
	return Math.round(Math.min(5e6, Math.max(0, price)));
}
function aprForCredit(band, termMonths) {
	let apr = {
		fair: 12.99,
		good: 10.49,
		"very-good": 8.49,
		excellent: 6.99
	}[band];
	if (termMonths > 180) apr += .5;
	else if (termMonths > 120) apr += .25;
	else if (termMonths <= 84) apr -= .15;
	return Math.round(apr * 100) / 100;
}
function creditLabel(band) {
	switch (band) {
		case "fair": return "600–650";
		case "good": return "650–700";
		case "very-good": return "700–750";
		case "excellent": return "800–850";
	}
}
function creditHint(band) {
	switch (band) {
		case "fair": return "600–650 · Highest rates · many RV lenders limited; large coaches often need more down or a co-buyer";
		case "good": return "650–700 · Higher rates · mid-size loans possible; 15–20%+ down helps big tickets";
		case "very-good": return "700–750 · Competitive rates · most specialty RV lenders will work the deal";
		case "excellent": return "800–850 · Best rates · strongest approval odds on six-figure motorhomes";
	}
}
/** Score ranges for the credit roll picker (FICO-style RV financing bands) */
var CREDIT_BANDS = [
	{
		id: "fair",
		range: "600–650",
		label: "600–650"
	},
	{
		id: "good",
		range: "650–700",
		label: "650–700"
	},
	{
		id: "very-good",
		range: "700–750",
		label: "700–750"
	},
	{
		id: "excellent",
		range: "800–850",
		label: "800–850"
	}
];
var TERM_PRESETS = [
	{
		label: "7 yr",
		months: 84,
		years: 7
	},
	{
		label: "10 yr",
		months: 120,
		years: 10
	},
	{
		label: "12 yr",
		months: 144,
		years: 12
	},
	{
		label: "15 yr",
		months: 180,
		years: 15
	},
	{
		label: "20 yr",
		months: 240,
		years: 20
	}
];
/** Down payment % — 0 first, then 10 / 15 / 20 / 30 */
var DOWN_PRESETS = [
	0,
	10,
	15,
	20,
	30
];
/** APR roll steps for the drum picker (manual override) */
var APR_PRESETS = (() => {
	const out = [];
	for (let a = 5; a <= 13.01; a += .25) out.push(Math.round(a * 100) / 100);
	return out;
})();
function lenderApr(lender, band) {
	const t = band === "excellent" ? 0 : band === "very-good" ? .28 : band === "good" ? .55 : .85;
	return Math.round((lender.aprLow + (lender.aprHigh - lender.aprLow) * t) * 100) / 100;
}
function lenderMonthly(lender, amountFinanced, termMonths, band) {
	if (amountFinanced < lender.minLoan) return null;
	const term = Math.min(lender.termMax, Math.max(lender.termMin, termMonths));
	return monthlyPayment(amountFinanced, lenderApr(lender, band), term);
}
function formatMoney(n, digits = 0) {
	if (!Number.isFinite(n)) return "—";
	return n.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	});
}
function formatPct(n, digits = 2) {
	if (!Number.isFinite(n)) return "—";
	return `${n.toFixed(digits)}%`;
}
function buildPdfReportHtml(opts) {
	const { price, loan, downPct, stateLabel, credit } = opts;
	const eqParts = [
		formatMoney(price, 0),
		`+ ${formatMoney(loan.taxAmount, 0)} tax`,
		`+ ${formatMoney(loan.registrationFees, 0)} fees`
	];
	if (loan.negativeEquity > 0) eqParts.push(`+ ${formatMoney(loan.negativeEquity, 0)} neg. equity`);
	if (loan.equity > 0) eqParts.push(`− ${formatMoney(loan.equity, 0)} trade equity`);
	eqParts.push(`− ${formatMoney(loan.downPayment, 0)} down`);
	const equation = `${eqParts.join(" ")} = ${formatMoney(loan.amountFinanced, 0)} financed`;
	return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>RvCal Report</title>
  <style>
    body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#fff;padding:32px;max-width:720px;margin:0 auto}
    h1{color:#c9a227} .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333}
    .muted{color:#aaa;font-size:13px} .big{font-size:42px;font-weight:700}
    .eq{margin-top:16px;padding:12px;border:1px solid #444;border-radius:10px;font-family:ui-monospace,monospace;font-size:12px;line-height:1.5;color:#ddd}
    .warn{color:#f5a623}
  </style></head><body>
  <h1>RvCal Payment Report</h1>
  <p class="muted">${stateLabel} · Credit: ${credit} · Generated ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
  <p class="big">${formatMoney(loan.monthlyPayment)}<span class="muted"> /mo</span></p>
  <p class="muted">${loan.termMonths} months · ${formatPct(loan.apr)} APR · ${downPct}% down</p>
  <div class="row"><span>Vehicle Price</span><span>${formatMoney(price)}</span></div>
  <div class="row"><span>Sales Tax</span><span>${formatMoney(loan.taxAmount)}</span></div>
  <div class="row"><span>Registration</span><span>${formatMoney(loan.registrationFees)}</span></div>
  <div class="row"><span>Negative Equity</span><span class="${loan.negativeEquity > 0 ? "warn" : ""}">${formatMoney(loan.negativeEquity)}</span></div>
  <div class="row"><span>Trade Equity Applied</span><span>${loan.equity > 0 ? "−" + formatMoney(loan.equity) : formatMoney(0)}</span></div>
  <div class="row"><span>Down Payment</span><span>−${formatMoney(loan.downPayment)}</span></div>
  <div class="row"><span><strong>Amount Financed</strong></span><span><strong>${formatMoney(loan.amountFinanced)}</strong></span></div>
  <div class="row"><span><strong>Est. Monthly</strong></span><span><strong>${formatMoney(loan.monthlyPayment)}</strong></span></div>
  <div class="eq">${equation}</div>
  ${loan.negativeEquity > 0 ? `<p class="muted" style="margin-top:12px">Negative equity: trade payoff exceeds trade value. That balance is rolled into the amount financed.</p>` : ""}
  <p class="muted" style="margin-top:24px">Estimates only — not a credit offer. Confirm rates and fees with a dealer or lender.</p>
  </body></html>`;
}
function clampPrice(n) {
	if (!Number.isFinite(n) || n < 0) return 0;
	return Math.min(5e6, Math.round(n));
}
function clampApr(n) {
	if (!Number.isFinite(n)) return 7.5;
	return Math.min(30, Math.max(0, Number(n.toFixed(3))));
}
/** Top of each credit roll band — shown in manual mode */
function creditBandTopScore(band) {
	switch (band) {
		case "fair": return 650;
		case "good": return 700;
		case "very-good": return 750;
		case "excellent": return 850;
	}
}
function creditScoreToBand(score) {
	const s = Math.round(score);
	if (s < 650) return "fair";
	if (s < 700) return "good";
	if (s < 800) return "very-good";
	return "excellent";
}
function NativeCalSelect({ "aria-label": ariaLabel, value, options, onChange, parse }) {
	const selected = options.some((o) => o.value === value) ? value : options[0]?.value;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			"aria-label": ariaLabel,
			value: selected === void 0 ? "" : String(selected),
			onChange: (e) => onChange(parse(e.target.value)),
			className: "glass-field min-h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] px-2 py-2.5 pr-7 text-center text-[13px] font-bold tabular-nums text-white outline-none [color-scheme:dark]",
			children: options.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: String(o.value),
				children: o.sublabel ? `${o.label} · ${o.sublabel}` : o.label
			}, `${String(o.value)}-${i}`))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
			className: "pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-gold",
			"aria-hidden": true
		})]
	});
}
function clampCreditScore(n) {
	if (!Number.isFinite(n)) return 850;
	return Math.min(850, Math.max(300, Math.round(n)));
}
function clampTermYears(n) {
	if (!Number.isFinite(n)) return 20;
	return Math.min(40, Math.max(5, Math.round(n)));
}
function RvCalApp() {
	const [price, setPrice] = (0, import_react.useState)(0);
	const [priceFocused, setPriceFocused] = (0, import_react.useState)(false);
	const [priceDraft, setPriceDraft] = (0, import_react.useState)("");
	const [zip, setZip] = (0, import_react.useState)("");
	const [taxRate, setTaxRate] = (0, import_react.useState)(0);
	const [registrationFees, setRegistrationFees] = (0, import_react.useState)(0);
	const [stateLabel, setStateLabel] = (0, import_react.useState)("Enter ZIP for tax");
	const [stateAbbr, setStateAbbr] = (0, import_react.useState)("");
	const [zipInfo, setZipInfo] = (0, import_react.useState)(null);
	const [taxManual, setTaxManual] = (0, import_react.useState)(false);
	const [tradeValue, setTradeValue] = (0, import_react.useState)(0);
	const [tradePayoff, setTradePayoff] = (0, import_react.useState)(0);
	const [downPct, setDownPct] = (0, import_react.useState)(20);
	const [credit, setCredit] = (0, import_react.useState)("excellent");
	const [creditScore, setCreditScore] = (0, import_react.useState)(850);
	/** select = native dropdowns · manual = text fields seeded from current values */
	const [loanEntryMode, setLoanEntryMode] = (0, import_react.useState)("roll");
	const [apr, setApr] = (0, import_react.useState)(7.5);
	const [aprFocused, setAprFocused] = (0, import_react.useState)(false);
	const [aprDraft, setAprDraft] = (0, import_react.useState)("");
	const [termMonths, setTermMonths] = (0, import_react.useState)(240);
	const [lendersOpen, setLendersOpen] = (0, import_react.useState)(false);
	const [lendersPulse, setLendersPulse] = (0, import_react.useState)(true);
	const [lenderRevealKey, setLenderRevealKey] = (0, import_react.useState)(0);
	const [aprManual, setAprManual] = (0, import_react.useState)(false);
	const [paymentFocused, setPaymentFocused] = (0, import_react.useState)(false);
	const [paymentDraft, setPaymentDraft] = (0, import_react.useState)("");
	const [paymentDriven, setPaymentDriven] = (0, import_react.useState)(false);
	const [lastTargetPayment, setLastTargetPayment] = (0, import_react.useState)(0);
	/** purchase = edit sticker · finance = edit amount financed (solves sticker) */
	const [priceMode, setPriceMode] = (0, import_react.useState)("purchase");
	const [financeDriven, setFinanceDriven] = (0, import_react.useState)(false);
	const [lastTargetFinance, setLastTargetFinance] = (0, import_react.useState)(0);
	const [apiLenders, setApiLenders] = (0, import_react.useState)(null);
	const [coachLabel, setCoachLabel] = (0, import_react.useState)(null);
	const scrollRef = (0, import_react.useRef)(null);
	const lendersSectionRef = (0, import_react.useRef)(null);
	const lastSeedToken = (0, import_react.useRef)(0);
	const nav = useShellNavOptional();
	(0, import_react.useEffect)(() => {
		const v = validateUsZip(zip);
		setZipInfo(v.status === "valid" ? v.info : null);
		if (taxManual) return;
		if (v.status === "valid" && v.info) {
			setTaxRate(v.info.taxRate);
			setRegistrationFees(v.info.registrationFees);
			setStateAbbr(v.info.abbr);
			setStateLabel(formatZipTaxLabel(v.info));
			return;
		}
		setTaxRate(0);
		setRegistrationFees(0);
		setStateAbbr("");
		setStateLabel("Enter ZIP for tax");
	}, [zip, taxManual]);
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => setLendersPulse(false), 1800);
		return () => window.clearTimeout(t);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!aprManual) setApr(aprForCredit(credit, termMonths));
	}, [
		credit,
		termMonths,
		aprManual
	]);
	const tradeTaxCredit = givesTradeInTaxCredit(stateAbbr);
	const zipCheck = (0, import_react.useMemo)(() => validateUsZip(zip), [zip]);
	const resetCal = (0, import_react.useCallback)(() => {
		setPrice(0);
		setPriceFocused(false);
		setPriceDraft("");
		setZip("");
		setTaxRate(0);
		setRegistrationFees(0);
		setStateLabel("Enter ZIP for tax");
		setStateAbbr("");
		setZipInfo(null);
		setTaxManual(false);
		setTradeValue(0);
		setTradePayoff(0);
		setDownPct(20);
		setCredit("excellent");
		setCreditScore(850);
		setLoanEntryMode("roll");
		setApr(7.5);
		setAprFocused(false);
		setAprDraft("");
		setTermMonths(240);
		setLendersOpen(false);
		setAprManual(false);
		setPaymentFocused(false);
		setPaymentDraft("");
		setPaymentDriven(false);
		setLastTargetPayment(0);
		setPriceMode("purchase");
		setFinanceDriven(false);
		setLastTargetFinance(0);
		setApiLenders(null);
		setCoachLabel(null);
	}, []);
	(0, import_react.useEffect)(() => {
		const seed = nav?.calSeed;
		if (!seed || seed.token === lastSeedToken.current) return;
		lastSeedToken.current = seed.token;
		if (seed.price > 0) {
			setPrice(clampPrice(seed.price));
			setPaymentDriven(false);
			setLastTargetPayment(0);
			setFinanceDriven(false);
			setLastTargetFinance(0);
			setPriceMode("purchase");
			setCoachLabel(seed.label ?? null);
		}
		nav?.clearCalSeed();
	}, [nav?.calSeed, nav]);
	const loanOpts = (0, import_react.useMemo)(() => ({
		apr,
		termMonths,
		taxRate,
		tradeValue,
		tradePayoff,
		registrationFees,
		fees: 0,
		applyTradeInTaxCredit: tradeTaxCredit
	}), [
		apr,
		termMonths,
		taxRate,
		tradeValue,
		tradePayoff,
		registrationFees,
		tradeTaxCredit
	]);
	const downPayment = price * downPct / 100;
	const applyDownPct = (pct) => {
		if (!Number.isFinite(pct)) return;
		setDownPct(Math.min(100, Math.max(0, Math.round(pct * 100) / 100)));
	};
	const applyCreditScore = (score) => {
		const s = clampCreditScore(score);
		setCreditScore(s);
		setCredit(creditScoreToBand(s));
		setAprManual(false);
	};
	const applyTermYears = (years) => {
		const y = clampTermYears(years);
		setTermMonths(y * 12);
	};
	const downRollOptions = (0, import_react.useMemo)(() => {
		const base = DOWN_PRESETS.map((pct) => {
			const down = price * pct / 100;
			return {
				value: pct,
				label: `${pct}%`,
				sublabel: price > 0 ? formatMoney(down, 0) : void 0
			};
		});
		if (!DOWN_PRESETS.includes(downPct) && downPct >= 0) {
			base.push({
				value: downPct,
				label: `${Number(downPct.toFixed(1))}%`,
				sublabel: price > 0 ? formatMoney(downPayment, 0) : "custom"
			});
			base.sort((a, b) => a.value - b.value);
		}
		return base;
	}, [
		price,
		downPct,
		downPayment
	]);
	const termRollOptions = (0, import_react.useMemo)(() => {
		const base = TERM_PRESETS.map((t) => ({
			value: t.months,
			label: t.label,
			sublabel: `${t.months} mo`
		}));
		if (!TERM_PRESETS.some((t) => t.months === termMonths)) {
			const years = Math.round(termMonths / 12);
			base.push({
				value: termMonths,
				label: `${years} yr`,
				sublabel: `${termMonths} mo`
			});
			base.sort((a, b) => a.value - b.value);
		}
		return base;
	}, [termMonths]);
	const loan = (0, import_react.useMemo)(() => computeLoan({
		price,
		downPayment,
		...loanOpts
	}), [
		price,
		downPayment,
		loanOpts
	]);
	(0, import_react.useEffect)(() => {
		if (!paymentDriven || lastTargetPayment <= 0 || paymentFocused) return;
		if (financeDriven) return;
		const nextPrice = priceForTargetPayment(lastTargetPayment, downPct, {
			apr,
			termMonths,
			taxRate,
			tradeValue: 0,
			tradePayoff: 0,
			registrationFees,
			fees: 0,
			applyTradeInTaxCredit: tradeTaxCredit
		});
		setPrice((prev) => {
			const n = clampPrice(nextPrice);
			return n === prev ? prev : n;
		});
	}, [
		paymentDriven,
		lastTargetPayment,
		downPct,
		apr,
		termMonths,
		taxRate,
		registrationFees,
		tradeTaxCredit,
		paymentFocused,
		financeDriven
	]);
	(0, import_react.useEffect)(() => {
		if (!financeDriven || lastTargetFinance <= 0 || priceFocused) return;
		if (paymentDriven) return;
		const nextPrice = priceForTargetAmountFinanced(lastTargetFinance, downPct, {
			apr,
			termMonths,
			taxRate,
			tradeValue,
			tradePayoff,
			registrationFees,
			fees: 0,
			applyTradeInTaxCredit: tradeTaxCredit
		});
		setPrice((prev) => {
			const n = clampPrice(nextPrice);
			return n === prev ? prev : n;
		});
	}, [
		financeDriven,
		lastTargetFinance,
		downPct,
		apr,
		termMonths,
		taxRate,
		tradeValue,
		tradePayoff,
		registrationFees,
		tradeTaxCredit,
		priceFocused,
		paymentDriven
	]);
	(0, import_react.useEffect)(() => {
		const ctrl = new AbortController();
		const qs = new URLSearchParams({
			amount: String(Math.round(loan.amountFinanced)),
			termMonths: String(termMonths),
			credit,
			zip
		});
		fetch(`/api/lenders?${qs}`, { signal: ctrl.signal }).then((r) => r.json()).then((j) => {
			if (j.lenders?.length) setApiLenders(j.lenders);
		}).catch(() => {});
		return () => ctrl.abort();
	}, [
		loan.amountFinanced,
		termMonths,
		credit,
		zip
	]);
	const onZipChange = (raw) => {
		setZip(formatZipInput(raw));
		setTaxManual(false);
	};
	const commitPriceDraft = () => {
		const n = clampPrice(parseInt(priceDraft.replace(/\D/g, ""), 10) || 0);
		if (priceMode === "finance") {
			setLastTargetFinance(n);
			setFinanceDriven(n > 0);
			setPaymentDriven(false);
			setLastTargetPayment(0);
			if (n > 0) setPrice(clampPrice(priceForTargetAmountFinanced(n, downPct, {
				apr,
				termMonths,
				taxRate,
				tradeValue,
				tradePayoff,
				registrationFees,
				fees: 0,
				applyTradeInTaxCredit: tradeTaxCredit
			})));
			else setPrice(0);
		} else {
			setPrice(n);
			setFinanceDriven(false);
			setLastTargetFinance(0);
			setPaymentDriven(false);
		}
		setPriceFocused(false);
		setPriceDraft("");
	};
	const applyPriceInput = (rawDigits) => {
		if (!Number.isFinite(rawDigits)) return;
		if (priceMode === "finance") {
			const af = clampPrice(rawDigits);
			setLastTargetFinance(af);
			setFinanceDriven(af > 0);
			setPaymentDriven(false);
			setLastTargetPayment(0);
			if (af <= 0) {
				setPrice(0);
				return;
			}
			setPrice(clampPrice(priceForTargetAmountFinanced(af, downPct, {
				apr,
				termMonths,
				taxRate,
				tradeValue,
				tradePayoff,
				registrationFees,
				fees: 0,
				applyTradeInTaxCredit: tradeTaxCredit
			})));
			return;
		}
		setPaymentDriven(false);
		setFinanceDriven(false);
		setLastTargetFinance(0);
		setPrice(clampPrice(rawDigits));
	};
	/** Reverse payment → sticker. Trade is never part of sticker solve. */
	const stickerFromPayment = (monthly) => priceForTargetPayment(monthly, downPct, {
		apr,
		termMonths,
		taxRate,
		tradeValue: 0,
		tradePayoff: 0,
		registrationFees,
		fees: 0,
		applyTradeInTaxCredit: tradeTaxCredit
	});
	const applyTargetPayment = (n) => {
		const monthly = Math.max(0, Math.round(n));
		if (monthly <= 0) return;
		setPrice(clampPrice(stickerFromPayment(monthly)));
		setLastTargetPayment(monthly);
		setPaymentDriven(true);
		setFinanceDriven(false);
		setLastTargetFinance(0);
		setPriceMode("purchase");
	};
	const commitPaymentDraft = () => {
		const n = Math.round(parseInt(paymentDraft.replace(/\D/g, ""), 10) || 0);
		setPaymentFocused(false);
		applyTargetPayment(n);
	};
	const setAprFromControl = (n) => {
		setAprManual(true);
		setApr(clampApr(n));
	};
	const useAutoApr = () => {
		setAprManual(false);
		setApr(aprForCredit(credit, termMonths));
	};
	const openPdf = () => {
		const html = buildPdfReportHtml({
			price,
			loan,
			downPct,
			stateLabel,
			credit: creditLabel(credit)
		});
		const w = window.open("", "_blank");
		if (w) {
			w.document.write(html);
			w.document.close();
		}
	};
	const lendersList = apiLenders?.length ? apiLenders : LENDERS_CATALOG;
	/** While Lender Options expands, keep the card in view with a smooth upward scroll */
	(0, import_react.useEffect)(() => {
		if (!lendersOpen) return;
		const section = lendersSectionRef.current;
		const scroller = scrollRef.current;
		if (!section || !scroller) return;
		const keepVisible = () => {
			const sRect = section.getBoundingClientRect();
			const cRect = scroller.getBoundingClientRect();
			const padTop = 12;
			const padBottom = 24;
			if (sRect.bottom > cRect.bottom - padBottom) {
				const delta = sRect.bottom - (cRect.bottom - padBottom);
				scroller.scrollBy({
					top: delta,
					behavior: "smooth"
				});
			} else if (sRect.top < cRect.top + padTop) {
				const delta = sRect.top - (cRect.top + padTop);
				scroller.scrollBy({
					top: delta,
					behavior: "smooth"
				});
			}
		};
		section.scrollIntoView({
			behavior: "smooth",
			block: "nearest"
		});
		keepVisible();
		const lenderCount = Math.max(1, lendersList.length);
		const duration = 900 + lenderCount * 1e3 + 500;
		const start = performance.now();
		let raf = 0;
		const tick = (now) => {
			keepVisible();
			if (now - start < duration) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		const intervals = [];
		for (let i = 0; i <= lenderCount; i++) intervals.push(window.setTimeout(keepVisible, 250 + i * 1e3));
		return () => {
			cancelAnimationFrame(raf);
			intervals.forEach((id) => window.clearTimeout(id));
		};
	}, [
		lendersOpen,
		lenderRevealKey,
		lendersList.length
	]);
	const activeBand = CREDIT_BANDS.find((b) => b.id === credit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuitePage, {
		tab: "rvcal",
		scrollRef,
		onPullReset: resetCal,
		pullLabel: "Release to reset RvCal · pull down",
		adaptiveGlass: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "landscape-content mx-auto w-full max-w-lg space-y-3 px-3 pb-10 pt-3 sm:px-4",
			children: [
				coachLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-center text-[11px] font-semibold text-gold-bright",
					children: ["Market avg ·", coachLabel]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-prestige-gold rounded-[var(--radius-xl)] px-4 py-5 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-bold tracking-[0.16em] text-amber",
								children: paymentDriven ? "TARGET MONTHLY · PRICE ADJUSTED" : "EST. MONTHLY PAYMENT"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mx-auto flex max-w-[16rem] items-center justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pointer-events-none absolute left-2 text-[28px] font-bold text-gold",
								children: "$"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: paymentFocused ? paymentDraft : price > 0 ? Math.round(loan.monthlyPayment).toLocaleString("en-US") : "",
								onFocus: () => {
									setPaymentFocused(true);
									setPaymentDraft(String(Math.round(loan.monthlyPayment) || ""));
								},
								onBlur: commitPaymentDraft,
								onKeyDown: (e) => {
									if (e.key === "Enter") e.currentTarget.blur();
								},
								onChange: (e) => {
									const raw = e.target.value.replace(/[^\d,]/g, "");
									setPaymentDraft(raw);
									const n = parseInt(raw.replace(/\D/g, ""), 10);
									if (!Number.isFinite(n) || n <= 0) return;
									applyTargetPayment(n);
								},
								className: "w-full bg-transparent py-1 pl-9 pr-2 text-center text-[40px] font-bold leading-none tabular-nums text-white outline-none",
								inputMode: "numeric",
								enterKeyHint: "done",
								"aria-label": "Target monthly payment",
								placeholder: "0"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-[12px] text-white",
							children: [
								termMonths,
								"mo ·",
								formatPct(apr),
								"APR ·",
								formatPct(downPct, 0),
								"down"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] text-white",
							children: [
								"Financed",
								formatMoney(loan.amountFinanced),
								paymentDriven ? ` · coach needs ~${formatMoney(price)}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[10px] leading-relaxed text-white/75",
							children: "Type a monthly payment to reverse-solve purchase price from term, APR, down, tax, and fees."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-prestige rounded-[var(--radius-xl)] p-3.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-3 flex items-center gap-1.5 text-caption font-bold tracking-[0.12em] text-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "size-3.5" }), "VEHICLE DETAILS"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold tracking-[0.12em] text-white",
								children: priceMode === "finance" ? "AMOUNT financed" : "purchase price"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex rounded-full border border-white/20 bg-black/35 p-0.5",
								role: "group",
								"aria-label": "Price input mode",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setPriceMode("purchase");
										setFinanceDriven(false);
										setLastTargetFinance(0);
										setPriceFocused(false);
										setPriceDraft("");
									},
									className: cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide transition", priceMode === "purchase" ? "bg-gold/25 text-gold-bright" : "text-white/70"),
									children: "Purchase"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setPriceMode("finance");
										setPaymentDriven(false);
										setLastTargetPayment(0);
										setPriceFocused(false);
										setPriceDraft("");
										if (price > 0 && loan.amountFinanced > 0) {
											setLastTargetFinance(Math.round(loan.amountFinanced));
											setFinanceDriven(true);
										}
									},
									className: cn("rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide transition", priceMode === "finance" ? "bg-blue/30 text-white" : "text-white/70"),
									children: "Amount financed"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gold",
								children: "$"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: priceFocused ? priceDraft : priceMode === "finance" ? price ? Math.round(financeDriven && lastTargetFinance > 0 ? lastTargetFinance : loan.amountFinanced).toLocaleString("en-US") : "" : price ? price.toLocaleString("en-US") : "",
								onFocus: () => {
									setPriceFocused(true);
									if (priceMode === "finance") {
										const af = financeDriven && lastTargetFinance > 0 ? lastTargetFinance : Math.round(loan.amountFinanced);
										setPriceDraft(af > 0 ? String(af) : "");
									} else setPriceDraft(price ? String(price) : "");
								},
								onBlur: commitPriceDraft,
								onKeyDown: (e) => {
									if (e.key === "Enter") e.currentTarget.blur();
								},
								onChange: (e) => {
									const raw = e.target.value.replace(/[^\d,]/g, "");
									setPriceDraft(raw);
									const n = parseInt(raw.replace(/\D/g, ""), 10);
									if (Number.isFinite(n)) applyPriceInput(n);
								},
								className: "glass-field w-full rounded-[var(--radius-md)] py-3.5 pl-8 pr-3 text-[18px] font-bold tabular-nums tracking-tight text-white outline-none placeholder:text-white/35",
								inputMode: "numeric",
								enterKeyHint: "done",
								"aria-label": priceMode === "finance" ? "Amount financed" : "Purchase price",
								placeholder: "0"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-[10px] text-white/75",
							children: priceMode === "finance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Type the loan amount. Purchase price updates from down %, tax, trade, and fees.", price > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold text-gold",
								children: [
									" ",
									"· sticker ~",
									formatMoney(price)
								]
							}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Type sticker, set a target payment above, or open Finance from a Facts report. Pull down to reset.", financeDriven ? null : price > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-white/60",
								children: [
									" ",
									"· financed ",
									formatMoney(loan.amountFinanced)
								]
							}) : null] })
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-prestige rounded-[var(--radius-xl)] p-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold tracking-[0.12em] text-gold",
								children: loanEntryMode === "roll" ? "QUICK LOAN · SELECT" : "QUICK LOAN · MANUAL ENTRY"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setLoanEntryMode((m) => {
										if (m === "roll") {
											setCreditScore(creditBandTopScore(credit));
											return "manual";
										}
										setCredit(creditScoreToBand(creditScore));
										return "roll";
									});
								},
								className: cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition", loanEntryMode === "manual" ? "border-blue/50 bg-blue/25 text-white" : "border-white/20 bg-black/30 text-white/85"),
								"aria-label": loanEntryMode === "roll" ? "Switch to manual entry" : "Switch to dropdowns",
								title: loanEntryMode === "roll" ? "Manual entry" : "Dropdowns",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-3.5" }), loanEntryMode === "manual" ? "Select" : "Manual"]
							})]
						}),
						loanEntryMode === "roll" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-1.5 text-center text-[9px] font-bold tracking-[0.1em] text-white",
										children: "CREDIT"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeCalSelect, {
										"aria-label": "Credit score range",
										value: credit,
										options: CREDIT_BANDS.map((b) => ({
											value: b.id,
											label: b.range
										})),
										parse: (raw) => raw,
										onChange: (band) => {
											setCredit(band);
											setCreditScore(creditBandTopScore(band));
											setAprManual(false);
										}
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1.5 flex items-center justify-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[9px] font-bold tracking-[0.1em] text-white",
											children: "APR"
										}), aprManual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: useAutoApr,
											className: "text-[8px] font-bold text-blue",
											children: "Auto"
										}) : null]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeCalSelect, {
										"aria-label": "Interest rate APR",
										value: APR_PRESETS.reduce((best, a) => Math.abs(a - apr) < Math.abs(best - apr) ? a : best),
										options: APR_PRESETS.map((a) => ({
											value: a,
											label: `${a.toFixed(2)}%`
										})),
										parse: (raw) => Number(raw),
										onChange: (v) => setAprFromControl(v)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-1.5 text-center text-[9px] font-bold tracking-[0.1em] text-white",
										children: "TERM"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeCalSelect, {
										"aria-label": "Loan term",
										value: termMonths,
										options: termRollOptions,
										parse: (raw) => Number(raw),
										onChange: (months) => setTermMonths(months)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-1.5 text-center text-[9px] font-bold tracking-[0.1em] text-white",
										children: "DOWN"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeCalSelect, {
										"aria-label": "Down payment percent",
										value: downPct,
										options: downRollOptions,
										parse: (raw) => Number(raw),
										onChange: (pct) => setDownPct(pct)
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-1 block text-[9px] font-bold tracking-[0.1em] text-white",
										children: "CREDIT"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: creditScore,
										onChange: (e) => {
											const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
											if (Number.isFinite(n)) applyCreditScore(n);
											else if (e.target.value === "") setCreditScore(0);
										},
										className: "glass-field w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none",
										inputMode: "numeric",
										enterKeyHint: "done",
										"aria-label": "Credit score",
										placeholder: "850"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mb-1 flex items-center justify-between text-[9px] font-bold tracking-[0.1em] text-white",
										children: ["APR %", aprManual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: useAutoApr,
											className: "text-[8px] font-bold text-blue",
											children: "Auto"
										}) : null]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: aprFocused ? aprDraft : apr.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										}),
										onFocus: () => {
											setAprFocused(true);
											setAprDraft(apr.toLocaleString("en-US", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2
											}));
										},
										onBlur: () => {
											const n = parseFloat(aprDraft.replace(/[^\d.]/g, ""));
											if (Number.isFinite(n)) setAprFromControl(n);
											setAprFocused(false);
											setAprDraft("");
										},
										onChange: (e) => {
											const raw = e.target.value.replace(/[^\d.]/g, "");
											setAprDraft(raw);
											const n = parseFloat(raw);
											if (Number.isFinite(n)) setAprFromControl(n);
										},
										className: "glass-field w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none",
										inputMode: "decimal",
										enterKeyHint: "done",
										"aria-label": "APR percent"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-1 block text-[9px] font-bold tracking-[0.1em] text-white",
										children: "TERM (YRS)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: Math.round(termMonths / 12),
										onChange: (e) => {
											const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
											if (Number.isFinite(n)) applyTermYears(n);
										},
										className: "glass-field w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none",
										inputMode: "numeric",
										enterKeyHint: "done",
										"aria-label": "Term years",
										placeholder: "20"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-1 block text-[9px] font-bold tracking-[0.1em] text-white",
										children: "DOWN %"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: Number.isInteger(downPct) ? String(downPct) : String(Math.round(downPct * 10) / 10),
										onChange: (e) => {
											const n = parseFloat(e.target.value.replace(/[^\d.]/g, ""));
											if (Number.isFinite(n)) applyDownPct(n);
										},
										className: "glass-field w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none",
										inputMode: "decimal",
										enterKeyHint: "done",
										"aria-label": "Down payment percent",
										placeholder: "20"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[10px] leading-relaxed text-white/75",
							children: creditHint(credit)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-prestige rounded-[var(--radius-xl)] p-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-amber",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "size-3.5" }), "TRADE-IN"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-3 text-[11px] leading-relaxed text-white/80",
							children: ["Trade equity always lowers amount financed (and payment). Sticker price does not change.", tradeTaxCredit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-emerald-200",
								children: [stateAbbr || "This state", ": sales tax is on (price − trade value)."]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-amber",
								children: [stateAbbr || "This state", ": sales tax is on full selling price (no trade deduction on tax)."]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-1 block text-[10px] font-bold tracking-[0.12em] text-white",
									children: "TRADE VALUE"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tradeValue || "",
									onChange: (e) => {
										setPaymentDriven(false);
										setTradeValue(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0);
									},
									className: "glass-field w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold text-white outline-none",
									inputMode: "numeric",
									placeholder: "0"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-1 block text-[10px] font-bold tracking-[0.12em] text-white",
									children: "TRADE PAYOFF"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: tradePayoff || "",
									onChange: (e) => {
										setPaymentDriven(false);
										setTradePayoff(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0);
									},
									className: "glass-field w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold text-white outline-none",
									inputMode: "numeric",
									placeholder: "0"
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-prestige rounded-[var(--radius-xl)] p-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-3 flex items-center gap-1.5 text-caption font-bold tracking-[0.12em] text-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), "LOCATION & TAX"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mb-1 flex items-center justify-between text-[10px] font-bold tracking-[0.12em] text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CUSTOMER ZIP CODE" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold tracking-normal text-white/60",
									children: zipCheck.status === "valid" && zipCheck.digits.length > 5 ? "ZIP+4" : "5-digit US"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: zip,
								onChange: (e) => onZipChange(e.target.value),
								maxLength: 10,
								inputMode: "numeric",
								autoComplete: "postal-code",
								enterKeyHint: "done",
								placeholder: "85001 or 85001-1234",
								"aria-label": "Customer ZIP code",
								"aria-invalid": zipCheck.status === "invalid",
								"aria-describedby": "zip-status",
								className: cn("glass-field w-full rounded-[var(--radius-md)] px-3 py-3 font-mono text-sm font-semibold tracking-wider text-white outline-none", zipCheck.status === "valid" && "border-gold/50", zipCheck.status === "invalid" && "border-amber/70")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							id: "zip-status",
							className: "mt-2.5",
							children: zipCheck.status === "valid" && zipInfo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-[var(--radius-md)] border border-gold/30 bg-gold/10 px-3 py-2.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-1.5 text-[13px] font-bold text-gold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 shrink-0" }), stateLabel]
								})
							}) : zipCheck.status === "incomplete" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1.5 text-[12px] text-white/75",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 shrink-0 text-gold" }), zipCheck.message]
							}) : zipCheck.status === "invalid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1.5 text-[12px] font-semibold text-amber",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5 shrink-0" }), zipCheck.message]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-white/60",
								children: "Enter a 5-digit US ZIP to fill sales tax. ZIP+4 is optional."
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold tracking-[0.12em] text-white",
									children: "SALES TAX RATE (%)"
								}), taxManual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setTaxManual(false),
									className: "text-[10px] font-bold text-blue",
									children: "Reset from ZIP"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-white",
									children: "auto from ZIP"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								step: "0.01",
								value: taxRate,
								onChange: (e) => {
									setTaxManual(true);
									setTaxRate(Number(e.target.value) || 0);
								},
								className: "glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-sm font-semibold text-white outline-none"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "glass-prestige rounded-[var(--radius-xl)] p-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "size-3.5 text-gold" }), "PAYMENT BREAKDOWN"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Vehicle price",
									value: formatMoney(price)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: tradeTaxCredit && loan.tradeValue > 0 ? `Sales tax ${formatPct(taxRate)} (price − trade)` : `Sales tax (${formatPct(taxRate)})`,
									value: formatMoney(loan.taxAmount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Registration / fees",
									value: formatMoney(registrationFees)
								}),
								loan.negativeEquity > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Negative equity rolled in",
									value: formatMoney(loan.negativeEquity),
									warn: true
								}) : null,
								loan.equity > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Trade equity applied",
									value: `−${formatMoney(loan.equity)}`,
									accent: true
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: `Down payment (${Number.isInteger(downPct) ? downPct : downPct.toFixed(1)}%)`,
									value: `−${formatMoney(loan.downPayment)}`,
									accent: true
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: openPdf,
							className: "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 py-2.5 text-[13px] font-bold text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }), "Payment report"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					ref: lendersSectionRef,
					className: cn("glass-prestige exclusive-card rounded-[var(--radius-xl)] p-3.5", lendersPulse && "exclusive-card-pulse-once"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "exclusive-card-shine",
							"aria-hidden": true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "exclusive-card-shine-glow" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "exclusive-card-shine-blade" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setLendersOpen((v) => {
									const next = !v;
									if (next) setLenderRevealKey((k) => k + 1);
									return next;
								});
							},
							className: "flex w-full items-center justify-between gap-2",
							"aria-expanded": lendersOpen,
							"aria-controls": "lender-options-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex min-w-0 items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "relative flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-gold/15",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-3.5 text-gold-bright" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "absolute -right-0.5 -top-0.5 size-3 text-gold-bright" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-wrap items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-bold tracking-[0.12em] text-gold-bright",
											children: "LENDER OPTIONS"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "exclusive-badge inline-flex items-center gap-0.5 rounded-full border border-gold/50 bg-gold/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-gold-bright",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-2.5 fill-gold-bright text-gold-bright" }), "Exclusive"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block text-[10px] font-medium leading-snug text-white/80",
										children: "Your broker edge — match the deal, then let them choose you"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
								className: "exclusive-chevron size-4 shrink-0 text-gold-bright",
								"data-open": lendersOpen ? "true" : "false",
								"aria-hidden": true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							id: "lender-options-panel",
							className: "exclusive-reveal",
							"data-open": lendersOpen ? "true" : "false",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "exclusive-reveal-inner",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "exclusive-reveal-content mt-2.5 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "exclusive-lender-row rounded-lg border border-gold/25 bg-gold/10 px-2.5 py-2 text-[10px] leading-relaxed text-white/90",
										style: { ["--lender-delay"]: "0ms" },
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-gold-bright",
												children: "Show this list. Close the loan."
											}),
											"Credit-aware options for",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold",
												children: activeBand?.range ?? creditLabel(credit)
											}),
											"·",
											formatMoney(loan.amountFinanced, 0),
											"financed ·",
											termMonths,
											"mo. Estimates to start the conversation — you broker the best real offer."
										]
									}), lendersList.map((L, i) => {
										const quote = "estimatedApr" in L ? L : null;
										const eligible = quote ? quote.eligible !== false : true;
										const reason = quote?.ineligibilityReason;
										const monthly = quote ? quote.estimatedMonthly : lenderMonthly(L, loan.amountFinanced, termMonths, credit);
										const aprShow = quote ? quote.estimatedApr : lenderApr(L, credit);
										const range = `${L.aprLow}%–${L.aprHigh}%`;
										const delayMs = (i + 1) * 1e3;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: L.url || "#",
											target: "_blank",
											rel: "noopener noreferrer",
											className: cn("exclusive-lender-row flex items-center gap-3 rounded-xl border px-3 py-2.5 transition", eligible ? "border-gold/25 bg-black/35 hover:border-gold/45 hover:bg-gold/10" : "border-white/10 bg-black/20 opacity-70"),
											style: { ["--lender-delay"]: `${delayMs}ms` },
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: cn("flex size-9 shrink-0 items-center justify-center rounded-full", eligible ? "bg-gold/15" : "bg-white/10"),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: cn("size-4", eligible ? "text-gold-bright" : "text-white") })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0 flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "truncate text-[13px] font-bold text-white",
														children: [L.name, !eligible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "ml-1.5 text-[9px] font-bold uppercase tracking-wide text-amber",
															children: "unlikely"
														}) : null]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] leading-snug text-white/85",
														children: eligible ? range : reason || "Credit / loan size limit"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-right",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[14px] font-bold tabular-nums text-gold-bright",
														children: eligible && monthly != null ? formatMoney(monthly) : "—"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[10px] text-white/85",
														children: eligible ? `/mo · ${formatPct(aprShow)}` : "n/a"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5 shrink-0 text-white" })
											]
										}, `${L.id}-${lenderRevealKey}`);
									})]
								})
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex gap-1.5 px-1 text-[10px] leading-relaxed text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mt-0.5 size-3 shrink-0" }), "Estimates only — not a credit offer. Confirm rates and fees with a dealer or lender."]
				})
			]
		})
	});
}
function Row({ label, value, bold, accent, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("min-w-0 flex-1 leading-snug text-white", bold ? "text-[13px] font-bold" : "text-[12px]"),
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("shrink-0 tabular-nums", bold ? "text-[13px] font-bold" : "text-[12px] font-semibold", warn && "text-amber", accent && "text-gold", !warn && !accent && "text-white"),
			children: value
		})]
	});
}
//#endregion
export { RvCalApp };
