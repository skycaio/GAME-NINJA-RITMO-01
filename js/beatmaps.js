// js/beatmaps.js - 10 Fases Completas com 3 Barras/Trilhas de Ritmo, Temas Únicos e Padrões Sincronizados

const BEATMAPS = {
  // ================= FASE 1 =================
  fase1: {
    id: 'fase1',
    phaseNumber: 1,
    name: 'Caminho do Bambuzal',
    subtitle: 'Fase 1 • Aprendiz • 80 BPM',
    difficultyLabel: 'Iniciante',
    bpm: 80,
    travelTime: 1.75,
    color: '#2ed573',
    accentGlow: 'rgba(46, 213, 115, 0.4)',
    enemyName: 'Ronin Aprendiz',
    description: 'A floresta de bambu sussurra com o vento. Treine os fundamentos da lâmina nas 3 trilhas sagradas.',
    theme: {
      skyTop: '#05140b',
      skyMid: '#0d2919',
      skyBottom: '#07170e',
      moonColor: '#7bed9f',
      moonGlow: 'rgba(46, 213, 115, 0.4)',
      moonDisc: ['#f0fff4', '#7bed9f', '#2ed573'],
      petalType: 'leaf',
      mountainColor: '#0a1d12'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm; // 0.75s
      const beats = [];
      const totalMeasures = 16;
      let currentTime = 2.0;

      // Sequências suaves alternando entre as 3 barras (0: Alto, 1: Médio, 2: Baixo)
      for (let m = 0; m < totalMeasures; m++) {
        if (m % 4 === 0) {
          // Introdução: hold no meio, depois normal no topo
          beats.push({ time: currentTime, type: 'hold', lane: 1, duration: beatInterval * 1.5 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'normal', lane: 0 });
        } else if (m % 4 === 1) {
          // Cima, Meio, Baixo
          beats.push({ time: currentTime, type: 'normal', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 1, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 2, type: 'normal', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 1 });
        } else if (m % 4 === 2) {
          // Hold no baixo, normal no topo
          beats.push({ time: currentTime, type: 'hold', lane: 2, duration: beatInterval * 1.5 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'normal', lane: 0 });
        } else {
          // 4 batidas constantes
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: 'normal', lane: b % 3 });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 2 =================
  fase2: {
    id: 'fase2',
    phaseNumber: 2,
    name: 'Pátio dos Cerejais',
    subtitle: 'Fase 2 • Fácil • 92 BPM',
    difficultyLabel: 'Fácil',
    bpm: 92,
    travelTime: 1.55,
    color: '#ff758c',
    accentGlow: 'rgba(255, 117, 140, 0.4)',
    enemyName: 'Bandido da Vila',
    description: 'Pétalas rosadas dançam na brisa noturna enquanto invasores atacam em diferentes alturas.',
    theme: {
      skyTop: '#16091b',
      skyMid: '#2d122e',
      skyBottom: '#14081c',
      moonColor: '#ff9ff3',
      moonGlow: 'rgba(255, 117, 140, 0.45)',
      moonDisc: ['#fff0f5', '#ff9a9e', '#e84393'],
      petalType: 'sakura',
      mountainColor: '#1e0d24'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 18;
      let currentTime = 2.0;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 3 === 1) {
          beats.push({ time: currentTime, type: 'hold', lane: 0, duration: beatInterval * 1.5 });
          beats.push({ time: currentTime + beatInterval * 2, type: 'normal', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 1 });
        } else if (m % 3 === 2) {
          beats.push({ time: currentTime, type: 'normal', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 1.5, type: 'fast', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 1 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: 'normal', lane: [1, 0, 1, 2][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 3 =================
  fase3: {
    id: 'fase3',
    phaseNumber: 3,
    name: 'Ponte das Névoas',
    subtitle: 'Fase 3 • Cadenciado • 105 BPM',
    difficultyLabel: 'Cadenciado',
    bpm: 105,
    travelTime: 1.4,
    color: '#00d2d3',
    accentGlow: 'rgba(0, 210, 211, 0.4)',
    enemyName: 'Guarda Fluvial',
    description: 'Sobre as águas frias do rio Katsura, guerreiros da névoa saltam e deslizam nas 3 alturas.',
    theme: {
      skyTop: '#051624',
      skyMid: '#0c2e42',
      skyBottom: '#071b26',
      moonColor: '#48dbfb',
      moonGlow: 'rgba(0, 210, 211, 0.45)',
      moonDisc: ['#e0f7fa', '#4dd0e1', '#0097a7'],
      petalType: 'mist',
      mountainColor: '#0a2233'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 20;
      let currentTime = 1.9;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 4 === 1) {
          beats.push({ time: currentTime, type: 'hold', lane: 0, duration: beatInterval * 1.5 });
          beats.push({ time: currentTime + beatInterval * 1.8, type: 'fast', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 1 });
        } else if (m % 4 === 3) {
          beats.push({ time: currentTime, type: 'heavy', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 2, type: 'hold', lane: 1, duration: beatInterval });
          beats.push({ time: currentTime + beatInterval * 3.2, type: 'normal', lane: 0 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: 'normal', lane: [0, 1, 2, 1][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 4 =================
  fase4: {
    id: 'fase4',
    phaseNumber: 4,
    name: 'Portão Torii Rubro',
    subtitle: 'Fase 4 • Intermediário • 116 BPM',
    difficultyLabel: 'Intermediário',
    bpm: 116,
    travelTime: 1.3,
    color: '#ff6b4a',
    accentGlow: 'rgba(255, 107, 74, 0.45)',
    enemyName: 'Lanceiro do Clã',
    description: 'Tochas cerimoniais iluminam os arcos sagrados. Os lanceiros atacam combinando cortes altos e baixos.',
    theme: {
      skyTop: '#1f0d0d',
      skyMid: '#3c1818',
      skyBottom: '#1c0a0a',
      moonColor: '#ff793f',
      moonGlow: 'rgba(255, 107, 74, 0.45)',
      moonDisc: ['#fff3e0', '#ff793f', '#d35400'],
      petalType: 'ember',
      mountainColor: '#2b1010'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 22;
      let currentTime = 1.9;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 3 === 0) {
          beats.push({ time: currentTime, type: 'hold', lane: 2, duration: beatInterval * 1.5 });
          beats.push({ time: currentTime + beatInterval * 2, type: 'normal', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'fast', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 2 });
        } else if (m % 3 === 1) {
          beats.push({ time: currentTime, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 1, type: 'hold', lane: 0, duration: beatInterval });
          beats.push({ time: currentTime + beatInterval * 2.2, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'fast', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3.5, type: 'fast', lane: 0 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: 'normal', lane: [0, 2, 1, 0][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 5 =================
  fase5: {
    id: 'fase5',
    phaseNumber: 5,
    name: 'Templo da Meia-Noite',
    subtitle: 'Fase 5 • Moderado • 126 BPM',
    difficultyLabel: 'Moderado',
    bpm: 126,
    travelTime: 1.2,
    color: '#a29bfe',
    accentGlow: 'rgba(162, 155, 254, 0.4)',
    enemyName: 'Ninja Espião Shinobi',
    description: 'Sob o luar violeta do santuário, sombras velozes atacam alternando com precisão entre as 3 barras.',
    theme: {
      skyTop: '#120a26',
      skyMid: '#24144d',
      skyBottom: '#0e071e',
      moonColor: '#9c88ff',
      moonGlow: 'rgba(162, 155, 254, 0.45)',
      moonDisc: ['#f5f0ff', '#a29bfe', '#6c5ce7'],
      petalType: 'spirit',
      mountainColor: '#1c1038'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 24;
      let currentTime = 1.8;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 4 === 1) {
          beats.push({ time: currentTime, type: 'hold', lane: 0, duration: beatInterval * 1.5 });
          beats.push({ time: currentTime + beatInterval * 1.8, type: 'fast', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 0 });
        } else if (m % 4 === 3) {
          beats.push({ time: currentTime, type: 'heavy', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 1.5, type: 'hold', lane: 1, duration: beatInterval });
          beats.push({ time: currentTime + beatInterval * 2.8, type: 'fast', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 3.5, type: 'normal', lane: 2 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: 'normal', lane: [2, 1, 0, 1][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 6 =================
  fase6: {
    id: 'fase6',
    phaseNumber: 6,
    name: 'Dança das Lâminas',
    subtitle: 'Fase 6 • Rápido • 136 BPM',
    difficultyLabel: 'Rápido',
    bpm: 136,
    travelTime: 1.12,
    color: '#ffd32a',
    accentGlow: 'rgba(255, 211, 42, 0.45)',
    enemyName: 'Mestre da Guarda',
    description: 'O choque de aço ressoa nos corredores dourados com combos em cascata pelas 3 barras.',
    theme: {
      skyTop: '#1b1404',
      skyMid: '#382a08',
      skyBottom: '#171103',
      moonColor: '#ffd32a',
      moonGlow: 'rgba(255, 211, 42, 0.45)',
      moonDisc: ['#fffde7', '#ffd32a', '#ff9f1a'],
      petalType: 'gold',
      mountainColor: '#281e06'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 26;
      let currentTime = 1.8;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 3 === 0) {
          beats.push({ time: currentTime, type: 'hold', lane: 0, duration: beatInterval * 1.2 });
          beats.push({ time: currentTime + beatInterval * 1.5, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 2, type: 'heavy', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'fast', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 0 });
        } else if (m % 3 === 1) {
          beats.push({ time: currentTime, type: 'fast', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 0.5, type: 'hold', lane: 2, duration: beatInterval * 1.2 });
          beats.push({ time: currentTime + beatInterval * 2, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 2.8, type: 'normal', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 3.5, type: 'heavy', lane: 2 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: 'normal', lane: [0, 1, 2, 0][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 7 =================
  fase7: {
    id: 'fase7',
    phaseNumber: 7,
    name: 'Fortaleza do Vendaval',
    subtitle: 'Fase 7 • Difícil • 146 BPM',
    difficultyLabel: 'Difícil',
    bpm: 146,
    travelTime: 1.02,
    color: '#0fbcf9',
    accentGlow: 'rgba(15, 188, 249, 0.45)',
    enemyName: 'Samurai da Guarda Negra',
    description: 'Ventos tempestuosos açoitam a fortaleza. Os inimigos atacam em rajadas contínuas nas 3 trilhas.',
    theme: {
      skyTop: '#081729',
      skyMid: '#122f52',
      skyBottom: '#071626',
      moonColor: '#4bcffa',
      moonGlow: 'rgba(15, 188, 249, 0.5)',
      moonDisc: ['#e7f9ff', '#0fbcf9', '#0652dd'],
      petalType: 'wind',
      mountainColor: '#0e233d'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 28;
      let currentTime = 1.7;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 4 === 0) {
          beats.push({ time: currentTime, type: 'hold', lane: 2, duration: beatInterval * 1.2 });
          beats.push({ time: currentTime + beatInterval * 1.5, type: 'fast', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 2, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 2 });
        } else if (m % 4 === 2) {
          beats.push({ time: currentTime, type: 'hold', lane: 0, duration: beatInterval });
          beats.push({ time: currentTime + beatInterval * 1.2, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 2, type: 'heavy', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 3.5, type: 'fast', lane: 1 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: b === 0 ? 'heavy' : 'normal', lane: [0, 2, 1, 2][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 8 =================
  fase8: {
    id: 'fase8',
    phaseNumber: 8,
    name: 'Cume do Vulcão Sangrento',
    subtitle: 'Fase 8 • Feroz • 158 BPM',
    difficultyLabel: 'Feroz',
    bpm: 158,
    travelTime: 0.94,
    color: '#ff3838',
    accentGlow: 'rgba(255, 56, 56, 0.5)',
    enemyName: 'Guarda Flamejante de Elite',
    description: 'Cinzas e chamas sobem da cratera vulcânica. O ritmo veloz exige alternar entre as 3 barras sem hesitar.',
    theme: {
      skyTop: '#24080a',
      skyMid: '#471015',
      skyBottom: '#1c0507',
      moonColor: '#ff3838',
      moonGlow: 'rgba(255, 56, 56, 0.55)',
      moonDisc: ['#ffebee', '#ff3838', '#b71540'],
      petalType: 'magma',
      mountainColor: '#360c10'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 30;
      let currentTime = 1.7;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 3 === 0) {
          beats.push({ time: currentTime, type: 'hold', lane: 0, duration: beatInterval });
          beats.push({ time: currentTime + beatInterval * 1.2, type: 'fast', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 1.8, type: 'fast', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'heavy', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 3, type: 'normal', lane: 2 });
        } else if (m % 3 === 1) {
          beats.push({ time: currentTime, type: 'heavy', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 1, type: 'hold', lane: 1, duration: beatInterval });
          beats.push({ time: currentTime + beatInterval * 2.2, type: 'normal', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 2.8, type: 'fast', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3.5, type: 'fast', lane: 0 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: b === 0 ? 'heavy' : 'normal', lane: [2, 1, 0, 1][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 9 =================
  fase9: {
    id: 'fase9',
    phaseNumber: 9,
    name: 'Salão das Sombras do Shogun',
    subtitle: 'Fase 9 • Mestre • 170 BPM',
    difficultyLabel: 'Mestre',
    bpm: 170,
    travelTime: 0.86,
    color: '#e056fd',
    accentGlow: 'rgba(224, 86, 253, 0.5)',
    enemyName: 'A Sombra do Shogun',
    description: 'Relâmpagos violetas revelam sequências frenéticas através de todas as 3 barras simultâneas.',
    theme: {
      skyTop: '#1a0628',
      skyMid: '#390c57',
      skyBottom: '#14041f',
      moonColor: '#be2edd',
      moonGlow: 'rgba(224, 86, 253, 0.55)',
      moonDisc: ['#fdf0ff', '#e056fd', '#68078f'],
      petalType: 'shadow',
      mountainColor: '#28093d'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 32;
      let currentTime = 1.6;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 3 === 0) {
          beats.push({ time: currentTime, type: 'hold', lane: 0, duration: beatInterval * 0.9 });
          beats.push({ time: currentTime + beatInterval * 1.1, type: 'fast', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 1.8, type: 'fast', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'heavy', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 3.2, type: 'normal', lane: 2 });
        } else if (m % 3 === 1) {
          beats.push({ time: currentTime, type: 'normal', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 0.5, type: 'hold', lane: 2, duration: beatInterval * 0.9 });
          beats.push({ time: currentTime + beatInterval * 1.6, type: 'heavy', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'fast', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 3.2, type: 'normal', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3.7, type: 'fast', lane: 0 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: (b === 0 || b === 2) ? 'heavy' : 'normal', lane: [0, 1, 2, 1][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  },

  // ================= FASE 10 =================
  fase10: {
    id: 'fase10',
    phaseNumber: 10,
    name: 'O Despertar do Lorde Oni',
    subtitle: 'Fase 10 • Clímax Final • 185 BPM',
    difficultyLabel: 'Supremo',
    bpm: 185,
    travelTime: 0.78,
    color: '#ff0055',
    accentGlow: 'rgba(255, 0, 85, 0.65)',
    enemyName: 'Lorde Oni Supremo',
    description: 'A Lua de Sangue atinge o zênite. A tempestade de lâminas nas 3 barras exige domínio Shinobi absoluto.',
    theme: {
      skyTop: '#26040a',
      skyMid: '#520816',
      skyBottom: '#1a0104',
      moonColor: '#ff0055',
      moonGlow: 'rgba(255, 0, 85, 0.7)',
      moonDisc: ['#ffffff', '#ff2a5f', '#800020'],
      petalType: 'bloodMoon',
      mountainColor: '#3d0610'
    },
    generateBeats: function() {
      const beatInterval = 60 / this.bpm;
      const beats = [];
      const totalMeasures = 36;
      let currentTime = 1.6;

      for (let m = 0; m < totalMeasures; m++) {
        if (m % 4 === 0) {
          beats.push({ time: currentTime, type: 'hold', lane: 0, duration: beatInterval * 0.85 });
          beats.push({ time: currentTime + beatInterval * 1.0, type: 'fast', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 1.5, type: 'fast', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 2.2, type: 'heavy', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 2.8, type: 'fast', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3.3, type: 'normal', lane: 1 });
        } else if (m % 4 === 1) {
          beats.push({ time: currentTime, type: 'normal', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 0.5, type: 'hold', lane: 1, duration: beatInterval * 0.85 });
          beats.push({ time: currentTime + beatInterval * 1.5, type: 'heavy', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 2.2, type: 'fast', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 3.0, type: 'fast', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 3.5, type: 'fast', lane: 2 });
        } else if (m % 4 === 2) {
          beats.push({ time: currentTime, type: 'hold', lane: 2, duration: beatInterval * 0.85 });
          beats.push({ time: currentTime + beatInterval * 1.1, type: 'heavy', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 1.7, type: 'fast', lane: 1 });
          beats.push({ time: currentTime + beatInterval * 2.5, type: 'normal', lane: 0 });
          beats.push({ time: currentTime + beatInterval * 3.2, type: 'heavy', lane: 2 });
          beats.push({ time: currentTime + beatInterval * 3.7, type: 'fast', lane: 1 });
        } else {
          for (let b = 0; b < 4; b++) {
            beats.push({ time: currentTime + b * beatInterval, type: b % 2 === 0 ? 'heavy' : 'normal', lane: [0, 1, 2, 1][b] });
          }
        }
        currentTime += beatInterval * 4;
      }
      return beats;
    }
  }
};

// Aliases para retrocompatibilidade
BEATMAPS.facil = BEATMAPS.fase1;
BEATMAPS.medio = BEATMAPS.fase5;
BEATMAPS.dificil = BEATMAPS.fase8;

// Lista ordenada das 10 fases para iteração e seleção na interface
const PHASE_KEYS = ['fase1', 'fase2', 'fase3', 'fase4', 'fase5', 'fase6', 'fase7', 'fase8', 'fase9', 'fase10'];

// Helper para obter próxima fase
function getNextPhaseKey(currentKey) {
  const idx = PHASE_KEYS.indexOf(currentKey);
  if (idx >= 0 && idx < PHASE_KEYS.length - 1) {
    return PHASE_KEYS[idx + 1];
  }
  return null;
}
