// js/game.js - Loop Principal, Lógica de Combate em 3 Barras, Precisão, Sistema de Pausa e 10 Fases com Trilha Sonora Sincronizada

class ShinobiRhythmGame {
  constructor() {
    this.renderer = new GameRenderer('game-canvas');
    this.rhythmBar = new RhythmBar('rhythm-canvas');

    // Estado do jogo
    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER', 'VICTORY'
    this.selectedPhase = 'fase1';
    this.currentBeatmap = null;
    this.beats = [];
    this.totalNotesCount = 0;

    // Tempo e ritmo com suporte a pausa precisa
    this.startTime = 0;
    this.currentTime = 0;
    this.lastFrameTime = 0;
    this.totalPausedDuration = 0;
    this.pauseStartTime = 0;
    this.beatSoundIndex = 0;

    // Estatísticas do jogador
    this.health = 100;
    this.maxHealth = 100;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.missHits = 0;

    // Contador de golpes para alternar animações de corte
    this.slashCycle = 0;

    // Rastreia quais trilhas estão sendo pressionadas (para hold notes)
    this.activeLanes = { 0: false, 1: false, 2: false };
    this._holdTickTimers = { 0: 0, 1: 0, 2: 0 };

    // Registros salvos no navegador (Recordes locais)
    this.records = this.loadRecords();

    // Cache de elementos do DOM
    this.dom = {
      hud: document.getElementById('hud'),
      healthFill: document.getElementById('health-fill'),
      scoreDisplay: document.getElementById('score-display'),
      accuracyDisplay: document.getElementById('accuracy-display'),
      comboDisplay: document.getElementById('combo-display'),
      comboNumber: document.getElementById('combo-number'),
      judgmentDisplay: document.getElementById('judgment-display'),
      progressFill: document.getElementById('progress-fill'),
      songTitleDisplay: document.getElementById('song-title-display'),

      // Telas / Modais
      menuModal: document.getElementById('menu-modal'),
      pauseModal: document.getElementById('pause-modal'),
      gameoverModal: document.getElementById('gameover-modal'),
      victoryModal: document.getElementById('victory-modal'),

      // Botões principais
      playBtn: document.getElementById('btn-play'),
      muteBtn: document.getElementById('btn-mute'),
      pauseBtn: document.getElementById('btn-pause'),

      // Seletor de Fases
      phasesGrid: document.getElementById('phases-grid'),
      phaseCounterBadge: document.getElementById('phase-counter-badge'),
      phaseCardNumber: document.getElementById('phase-card-number'),
      phaseCardTitle: document.getElementById('phase-card-title'),
      phaseCardDiff: document.getElementById('phase-card-diff'),
      phaseCardBpm: document.getElementById('phase-card-bpm'),
      phaseCardDesc: document.getElementById('phase-card-desc'),
      phaseCardEnemy: document.getElementById('phase-card-enemy'),
      phaseCardRecord: document.getElementById('phase-card-record'),

      // Modal de Pausa
      pausePhaseDisplay: document.getElementById('pause-phase-display'),
      pauseScore: document.getElementById('pause-score'),
      pauseCombo: document.getElementById('pause-combo'),
      pauseAccuracy: document.getElementById('pause-accuracy'),
      pausePassedNotes: document.getElementById('pause-passed-notes'),
      btnResumePause: document.getElementById('btn-resume-pause'),
      btnRetryPause: document.getElementById('btn-retry-pause'),
      btnMenuPause: document.getElementById('btn-menu-pause'),

      // Modal de Vitória
      finalScore: document.getElementById('final-score'),
      finalAccuracy: document.getElementById('final-accuracy'),
      finalMaxCombo: document.getElementById('final-max-combo'),
      countPerfect: document.getElementById('count-perfect'),
      countGood: document.getElementById('count-good'),
      countMiss: document.getElementById('count-miss'),
      rankBadge: document.getElementById('rank-badge'),
      btnNextVictory: document.getElementById('btn-next-victory'),
      retryVictoryBtn: document.getElementById('btn-retry-victory'),
      menuVictoryBtn: document.getElementById('btn-menu-victory'),

      // Modal de Game Over
      goScore: document.getElementById('go-score'),
      goMaxCombo: document.getElementById('go-max-combo'),
      goPassedNotes: document.getElementById('go-passed-notes'),
      retryGameoverBtn: document.getElementById('btn-retry-gameover'),
      menuGameoverBtn: document.getElementById('btn-menu-gameover')
    };

    this.initPhaseSelector();
    this.bindEvents();
    this.initLoop();
  }

