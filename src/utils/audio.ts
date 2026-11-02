// Simple Web Audio API sound effects and Voice Pronunciation

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playRevealSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore audio errors on autoplay restrictions
  }
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.1, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Ignore audio errors
  }
}

// Pronounce district name in voice using SpeechSynthesis
export function speakDistrictName(name: string, bnName?: string, lang: "en" | "bn" = "en") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel();

    // In Bengali mode, if bnName exists, pronounce the Bengali name
    const textToSpeak = lang === "bn" && bnName ? bnName : name;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const voices = window.speechSynthesis.getVoices();
    if (lang === "bn") {
      const bnVoice = voices.find(
        (v) => v.lang.startsWith("bn") || v.lang === "bn-BD" || v.lang === "bn-IN"
      );
      if (bnVoice) {
        utterance.voice = bnVoice;
        utterance.lang = bnVoice.lang;
      } else {
        utterance.lang = "bn-BD";
      }
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) {
        utterance.voice = enVoice;
        utterance.lang = enVoice.lang;
      } else {
        utterance.lang = "en-US";
      }
    }

    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis error fallback
  }
}
