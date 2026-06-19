class AudioSynthesizer {
  private ctx: AudioContext | null = null;

  // Sound nodes
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;

  private crackleGain: GainNode | null = null;

  // Ball lightning sound generator
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private humFilter: BiquadFilterNode | null = null;

  private isRadioOn: boolean = false;
  private rainInterval: number | null = null;

  constructor() {
    // Lazy initialize to avoid blocking on load
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.setupRainSource();
      this.setupHumSource();
      this.isRadioOn = true;
    } catch (e) {
      console.error("Failed to initialize AudioContext", e);
    }
  }

  private setupRainSource() {
    if (!this.ctx) return;

    // Create rain noise buffer
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Populate with white/pink noise mixture
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      lastOut = 0.997 * lastOut + white * 0.085;
      data[i] = (lastOut + white * 0.1) * 0.4;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = buffer;
    this.rainSource.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = "lowpass";
    this.rainFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.06, this.ctx.currentTime); // Soft start

    this.rainSource.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);

    this.rainSource.start();

    // Start droplet patter generator
    this.crackleGain = this.ctx.createGain();
    this.crackleGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.crackleGain.connect(this.ctx.destination);

    this.rainInterval = window.setInterval(() => {
      this.playDroplet();
    }, 120);
  }

  private setupHumSource() {
    if (!this.ctx) return;

    // Quantum hum for ball lightning - slightly erratic buzzing tone
    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = "sawtooth";
    this.humOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low 55Hz drone

    this.humFilter = this.ctx.createBiquadFilter();
    this.humFilter.type = "bandpass";
    this.humFilter.frequency.setValueAtTime(240, this.ctx.currentTime);
    this.humFilter.Q.setValueAtTime(10, this.ctx.currentTime);

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0, this.ctx.currentTime); // Hidden by default

    this.humOsc.connect(this.humFilter);
    this.humFilter.connect(this.humGain);
    this.humGain.connect(this.ctx.destination);

    this.humOsc.start();

    // LFO frequency modifier
    this.modulateHum();
  }

  private modulateHum() {
    if (!this.ctx || !this.humOsc || !this.humFilter) return;
    const now = this.ctx.currentTime;
    
    // erratic frequency sweeps representing quantum instability
    this.humFilter.frequency.setValueAtTime(220 + Math.random() * 180, now);
    this.humFilter.frequency.exponentialRampToValueAtTime(180 + Math.random() * 250, now + 0.8);

    setTimeout(() => {
      if (this.isRadioOn) {
        this.modulateHum();
      }
    }, 800);
  }

  private playDroplet() {
    if (!this.ctx || !this.crackleGain || !this.isRadioOn) return;

    // A rain droplet hitting glass: quick pulse of bandpassed filtered noise
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200 + Math.random() * 800, this.ctx.currentTime);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2000 + Math.random() * 1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(8, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.005 + Math.random() * 0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.crackleGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  setWindowOpen(isOpen: boolean) {
    if (!this.ctx || !this.rainFilter || !this.rainGain) return;
    const now = this.ctx.currentTime;
    if (isOpen) {
      // Wind/rain is more crispy and slightly louder when window is open
      this.rainFilter.frequency.linearRampToValueAtTime(2400, now + 1.5);
      this.rainGain.gain.linearRampToValueAtTime(0.18, now + 1.5);
    } else {
      // Low pass muffle + soft volume when window is closed
      this.rainFilter.frequency.linearRampToValueAtTime(700, now + 1.5);
      this.rainGain.gain.linearRampToValueAtTime(0.05, now + 1.5);
    }
  }

  playThunder() {
    if (!this.ctx || !this.isRadioOn) return;
    const now = this.ctx.currentTime;

    // Thunder has two parts: 1) A sharp crash 2) A long low rumbling reverb
    const dur = 4.0 + Math.random() * 3.0;

    // Crash noise
    const crashOsc = this.ctx.createOscillator();
    const crashFilter = this.ctx.createBiquadFilter();
    const crashGain = this.ctx.createGain();

    crashOsc.type = "sawtooth";
    // Pitch sweeps downwards representation of electrical shockwave
    crashOsc.frequency.setValueAtTime(110, now);
    crashOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    crashFilter.type = "lowpass";
    crashFilter.frequency.setValueAtTime(280, now);

    crashGain.gain.setValueAtTime(0.12, now);
    crashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    crashOsc.connect(crashFilter);
    crashFilter.connect(crashGain);
    crashGain.connect(this.ctx.destination);

    crashOsc.start();
    crashOsc.stop(now + 0.9);

    // Rumble rumble noise
    const rumbleSource = this.ctx.createBufferSource();
    const rumbleSize = this.ctx.sampleRate * 6; // 6 seconds
    const rumbleBuffer = this.ctx.createBuffer(1, rumbleSize, this.ctx.sampleRate);
    const data = rumbleBuffer.getChannelData(0);
    for (let i = 0; i < rumbleSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    rumbleSource.buffer = rumbleBuffer;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.setValueAtTime(90, now);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.01, now); // delayed rumble onset
    rumbleGain.gain.linearRampToValueAtTime(0.28, now + 0.4); // swell up
    rumbleGain.gain.setValueAtTime(0.28, now + 1.2);
    // fluctuate rumble volume representing echoes bouncing
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.ctx.destination);

    rumbleSource.start();
    rumbleSource.stop(now + dur + 0.5);
  }

  playQuantumSparkle() {
    if (!this.ctx || !this.isRadioOn) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const crystal = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1400 + Math.random() * 400, now);
    
    crystal.type = "sine";
    crystal.frequency.setValueAtTime(400 + Math.random() * 200, now);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(5, now);

    gain.gain.setValueAtTime(0.006, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(filter);
    crystal.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    crystal.start();
    osc.stop(now + 0.2);
    crystal.stop(now + 0.2);
  }

  setBallLightningCount(count: number) {
    if (!this.ctx || !this.humGain) return;
    const now = this.ctx.currentTime;
    
    // Scale hum volume based on number of active balls
    if (count === 0) {
      this.humGain.gain.linearRampToValueAtTime(0, now + 0.6);
    } else {
      const volume = Math.min(0.04 + count * 0.02, 0.12);
      this.humGain.gain.linearRampToValueAtTime(volume, now + 0.6);
    }
  }

  toggleRadio() {
    if (!this.ctx) {
      this.init();
      return;
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isRadioOn = !this.isRadioOn;
    const now = this.ctx.currentTime;

    if (this.isRadioOn) {
      this.rainGain?.gain.linearRampToValueAtTime(0.06, now + 0.5);
      if (this.crackleGain) this.crackleGain.gain.value = 0.3;
    } else {
      this.rainGain?.gain.linearRampToValueAtTime(0, now + 0.5);
      if (this.crackleGain) this.crackleGain.gain.value = 0;
      this.humGain?.gain.linearRampToValueAtTime(0, now + 0.5);
    }
  }

  getRadioState() {
    return this.isRadioOn;
  }
}

export const audioSynth = new AudioSynthesizer();
