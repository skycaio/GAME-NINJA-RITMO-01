// js/audio.js - Motor de Efeitos Sonoros e Trilha Sonora Rítmica Procedural com Web Audio API

// Escalas Tradicionais Japonesas e Frequências das Notas Musicais (em Hz)
const NOTE_FREQS = {
  // Oitava 2 (Baixo profundo)
  'C2': 65.41, 'Cs2': 69.30, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'Fs2': 92.50, 'G2': 98.00, 'Ab2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  // Oitava 3 (Baixo / Shamisen médio)
  'C3': 130.81, 'Cs3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'Fs3': 185.00, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  // Oitava 4 (Koto / Flauta / Melodia principal)
  'C4': 261.63, 'Cs4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'Fs4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  // Oitava 5 (Agudos de Koto e flauta)
  'C5': 523.25, 'Cs5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'Fs5': 739.99, 'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
  // Oitava 6 (Harmônicos brilhantes)
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98, 'A6': 1760.00
};

// Padrões Musicais Procedurais para as 10 Fases (Linhas de Melodia, Harmonia/Koto e Baixo)
const PHASE_MUSIC_PATTERNS = {
  // Fase 1: Caminho do Bambuzal (80 BPM) - Hirajoshi (A)
  fase1: {
    scale: 'Hirajoshi',
    root: 'A2',
    bpm: 80,
    bassLine: ['A2', null, 'E2', null, 'F2', null, 'E2', 'A2', 'A2', null, 'C3', null, 'B2', null, 'E2', null],
    kotoChords: [
      ['A3', 'E4', 'A4'], null, ['C4', 'E4', 'A4'], null,
      ['F3', 'C4', 'F4'], null, ['E3', 'B3', 'E4'], null
    ],
    melody: [
      'A4', 'B4', 'C5', 'E5', 'F5', 'E5', 'C5', 'B4',
      'A4', 'E4', 'A4', 'B4', 'C5', 'B4', 'A4', null,
      'E5', 'F5', 'E5', 'C5', 'B4', 'C5', 'B4', 'A4',
      'F4', 'E4', 'F4', 'A4', 'B4', 'C5', 'A4', null
    ]
  },
  // Fase 2: Pátio dos Cerejais (92 BPM) - Akebono (D)
  fase2: {
    scale: 'Akebono',
    root: 'D2',
    bpm: 92,
    bassLine: ['D2', null, 'A2', null, 'Bb2', null, 'A2', 'D2', 'D2', 'D2', 'F2', null, 'E2', null, 'A2', null],
    kotoChords: [
      ['D3', 'A3', 'D4'], null, ['F3', 'A3', 'D4'], null,
      ['Bb3', 'D4', 'F4'], null, ['A3', 'E4', 'A4'], null
    ],
    melody: [
      'D4', 'E4', 'F4', 'A4', 'Bb4', 'A4', 'F4', 'E4',
      'D4', 'A4', 'D5', 'E5', 'F5', 'E5', 'D5', null,
      'A4', 'Bb4', 'A4', 'F4', 'E4', 'F4', 'E4', 'D4',
      'Bb3', 'D4', 'E4', 'F4', 'A4', 'F4', 'D4', null
    ]
  },
  // Fase 3: Ponte das Névoas (105 BPM) - Insen (E)
  fase3: {
    scale: 'Insen',
    root: 'E2',
    bpm: 105,
    bassLine: ['E2', 'E2', 'B2', null, 'C3', null, 'B2', 'E2', 'E2', null, 'G2', null, 'A2', null, 'B2', null],
    kotoChords: [
      ['E3', 'B3', 'E4'], null, ['G3', 'B3', 'E4'], null,
      ['A3', 'E4', 'A4'], null, ['B3', 'Fs4', 'B4'], null
    ],
    melody: [
      'E4', 'F4', 'A4', 'B4', 'D5', 'B4', 'A4', 'F4',
      'E4', 'B4', 'E5', 'D5', 'B4', 'A4', 'B4', null,
      'E5', 'D5', 'B4', 'A4', 'F4', 'A4', 'F4', 'E4',
      'B3', 'D4', 'E4', 'F4', 'A4', 'B4', 'E4', null
    ]
  },
  // Fase 4: Portão Torii Rubro (116 BPM) - Miyako-Bushi (C)
  fase4: {
    scale: 'Miyako-Bushi',
    root: 'C2',
    bpm: 116,
    bassLine: ['C2', 'C2', 'G2', null, 'Ab2', null, 'G2', 'C2', 'C2', 'Eb2', 'F2', null, 'G2', null, 'Ab2', 'G2'],
    kotoChords: [
      ['C3', 'G3', 'C4'], null, ['Eb3', 'G3', 'C4'], null,
      ['Ab3', 'C4', 'Eb4'], null, ['G3', 'D4', 'G4'], null
    ],
    melody: [
      'C4', 'Db4', 'F4', 'G4', 'Ab4', 'G4', 'F4', 'Db4',
      'C4', 'G4', 'C5', 'Db5', 'C5', 'Ab4', 'G4', null,
      'F4', 'G4', 'Ab4', 'C5', 'Db5', 'C5', 'Ab4', 'G4',
      'Db4', 'F4', 'G4', 'Ab4', 'G4', 'F4', 'C4', null
    ]
  },
  // Fase 5: Templo da Meia-Noite (126 BPM) - Hon-Kumoi (D)
  fase5: {
    scale: 'Hon-Kumoi',
    root: 'D2',
    bpm: 126,
    bassLine: ['D2', 'D2', 'A2', 'D2', 'Eb2', null, 'A2', 'D2', 'G2', 'G2', 'D2', null, 'Eb2', null, 'A2', 'D2'],
    kotoChords: [
      ['D3', 'A3', 'D4'], ['D3', 'A3', 'D4'], ['Eb3', 'Bb3', 'Eb4'], null,
      ['G3', 'D4', 'G4'], null, ['A3', 'E4', 'A4'], null
    ],
    melody: [
      'D4', 'Eb4', 'G4', 'A4', 'Bb4', 'A4', 'G4', 'Eb4',
      'D4', 'A4', 'D5', 'Eb5', 'D5', 'Bb4', 'A4', 'G4',
      'A4', 'Bb4', 'D5', 'Eb5', 'D5', 'Bb4', 'A4', 'G4',
      'Eb4', 'G4', 'A4', 'Bb4', 'A4', 'G4', 'D4', null
    ]
  },
  // Fase 6: Dança das Lâminas (136 BPM) - Ritsu Dourado (G)
  fase6: {
    scale: 'Ritsu',
    root: 'G2',
    bpm: 136,
    bassLine: ['G2', 'G2', 'D3', 'G2', 'C3', 'C3', 'D3', 'G2', 'G2', 'B2', 'C3', 'D3', 'E3', 'D3', 'B2', 'G2'],
    kotoChords: [
      ['G3', 'D4', 'G4'], ['G3', 'D4', 'G4'], ['C4', 'E4', 'G4'], null,
      ['D4', 'A4', 'D5'], null, ['G3', 'D4', 'G4'], null
    ],
    melody: [
      'G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4',
      'G4', 'D5', 'G5', 'E5', 'D5', 'C5', 'D5', null,
      'E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'E5', 'G5',
      'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'G4', null
    ]
  },
  // Fase 7: Fortaleza do Vendaval (146 BPM) - Iwato (B)
  fase7: {
    scale: 'Iwato',
    root: 'B2',
    bpm: 146,
    bassLine: ['B2', 'B2', 'Fs2', 'B2', 'C3', 'C3', 'Fs2', 'B2', 'E2', 'E2', 'F2', 'F2', 'Fs2', null, 'B2', 'B2'],
    kotoChords: [
      ['B3', 'Fs4', 'B4'], ['B3', 'Fs4', 'B4'], ['C4', 'E4', 'G4'], null,
      ['E3', 'B3', 'E4'], null, ['Fs3', 'Cs4', 'Fs4'], null
    ],
    melody: [
      'B4', 'C5', 'E5', 'F5', 'A5', 'F5', 'E5', 'C5',
      'B4', 'Fs4', 'B5', 'A5', 'F5', 'E5', 'F5', null,
      'A5', 'F5', 'E5', 'C5', 'E5', 'F5', 'A5', 'B5',
      'F5', 'E5', 'C5', 'B4', 'C5', 'E5', 'B4', null
    ]
  },
  // Fase 8: Cume do Vulcão Sangrento (158 BPM) - Minyo Ardente (E)
  fase8: {
    scale: 'Minyo',
    root: 'E2',
    bpm: 158,
    bassLine: ['E2', 'E2', 'B2', 'E2', 'G2', 'G2', 'A2', 'B2', 'E2', 'E2', 'D2', 'D2', 'B2', 'B2', 'E2', 'E2'],
    kotoChords: [
      ['E3', 'B3', 'E4'], ['E3', 'B3', 'E4'], ['G3', 'D4', 'G4'], null,
      ['A3', 'E4', 'A4'], null, ['B3', 'Fs4', 'B4'], null
    ],
    melody: [
      'E4', 'G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4',
      'E5', 'D5', 'B4', 'A4', 'B4', 'D5', 'E5', null,
      'D5', 'B4', 'A4', 'G4', 'A4', 'B4', 'D5', 'E5',
      'G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'E4', null
    ]
  },
  // Fase 9: Salão das Sombras do Shogun (170 BPM) - Kokin Sombrio (D)
  fase9: {
    scale: 'Kokin-Joshi',
    root: 'D2',
    bpm: 170,
    bassLine: ['D2', 'D2', 'A2', 'D2', 'Eb2', 'Eb2', 'A2', 'D2', 'G2', 'G2', 'A2', 'A2', 'Bb2', 'A2', 'Eb2', 'D2'],
    kotoChords: [
      ['D3', 'A3', 'D4'], ['D3', 'A3', 'D4'], ['Eb3', 'Bb3', 'Eb4'], null,
      ['G3', 'D4', 'G4'], null, ['A3', 'E4', 'A4'], null
    ],
    melody: [
      'D4', 'Eb4', 'G4', 'A4', 'C5', 'A4', 'G4', 'Eb4',
      'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'D5', null,
      'Eb5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'D5',
      'C5', 'A4', 'G4', 'Eb4', 'G4', 'A4', 'D4', null
    ]
  },
  // Fase 10: O Despertar do Lorde Oni (185 BPM) - Oni Sangrento (C)
  fase10: {
    scale: 'Oni',
    root: 'C2',
    bpm: 185,
    bassLine: ['C2', 'C2', 'G2', 'C2', 'Cs2', 'Cs2', 'G2', 'C2', 'Fs2', 'Fs2', 'G2', 'G2', 'Ab2', 'G2', 'Cs2', 'C2'],
    kotoChords: [
      ['C3', 'G3', 'C4'], ['C3', 'G3', 'C4'], ['Cs3', 'Gs3', 'Cs4'], null,
      ['Fs3', 'Cs4', 'Fs4'], null, ['G3', 'D4', 'G4'], null
    ],
    melody: [
      'C4', 'Cs4', 'E4', 'Fs4', 'G4', 'Fs4', 'E4', 'Cs4',
      'C5', 'Cs5', 'C5', 'Ab4', 'G4', 'Fs4', 'G4', null,
      'E5', 'Fs5', 'G5', 'Ab5', 'G5', 'Fs5', 'E5', 'Cs5',
      'Cs4', 'E4', 'Fs4', 'G4', 'Fs4', 'E4', 'C4', null
    ]
  }
};

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.initialized = false;

    // Estado da Música Procedural
    this.currentPhaseKey = null;
    this.isMusicPlaying = false;
    this.musicBpm = 100;
    this.stepIndex = 0;
    this.lastStepScheduledTime = 0;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Bus (BGM)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API não suportada ou bloqueada:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // ================= MÚSICA PROCEDURAL SINCRONIZADA =================

  startPhaseMusic(phaseKey) {
    this.ensureContext();
    this.currentPhaseKey = phaseKey;
    const pattern = PHASE_MUSIC_PATTERNS[phaseKey] || PHASE_MUSIC_PATTERNS.fase1;
    this.musicBpm = pattern.bpm || 100;
    this.stepIndex = 0;
    this.isMusicPlaying = true;
  }

  stopMusic() {
    this.isMusicPlaying = false;
    this.currentPhaseKey = null;
  }

  pauseMusic() {
    this.isMusicPlaying = false;
  }

  resumeMusic() {
    if (this.currentPhaseKey) {
      this.isMusicPlaying = true;
    }
  }

  // Atualizador do Sequenciador de Música chamado a cada frame do Game Loop
  updateMusicClock(currentTime) {
    if (!this.isMusicPlaying || !this.currentPhaseKey || !this.ctx || this.isMuted) return;

    const pattern = PHASE_MUSIC_PATTERNS[this.currentPhaseKey] || PHASE_MUSIC_PATTERNS.fase1;
    const beatInterval = 60 / pattern.bpm; // Duração de 1 batida (semínima)
    const stepInterval = beatInterval / 2; // Semicolcheia (1/2 batida = passo do sequenciador)

    // Calcula o passo musical atual com base no tempo de jogo
    const currentStep = Math.floor(currentTime / stepInterval);

    while (this.stepIndex <= currentStep) {
      const stepTime = this.stepIndex * stepInterval;
      if (stepTime >= 0) {
        this.triggerMusicalStep(pattern, this.stepIndex);
      }
      this.stepIndex++;
    }
  }

  // Executa as notas programadas para um passo do compasso
  triggerMusicalStep(pattern, step) {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const beatIndex = Math.floor(step / 2);
    const isBeatStart = step % 2 === 0;

    // 1. Toca o Baixo no tempo (a cada batida)
    if (isBeatStart && pattern.bassLine) {
      const bassNote = pattern.bassLine[beatIndex % pattern.bassLine.length];
      if (bassNote && NOTE_FREQS[bassNote]) {
        this.playBassPluck(NOTE_FREQS[bassNote], t, 0.28);
      }
    }

    // 2. Toca os Acordes de Koto / Harpa Japonesa a cada 2 tempos
    if (isBeatStart && (beatIndex % 2 === 0) && pattern.kotoChords) {
      const chordIdx = (beatIndex / 2) % pattern.kotoChords.length;
      const chord = pattern.kotoChords[chordIdx];
      if (chord && Array.isArray(chord)) {
        chord.forEach((noteName, idx) => {
          if (NOTE_FREQS[noteName]) {
            // Pequeno dedilhado arpejado característico de Koto (strum)
            this.playKotoPluck(NOTE_FREQS[noteName], t + idx * 0.025, 0.22);
          }
        });
      }
    }

    // 3. Toca a Melodia Tradicional de Flauta/Shamisen
    if (pattern.melody) {
      const melNote = pattern.melody[step % pattern.melody.length];
      if (melNote && NOTE_FREQS[melNote]) {
        this.playMelodyNote(NOTE_FREQS[melNote], t, 0.26);
      }
    }

    // 4. Percussão Taiko Leve de Fundo (mantém o pulso musical constante)
    if (isBeatStart) {
      const isStrongBeat = (beatIndex % 4 === 0);
      this.playBackgroundTaikoPulse(isStrongBeat ? 1.0 : 0.6, t);
    }
  }

  // Timbre de Koto Japonês (dedilhado com brilho e decaimento natural de cordas)
  playKotoPluck(freq, startTime, duration = 0.3) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const oscHarm = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    oscHarm.type = 'sine';
    oscHarm.frequency.setValueAtTime(freq * 2.01, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + duration);

    gain.gain.setValueAtTime(0.18, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    oscHarm.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    oscHarm.start(startTime);
    osc.stop(startTime + duration);
    oscHarm.stop(startTime + duration);
  }

  // Timbre de Melodia (Flauta Shakuhachi & Shamisen lírico)
  playMelodyNote(freq, startTime, duration = 0.25) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    // Vibrato oriental sutil
    osc.frequency.linearRampToValueAtTime(freq * 1.012, startTime + duration * 0.6);
    osc.frequency.linearRampToValueAtTime(freq, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.24, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Timbre de Baixo Profundo Shinobi (Bassline oriental)
  playBassPluck(freq, startTime, duration = 0.35) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, startTime);
    filter.frequency.exponentialRampToValueAtTime(80, startTime + duration);

    gain.gain.setValueAtTime(0.25, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Pulso de Taiko de Fundo da Música
  playBackgroundTaikoPulse(intensity = 1.0, startTime) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95 * intensity, startTime);
    osc.frequency.exponentialRampToValueAtTime(32, startTime + 0.12);

    gain.gain.setValueAtTime(0.18 * intensity, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + 0.14);
  }

  // ================= EFEITOS SONOROS DE COMBATE (SFX) =================

  // Batida rítmica (Taiko drum) que soa a cada pulso das notas do jogador
  playBeatSound(intensity = 1.0, lane = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Variação de pitch por lane: Lane 0 (agudo), Lane 1 (médio), Lane 2 (grave)
    const lanePitchMult = lane === 0 ? 1.25 : (lane === 2 ? 0.85 : 1.0);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 * intensity * lanePitchMult, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.16);

    gain.gain.setValueAtTime(0.35 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);

    // Ruído percussivo leve (impacto suave na pele do tambor)
    const noiseBuffer = this.createNoiseBuffer(0.04);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 * lanePitchMult, t);
    filter.Q.setValueAtTime(1.5, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2 * intensity, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noiseSource.start(t);
  }

  // Som de corte de espada rápido (whoosh)
  playSlashSound(lane = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.15;
    const buffer = this.createNoiseBuffer(dur);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const baseFreq = lane === 0 ? 2800 : (lane === 2 ? 1600 : 2200);
    filter.frequency.setValueAtTime(baseFreq, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + dur);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // Som de impacto certeiro de Katana (corte suave / choque de aço com volume equilibrado)
  playHitSound(isPerfect = false, lane = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const laneFreqMult = lane === 0 ? 1.2 : (lane === 2 ? 0.85 : 1.0);

    // Resplendor metálico de lâmina afiada
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = (isPerfect ? 1760 : 1320) * laneFreqMult;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, t + 0.22);

    // Volume reduzido para soar agradável e não sobrepor a música
    gain.gain.setValueAtTime(isPerfect ? 0.24 : 0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);

    // Segundo tom harmônico suave
    const harmonicOsc = this.ctx.createOscillator();
    const harmonicGain = this.ctx.createGain();
    harmonicOsc.type = 'triangle';
    harmonicOsc.frequency.setValueAtTime(baseFreq * 1.5, t);
    harmonicOsc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.15);

    harmonicGain.gain.setValueAtTime(0.09, t);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    harmonicOsc.connect(harmonicGain);
    harmonicGain.connect(this.sfxGain);

    harmonicOsc.start(t);
    harmonicOsc.stop(t + 0.15);

    // Impacto de corte suave
    this.playBeatSound(isPerfect ? 0.35 : 0.22, lane);
  }

  // Som de erro / golpe que atinge o jogador
  playMissSound() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Som de vitória triunfal
  playVictorySound() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [440, 554, 659, 880, 1108]; // Acorde triunfal oriental
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.7);
      }, idx * 110);
    });
  }

  // Som cont\u00ednuo suave durante sustenta\u00e7\u00e3o de hold note
  playHoldTickSound(lane = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [660, 550, 440]; // Frequências por trilha (0=agudo, 1=médio, 2=grave)
    const freq = freqs[lane] || 550;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.04, t); // Volume muito suave
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Gera buffer de ruído branco para efeitos percussivos e cortes
  createNoiseBuffer(duration) {
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

// Instância global
const soundEngine = new SoundEngine();

