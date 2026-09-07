/**
 * Spoken turn prompts for Trips navigation.
 *
 * Web Speech Synthesis only — playback, not recording.
 * Capacitor WKWebView already exposes window.speechSynthesis; a native
 * TTS plugin would need a TestFlight rebuild and is not required.
 * iOS / Android do not show a speech-synthesis permission dialog.
 * Unlock by speaking from a user gesture (speaker tap or Start).
 */

export function isNavSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function cancelNavSpeech(): void {
  if (!isNavSpeechAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* */
  }
}

/** Prime voices from a tap. Returns false when TTS is missing. */
export function unlockNavSpeech(): boolean {
  if (!isNavSpeechAvailable()) return false;
  try {
    window.speechSynthesis.getVoices();
    return true;
  } catch {
    return false;
  }
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => /^en-US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null
    );
  } catch {
    return null;
  }
}

/** Speak a turn prompt. No-op when TTS is missing. */
export function speakNavPrompt(text: string): boolean {
  const line = text.replace(/\s+/g, " ").trim();
  if (!line || !isNavSpeechAvailable()) return false;
  try {
    const syn = window.speechSynthesis;
    syn.cancel();
    const u = new SpeechSynthesisUtterance(line);
    u.rate = 1;
    u.lang = "en-US";
    u.volume = 1;
    const voice = pickEnglishVoice();
    if (voice) u.voice = voice;
    syn.speak(u);
    return true;
  } catch {
    return false;
  }
}
