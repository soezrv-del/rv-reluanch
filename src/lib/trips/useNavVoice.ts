/**
 * Voice toggle + upcoming-turn speech while Turn-by-Turn is armed.
 * Mute cancels speech. Never requests the microphone.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelNavSpeech,
  speakNavPrompt,
  unlockNavSpeech,
} from "./navSpeech.ts";
import {
  considerVoiceCue,
  emptyVoiceMemory,
  formatVoicePrompt,
  loadVoicePref,
  pickBand,
  rememberSpoken,
  saveVoicePref,
  type UpcomingGuidance,
  type VoiceMemory,
} from "./voiceGuidance.ts";

export function useNavVoice(opts: {
  armed: boolean;
  routeId: string;
  guidance: UpcomingGuidance | null;
  rerouting: boolean;
}): {
  voiceOn: boolean;
  toggleVoice: () => void;
  speakStart: () => void;
  hush: () => void;
} {
  const [voiceOn, setVoiceOn] = useState(false);
  const mem = useRef<VoiceMemory>(emptyVoiceMemory());
  const rerouteSaid = useRef(false);
  const guidanceRef = useRef(opts.guidance);
  const routeIdRef = useRef(opts.routeId);
  guidanceRef.current = opts.guidance;
  routeIdRef.current = opts.routeId;

  useEffect(() => {
    setVoiceOn(loadVoicePref());
    return () => cancelNavSpeech();
  }, []);

  useEffect(() => {
    if (!opts.armed) {
      mem.current = emptyVoiceMemory();
      rerouteSaid.current = false;
      cancelNavSpeech();
    }
  }, [opts.armed]);

  useEffect(() => {
    if (!opts.armed || !voiceOn) return;
    const cue = considerVoiceCue({
      enabled: true,
      routeId: opts.routeId,
      guidance: opts.guidance,
      memory: mem.current,
    });
    mem.current = cue.memory;
    if (cue.speak) speakNavPrompt(cue.speak);
  }, [opts.armed, voiceOn, opts.routeId, opts.guidance]);

  useEffect(() => {
    if (!opts.armed || !voiceOn) {
      rerouteSaid.current = opts.rerouting;
      return;
    }
    if (opts.rerouting && !rerouteSaid.current) {
      speakNavPrompt("Off route. Recalculating.");
    }
    rerouteSaid.current = opts.rerouting;
  }, [opts.armed, voiceOn, opts.rerouting]);

  const markGuidance = useCallback(
    (guidance: UpcomingGuidance | null, line?: string) => {
      if (!guidance) return;
      const band = pickBand(guidance.remainM);
      if (!band) return;
      mem.current = rememberSpoken(routeIdRef.current, guidance.step.id, band, {
        at: Date.now(),
        line: line ?? formatVoicePrompt(guidance.step.instruction, guidance.remainM),
      });
    },
    [],
  );

  const toggleVoice = useCallback(() => {
    const next = !voiceOn;
    setVoiceOn(next);
    saveVoicePref(next);
    if (!next) {
      cancelNavSpeech();
      return;
    }
    unlockNavSpeech();
    const g = guidanceRef.current;
    const line = g
      ? formatVoicePrompt(g.step.instruction, g.remainM)
      : "Voice guidance on";
    speakNavPrompt(line);
    markGuidance(g, line);
  }, [voiceOn, markGuidance]);

  const speakStart = useCallback(() => {
    if (!voiceOn) return;
    unlockNavSpeech();
    const g = guidanceRef.current;
    const line = g
      ? `Navigation started. ${formatVoicePrompt(g.step.instruction, g.remainM)}`
      : "Navigation started.";
    speakNavPrompt(line);
    markGuidance(g, line);
  }, [voiceOn, markGuidance]);

  const hush = useCallback(() => {
    cancelNavSpeech();
  }, []);

  return { voiceOn, toggleVoice, speakStart, hush };
}
