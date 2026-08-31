/**
 * Web Audio API synthesizer for driver alerts and notifications.
 * Self-contained without external audio asset dependencies.
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

/**
 * Plays an attention-grabbing dual-tone chime for incoming orders.
 */
export function playOrderAlertSound(repeat = true) {
  stopOrderAlertSound();

  const playChime = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Tone 1 (High note)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5 note
      osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6 note

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.3);

      // Tone 2 (Harmonic follow-up)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.51, now + 0.18); // E6 note
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.35); // A6 note

      gain2.gain.setValueAtTime(0.35, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.18);
      osc2.stop(now + 0.5);

      // Trigger mobile vibration if supported
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (err) {
      console.warn("Web Audio alert sound prevented or unsupported:", err);
    }
  };

  playChime();

  if (repeat) {
    activeIntervalId = setInterval(playChime, 1800);
  }
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
 * Plays an upbeat success chime (e.g. order accepted or completed).
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }
  } catch (err) {
    console.warn("Web Audio success chime prevented:", err);
  }
}
