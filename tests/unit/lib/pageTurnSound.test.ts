import { playPageTurn, resetPageTurnAudio } from "@/lib/utils/pageTurnSound";

interface AudioMocks {
  context: Record<string, unknown>;
  source: { connect: jest.Mock; start: jest.Mock; stop: jest.Mock; buffer: unknown };
  filter: {
    type: string;
    connect: jest.Mock;
    frequency: Record<string, jest.Mock>;
    Q: { value: number };
  };
  gain: { connect: jest.Mock; gain: Record<string, jest.Mock> };
  constructor: jest.Mock;
}

function installAudioContext(contextOverrides: Record<string, unknown> = {}): AudioMocks {
  const source = { buffer: null as unknown, connect: jest.fn(), start: jest.fn(), stop: jest.fn() };
  const filter = {
    type: "",
    Q: { value: 0 },
    frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
    connect: jest.fn(),
  };
  const gain = {
    gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
    connect: jest.fn(),
  };

  const context = {
    state: "running",
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    resume: jest.fn(),
    createBuffer: jest.fn(() => ({ getChannelData: () => new Float32Array(20000) })),
    createBufferSource: jest.fn(() => source),
    createBiquadFilter: jest.fn(() => filter),
    createGain: jest.fn(() => gain),
    ...contextOverrides,
  };

  const constructor = jest.fn(() => context);
  (window as unknown as { AudioContext: unknown }).AudioContext = constructor;

  return { context, source, filter, gain, constructor };
}

afterEach(() => {
  resetPageTurnAudio();
  delete (window as unknown as { AudioContext?: unknown }).AudioContext;
  delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
  jest.clearAllMocks();
});

describe("playPageTurn", () => {
  it("is a no-op when the browser exposes no AudioContext", () => {
    expect(() => playPageTurn()).not.toThrow();
  });

  it("builds and starts a noise burst through a band-pass and a gain envelope", () => {
    const { context, source, filter, gain } = installAudioContext();

    playPageTurn();

    expect(context.createBufferSource).toHaveBeenCalled();
    expect(filter.type).toBe("bandpass");
    // Swept up then back down — that sweep is what reads as paper.
    expect(filter.frequency.exponentialRampToValueAtTime).toHaveBeenCalledTimes(2);
    expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenCalledTimes(2);
    expect(source.connect).toHaveBeenCalledWith(filter);
    expect(filter.connect).toHaveBeenCalledWith(gain);
    expect(gain.connect).toHaveBeenCalledWith(context.destination);
    expect(source.start).toHaveBeenCalled();
    expect(source.stop).toHaveBeenCalled();
  });

  it("fills the buffer with noise rather than leaving it silent", () => {
    const channel = new Float32Array(20000);
    installAudioContext({
      createBuffer: jest.fn(() => ({ getChannelData: () => channel })),
    });

    playPageTurn();

    expect(channel.some((sample) => sample !== 0)).toBe(true);
  });

  it("resumes a context the browser handed back suspended", () => {
    const { context } = installAudioContext({ state: "suspended" });

    playPageTurn();

    expect(context.resume).toHaveBeenCalled();
  });

  it("reuses one AudioContext across calls (browsers cap how many exist)", () => {
    const { constructor } = installAudioContext();

    playPageTurn();
    playPageTurn();
    playPageTurn();

    expect(constructor).toHaveBeenCalledTimes(1);
  });

  it("falls back to the webkit-prefixed constructor", () => {
    const constructor = jest.fn(() => ({
      state: "running",
      currentTime: 0,
      sampleRate: 44100,
      destination: {},
      resume: jest.fn(),
      createBuffer: jest.fn(() => ({ getChannelData: () => new Float32Array(20000) })),
      createBufferSource: jest.fn(() => ({ connect: jest.fn(), start: jest.fn(), stop: jest.fn() })),
      createBiquadFilter: jest.fn(() => ({
        Q: { value: 0 },
        frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
        connect: jest.fn(),
      })),
      createGain: jest.fn(() => ({
        gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
        connect: jest.fn(),
      })),
    }));
    (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext = constructor;

    playPageTurn();

    expect(constructor).toHaveBeenCalledTimes(1);
  });

  it("swallows audio failures so a blocked context never breaks navigation", () => {
    installAudioContext({
      createBufferSource: jest.fn(() => {
        throw new Error("not allowed to start AudioContext");
      }),
    });

    expect(() => playPageTurn()).not.toThrow();
  });
});
