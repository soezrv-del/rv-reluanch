/**
 * Chat, agent, and Live Voice call rvGrokCoreFor(audience).
 * These constants are the shopper default only. A missing tag is shopper.
 * Do not append pin-wins or search-always onto both sessions.
 */

import { rvGrokCoreFor } from "./speechPolicy.ts";

export {
  RV_GROK_LEAN_CORE,
  rvGrokCoreFor,
  parseAudience,
  keepTalkingCue,
  RV_GROK_SESSION_INTRO,
  SALES_MISSION_POLICY,
  VOICE_RESEARCH_HOLD_ALT,
  VOICE_RESEARCH_HOLD_PHRASE,
} from "./speechPolicy.ts";

export const RV_SYSTEM_PROMPT = rvGrokCoreFor("shopper");

export const AGENT_SYSTEM_PROMPT = rvGrokCoreFor("shopper");
