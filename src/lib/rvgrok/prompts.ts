/**
 * RvGrok behavior is shaped by instructions (process), not by re-training the model.
 * Chat + agent share the lean standing core. Desk / chips / research stay in code.
 */

import { RV_GROK_LEAN_CORE } from "./speechPolicy.ts";

export {
  RV_GROK_LEAN_CORE,
  RV_GROK_SESSION_INTRO,
  SALES_MISSION_POLICY,
  VOICE_RESEARCH_HOLD_ALT,
  VOICE_RESEARCH_HOLD_PHRASE,
} from "./speechPolicy.ts";

export const RV_SYSTEM_PROMPT = RV_GROK_LEAN_CORE;

export const AGENT_SYSTEM_PROMPT = RV_GROK_LEAN_CORE;