  // ================= GERENCIAMENTO DE RECORDES =================
  loadRecords() {
    try {
      const data = localStorage.getItem('shinobi_records_v1');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveRecord(phaseKey, score, rank) {
    try {
      const current = this.records[phaseKey] || { score: 0, rank: '-' };
      if (score > current.score) {
        this.records[phaseKey] = { score, rank };
        localStorage.setItem('shinobi_records_v1', JSON.stringify(this.records));
      }
    } catch (e) {
      console.warn("Não foi possível salvar recorde localmente:", e);
    }
  }

  // ================= INICIALIZAÇÃO DO SELETOR DE 10 FASES =================
  initPhaseSelector() {
    if (!this.dom.phasesGrid) return;
    this.dom.phasesGrid.innerHTML = '';

    PHASE_KEYS.forEach((key, index) => {
      const map = BEATMAPS[key];
      if (!map) return;

      const btn = document.createElement('button');
      btn.className = `phase-btn ${key === this.selectedPhase ? 'selected' : ''}`;
      btn.dataset.phase = key;
      btn.style.setProperty('--phase-color', map.color);
      btn.style.setProperty('--phase-glow', map.accentGlow || 'rgba(255, 207, 64, 0.4)');

      const numStr = String(index + 1).padStart(2, '0');
      btn.innerHTML = `
        <span class="phase-btn-num">F${numStr}</span>
        <span class="phase-btn-name" title="${map.name}">${map.name}</span>
        <span class="phase-btn-bpm">${map.bpm} BPM</span>
      `;

      btn.addEventListener('click', () => {
        this.selectPhase(key);
      });

      this.dom.phasesGrid.appendChild(btn);
    });

    this.updatePhaseCard(this.selectedPhase);
  }

  selectPhase(phaseKey) {
    if (!BEATMAPS[phaseKey]) return;
    this.selectedPhase = phaseKey;

    const buttons = this.dom.phasesGrid?.querySelectorAll('.phase-btn');
    if (buttons) {
      buttons.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.phase === phaseKey);
      });
    }

