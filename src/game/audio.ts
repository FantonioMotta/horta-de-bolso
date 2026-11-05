type Sfx =
  | 'plant'
  | 'water'
  | 'harvest'
  | 'coin'
  | 'unlock'
  | 'error'
  | 'expand'
  | 'sell'
  | 'fertilize'
  | 'order';

/**
 * Áudio inteiramente sintetizado (sem arquivos): vento, pássaros, grilos e
 * pequenos efeitos. O contexto só nasce depois do primeiro gesto do usuário.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private natureTimer: number | null = null;
  private musicBus: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private chordTimer: number | null = null;
  private noteTimer: number | null = null;
  private chordIndex = 0;
  private muted = false;
  private night = false;
  private started = false;

  get ready(): boolean {
    return Boolean(this.ctx);
  }

  init(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.85;
    master.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.startAmbient();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(muted ? 0 : 0.85, now, 0.12);
  }

  setNight(night: boolean): void {
    if (this.night === night) return;
    this.night = night;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.windFilter?.frequency.setTargetAtTime(night ? 260 : 430, now, 1.5);
    this.musicBus?.gain.setTargetAtTime(night ? 0.34 : 0.5, now, 2.5);
    this.musicFilter?.frequency.setTargetAtTime(night ? 780 : 1150, now, 2.5);
  }

  private startAmbient(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.started) return;
    this.started = true;

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.018 * white) / 1.018;
      data[i] = last * 1.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.night ? 260 : 430;
    filter.Q.value = 0.5;
    this.windFilter = filter;

    const gain = ctx.createGain();
    gain.gain.value = 0.1;
    this.ambient = gain;

    // Dois LFOs lentos: um sopra, outro muda a direção do vento.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.032;
    lfo.connect(lfoGain).connect(gain.gain);

    const gust = ctx.createOscillator();
    gust.frequency.value = 0.011;
    const gustGain = ctx.createGain();
    gustGain.gain.value = 0.022;
    gust.connect(gustGain).connect(gain.gain);

    const sweep = ctx.createOscillator();
    sweep.frequency.value = 0.021;
    const sweepGain = ctx.createGain();
    sweepGain.gain.value = 90;
    sweep.connect(sweepGain).connect(filter.frequency);

    source.connect(filter).connect(gain).connect(master);
    source.start();
    lfo.start();
    gust.start();
    sweep.start();

    this.startMusic(master);
    this.scheduleNature(3200);
  }

  /* ----------------------------- lo-fi ----------------------------- */

  private startMusic(master: GainNode): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const bus = ctx.createGain();
    bus.gain.value = this.night ? 0.34 : 0.5;
    bus.connect(master);

    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowpass';
    warmth.frequency.value = this.night ? 780 : 1150;
    warmth.Q.value = 0.35;
    warmth.connect(bus);

    // Eco curto e discreto, tipo fita.
    const delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.44;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.26;
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    bus.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);

    this.musicBus = bus;
    this.musicFilter = warmth;

    this.scheduleChord(900);
    this.scheduleNote(4200);
  }

  private scheduleChord(delay: number): void {
    if (this.chordTimer !== null) window.clearTimeout(this.chordTimer);
    this.chordTimer = window.setTimeout(() => {
      this.chordTimer = null;
      if (!this.ctx) return;
      if (!this.muted) this.playChord();
      this.scheduleChord(this.night ? 12_500 : 10_500);
    }, delay);
  }

  private playChord(): void {
    const ctx = this.ctx;
    const filter = this.musicFilter;
    if (!ctx || !filter) return;

    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
      [110.0, 130.81, 164.81, 196.0], // Am7
      [98.0, 123.47, 146.83, 164.81], // G6
    ];
    const chord = chords[this.chordIndex % chords.length];
    this.chordIndex += 1;

    const start = ctx.currentTime + 0.08;
    const duration = this.night ? 12 : 10;

    // baixo macio
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sine';
    bass.frequency.value = chord[0] / 2;
    bassGain.gain.setValueAtTime(0.0001, start);
    bassGain.gain.exponentialRampToValueAtTime(0.035, start + 2.2);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    bass.connect(bassGain).connect(filter);
    bass.start(start);
    bass.stop(start + duration + 0.2);

    chord.forEach((freq, index) => {
      const t = start + index * 0.22;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (index - 1.5) * 2.5;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.026 : 0.019, t + 2.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain).connect(filter);
      osc.start(t);
      osc.stop(t + duration + 0.2);
    });
  }

  private scheduleNote(delay: number): void {
    if (this.noteTimer !== null) window.clearTimeout(this.noteTimer);
    this.noteTimer = window.setTimeout(() => {
      this.noteTimer = null;
      if (!this.ctx) return;
      if (!this.muted && Math.random() < 0.72) this.pluck();
      this.scheduleNote(2600 + Math.random() * 4200);
    }, delay);
  }

  private pluck(): void {
    const ctx = this.ctx;
    const filter = this.musicFilter;
    if (!ctx || !filter) return;

    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = scale[Math.floor(Math.random() * scale.length)];
    const t = ctx.currentTime + 0.05;

    [1, 2].forEach((harmonic, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq * harmonic;
      const peak = index === 0 ? 0.02 : 0.006;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1 / harmonic);
      osc.connect(gain).connect(filter);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  private scheduleNature(delay: number): void {
    if (this.natureTimer !== null) window.clearTimeout(this.natureTimer);
    this.natureTimer = window.setTimeout(() => {
      this.natureTimer = null;
      if (!this.ctx || this.muted) {
        this.scheduleNature(4000);
        return;
      }
      if (this.night) {
        this.cricket();
        this.scheduleNature(1800 + Math.random() * 2600);
      } else {
        if (Math.random() < 0.62) this.bird();
        this.scheduleNature(5000 + Math.random() * 9000);
      }
    }, delay);
  }

  private bird(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const notes = 2 + Math.floor(Math.random() * 3);
    const base = 1750 + Math.random() * 1200;
    const start = ctx.currentTime + Math.random() * 0.4;

    for (let i = 0; i < notes; i += 1) {
      const t = start + i * (0.09 + Math.random() * 0.05);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.2), t);
      osc.frequency.exponentialRampToValueAtTime(base * 1.45, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(base * 0.95, t + 0.11);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.035, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 0.16);
    }
  }

  private cricket(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const start = ctx.currentTime;
    for (let i = 0; i < 3; i += 1) {
      const t = start + i * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 4300 + Math.random() * 300;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.018, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  private tone(
    freq: number,
    duration: number,
    options: { type?: OscillatorType; gain?: number; delay?: number; to?: number } = {}
  ): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const { type = 'sine', gain: peak = 0.12, delay = 0, to } = options;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.02, duration * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private noiseBurst(duration: number, from: number, to: number, peak: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.1;
    const t = ctx.currentTime;
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter).connect(gain).connect(master);
    source.start(t);
  }

  play(sfx: Sfx): void {
    if (!this.ctx || this.muted) return;
    switch (sfx) {
      case 'plant':
        this.tone(190, 0.18, { type: 'sine', gain: 0.16, to: 110 });
        this.noiseBurst(0.16, 900, 260, 0.08);
        break;
      case 'water':
        this.noiseBurst(0.55, 1800, 520, 0.16);
        this.tone(520, 0.3, { type: 'sine', gain: 0.03, to: 780 });
        break;
      case 'harvest':
        this.tone(520, 0.12, { type: 'triangle', gain: 0.12, to: 700 });
        this.tone(880, 0.22, { type: 'sine', gain: 0.09, delay: 0.06 });
        this.noiseBurst(0.12, 2200, 900, 0.05);
        break;
      case 'coin':
        this.tone(1046, 0.14, { type: 'sine', gain: 0.08 });
        this.tone(1568, 0.22, { type: 'sine', gain: 0.06, delay: 0.07 });
        break;
      case 'unlock':
        [523, 659, 784, 1046].forEach((note, index) => {
          this.tone(note, 0.26, { type: 'triangle', gain: 0.1, delay: index * 0.09 });
        });
        break;
      case 'expand':
        this.tone(320, 0.4, { type: 'sine', gain: 0.12, to: 520 });
        this.noiseBurst(0.45, 500, 1600, 0.08);
        break;
      case 'sell':
        this.tone(660, 0.12, { type: 'triangle', gain: 0.09, to: 820 });
        this.tone(990, 0.2, { type: 'sine', gain: 0.07, delay: 0.06 });
        this.tone(1320, 0.24, { type: 'sine', gain: 0.045, delay: 0.13 });
        break;
      case 'fertilize':
        this.tone(240, 0.28, { type: 'sine', gain: 0.1, to: 170 });
        this.noiseBurst(0.3, 780, 260, 0.07);
        break;
      case 'order':
        [784, 988, 1175].forEach((note, index) => {
          this.tone(note, 0.2, { type: 'sine', gain: 0.065, delay: index * 0.075 });
        });
        break;
      case 'error':
        this.tone(160, 0.1, { type: 'square', gain: 0.035, to: 120 });
        break;
    }
  }
}

export const audio = new AudioEngine();

// Apenas em desenvolvimento: facilita inspecionar o áudio no console.
if (import.meta.env.DEV) {
  (window as unknown as { __ortaAudio?: AudioEngine }).__ortaAudio = audio;
}
