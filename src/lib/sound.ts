/**
 * Web Audio API synthesizer for driver alerts and notifications.
 * Includes authentic Surakarta Gamelan instrument sound synthesis
 * (Bonang Barung, Kenong, Slendro/Pelog scales) without external audio asset dependencies.
 */

let activeAudioContext: AudioContext | null = null;
let activeIntervalId: NodeJS.Timeout | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!activeAudioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      activeAudioContext = new AudioCtx();
    }
  }
  if (activeAudioContext && activeAudioContext.state === "suspended") {
    activeAudioContext.resume().catch(() => {});
  }
  return activeAudioContext;
}

// Surakarta Gamelan Tuning Frequencies (Slendro & Pelog)
export const GAMELAN_SCALES = {
  // Slendro Scale (Equidistant 5 tones)
  slendro: {
    panunggal: 560, // 1 (Ji)
    gulu: 630,      // 2 (Ro)
    dada: 720,      // 3 (Lu)
    lima: 840,      // 5 (Ma)
    nem: 960,       // 6 (Nem)
    barang: 1120    // 1 tinggi (Ji Tinggi)
  },
  // Pelog Scale (7 tones with distinct harmonic intervals)
  pelog: {
    panunggal: 520,
    gulu: 580,
    dada: 670,
    pelog: 760,
    lima: 820,
    nem: 910,
    barang: 1040
  }
};

/**
 * Synthesizes a metallic bronze Bonang Barung bell note with decaying harmonics.
 */
export function playGamelanBonang(frequency: number, startTime: number, ctx: AudioContext, gainAmount = 0.3) {
  // Fundamental metallic tone (Sine + Overtones)
  const oscFundamental = ctx.createOscillator();
  const oscHarmonic1 = ctx.createOscillator();
  const oscHarmonic2 = ctx.createOscillator();

  const gainNode = ctx.createGain();

  oscFundamental.type = "sine";
  oscFundamental.frequency.setValueAtTime(frequency, startTime);

  // Inharmonic bell-like partials typical of bronze gamelan kettle
  oscHarmonic1.type = "sine";
  oscHarmonic1.frequency.setValueAtTime(frequency * 2.02, startTime);

  oscHarmonic2.type = "triangle";
  oscHarmonic2.frequency.setValueAtTime(frequency * 3.48, startTime);

  // Metallic attack and exponential ring decay
  gainNode.gain.setValueAtTime(0.001, startTime);
  gainNode.gain.linearRampToValueAtTime(gainAmount, startTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(gainAmount * 0.4, startTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

  oscFundamental.connect(gainNode);
  oscHarmonic1.connect(gainNode);
  oscHarmonic2.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscFundamental.start(startTime);
  oscHarmonic1.start(startTime);
  oscHarmonic2.start(startTime);

  oscFundamental.stop(startTime + 0.9);
  oscHarmonic1.stop(startTime + 0.9);
  oscHarmonic2.stop(startTime + 0.9);
}

/**
 * Plays an authentic Solo Gamelan Slendro alert sequence for incoming orders.
 * Pattern: Dada (3) -> Lima (5) -> Nem (6) -> Barang (1 Tinggi)
 */
export function playGamelanAlertSound(repeat = true) {
  stopOrderAlertSound();

  const playChime = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        GAMELAN_SCALES.slendro.dada,
        GAMELAN_SCALES.slendro.lima,
        GAMELAN_SCALES.slendro.nem,
        GAMELAN_SCALES.slendro.barang
      ];

      notes.forEach((freq, idx) => {
        playGamelanBonang(freq, now + idx * 0.14, ctx, 0.28);
      });

      // Mobile vibration pattern
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([150, 80, 150, 80, 250]);
      }
    } catch (err) {
      console.warn("Gamelan Web Audio synthesis prevented:", err);
    }
  };

  playChime();

  if (repeat) {
    activeIntervalId = setInterval(playChime, 2200);
  }
}

/**
 * Plays an attention-grabbing dual-tone chime for incoming orders (Standard Synthesizer).
 */
export function playOrderAlertSound(repeat = true) {
  // Delegate to Gamelan alert by default for Surakarta cultural touch
  playGamelanAlertSound(repeat);
}

/**
 * Stops any actively repeating order alert sound.
 */
export function stopOrderAlertSound() {
  if (activeIntervalId) {
    clearInterval(activeIntervalId);
    activeIntervalId = null;
  }
}

/**
 * Plays a resonant Kenong gong tone for order completion / milestone.
 */
export function playGamelanKenongChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Kenong tone (deep resonant brass bell)
    const fundamentalFreq = 360; // G4 / Kenong tone

    const osc = ctx.createOscillator();
    const oscPartial = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(fundamentalFreq, now);

    oscPartial.type = "triangle";
    oscPartial.frequency.setValueAtTime(fundamentalFreq * 2.01, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc.connect(gainNode);
    oscPartial.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    oscPartial.start(now);
    osc.stop(now + 1.6);
    oscPartial.stop(now + 1.6);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 300]);
    }
  } catch (err) {
    console.warn("Kenong sound prevented:", err);
  }
}

/**
 * Plays an upbeat success chime (e.g. order accepted or completed).
 */
export function playSuccessChime() {
  try {
    playGamelanKenongChime();
  } catch (err) {
    console.warn("Web Audio success chime prevented:", err);
  }
}