    this.updatePhaseCard(phaseKey);
  }

  updatePhaseCard(phaseKey) {
    const map = BEATMAPS[phaseKey];
    if (!map) return;

    const numStr = String(map.phaseNumber).padStart(2, '0');
    if (this.dom.phaseCounterBadge) {
      this.dom.phaseCounterBadge.innerText = `FASE ${map.phaseNumber} DE 10`;
    }
    if (this.dom.phaseCardNumber) {
      this.dom.phaseCardNumber.innerText = `FASE ${numStr}`;
      this.dom.phaseCardNumber.style.color = map.color;
    }
    if (this.dom.phaseCardTitle) {
      this.dom.phaseCardTitle.innerText = map.name;
    }
    if (this.dom.phaseCardDiff) {
      this.dom.phaseCardDiff.innerText = map.difficultyLabel || 'Desafio';
      this.dom.phaseCardDiff.style.borderColor = map.color;
      this.dom.phaseCardDiff.style.color = map.color;
    }
    if (this.dom.phaseCardBpm) {
      this.dom.phaseCardBpm.innerText = `${map.bpm} BPM`;
    }
    if (this.dom.phaseCardDesc) {
      this.dom.phaseCardDesc.innerText = map.description || map.subtitle;
    }
    if (this.dom.phaseCardEnemy) {
      this.dom.phaseCardEnemy.innerHTML = `🗡️ Inimigo: <strong>${map.enemyName}</strong>`;
    }
    if (this.dom.phaseCardRecord) {
      const rec = this.records[phaseKey];
      if (rec && rec.score > 0) {
        this.dom.phaseCardRecord.innerHTML = `🏆 Recorde: <strong>${rec.score.toLocaleString()} pts [${rec.rank}]</strong>`;
      } else {
        this.dom.phaseCardRecord.innerHTML = `🏆 Recorde: <strong>Ainda não concluída</strong>`;
      }
    }
  }

  bindEvents() {
    // Iniciar Jogo
    this.dom.playBtn?.addEventListener('click', () => {
      soundEngine.init();
      this.startGame(this.selectedPhase);
    });

    // Botão de Pausa Superior
    this.dom.pauseBtn?.addEventListener('click', () => {
      this.togglePause();
    });

    // Controles do Modal de Pausa
    this.dom.btnResumePause?.addEventListener('click', () => {
      this.resumeGame();
    });

    this.dom.btnRetryPause?.addEventListener('click', () => {
      this.dom.pauseModal.classList.add('hidden');
      this.startGame(this.selectedPhase);
    });

    this.dom.btnMenuPause?.addEventListener('click', () => {
      this.dom.pauseModal.classList.add('hidden');
      this.showMenu();
    });

    // Botões de Reinício e Menu (Game Over & Vitória)
    this.dom.retryGameoverBtn?.addEventListener('click', () => this.startGame(this.selectedPhase));
    this.dom.menuGameoverBtn?.addEventListener('click', () => this.showMenu());
    this.dom.retryVictoryBtn?.addEventListener('click', () => this.startGame(this.selectedPhase));
    this.dom.menuVictoryBtn?.addEventListener('click', () => this.showMenu());

    // Botão de Próxima Fase (Tela de Vitória)
    if (this.dom.btnNextVictory) {
      this.dom.btnNextVictory.addEventListener('click', () => {
        const nextKey = getNextPhaseKey(this.selectedPhase);
        if (nextKey) {
          this.selectPhase(nextKey);
          this.startGame(nextKey);
        } else {
          this.showMenu();
        }
      });
    }

    // Botão de Áudio Mudo
    this.dom.muteBtn?.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      this.dom.muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
    });

    // Mapeamento das 3 trilhas / barras de ritmo
    const lane0Keys = ['KeyA', 'KeyZ', 'Digit1', 'Numpad1', 'ArrowUp', 'KeyQ', 'KeyU'];
    const lane1Keys = ['KeyS', 'KeyX', 'Digit2', 'Numpad2', 'Space', 'ArrowRight', 'KeyW', 'KeyI', 'Enter'];
    const lane2Keys = ['KeyD', 'KeyC', 'Digit3', 'Numpad3', 'ArrowDown', 'KeyE', 'KeyO', 'KeyJ', 'KeyK', 'KeyL'];

    const getLaneForCode = (code) => {
      if (lane0Keys.includes(code)) return 0;
      if (lane1Keys.includes(code)) return 1;
      if (lane2Keys.includes(code)) return 2;
      return null;
    };

    // Controles por Teclado — KEYDOWN (pressionar)
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;

      // Atalho de pausa
      const pauseCode = (typeof keybindManager !== 'undefined')
        ? keybindManager.getPauseCode()
        : 'KeyP';

      if (e.code === pauseCode || e.code === 'Escape') {
        e.preventDefault();
        this.togglePause();
        return;
      }

      const targetLane = getLaneForCode(e.code);
      if (targetLane !== null) {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.activeLanes[targetLane] = true;
          this.handlePlayerAttack(targetLane);
        } else if (this.state === 'MENU') {
          soundEngine.init();
          this.startGame(this.selectedPhase);
        }
      }
    });

    // Controles por Teclado — KEYUP (soltar)
    window.addEventListener('keyup', (e) => {
      const targetLane = getLaneForCode(e.code);
      if (targetLane !== null) {
        this.activeLanes[targetLane] = false;
        if (this.state === 'PLAYING') {
          this.handlePlayerRelease(targetLane);
        }
      }
    });

    // Controles por Clique ou Toque (Mouse / Touch) — PRESSIONAR
    const handleScreenPress = (e) => {
      if (e.target.closest('button') || e.target.closest('.modal-content')) return;

      if (this.state === 'PLAYING') {
        const rhythmCanvas = document.getElementById('rhythm-canvas');
        if (rhythmCanvas && (e.target === rhythmCanvas || e.target.closest('.rhythm-bar-wrapper'))) {
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const lane = this.rhythmBar.getLaneFromX(clientX);
          this.activeLanes[lane] = true;
          this.handlePlayerAttack(lane);
        } else {
          this.handlePlayerAttack(null);
        }
      }
    };

    // Controles por Clique ou Toque — SOLTAR
    const handleScreenRelease = (e) => {
      if (this.state !== 'PLAYING') return;
      const rhythmCanvas = document.getElementById('rhythm-canvas');
      const touches = e.changedTouches;
      if (touches) {
        for (let i = 0; i < touches.length; i++) {
          const clientX = touches[i].clientX;
          const lane = rhythmCanvas ? this.rhythmBar.getLaneFromX(clientX) : 1;
          this.activeLanes[lane] = false;
          this.handlePlayerRelease(lane);
        }
      } else {
        // mouseup: libera todas as lanes que estavam ativas por mouse
        for (let l = 0; l < 3; l++) {
          if (this.activeLanes[l]) {
            this.activeLanes[l] = false;
            this.handlePlayerRelease(l);
          }
        }
      }
    };

    window.addEventListener('mousedown', handleScreenPress);
    window.addEventListener('mouseup', handleScreenRelease);
    window.addEventListener('touchstart', handleScreenPress, { passive: true });
    window.addEventListener('touchend', handleScreenRelease, { passive: true });
  }

  // ================= SISTEMA DE PAUSA PRECISO =================
  togglePause() {
    if (this.state === 'PLAYING') {
      this.pauseGame();
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;

    this.state = 'PAUSED';
    this.pauseStartTime = performance.now() / 1000;
    soundEngine.pauseMusic();

    const map = this.currentBeatmap;
    if (this.dom.pausePhaseDisplay && map) {
      this.dom.pausePhaseDisplay.innerText = `Fase ${map.phaseNumber}: ${map.name} (${map.bpm} BPM)`;
      this.dom.pausePhaseDisplay.style.borderColor = map.color;
      this.dom.pausePhaseDisplay.style.color = map.color;
    }
    if (this.dom.pauseScore) {
      this.dom.pauseScore.innerText = this.score.toLocaleString();
    }
    if (this.dom.pauseCombo) {
      this.dom.pauseCombo.innerText = this.combo;
    }
    if (this.dom.pauseAccuracy) {
      const totalJudged = this.perfectHits + this.goodHits + this.missHits;
      let accuracy = 100;
      if (totalJudged > 0) {
        accuracy = ((this.perfectHits * 100 + this.goodHits * 50) / (totalJudged * 100)) * 100;
      }
      this.dom.pauseAccuracy.innerText = `${accuracy.toFixed(1)}%`;
    }
    if (this.dom.pausePassedNotes) {
      const passed = this.perfectHits + this.goodHits;
      this.dom.pausePassedNotes.innerText = `${passed} / ${this.totalNotesCount}`;
    }

    if (this.dom.pauseBtn) {
      this.dom.pauseBtn.innerHTML = '▶️';
      this.dom.pauseBtn.title = 'Retomar Jogo (P / Esc)';
    }

    this.dom.pauseModal?.classList.remove('hidden');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;

    const now = performance.now() / 1000;
    this.totalPausedDuration += (now - this.pauseStartTime);
    this.lastFrameTime = now;

    this.state = 'PLAYING';
    soundEngine.resumeMusic();

    if (this.dom.pauseBtn) {
      this.dom.pauseBtn.innerHTML = '⏸️';
      this.dom.pauseBtn.title = 'Pausar Jogo (P / Esc)';
    }

    this.dom.pauseModal?.classList.add('hidden');
  }

  showMenu() {
    this.state = 'MENU';
    soundEngine.stopMusic();

    if (typeof mainMenuController !== 'undefined') {
      mainMenuController.returnToMainMenu();
    } else {
      this.dom.menuModal?.classList.remove('hidden');
    }

    this.dom.pauseModal?.classList.add('hidden');
    this.dom.gameoverModal?.classList.add('hidden');
    this.dom.victoryModal?.classList.add('hidden');
    this.dom.hud?.classList.add('hidden');
    if (this.dom.pauseBtn) {
      this.dom.pauseBtn.innerHTML = '⏸️';
      this.dom.pauseBtn.title = 'Pausar Jogo (P / Esc)';
    }
    this.updatePhaseCard(this.selectedPhase);
  }

  startGame(phaseKey) {
    this.selectedPhase = phaseKey;
    this.currentBeatmap = BEATMAPS[phaseKey] || BEATMAPS.fase1;

    // Gera notas para a fase escolhida em 3 barras
    this.beats = this.currentBeatmap.generateBeats();
    this.totalNotesCount = this.beats.length;
    this.beatSoundIndex = 0;

    // Reseta estatísticas do jogador
    this.health = this.maxHealth;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.missHits = 0;
    this.slashCycle = 0;

    // Reseta estado de teclas pressionadas
    this.activeLanes = { 0: false, 1: false, 2: false };
    this._holdTickTimers = { 0: 0, 1: 0, 2: 0 };

    // Inicia cronômetro do jogo e música procedural da fase
    this.startTime = performance.now() / 1000;
    this.currentTime = 0;
    this.totalPausedDuration = 0;
    this.pauseStartTime = 0;
    this.lastFrameTime = performance.now() / 1000;

    soundEngine.startPhaseMusic(phaseKey);

    // Atualiza HUD inicial
    const map = this.currentBeatmap;
    if (this.dom.songTitleDisplay) {
      this.dom.songTitleDisplay.innerText = `Fase ${map.phaseNumber}: ${map.name} (${map.bpm} BPM)`;
      this.dom.songTitleDisplay.style.color = map.color;
    }
    this.updateHUD();

    if (this.dom.pauseBtn) {
      this.dom.pauseBtn.innerHTML = '⏸️';
      this.dom.pauseBtn.title = 'Pausar Jogo (P / Esc)';
    }

    // Mostra HUD e oculta modais
    this.dom.menuModal?.classList.add('hidden');
    this.dom.pauseModal?.classList.add('hidden');
    this.dom.gameoverModal?.classList.add('hidden');
    this.dom.victoryModal?.classList.add('hidden');
    this.dom.hud?.classList.remove('hidden');

    this.state = 'PLAYING';
  }

  handlePlayerAttack(requestedLane = null) {
    this.slashCycle++;
    const safeLane = requestedLane !== null ? requestedLane : 1;
    soundEngine.playSlashSound(safeLane);

    // Procura a batida mais próxima correspondente à trilha solicitada
    let closestBeat = null;
    let minDiff = Infinity;

    for (let i = 0; i < this.beats.length; i++) {
      const beat = this.beats[i];
      if (beat.hit || beat.missed) continue;

      // Se uma trilha foi especificada, filtra apenas batidas dessa trilha
      if (requestedLane !== null) {
        const bLane = beat.lane !== undefined ? beat.lane : 1;
        if (bLane !== requestedLane) continue;
      }

      const diff = Math.abs(this.currentTime - beat.time);

      if (diff < minDiff && diff < 0.22) {
        minDiff = diff;
        closestBeat = beat;
      }
    }

    // Se o clique foi genérico (tela geral) e não encontrou com filtro estrito, tenta qualquer trilha
    if (!closestBeat && requestedLane === null) {
      for (let i = 0; i < this.beats.length; i++) {
        const beat = this.beats[i];
        if (beat.hit || beat.missed) continue;

        const diff = Math.abs(this.currentTime - beat.time);
        if (diff < minDiff && diff < 0.22) {
          minDiff = diff;
          closestBeat = beat;
        }
      }
    }

    if (closestBeat) {
      if (closestBeat.type === 'hold') {
        // Nota de segurar: inicia o hold se estiver no tempo certo
        if (minDiff <= 0.22) {
          closestBeat.holding = true;
          closestBeat.holdStartTime = this.currentTime;
          this.rhythmBar.triggerHoldSpark(closestBeat.lane !== undefined ? closestBeat.lane : 1);
          this._holdTickTimers[closestBeat.lane !== undefined ? closestBeat.lane : 1] = 0;
        }
      } else {
        // Nota normal
        if (minDiff <= 0.055) {
          this.processHit(closestBeat, 'PERFEITO');
        } else if (minDiff <= 0.125) {
          this.processHit(closestBeat, 'BOM');
        } else {
          this.processMiss(closestBeat, true);
        }
      }
    } else {
      // Golpe fora de tempo / golpe no vazio na trilha acionada
      this.renderer.triggerNinjaSlash(this.slashCycle, false, safeLane);
    }
  }

  handlePlayerRelease(lane) {
    // Verifica se há algum hold ativo nessa trilha que foi solto antes do tempo
    for (let i = 0; i < this.beats.length; i++) {
      const beat = this.beats[i];
      if (beat.hit || beat.missed) continue;
      if (beat.type !== 'hold' || !beat.holding) continue;
      const bLane = beat.lane !== undefined ? beat.lane : 1;
      if (bLane !== lane) continue;

      const duration = beat.duration || 0.6;
      const held = this.currentTime - beat.holdStartTime;
      const minHoldRequired = duration * 0.75; // Precisa segurar 75% da duração

      if (held < minHoldRequired) {
        // Soltou cedo demais — ERRO
        beat.holding = false;
        this.processMiss(beat, true);
      }
      // Se já segurou o suficiente, o loop do jogo vai completar
    }
  }

  processHit(beat, judgmentType) {
    beat.hit = true;
    const isPerfect = judgmentType === 'PERFEITO';
    const lane = beat.lane !== undefined ? beat.lane : 1;

    if (isPerfect) {
      this.perfectHits++;
      this.combo++;
      this.health = Math.min(this.maxHealth, this.health + 2);
      const multiplier = this.getComboMultiplier();
      this.score += 300 * multiplier;
    } else {
      this.goodHits++;
      this.combo++;
      const multiplier = this.getComboMultiplier();
      this.score += 100 * multiplier;
    }

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    // Feedback sonoro e visual por trilha
    soundEngine.playHitSound(isPerfect, lane);
    this.rhythmBar.triggerHitFeedback(judgmentType, lane);
    this.renderer.triggerNinjaSlash(this.slashCycle, isPerfect, lane);

    // Corta o inimigo sincronizado na altura correspondente
    const laneYOffset = lane === 0 ? -40 : (lane === 2 ? 8 : 0);
    const enemyRef = {
      x: this.renderer.ninja.x + 80,
      y: this.renderer.groundY + laneYOffset,
      type: beat.type
    };
    this.renderer.sliceEnemy(enemyRef, isPerfect);

    this.renderer.addFloatingText(judgmentType, isPerfect, false);
    this.showJudgmentHUD(judgmentType);
    this.updateHUD();
  }

  processMiss(beat, isEarly = false) {
    beat.missed = true;
    this.missHits++;
    this.combo = 0;
    const lane = beat.lane !== undefined ? beat.lane : 1;

    this.health = Math.max(0, this.health - 15);

    soundEngine.playMissSound();
    this.rhythmBar.triggerHitFeedback('ERRO', lane);
    this.renderer.triggerNinjaHurt();
    this.renderer.addFloatingText('ERRO!', false, true);
    this.showJudgmentHUD('ERRO');
    this.updateHUD();

    if (this.health <= 0) {
      this.triggerGameOver();
    }
  }

  getComboMultiplier() {
    if (this.combo >= 50) return 4;
    if (this.combo >= 25) return 3;
    if (this.combo >= 10) return 2;
    return 1;
  }

  showJudgmentHUD(type) {
    const el = this.dom.judgmentDisplay;
    if (!el) return;
    el.className = 'judgment-display show';
    if (type === 'PERFEITO') {
      el.classList.add('judgment-perfect');
      el.innerText = 'PERFEITO!';
    } else if (type === 'BOM') {
      el.classList.add('judgment-good');
      el.innerText = 'BOM!';
    } else {
      el.classList.add('judgment-miss');
      el.innerText = 'ERRO!';
    }

    clearTimeout(this.judgmentTimeout);
    this.judgmentTimeout = setTimeout(() => {
      el.className = 'judgment-display';
    }, 450);
  }

  updateHUD() {
    if (this.dom.healthFill) {
      const hpPercent = Math.max(0, (this.health / this.maxHealth) * 100);
      this.dom.healthFill.style.width = `${hpPercent}%`;
    }

    if (this.dom.scoreDisplay) {
      this.dom.scoreDisplay.innerText = this.score.toLocaleString();
    }

    const totalJudged = this.perfectHits + this.goodHits + this.missHits;
    let accuracy = 100;
    if (totalJudged > 0) {
      accuracy = ((this.perfectHits * 100 + this.goodHits * 50) / (totalJudged * 100)) * 100;
    }
    if (this.dom.accuracyDisplay) {
      this.dom.accuracyDisplay.innerText = `${accuracy.toFixed(1)}%`;
    }

    if (this.dom.comboDisplay) {
      if (this.combo > 1) {
        this.dom.comboDisplay.classList.add('active');
        if (this.dom.comboNumber) this.dom.comboNumber.innerText = this.combo;
      } else {
        this.dom.comboDisplay.classList.remove('active');
      }
    }

    if (this.dom.progressFill && this.beats.length > 0) {
      const lastBeatTime = this.beats[this.beats.length - 1].time + 1.5;
      const progressPercent = Math.min(100, (this.currentTime / lastBeatTime) * 100);
      this.dom.progressFill.style.width = `${progressPercent}%`;
    }
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    soundEngine.stopMusic();

    if (this.dom.goScore) this.dom.goScore.innerText = this.score.toLocaleString();
    if (this.dom.goMaxCombo) this.dom.goMaxCombo.innerText = this.maxCombo;
    const passed = this.perfectHits + this.goodHits;
    if (this.dom.goPassedNotes) this.dom.goPassedNotes.innerText = `${passed} / ${this.totalNotesCount}`;

    setTimeout(() => {
      this.dom.gameoverModal?.classList.remove('hidden');
    }, 400);
  }

  triggerVictory() {
    this.state = 'VICTORY';
    soundEngine.stopMusic();
    soundEngine.playVictorySound();

    const totalJudged = this.perfectHits + this.goodHits + this.missHits;
    let accuracy = 100;
    if (totalJudged > 0) {
      accuracy = ((this.perfectHits * 100 + this.goodHits * 50) / (totalJudged * 100)) * 100;
    }

    let rank = 'C';
    let rankClass = 'rank-c';
    if (accuracy >= 98 && this.missHits === 0) {
      rank = 'SSS';
      rankClass = 'rank-sss';
    } else if (accuracy >= 90) {
      rank = 'S';
      rankClass = 'rank-s';
    } else if (accuracy >= 80) {
      rank = 'A';
      rankClass = 'rank-a';
    } else if (accuracy >= 70) {
      rank = 'B';
      rankClass = 'rank-b';
    } else {
      rank = 'D';
      rankClass = 'rank-d';
    }

    this.saveRecord(this.selectedPhase, this.score, rank);

    if (this.dom.rankBadge) {
      this.dom.rankBadge.innerText = rank;
      this.dom.rankBadge.className = `rank-badge ${rankClass}`;
    }
    if (this.dom.finalScore) this.dom.finalScore.innerText = this.score.toLocaleString();
    if (this.dom.finalAccuracy) this.dom.finalAccuracy.innerText = `${accuracy.toFixed(1)}%`;
    if (this.dom.finalMaxCombo) this.dom.finalMaxCombo.innerText = this.maxCombo;
    if (this.dom.countPerfect) this.dom.countPerfect.innerText = this.perfectHits;
    if (this.dom.countGood) this.dom.countGood.innerText = this.goodHits;
    if (this.dom.countMiss) this.dom.countMiss.innerText = this.missHits;

    if (this.dom.btnNextVictory) {
      const nextKey = getNextPhaseKey(this.selectedPhase);
      if (nextKey) {
        const nextMap = BEATMAPS[nextKey];
        this.dom.btnNextVictory.innerText = `PRÓXIMA: FASE ${nextMap.phaseNumber} ➔`;
        this.dom.btnNextVictory.style.display = 'inline-block';
      } else {
        this.dom.btnNextVictory.innerText = `👑 MESTRE SHINOBI CONCLUÍDO!`;
        this.dom.btnNextVictory.style.display = 'inline-block';
      }
    }

    setTimeout(() => {
      this.dom.victoryModal?.classList.remove('hidden');
    }, 500);
  }

  initLoop() {
    const loop = (nowMs) => {
      const now = nowMs / 1000;
      const dt = Math.min(0.1, now - (this.lastFrameTime || now));
      this.lastFrameTime = now;

      if (this.state === 'PLAYING') {
        this.currentTime = now - this.startTime - this.totalPausedDuration;

        // 1. Atualiza o relógio de música procedural da fase
        soundEngine.updateMusicClock(this.currentTime);

        // 2. Toca som percussivo Taiko em sincronia com as notas que chegam
        while (this.beatSoundIndex < this.beats.length &&
               this.currentTime >= this.beats[this.beatSoundIndex].time) {
          const beat = this.beats[this.beatSoundIndex];
          if (beat.type !== 'hold') {
            soundEngine.playBeatSound(beat.type === 'heavy' ? 1.4 : 1.0, beat.lane || 1);
          }
          this.beatSoundIndex++;
        }

        // 3. Atualiza hold notes ativas
        for (let i = 0; i < this.beats.length; i++) {
          const beat = this.beats[i];
          if (beat.hit || beat.missed || beat.type !== 'hold') continue;

          const lane = beat.lane !== undefined ? beat.lane : 1;
          const duration = beat.duration || 0.6;

          if (beat.holding) {
            if (!this.activeLanes[lane]) {
              // Tecla foi solta — handlePlayerRelease já trata, mas como segurança:
              beat.holding = false;
            } else {
              // Efeito visual de faíscas contínuas (a cada ~0.08s)
              this._holdTickTimers[lane] = (this._holdTickTimers[lane] || 0) + dt;
              if (this._holdTickTimers[lane] >= 0.08) {
                this._holdTickTimers[lane] = 0;
                this.rhythmBar.triggerHoldSpark(lane);
                if (typeof soundEngine.playHoldTickSound === 'function') {
                  soundEngine.playHoldTickSound(lane);
                }
              }

              // Verifica se o hold foi completado com sucesso
              if (this.currentTime >= beat.time + duration) {
                beat.holding = false;
                this.activeLanes[lane] = false; // Reseta lane após conclusão
                this.processHit(beat, 'PERFEITO');
              }
            }
          } else if (!beat.holding) {
            // Miss automático se a nota passou sem ser iniciada
            if (this.currentTime > beat.time + 0.22 && !beat.hit && !beat.missed) {
              this.processMiss(beat, false);
            }
          }
        }

        // 4. Verifica notas normais que passaram sem corte (MISS)
        for (let i = 0; i < this.beats.length; i++) {
          const beat = this.beats[i];
          if (beat.hit || beat.missed || beat.type === 'hold') continue;
          if (this.currentTime > beat.time + 0.13) {
            this.processMiss(beat, false);
          }
        }

        // 5. Condição de Vitória ao fim da fase
        if (this.state === 'PLAYING' && this.beats.length > 0) {
          const lastBeat = this.beats[this.beats.length - 1];
          const lastEnd = lastBeat.type === 'hold'
            ? lastBeat.time + (lastBeat.duration || 0.6)
            : lastBeat.time;
          if (this.currentTime > lastEnd + 1.8) {
            this.triggerVictory();
          }
        }

        this.updateHUD();

        this.renderer.update(dt, this.currentTime);
        this.rhythmBar.update(dt);
      }

      // Renderiza cenário, ninja, inimigos e a barra de 3 faixas
      const travelTime = this.currentBeatmap ? this.currentBeatmap.travelTime : 1.5;
      const bpm = this.currentBeatmap ? this.currentBeatmap.bpm : 100;
      const theme = this.currentBeatmap ? this.currentBeatmap.theme : null;

      this.renderer.render(this.currentTime, this.beats, travelTime, this.combo, theme);
      this.rhythmBar.render(this.currentTime, this.beats, travelTime, bpm);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Inicializa o jogo ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  window.game = new ShinobiRhythmGame();
});
