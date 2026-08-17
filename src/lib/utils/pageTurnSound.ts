/**
 * Synthesised page-turn rustle for the Brand Story flipbook.
 *
 * Generated with the Web Audio API rather than shipped as an audio file: a
 * paper rustle is just broadband noise shaped by an amplitude envelope and
 * a sweeping band-pass, which costs a few lines of code and keeps a binary
 * asset (plus its network request) out of the repo.
 *
 * Only ever call this from a user gesture — browsers create an AudioContext
 * in the "suspended" state otherwise and the sound is silently dropped.
 * Every call is wrapped defensively: audio is a flourish, and it must never
 * be able to break page navigation.
 */

type AudioContextConstructor = new () => AudioContext;

/** Browsers cap how many AudioContexts a page may create, so reuse one. */
let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Ctor: AudioContextConstructor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext;

  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  return sharedContext;
}

export function playPageTurn(): void {
  try {
    const context = getContext();
    if (!context) return;

    // Safari in particular hands back a suspended context on first use.
    if (context.state === "suspended") void context.resume();

    const now = context.currentTime;
    const duration = 0.34;

    // White noise — the raw material of a paper rustle.
    const frameCount = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      samples[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;

    // Sweeping the band up then back down is what reads as a sheet passing
    // through the air rather than an undifferentiated hiss.
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(620, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.13);
    filter.frequency.exponentialRampToValueAtTime(780, now + duration);

    // Fast attack, long tail — paper snaps then settles.
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    source.start(now);
    source.stop(now + duration);
  } catch {
    // Autoplay policy, a missing codec, a hostile embedding context — none
    // of it should stop the page from turning.
  }
}

/** Test seam: drops the memoised context so each case starts clean. */
export function resetPageTurnAudio(): void {
  sharedContext = null;
}
