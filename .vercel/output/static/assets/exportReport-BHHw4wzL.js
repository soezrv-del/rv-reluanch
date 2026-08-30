import{r as e}from"./index-CGwAM5cS.js";import{t}from"./dist-CD5Q11Pt.js";import{c as n,i as r,l as i,n as a,r as o,s,u as c}from"./brochureSpecs-D2_teWQp.js";var l=e(`arrow-left`,[[`path`,{d:`m12 19-7-7 7-7`,key:`1l729n`}],[`path`,{d:`M19 12H5`,key:`x3x0zl`}]]),u=e(`printer`,[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`,key:`143wyd`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`,key:`1itne7`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`,key:`1ue0tg`}]]),d=[{re:/\b(true\s+)?bunkhouses?\b|\bdedicated bunks\b|\bbunk room\b|\bbunkhouse floorplan\b/gi,need:/\bbunk/i,label:`bunkhouse`},{re:/\bbath[-\s]?and[-\s]?a[-\s]?half\b|\bhalf[-\s]?bath\b|\bbath and a half\b/gi,need:/\bbath|half/i,label:`bath-and-a-half`},{re:/\b(power\s+)?theater seating\b|\btheatre seating\b/gi,need:/\btheat(?:er|re)/i,label:`theater`}],f=`Layout details unconfirmed`;function p(e,t=[]){let n=(e||``).trim();if(!n)return``;let r=t.filter(Boolean).join(` `),i=n,a=!1;for(let e of d)e.need.test(r)||e.re.test(i)&&(a=!0,i=i.replace(e.re,f));return a&&!/layout details unconfirmed/i.test(n)&&(i=`${i.trim()}\n\n${f} — floorplan letters are labels only; use the OEM brochure.`),i.replace(/(Layout details unconfirmed(?: — floorplan letters are labels only; use the OEM brochure\.)?\s*){2,}/gi,`${f}. `)}function m(e){return(e||``).trim()||f}var h=/\b(godzilla|triton|v10|6\.8\s*l|7\.3\s*l|ecoboost|f-?53|gasoline|gas\s*v8)\b/i,g=/\b(cummins|isb|isl|isx|b6\.7|l9|x15|x12|power\s*stroke|duramax|diesel|mercedes|sprinter|om\d+)\b/i,_=/\b(isl\s*8\.?9|l9\s*450|x15|x12\s*500|1[,.]?250\s*lb|450\s*hp)\b/i,v=/\b(isb|b6\.7|340\s*hp|360\s*hp)\b/i,y=[{modelIncludes:`kountry star`,reject:h,reason:`Kountry Star is diesel pusher — rejected gas F53/Godzilla/V10`},{modelIncludes:`bay star`,reject:/\b(cummins\s*l9|isl\s*8|x15)\b/i,reason:`Bay Star is gas Class A — rejected flagship diesel`},{modelIncludes:`allegro red`,reject:/\b(triton|v10|f-?53|godzilla|isl\s*8|l9\s*450)\b/i,reason:`Allegro RED is mid-diesel ISB/B6.7 — rejected V10 or ISL/L9 flagship`},{modelIncludes:`vision`,reject:/\b(cummins|l9|isl|diesel\s*pusher)\b/i,reason:`Entegra Vision is gas F53 — rejected diesel`},{modelIncludes:`fr3`,reject:/\b(cummins|diesel\s*pusher|l9|isl)\b/i,reason:`FR3 is gas F53 — rejected diesel`},{modelIncludes:`via`,reject:/\b(cummins|isl|l9|x15|freightliner\s*xc|spartan)\b/i,reason:`Via is Sprinter OM642 — rejected Cummins pusher`},{modelIncludes:`villagio`,reject:/\b(cummins|isl|l9|x15|freightliner\s*xc)\b/i,reason:`Villagio is Sprinter cowl — rejected Cummins pusher`}];function b(e){return(e||``).toLowerCase().replace(/\s+/g,` `).trim()}function x(e){if(e==null||e===``)return null;if(typeof e==`number`&&Number.isFinite(e)&&e>0)return Math.round(e);let t=String(e).replace(/,/g,``).match(/(\d{2,4})/);if(!t)return null;let n=parseInt(t[1],10);return n>0?n:null}function S(e){if(!e)return!0;let t=e.trim();return!t||t===`—`||t===`N/A`||/^see chassis/i.test(t)||/^updating/i.test(t)?!0:t.length<3}function C(e,t){let n=`${e||``} ${t||``}`;return!!(/diesel/i.test(n)&&!/gas\s*\/\s*diesel|or diesel|by plan/i.test(n)||/class a diesel|diesel pusher/i.test(n))}function w(e,t){let n=`${e||``} ${t||``}`;return!C(e,t)&&/\bgas\b|gasoline|class a gas/i.test(n)}function T(e){let t=[],{make:r,model:i,catalogFuelType:a,catalogType:o,catalogEngine:s,catalogHp:c,live:l,pin:u}=e,d=l.engine?.trim()||``,f=l.horsepower,p=l.fuelType;if(!d&&(f==null||f<=0))return t;u&&d&&n(u,d,f)&&t.push(`Conflicts with brochure pin (${u.engine})`),u?.fuelType===`Diesel`&&d&&h.test(d)&&!g.test(d)&&t.push(`Pin is diesel — Live offered gas-only engine`),u?.fuelType===`Gas`&&d&&g.test(d)&&!h.test(d)&&t.push(`Pin is gas — Live offered diesel-only engine`),u&&f!=null&&f>0&&u.horsepower>0&&Math.abs(f-u.horsepower)>=40&&t.push(`HP ${f} too far from pin ${u.horsepower}`);let m=C(a,o||void 0),S=w(a,o||void 0);m&&d&&h.test(d)&&!g.test(d)&&t.push(`Catalog fuel is diesel — rejected gas engine from Live`),S&&d&&g.test(d)&&!h.test(d)&&t.push(`Catalog fuel is gas — rejected diesel engine from Live`),p&&(m&&/^gas/i.test(p)&&!/diesel/i.test(p)&&t.push(`Live fuelType gas conflicts with catalog diesel`),S&&/diesel/i.test(p)&&!/gas/i.test(p)&&t.push(`Live fuelType diesel conflicts with catalog gas`));let T=b(i);for(let e of y)T.includes(e.modelIncludes)&&(e.modelIncludes===`discovery`&&T.includes(`lxe`)||e.modelIncludes===`vision`&&(T.includes(`xl`)||T.includes(`diesel`))||d&&e.reject.test(d)&&t.push(e.reason));let E=s||``;if(E&&d){let e=v.test(E)&&!_.test(E),n=_.test(d)||f!=null&&f>=450;e&&n&&t.push(`Live flagship diesel conflicts with catalog mid-diesel`),h.test(E)&&g.test(d)&&!h.test(d)&&t.push(`Live diesel conflicts with catalog gas engine family`),g.test(E)&&h.test(d)&&!g.test(d)&&t.push(`Live gas conflicts with catalog diesel engine family`)}f!=null&&f>0&&d&&(h.test(d)&&!g.test(d)&&(f<200||f>420)&&t.push(`Gas engine HP ${f} outside 200–420 range`),/isb|b6\.7/i.test(d)&&!/isl|l9|x15/i.test(d)&&(f<250||f>400)&&t.push(`ISB/B6.7 HP ${f} outside 250–400 range`),/l9|isl/i.test(d)&&!/isb|b6\.7/i.test(d)&&(f<350||f>520)&&t.push(`ISL/L9 HP ${f} outside 350–520 range`),f===450&&(h.test(d)||v.test(d)&&!_.test(d))&&t.push(`Suspicious default 450 HP on non-flagship engine`));let D=x(c);return D!=null&&f!=null&&Math.abs(f-D)>=80&&!u&&t.push(`Live HP ${f} differs from catalog ${D} by ≥80`),[...new Set(t)]}function E(e){let t=o(e.year,e.make,e.model,e.floorplan),n=t?r(t):null;if(n&&t)return{hard:{engine:t.engine||n.engine,horsepower:t.horsepower!=null&&t.horsepower>0?t.horsepower:n.horsepower>0?n.horsepower:null,torqueLbFt:t.torqueLbFt??n.torqueLbFt??null,chassis:t.chassis??n.chassis??null,transmission:t.transmission??n.transmission??null,fuelType:t.fuelType??n.fuelType??null},trust:`local`,liveRejectedReasons:[],liveAccepted:!1,pin:n};let i=s(e.year,e.make,e.model,e.floorplan),c=e.catalog.engine?.trim()||null,l=e.catalog.chassis?.trim()||null,u=!!a(c,l,{fuelType:e.catalog.fuelType,type:e.catalog.type,modelEngine:c}),d=u?null:c,f=u?null:x(e.catalog.horsepower),p=e.catalog.transmission?.trim()||null,m=e.catalog.fuelType?.trim()||null,h={engine:S(d)?null:d,horsepower:f,torqueLbFt:u?null:(()=>{let t=e.catalog.torque;if(!t||t===`—`)return null;let n=String(t).replace(/,/g,``).match(/(\d{2,5})/);return n?parseInt(n[1],10):null})(),chassis:l&&l!==`—`?l:null,transmission:p&&p!==`—`?p:null,fuelType:m};if(i)return{hard:{engine:i.engine,horsepower:i.horsepower>0?i.horsepower:h.horsepower,torqueLbFt:i.torqueLbFt??h.torqueLbFt,chassis:i.chassis??h.chassis,transmission:i.transmission??h.transmission,fuelType:i.fuelType??h.fuelType},trust:`pinned`,liveRejectedReasons:[],liveAccepted:!1,pin:i};let g=e.live?.live?e.live:null;if(!g)return{hard:h,trust:h.engine?`catalog`:`empty`,liveRejectedReasons:[],liveAccepted:!1,pin:null};let _=T({year:e.year,make:e.make,model:e.model,floorplan:e.floorplan,catalogFuelType:m,catalogType:e.catalog.type,catalogEngine:d,catalogHp:u?null:e.catalog.horsepower,live:g,pin:null}),v=g.engine?.trim()||null,y=g.horsepower!=null&&g.horsepower>0?g.horsepower:null,b=_.length===0&&(g.confidence===`high`||g.confidence===`medium`),C={...h},w=!1;b&&(S(C.engine)||u)&&v&&(C.engine=v,w=!0),b&&y!=null&&(C.horsepower==null||C.horsepower<=0||u)&&(C.horsepower=y,w=!0),(!C.chassis||C.chassis===`—`)&&b&&g.chassis?.trim()&&(C.chassis=g.chassis.trim(),w=!0),(!C.transmission||C.transmission===`—`)&&b&&g.transmission?.trim()&&(C.transmission=g.transmission.trim(),w=!0),C.fuelType?!b&&g.fuelType:b&&g.fuelType?.trim()&&(C.fuelType=g.fuelType.trim(),w=!0),g.torqueLbFt!=null&&g.torqueLbFt>0&&(C.torqueLbFt==null||C.torqueLbFt<=0||u)&&b&&(C.torqueLbFt=g.torqueLbFt,w=!0);let E;return w&&b?(E=g.confidence===`high`||g.confidence===`medium`?`live-validated`:`live-unverified`,g.confidence===`low`&&(E=`live-unverified`)):E=h.engine?`catalog`:v&&!b?`empty`:h.engine?`catalog`:`empty`,!b&&h.engine&&(E=`catalog`),{hard:C,trust:E,liveRejectedReasons:_,liveAccepted:w&&b,pin:null}}function D(e){return e==null||e<=0?null:`${Math.round(e)} HP`}function O(e){return e==null||e<=0?null:`${e.toLocaleString()} lb-ft`}var k=`rvfax.verifiedCatalog.v9`,A=[`rvfax.verifiedCatalog.v1`,`rvfax.verifiedCatalog.v2`,`rvfax.verifiedCatalog.v3`,`rvfax.verifiedCatalog.v4`,`rvfax.verifiedCatalog.v5`,`rvfax.verifiedCatalog.v6`,`rvfax.verifiedCatalog.v7`,`rvfax.verifiedCatalog.v8`],j=200,M=12096e5;function N(){try{return typeof localStorage<`u`}catch{return!1}}function ee(){if(N())for(let e of A)try{localStorage.removeItem(e)}catch{}}function P(){return{version:9,entries:{}}}function F(){if(!N())return P();ee();try{let e=localStorage.getItem(k);if(!e)return P();let t=JSON.parse(e);return!t||t.version!==9||!t.entries?P():t}catch{return P()}}function I(e){if(N())try{e.version=9,localStorage.setItem(k,JSON.stringify(e))}catch{}}function L(e){if(e.schema!==9)return!1;let t=Date.parse(e.savedAt);return Number.isFinite(t)?Date.now()-t<M:!1}function R(e,t){let n=e.engine,r=c(e,t.overview),a=i(e,t.keyFeatures),o=c(e,t.reliabilitySummary),s=c(e,t.marketNotes);return{...t,engine:n,horsepower:e.horsepower,torqueLbFt:e.torqueLbFt??t.torqueLbFt,chassis:e.chassis??t.chassis,transmission:e.transmission??t.transmission,fuelType:e.fuelType??(/diesel|cummins|isb|b6\.7|l9|isl|power stroke/i.test(n)?`Diesel`:t.fuelType),rvType:e.fuelType===`Diesel`?t.rvType?.toLowerCase().includes(`gas`)?`Class A Diesel`:t.rvType||`Class A Diesel`:e.fuelType===`Gas`?t.rvType?.toLowerCase().includes(`diesel`)?`Class A Gas`:t.rvType||`Class A Gas`:t.rvType,overview:r,keyFeatures:a,reliabilitySummary:o,marketNotes:s,sourcesNote:[t.sourcesNote,e.note?`Brochure pin: ${e.note}`:null].filter(Boolean).join(` · `)}}function z(e,t,n,r,i){let a=s(e,t,n,r);return a?R(a,i):i}function B(e,t,r,i,a){let o=s(e,t,r,i);return!o||!a.engine?!1:n(o,a.engine,a.horsepower)}function V(e,t){return{...e,engine:t.engine,horsepower:t.horsepower,torqueLbFt:t.torqueLbFt,chassis:t.chassis,transmission:t.transmission,fuelType:t.fuelType}}function H(e){if(!e?.live)return!1;let t=!!(e.engine&&e.engine.trim().length>3),n=e.horsepower!=null&&e.horsepower>0,r=!!(e.chassis&&e.chassis.trim().length>2);return!!e.overview?.trim()||!!e.reliabilitySummary?.trim()||(e.commonIssues?.length??0)>0||e.tradeInUsd!=null&&e.tradeInUsd>0||e.retailHighUsd!=null&&e.retailHighUsd>0||t&&(n||r)}function te(e,t,n,r,i){if(!H(i))return null;let a=s(e,t,n,r),o=T({year:e,make:t,model:n,floorplan:r,catalogFuelType:i.fuelType,catalogType:i.rvType,catalogEngine:a?.engine??null,catalogHp:a?.horsepower??null,live:i,pin:a}),c={...i},l=!1,u=!1;if(a)c=R(a,c),l=!0,u=!0;else if(c=V(c,{engine:null,horsepower:null,torqueLbFt:null,chassis:null,transmission:null,fuelType:null}),u=!1,!H(c))return null;return c.horsepower===450&&!a&&c.engine&&/godzilla|v10|triton|isb|b6\.7/i.test(c.engine)&&(c={...c,horsepower:null}),{dossier:{...c,live:!0},powertrainPinned:l,powertrainValidated:u,rejectedReasons:o}}function ne(e,t,n,r){let i=G(e,t,n,r),a=F(),o=a.entries[i];if(!o||!L(o))return o&&!L(o)&&(delete a.entries[i],I(a)),null;if(B(e,t,n,r,o.dossier)){let c=s(e,t,n,r);if(c)o.dossier=R(c,o.dossier),o.powertrainPinned=!0,o.powertrainValidated=!0,o.savedAt=new Date().toISOString(),a.entries[i]=o,I(a);else return delete a.entries[i],I(a),null}let c=z(e,t,n,r,o.dossier);return s(e,t,n,r)||(c=V(c,{engine:null,horsepower:null,torqueLbFt:null,chassis:null,transmission:null,fuelType:null})),o.hits=(o.hits||0)+1,a.entries[i]=o,I(a),{...c,live:!0,cached:!0,fetchedAt:o.dossier.fetchedAt||o.savedAt}}function U(e,t,n,r,i){let a=te(e,t,n,r,i);if(!a||B(e,t,n,r,a.dossier)&&!a.powertrainPinned)return;let o=G(e,t,n,r),s=F();s.entries[o]={key:o,year:e.trim(),make:t.trim(),model:n.trim(),floorplan:(r||``).trim(),dossier:a.dossier,savedAt:new Date().toISOString(),hits:(s.entries[o]?.hits||0)+1,schema:9,powertrainPinned:a.powertrainPinned,powertrainValidated:a.powertrainValidated};let c=Object.keys(s.entries);if(c.length>j){let e=c.map(e=>s.entries[e]).sort((e,t)=>Date.parse(e.savedAt)-Date.parse(t.savedAt));for(let t=0;t<e.length-j;t++)delete s.entries[e[t].key]}I(s)}function W(e,t,n,r){let i=G(e,t,n,r),a=F();return a.entries[i]?(delete a.entries[i],I(a),!0):!1}function G(e,t,n,r){return`${e}|${t}|${n}|${r||``}`.toLowerCase()}var K=9e4;function q(e,t,n,r){return ne(e,t,n,r)}function J(e,t,n,r,i){return z(e,t,n,r,{...i,live:!0})}async function Y(e,t,n,r,i,a){if(!e.trim()||!t.trim()||!n.trim())return{ok:!1,error:`Year, make, and model are required.`};let o=new AbortController,s=()=>o.abort();if(i){if(i.aborted)return{ok:!1,error:`Request cancelled.`,aborted:!0};i.addEventListener(`abort`,s,{once:!0})}let c=setTimeout(()=>o.abort(),K);try{let i=await fetch(`/api/rvfax/dossier`,{method:`POST`,headers:{"Content-Type":`application/json`,Accept:`application/json`},body:JSON.stringify({year:e.trim(),make:t.trim(),model:n.trim(),floorplan:r?.trim()||void 0,catalogCandidate:a||void 0}),signal:o.signal}),s={};try{s=await i.json()}catch{return{ok:!1,error:`Live lookup returned invalid JSON (${i.status}) — catalog year-band stays on screen.`,status:i.status}}if(s&&s.data&&typeof s.data==`object`){let i=s.data,a=J(e,t,n,r,{...i,live:!0,cached:!!(s.meta?.cached||i.cached),fetchedAt:i.fetchedAt||new Date().toISOString(),modelUsed:s.meta?.model||i.modelUsed||null});return U(e,t,n,r,a),{ok:!0,data:a}}return{ok:!1,error:s.error||`Live lookup failed (${i.status}) — catalog year-band remains.`,status:i.status}}catch(e){return e instanceof DOMException&&e.name===`AbortError`||e instanceof Error&&e.name===`AbortError`?i?.aborted?{ok:!1,error:`Request cancelled.`,aborted:!0}:{ok:!1,error:`Live research timed out — catalog year-band remains on this report.`,aborted:!1}:{ok:!1,error:e instanceof Error?`${e.message} — catalog year-band remains on this report.`:`Network error on live lookup — catalog year-band remains.`}}finally{clearTimeout(c),i&&i.removeEventListener(`abort`,s)}}function X(e,t,n,r){W(e,t,n,r)}function re(e){return{engine:`—`,horsepower:`—`,torque:`—`,transmission:`—`,chassis:`—`,hitchOrPin:`—`,fuelCapacity:`—`,lengthFt:`—`,exteriorWidth:`—`,exteriorHeight:`—`,interiorHeight:`—`,gvwr:`—`,uvw:`—`,ccc:`—`,slideouts:`—`,sleeps:`—`,freshWater:`—`,grayWater:`—`,blackWater:`—`,generator:`—`,mpgHighway:`—`,warranty:`—`,isToyHauler:!1,garageLength:`—`,garageWidth:`—`,garageHeight:`—`,garageCapacity:`—`,rampWidth:`—`,fuelStation:`—`,garageFits:`—`}}function ie(e,t,n){let r=e??re(!1);if(!t?.live)return n?.hardOverride?{...r,engine:n.hardOverride.engine||r.engine,horsepower:n.hardOverride.horsepower||r.horsepower,torque:n.hardOverride.torque||r.torque,chassis:n.hardOverride.chassis||r.chassis,transmission:n.hardOverride.transmission||r.transmission}:r;let i=n?.lockPowertrainFromCatalog!==!1,a=e=>e!=null&&e>0?`${e.toLocaleString()} lbs`:null,o=e=>e!=null&&e>0?`${e} gal`:null,s=e=>e&&String(e).trim()?String(e).trim():null,c=e=>e?/\d\s*[-–—]\s*\d/.test(e)||/\bto\b/i.test(e)||/\b(span|range|varies)\b/i.test(e):!1,l=!!r.lengthFt&&r.lengthFt!==`—`&&!c(r.lengthFt),u=s(t.overallLength),d=u&&c(u)&&l?r.lengthFt:u&&!c(u)?u:r.lengthFt,f={engine:r.engine,horsepower:r.horsepower,torque:r.torque,transmission:r.transmission,chassis:r.chassis,hitchOrPin:a(t.towingCapacityLbs)??r.hitchOrPin,fuelCapacity:o(t.fuelCapacityGal)??r.fuelCapacity,lengthFt:d,exteriorWidth:s(t.exteriorWidth)??r.exteriorWidth,exteriorHeight:s(t.exteriorHeight)??r.exteriorHeight,interiorHeight:s(t.interiorHeight)??r.interiorHeight,gvwr:a(t.gvwrLbs)??r.gvwr,uvw:a(t.uvwLbs)??r.uvw,ccc:a(t.cccLbs)??r.ccc,slideouts:t.slideouts!=null&&t.slideouts>=0?String(t.slideouts):r.slideouts,sleeps:t.sleeps!=null&&t.sleeps>0?String(t.sleeps):r.sleeps,freshWater:o(t.freshWaterGal)??r.freshWater,grayWater:o(t.grayWaterGal)??r.grayWater,blackWater:o(t.blackWaterGal)??r.blackWater,generator:s(t.generator)??r.generator,mpgHighway:t.mpgHighwayEst!=null&&t.mpgHighwayEst>0?String(t.mpgHighwayEst):r.mpgHighway,warranty:s(t.warranty)??r.warranty,isToyHauler:r.isToyHauler,garageLength:r.garageLength,garageWidth:r.garageWidth,garageHeight:r.garageHeight,garageCapacity:r.garageCapacity,rampWidth:r.rampWidth,fuelStation:r.fuelStation,garageFits:r.garageFits};return n?.hardOverride?{...f,engine:n.hardOverride.engine||f.engine,horsepower:n.hardOverride.horsepower||f.horsepower,torque:n.hardOverride.torque||f.torque,chassis:n.hardOverride.chassis||f.chassis,transmission:n.hardOverride.transmission||f.transmission}:i?{...f,engine:r.engine,horsepower:r.horsepower,torque:r.torque,transmission:r.transmission,chassis:r.chassis}:{...f,engine:s(t.engine)??r.engine,horsepower:t.horsepower!=null&&Number.isFinite(t.horsepower)&&t.horsepower>0?`${Math.round(t.horsepower)} HP`:r.horsepower,torque:t.torqueLbFt!=null&&t.torqueLbFt>0?`${t.torqueLbFt.toLocaleString()} lb-ft`:r.torque,transmission:s(t.transmission)??r.transmission,chassis:s(t.chassis)??r.chassis}}function ae(e){if(!e?.live)return null;let t=e.tradeInUsd??0,n=e.retailLowUsd??0,r=e.retailHighUsd??0;return t<=0&&n<=0&&r<=0?null:{tradeIn:t,retailLow:n,retailHigh:r,msrpLo:e.msrpLowUsd??void 0,msrpHi:e.msrpHighUsd??void 0,note:e.marketNotes||`Live Grok market ladder`}}function oe(){try{return t.isNativePlatform()}catch{return!1}}function se(){return typeof navigator>`u`?!1:/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform===`MacIntel`&&navigator.maxTouchPoints>1}function Z(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function ce(e){let t=e.cloneNode(!0);return t.querySelectorAll(`script, iframe, video, audio, [data-no-export], .print\\:hidden`).forEach(e=>e.remove()),t.querySelectorAll(`*`).forEach(e=>{let t=e;!t.className||typeof t.className!=`string`||(t.className=t.className.replace(/\bflex-col-reverse\b/g,`flex-col`).replace(/\bflex-row-reverse\b/g,`flex-row`))}),t.querySelectorAll(`img`).forEach(e=>{let t=e,n=t.className||``;n.includes(`absolute`)&&(n.includes(`inset-0`)||n.includes(`object-cover`))&&t.remove()}),t.querySelectorAll(`button, input, select, textarea, a[href='#']`).forEach(e=>{let n=(e.textContent||``).trim();if(n&&n.length<80&&!/retry|search|finance|pdf|save|back|compare|ask/i.test(n)){let r=t.ownerDocument.createElement(`span`);r.className=`chip-export`,r.textContent=n,e.replaceWith(r)}else e.remove()}),t}function le(e){let{title:t,subtitle:n,bodyHtml:r,meta:i={}}=e,a=new Date().toLocaleString(`en-US`,{month:`long`,day:`numeric`,year:`numeric`}),o=new Date().toLocaleString(`en-US`,{month:`long`,day:`numeric`,year:`numeric`,hour:`numeric`,minute:`2-digit`}),s=[i.year,i.make,i.model].filter(Boolean).join(` `),c=i.tradeIn||`—`,l=i.retailLow||`—`,u=i.retailHigh||`—`,d=i.rating||`—`,f=i.reportId||`RVF-REPORT`,p=i.preparedFor||`Client`,m=i.type||`Motorhome`,h=i.recallCount??0,g=i.floorplan||``,_=[{label:`Service history when documented`,positive:!0},{label:`Personal / private ownership pattern`,positive:!0},{label:h>0?`${h} active NHTSA recall${h===1?``:`s`}`:`No open NHTSA recalls found`,positive:h===0},{label:`Age, roof seals, tires, chassis service gaps`,positive:!1}],v=(i.factors&&i.factors.length?i.factors:_).map(e=>`<div class="factor ${e.positive?`up`:`down`}"><span class="factor-ico">${e.positive?`↑`:`↓`}</span><span class="factor-label">${Z(e.label)}</span></div>`).join(``),y=h>0?`<div class="snap-row warn"><span class="snap-ico">!</span><strong>${h} open recall${h===1?``:`s`}</strong> on year/make/model</div>`:`<div class="snap-row ok"><span class="snap-ico">✓</span><strong>No open recalls</strong> found for this lineup</div>`;return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>${Z(t)}</title>
<style>
  :root {
    --ink: #0b1220;
    --muted: #4b5568;
    --line: #d7e3f2;
    --line-strong: #b8cce3;
    --paper: #ffffff;
    --soft: #f4f8fc;
    --blue: #1d6fbf;
    --blue-deep: #0e4f8f;
    --blue-soft: #e8f2fc;
    --red: #c81e1e;
    --green: #0f7a4a;
    --amber: #b45309;
    --navy: #0b1b33;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--ink);
    background: #e6eef7;
    font-weight: 600;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  strong, b, h1, h2, h3, th, .bold { font-weight: 800 !important; }

  .bar {
    position: sticky; top: 0; z-index: 50;
    display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
    padding: 12px 16px; padding-top: max(12px, env(safe-area-inset-top));
    background: var(--navy); color: #fff; font-weight: 700;
  }
  .bar button {
    appearance: none; border: 0; border-radius: 999px;
    padding: 11px 16px; font-weight: 800; font-size: 13px; cursor: pointer;
  }
  .bar .primary { background: #3b9eff; color: #041018; }
  .bar .secondary { background: rgba(255,255,255,.14); color: #fff; }

  .sheet {
    max-width: 860px; margin: 0 auto;
    background: var(--paper);
    box-shadow: 0 10px 40px rgba(11, 27, 51, 0.14);
    min-height: 100vh;
  }
  .pad { padding: 0 22px 28px; }

  /* ── Brand header (RvFOX Pro) ── */
  .tophead {
    display: grid; grid-template-columns: 1.2fr 1fr;
    gap: 12px; padding: 22px 22px 14px;
    border-bottom: 2px solid var(--line);
  }
  @media (max-width: 640px) { .tophead { grid-template-columns: 1fr; } }
  .brand-word {
    font-size: 28px; font-weight: 900; letter-spacing: -0.02em;
    color: var(--ink); line-height: 1;
  }
  .brand-word span { color: var(--blue); }
  .tagline {
    margin-top: 4px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.14em; color: var(--red); text-transform: uppercase;
  }
  .doc-label {
    margin-top: 8px; font-size: 10px; font-weight: 800;
    letter-spacing: 0.18em; color: #6b7c90; text-transform: uppercase;
  }
  .meta-right { text-align: right; }
  @media (max-width: 640px) { .meta-right { text-align: left; } }
  .meta-right .rid {
    font-size: 11px; font-weight: 800; color: #5b6b7c; letter-spacing: 0.04em;
  }
  .meta-right .date {
    margin-top: 2px; font-size: 12px; font-weight: 700; color: var(--ink);
  }
  .verified {
    display: inline-block; margin-top: 8px;
    font-size: 10px; font-weight: 800; color: var(--green);
    letter-spacing: 0.04em;
  }

  /* Prepared strip */
  .prepared {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; padding: 12px 22px 16px;
    border-bottom: 1px solid var(--line);
    background: linear-gradient(180deg, #fbfcfe, #f3f7fb);
  }
  @media (max-width: 640px) { .prepared { grid-template-columns: 1fr; } }
  .prep-label {
    font-size: 9px; font-weight: 900; letter-spacing: 0.16em;
    color: #6b7c90; text-transform: uppercase;
  }
  .prep-value {
    margin-top: 2px; font-size: 16px; font-weight: 900; color: var(--ink);
  }
  .prep-sub {
    margin-top: 2px; font-size: 11px; font-weight: 700; color: #5b6b7c;
  }

  /* ── CARFAX-style value band ── */
  .value-band {
    display: grid; grid-template-columns: 0.95fr 1.25fr;
    margin: 0 22px 16px;
    border: 2px solid var(--ink);
    background: #fff;
  }
  @media (max-width: 640px) { .value-band { grid-template-columns: 1fr; margin: 0 14px 14px; } }
  .value-left {
    padding: 16px 18px;
    border-right: 2px solid var(--ink);
    background: #fafbfc;
  }
  @media (max-width: 640px) { .value-left { border-right: 0; border-bottom: 2px solid var(--ink); } }
  .value-kicker {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase; color: #5b6b7c;
  }
  .value-amount {
    margin-top: 6px; font-size: 30px; font-weight: 900;
    color: var(--ink); letter-spacing: -0.02em; line-height: 1;
  }
  .value-range {
    margin-top: 8px; font-size: 12px; font-weight: 800; color: var(--blue-deep);
  }
  .value-note {
    margin-top: 6px; font-size: 11px; font-weight: 700; color: #5b6b7c;
  }
  .value-right { padding: 14px 16px; }
  .value-right h2 {
    margin: 0 0 10px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink);
  }
  .factor {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 0; font-size: 12px; font-weight: 800;
  }
  .factor-ico {
    width: 20px; height: 20px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; flex-shrink: 0;
  }
  .factor.up .factor-ico { background: #e8f8ef; color: var(--green); }
  .factor.down .factor-ico { background: #fdecec; color: var(--red); }
  .factor.up .factor-label { color: var(--ink); }
  .factor.down .factor-label { color: var(--ink); }

  /* Snapshot panel (CARFAX list style) */
  .snapshot {
    margin: 0 22px 18px;
    border: 1.5px solid var(--line-strong);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }
  .snapshot-head {
    display: flex; justify-content: space-between; align-items: center;
    gap: 10px; flex-wrap: wrap;
    padding: 12px 14px;
    background: var(--navy); color: #fff;
  }
  .snapshot-head .sh-title {
    font-size: 14px; font-weight: 900; letter-spacing: 0.02em;
  }
  .snapshot-head .sh-badge {
    font-size: 10px; font-weight: 900; letter-spacing: 0.08em;
    padding: 4px 8px; border-radius: 999px;
    background: #3b9eff; color: #041018;
  }
  .snap-vehicle {
    padding: 12px 14px; border-bottom: 1px solid var(--line);
    display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;
  }
  @media (max-width: 640px) { .snap-vehicle { grid-template-columns: 1fr; } }
  .snap-name {
    font-size: 18px; font-weight: 900; color: var(--ink); line-height: 1.15;
  }
  .snap-sub {
    margin-top: 3px; font-size: 12px; font-weight: 700; color: #4b5568;
  }
  .snap-rating {
    text-align: right;
  }
  @media (max-width: 640px) { .snap-rating { text-align: left; } }
  .snap-rating .num {
    font-size: 28px; font-weight: 900; color: var(--blue); line-height: 1;
  }
  .snap-rating .lbl {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    color: #6b7c90; text-transform: uppercase;
  }
  .snap-list { padding: 4px 0; }
  .snap-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; border-top: 1px solid var(--line);
    font-size: 12.5px; font-weight: 700;
  }
  .snap-row strong { font-weight: 900; }
  .snap-ico {
    width: 22px; height: 22px; border-radius: 6px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; flex-shrink: 0;
    background: var(--soft); color: var(--blue-deep);
  }
  .snap-row.warn .snap-ico { background: #fdecec; color: var(--red); }
  .snap-row.ok .snap-ico { background: #e8f8ef; color: var(--green); }

  /* Market triple */
  .market-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
    margin: 0 22px 18px;
  }
  @media (max-width: 640px) { .market-grid { grid-template-columns: 1fr; margin: 0 14px 14px; } }
  .m-card {
    border: 1.5px solid var(--line-strong); border-radius: 10px;
    padding: 12px 12px 14px; background: #fff; text-align: center;
  }
  .m-card .m-label {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .m-card.trade .m-label { color: var(--red); }
  .m-card.low .m-label { color: var(--blue); }
  .m-card.high .m-label { color: var(--blue-deep); }
  .m-card .m-val {
    margin-top: 6px; font-size: 22px; font-weight: 900; color: var(--ink);
    letter-spacing: -0.02em;
  }
  .m-card .m-sub {
    margin-top: 4px; font-size: 11px; font-weight: 700; color: #6b7c90;
  }

  /* Body / cloned report */
  .body { padding: 0 22px 8px; }
  #report-root {
    color: var(--ink) !important;
    font-weight: 700 !important;
  }
  #report-root, #report-root * {
    box-shadow: none !important;
    text-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  #report-root [class*="pointer-events-none"][class*="absolute"],
  #report-root [class*="absolute"][class*="inset-0"] {
    display: none !important;
  }
  #report-root img {
    max-width: 120px; height: auto; border-radius: 6px;
    border: 1px solid var(--line);
  }
  #report-root section,
  #report-root [class*="glass"],
  #report-root [class*="rounded-"][class*="border"],
  #report-root [class*="rounded-2xl"],
  #report-root [class*="rounded-\\["] {
    background: #fff !important;
    border: 1.5px solid var(--line) !important;
    border-radius: 12px !important;
    color: var(--ink) !important;
    margin: 0 0 14px !important;
    padding: 14px 16px !important;
    overflow: visible !important;
    page-break-inside: avoid;
    font-weight: 700 !important;
  }
  #report-root section > p:first-child,
  #report-root [class*="tracking"][class*="font-bold"]:first-child,
  #report-root h2, #report-root h3 {
    font-size: 12px !important; font-weight: 900 !important;
    letter-spacing: 0.12em !important; text-transform: uppercase !important;
    color: var(--blue-deep) !important;
    border-bottom: 2px solid var(--blue) !important;
    padding-bottom: 6px !important; margin: 0 0 12px !important;
    background: transparent !important;
  }
  #report-root h1 {
    font-size: 22px !important; font-weight: 900 !important;
    color: var(--ink) !important; margin: 0 !important;
  }
  #report-root, #report-root p, #report-root span, #report-root li, #report-root div {
    color: var(--ink) !important;
    font-weight: 700 !important;
  }
  #report-root [class*="text-white"],
  #report-root [class*="text-white\\/"] { color: var(--ink) !important; }
  #report-root [class*="text-sky"],
  #report-root [class*="text-blue"] { color: var(--blue-deep) !important; font-weight: 800 !important; }
  #report-root [class*="text-ruby"],
  #report-root [class*="text-red"] { color: var(--red) !important; font-weight: 800 !important; }
  #report-root [class*="text-emerald"],
  #report-root [class*="text-green"] { color: var(--green) !important; font-weight: 800 !important; }
  #report-root [class*="text-amber"],
  #report-root [class*="text-gold"],
  #report-root [class*="text-gold-bright"] { color: var(--amber) !important; font-weight: 800 !important; }
  #report-root [class*="text-white\\/70"],
  #report-root [class*="text-white\\/60"],
  #report-root [class*="text-white\\/55"],
  #report-root [class*="text-white\\/80"],
  #report-root [class*="text-white\\/75"],
  #report-root [class*="text-white\\/65"],
  #report-root [class*="text-white\\/45"] { color: #4b5568 !important; font-weight: 700 !important; }

  #report-root [class*="bg-black"],
  #report-root [class*="bg-white\\/"],
  #report-root [class*="bg-emerald"],
  #report-root [class*="bg-ruby"],
  #report-root [class*="bg-sky"],
  #report-root [class*="bg-gold"],
  #report-root [class*="bg-blue"],
  #report-root [class*="bg-green"],
  #report-root [class*="bg-amber"] {
    background: transparent !important;
    border-color: var(--line) !important;
  }
  #report-root [class*="grid"] { display: grid !important; gap: 8px !important; }
  #report-root [class*="grid-cols-2"] { grid-template-columns: 1fr 1fr !important; }
  #report-root [class*="grid-cols-3"] { grid-template-columns: 1fr 1fr 1fr !important; }
  #report-root [class*="grid-cols-4"] { grid-template-columns: 1fr 1fr 1fr 1fr !important; }
  #report-root .chip-export,
  #report-root [class*="rounded-full"] {
    display: inline-flex !important;
    font-size: 10px !important; font-weight: 900 !important;
    letter-spacing: 0.04em !important;
    padding: 4px 9px !important; border-radius: 999px !important;
    border: 1.5px solid var(--line-strong) !important;
    background: var(--blue-soft) !important; color: var(--blue-deep) !important;
    margin: 2px !important;
  }
  #report-root .hidden,
  #report-root .print\\:hidden,
  #report-root [class~="hidden"] { display: none !important; }
  #report-root [class*="space-y"] > * + * { margin-top: 8px !important; }
  #report-root [class*="flex"] {
    display: flex !important; flex-wrap: wrap; gap: 6px; font-weight: 700 !important;
  }
  #report-root [class*="flex-col"] { flex-direction: column !important; }
  #report-root [class*="items-center"] { align-items: center !important; }
  #report-root [class*="justify-between"] { justify-content: space-between !important; }
  #report-root [class*="border-emerald"],
  #report-root [class*="bg-emerald"] {
    background: #e8f8ef !important;
    border: 1px solid #b6e4cf !important;
    color: var(--green) !important;
    border-radius: 8px !important;
    font-weight: 800 !important;
  }
  #report-root svg { width: 12px !important; height: 12px !important; }

  /* Legal */
  .legal {
    margin: 10px 22px 0;
    padding: 14px 16px;
    border: 1.5px solid var(--line-strong);
    border-radius: 10px;
    background: var(--soft);
  }
  .legal h3 {
    margin: 0 0 8px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--navy);
  }
  .legal p {
    margin: 0 0 6px; font-size: 11px; line-height: 1.5;
    color: #4b5568; font-weight: 700;
  }
  .legal p:last-child { margin-bottom: 0; }
  .footer-bar {
    margin-top: 16px; padding: 14px 22px 18px;
    background: var(--navy); color: rgba(255,255,255,0.88);
    font-size: 11px; font-weight: 800; letter-spacing: 0.04em;
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  }
  .footer-bar strong { color: #7ec4ff; font-weight: 900; }

  @media print {
    body { background: #fff; }
    .bar { display: none !important; }
    .sheet { max-width: none; box-shadow: none; min-height: 0; }
    @page { size: letter; margin: 0.42in 0.48in; }
    .value-band, .snapshot, .market-grid, .legal, section { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="bar">
    <button type="button" class="primary" onclick="window.scrollTo(0,0);setTimeout(function(){window.print()},100)">Save as PDF / Print</button>
    <button type="button" class="secondary" onclick="try{window.parent.postMessage({type:'rvfax-export-close'},'*')}catch(e){};try{window.close()}catch(e){}">Close</button>
  </div>
  <div class="sheet">
    <header class="tophead">
      <div>
        <div class="brand-word">Rv<span>FOX</span> Pro</div>
        <div class="tagline">Know Before You Buy</div>
        <div class="doc-label">Vehicle History Report</div>
      </div>
      <div class="meta-right">
        <div class="rid">REPORT: ${Z(f)}</div>
        <div class="date">${Z(a)}</div>
        <div class="verified">Verified & True · RvFOX Pro</div>
      </div>
    </header>

    <div class="prepared">
      <div>
        <div class="prep-label">Prepared for</div>
        <div class="prep-value">${Z(p)}</div>
      </div>
      <div>
        <div class="prep-label">Subject vehicle</div>
        <div class="prep-value">${Z(s||t)}</div>
        <div class="prep-sub">Generated ${Z(o)}${g?` · Floorplan `+Z(g):``}</div>
      </div>
    </div>

    <!-- CARFAX-style value + factors -->
    <div class="value-band">
      <div class="value-left">
        <div class="value-kicker">RvFOX Retail Perspective</div>
        <div class="value-amount">${Z(u===`—`?l:u)}</div>
        <div class="value-range">Range ${Z(l)} – ${Z(u)}</div>
        <div class="value-note">Trade-in est. ${Z(c)} · Confirm with PPI & door sticker</div>
      </div>
      <div class="value-right">
        <h2>History events affecting this coach's value</h2>
        ${v}
      </div>
    </div>

    <!-- CARFAX-style snapshot -->
    <div class="snapshot">
      <div class="snapshot-head">
        <div class="sh-title">Vehicle History Snapshot</div>
        <div class="sh-badge">RvFOX PRO</div>
      </div>
      <div class="snap-vehicle">
        <div>
          <div class="snap-name">${Z(s||t)}</div>
          <div class="snap-sub">${Z(m)}${g?` · Floorplan `+Z(g):``}</div>
        </div>
        <div class="snap-rating">
          <div class="num">${Z(d)}</div>
          <div class="lbl">RvFOX Rating</div>
        </div>
      </div>
      <div class="snap-list">
        ${y}
        <div class="snap-row"><span class="snap-ico">⚙</span><strong>Service schedule</strong>&nbsp;included in this report</div>
        <div class="snap-row"><span class="snap-ico">▣</span><strong>Use / class</strong>&nbsp;${Z(m)}</div>
        <div class="snap-row"><span class="snap-ico">◆</span><strong>Market band</strong>&nbsp;${Z(l)} – ${Z(u)}</div>
        <div class="snap-row"><span class="snap-ico">◎</span><strong>Data</strong>&nbsp;Catalog + Live Grok + NHTSA when available</div>
      </div>
    </div>

    <!-- Market triple (from your preferred report) -->
    <div class="market-grid">
      <div class="m-card trade">
        <div class="m-label">Trade-In</div>
        <div class="m-val">${Z(c)}</div>
        <div class="m-sub">Dealer offer estimate</div>
      </div>
      <div class="m-card low">
        <div class="m-label">Retail Low</div>
        <div class="m-val">${Z(l)}</div>
        <div class="m-sub">Private party / auction</div>
      </div>
      <div class="m-card high">
        <div class="m-label">Retail High</div>
        <div class="m-val">${Z(u)}</div>
        <div class="m-sub">Dealer asking price</div>
      </div>
    </div>

    <div class="body">
      <div id="report-root">${r}</div>
    </div>

    <div class="legal">
      <h3>Disclaimer · Limited purpose</h3>
      <p>
        This <strong>RvFOX Pro Vehicle History Report</strong> is a professional decision-support
        dossier for recreational vehicles and motorhomes. It compiles catalog specifications,
        optional Live Grok enrichment, NHTSA recall queries, and market estimates. It is
        <strong>not</strong> a guarantee of condition, title accuracy, or future value.
      </p>
      <p>
        Always confirm chassis VIN, door sticker (GVWR / UVW / lengths), service records, and a
        qualified pre-purchase inspection (PPI) before purchase. Estimates may differ from dealer
        quotes or private-party offers.
      </p>
      <p>© ${new Date().getFullYear()} RvFOX Pro · Know Before You Buy · All rights reserved.</p>
    </div>

    <div class="footer-bar">
      <span><strong>RvFOX Pro</strong> · Know Before You Buy</span>
      <span>Motorcoach intelligence</span>
      <span>Confirm door sticker & PPI</span>
    </div>
  </div>
  <script>
    (function(){
      try {
        window.scrollTo(0,0);
        var r=document.getElementById('report-root');
        if(r){
          r.querySelectorAll('*').forEach(function(el){
            if(!el.style) return;
            el.style.height='auto'; el.style.maxHeight='none'; el.style.overflow='visible';
            el.style.fontWeight = el.style.fontWeight || '';
          });
        }
      } catch(e){}
    })();
  <\/script>
</body>
</html>`}async function ue(e,t,n){try{let r=new File([t],e,{type:`text/html`}),i=navigator;if(i.share&&i.canShare?.({files:[r]}))return await i.share({files:[r],title:n,text:n}),!0;if(i.share)return await i.share({title:n,text:n}),!0}catch(e){if(e instanceof Error&&/Abort|cancel/i.test(e.message))return!0}return!1}function Q(e,t){let n=new Blob([t],{type:`text/html;charset=utf-8`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=e,i.rel=`noopener`,i.style.display=`none`,document.body.appendChild(i),i.click(),window.setTimeout(()=>{URL.revokeObjectURL(r),i.remove()},1500)}function $(e){let t=new Blob([e],{type:`text/html;charset=utf-8`}),n=URL.createObjectURL(t);try{let e=document.createElement(`iframe`);e.setAttribute(`title`,`RvFOX Pro Vehicle History Report`),e.style.cssText=`position:fixed;inset:0;z-index:99999;width:100%;height:100%;border:0;background:#e6eef7;`,e.src=n;let t=document.createElement(`div`);t.style.cssText=`position:fixed;left:0;right:0;bottom:0;z-index:100000;display:flex;gap:8px;padding:12px 14px;padding-bottom:max(12px,env(safe-area-inset-bottom));background:#0b1b33;`;let r=(e,t)=>{let n=document.createElement(`button`);return n.type=`button`,n.textContent=e,n.style.cssText=t?`flex:1;padding:14px;border:0;border-radius:999px;font-weight:800;background:#3b9eff;color:#041018;font-size:14px;`:`padding:14px 16px;border:0;border-radius:999px;font-weight:800;background:rgba(255,255,255,.14);color:#fff;font-size:14px;`,n},i=r(`Save as PDF / Print`,!0),a=r(`Done`);return i.onclick=()=>{try{let t=e.contentWindow;t?.scrollTo(0,0),window.setTimeout(()=>{t?.focus(),t?.print()},120)}catch{}},a.onclick=()=>{e.remove(),t.remove(),URL.revokeObjectURL(n)},t.append(i,a),document.body.append(e,t),!0}catch{return window.open(n,`_blank`)?(window.setTimeout(()=>URL.revokeObjectURL(n),6e4),!0):(URL.revokeObjectURL(n),!1)}}async function de(e){let t=e.reportElementId??`rvfax-vehicle-report`,n=document.getElementById(t);if(!n)return{ok:!1,error:`Report not found on screen.`};let r=ce(n);r.querySelectorAll(`[data-no-export]`).forEach(e=>e.remove());let i=`${(e.filenameBase||`RvFOX-Pro-Report`).replace(/[^\w.-]+/g,`_`)}.html`,a=le({title:e.title,subtitle:e.subtitle,bodyHtml:r.innerHTML,meta:e.meta}),o=oe(),s=se();if(o||s){if($(a))return{ok:!0,method:`preview`};if(await ue(i,a,e.title))return{ok:!0,method:`share`};try{return Q(i,a),{ok:!0,method:`download`}}catch{return{ok:!1,error:`Could not open the report.`}}}try{if($(a))return{ok:!0,method:`preview`};document.body.classList.add(`printing-rv-report`);let e=document.getElementById(`rvfax-report-scroll`),t=[],r=e=>{e&&(t.push({el:e,css:e.style.cssText}),e.style.height=`auto`,e.style.maxHeight=`none`,e.style.overflow=`visible`)};r(e),r(n);let i=()=>{document.body.classList.remove(`printing-rv-report`),t.forEach(({el:e,css:t})=>{e.style.cssText=t}),window.removeEventListener(`afterprint`,i)};return window.addEventListener(`afterprint`,i),window.scrollTo(0,0),window.print(),window.setTimeout(i,3e3),{ok:!0,method:`print`}}catch{return Q(i,a),{ok:!0,method:`download`}}}export{q as a,O as c,m as d,u as f,ie as i,E as l,Y as n,X as o,l as p,ae as r,D as s,de as t,p as u};