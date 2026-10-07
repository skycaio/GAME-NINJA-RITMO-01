// js/rhythm_bar.js - Renderização e Lógica da Barra Visual de Ritmo Vertical em 3 Colunas no Canto

class RhythmBar {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.targetY = 0; // Posição Y da zona de impacto na base das colunas

    // Configuração das 3 Colunas Verticais (Esquerda, Centro, Direita)
    this.laneCount = 3;
    this.laneX = [0, 0, 0]; // Calculado dinamicamente no resize
    this.pulseScale = [1.0, 1.0, 1.0]; // Pulso individual para cada selo

    // Metadados visuais de cada Coluna
    this.laneMeta = [
      {
        id: 0,
        name: 'ESQUERDA',
        kanji: '斬', // ZAN (Corte Superior / Esquerda)
        color: '#ffcf40', // Dourado
        glow: 'rgba(255, 207, 64, 0.45)',
        keyLabel: 'A / Z / 1 / ←'
      },
      {
        id: 1,
        name: 'CENTRO',
        kanji: '刃', // JIN (Lâmina / Meio)
        color: '#00f0ff', // Ciano
        glow: 'rgba(0, 240, 255, 0.45)',
        keyLabel: 'S / X / 2 / ESPAÇO'
      },
      {
        id: 2,
        name: 'DIREITA',
        kanji: '滅', // METSU (Aniquilação / Direita)
        color: '#ff2a5f', // Carmesim
        glow: 'rgba(255, 42, 95, 0.45)',
        keyLabel: 'D / C / 3 / →'
      }
    ];

    this.hitEffects = []; // Efeitos visuais de impacto nos selos

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    // Ajusta a linha de impacto na parte inferior das colunas com espaçamento adequado
    this.targetY = this.height - 52;

    // Calcula a posição X central de cada uma das 3 colunas verticais
    const colWidth = this.width / 3;
    this.laneX = [
      colWidth * 0.5,
      colWidth * 1.5,
      colWidth * 2.5
    ];
  }

  // Identifica qual coluna vertical foi clicada ou tocada na tela
  getLaneFromX(clientX) {
    if (!this.canvas) return 1;
    const rect = this.canvas.getBoundingClientRect();
    const relX = clientX - rect.left;
    const normalizedX = relX / rect.width;

    if (normalizedX < 0.333) return 0; // Coluna 1 (Esquerda)
    if (normalizedX < 0.666) return 1; // Coluna 2 (Centro)
    return 2; // Coluna 3 (Direita)
  }

  // Compatibilidade com método anterior
  getLaneFromY(clientY) {
    return 1;
  }

  // Dispara animação de impacto na zona de corte da coluna correspondente
  triggerHitFeedback(judgmentType, lane = 1) {
    const safeLane = Math.max(0, Math.min(2, lane));
    const targetX = this.laneX[safeLane] || this.width / 2;
    const targetY = this.targetY;
    const color = judgmentType === 'PERFEITO' ? '#ffcf40' : (judgmentType === 'BOM' ? '#00f0ff' : '#ff2a5f');

    this.pulseScale[safeLane] = 1.45;

    // Anéis de choque expansivos
    this.hitEffects.push({
      x: targetX,
      y: targetY,
      lane: safeLane,
      radius: 18,
      maxRadius: 50,
      alpha: 1.0,
      color: color,
      type: 'ring'
    });

    // Partículas cintilantes que explodem na direção do impacto
    const count = judgmentType === 'PERFEITO' ? 14 : 7;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = Math.random() * 3.5 + 2;
      this.hitEffects.push({
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: Math.random() * 2.5 + 1.5,
        alpha: 1.0,
        color: color,
        type: 'particle'
      });
    }
  }

  update(dt) {
    // Retração suave do pulso dos selos das 3 colunas
    for (let i = 0; i < this.laneCount; i++) {
      if (this.pulseScale[i] > 1.0) {
        this.pulseScale[i] = Math.max(1.0, this.pulseScale[i] - dt * 3.5);
      }
    }

    // Atualiza partículas e anéis de feedback
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      const fx = this.hitEffects[i];
      if (fx.type === 'ring') {
        fx.radius += (fx.maxRadius - fx.radius) * 12 * dt;
        fx.alpha -= dt * 3.5;
      } else if (fx.type === 'particle') {
        fx.x += fx.vx;
        fx.y += fx.vy;
        fx.alpha -= dt * 3.0;
      }

      if (fx.alpha <= 0) {
        this.hitEffects.splice(i, 1);
      }
    }
  }

  render(currentTime, activeBeats, travelTime, bpm) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Fundo com gradiente tecnológico samurai vertical
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, 'rgba(10, 8, 16, 0.88)');
    bgGrad.addColorStop(0.6, 'rgba(15, 14, 25, 0.94)');
    bgGrad.addColorStop(1, 'rgba(25, 12, 28, 0.98)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Divisores verticais sutis entre as 3 Colunas
    const colW = w / 3;
    for (let l = 1; l < 3; l++) {
      const divX = colW * l;
      ctx.strokeStyle = 'rgba(255, 207, 64, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(divX, 0);
      ctx.lineTo(divX, h);
      ctx.stroke();
    }

    // 3. Linhas guia de pulso e marcações de compasso verticais
    const beatInterval = 60 / bpm;
    const currentPhase = (currentTime % beatInterval) / beatInterval;
    const availableHeight = this.targetY;
    const beatSpacing = availableHeight / (travelTime / beatInterval);

    for (let l = 0; l < 3; l++) {
      const centerX = this.laneX[l];
      const meta = this.laneMeta[l];

      // Linha central guia vertical pulsante
      ctx.strokeStyle = meta.glow;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX, 10);
      ctx.lineTo(centerX, this.targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Marcações horizontais de batida no fundo descendo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (let y = 10; y < availableHeight; y += beatSpacing) {
        const offsetY = y + (currentPhase * beatSpacing);
        if (offsetY <= availableHeight) {
          ctx.fillRect(centerX - (colW * 0.38), offsetY - 1, colW * 0.76, 2);
        }
      }

      // Rótulo da tecla no topo da coluna
      ctx.font = '700 10px "Rajdhani", sans-serif';
      ctx.fillStyle = meta.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(meta.keyLabel.split(' / ')[0], centerX, 8);

      // 4. Selo de Corte da Coluna (Strike Zone na base)
      this.renderStrikeZone(ctx, centerX, this.targetY, l);
    }

    // Linha horizontal de impacto dos selos
    ctx.strokeStyle = 'rgba(255, 207, 64, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.targetY);
    ctx.lineTo(w, this.targetY);
    ctx.stroke();

    // 5. Marcadores de Ritmo em Movimento Descendente (Top -> Bottom)
    this.renderBeats(ctx, currentTime, activeBeats, travelTime);

    // 6. Efeitos Visuais de Impacto
    this.renderHitEffects(ctx);

    // 7. Moldura ornamental oriental externa
    ctx.strokeStyle = 'rgba(255, 207, 64, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2, 2, w - 4, h - 4);
  }

  renderStrikeZone(ctx, x, y, lane) {
    const meta = this.laneMeta[lane];
    const scale = this.pulseScale[lane];
    const baseR = 18 * scale;

    ctx.save();
    ctx.translate(x, y);

    // Brilho difuso da zona de corte
    const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, baseR * 1.5);
    glow.addColorStop(0, meta.glow);
    glow.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, baseR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Anel externo
    ctx.strokeStyle = meta.color;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, baseR, 0, Math.PI * 2);
    ctx.stroke();

    // Anel interno de mira
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(0, 0, baseR * 0.68, 0, Math.PI * 2);
    ctx.stroke();

    // Mira em cruz
    ctx.strokeStyle = meta.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -baseR - 2);
    ctx.lineTo(0, -baseR + 4);
    ctx.moveTo(0, baseR - 4);
    ctx.lineTo(0, baseR + 2);
    ctx.moveTo(-baseR - 2, 0);
    ctx.lineTo(-baseR + 4, 0);
    ctx.moveTo(baseR - 4, 0);
    ctx.lineTo(baseR + 2, 0);
    ctx.stroke();

    // Kanji de corte correspondente à coluna (斬, 刃, 滅)
    ctx.font = `900 ${Math.floor(13 * scale)}px "Noto Sans JP", sans-serif`;
    ctx.fillStyle = meta.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = meta.color;
    ctx.shadowBlur = 6;
    ctx.fillText(meta.kanji, 0, 1);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // Dispara faíscas contínuas enquanto o jogador está segurando a nota de Hold
  triggerHoldSpark(lane = 1) {
    const safeLane = Math.max(0, Math.min(2, lane));
    const targetX = this.laneX[safeLane] || this.width / 2;
    const targetY = this.targetY;
    const meta = this.laneMeta[safeLane];

    this.pulseScale[safeLane] = Math.max(this.pulseScale[safeLane], 1.25);

    for (let i = 0; i < 2; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.5;
      const speed = Math.random() * 4 + 2;
      this.hitEffects.push({
        x: targetX + (Math.random() - 0.5) * 8,
        y: targetY + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.5 + 1.2,
        alpha: 0.9,
        color: Math.random() > 0.3 ? meta.color : '#ffffff',
        type: 'particle'
      });
    }
  }

  renderBeats(ctx, currentTime, beats, travelTime) {
    const availableDistance = this.targetY;

    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      if (beat.hit || beat.missed) continue;

      const lane = (beat.lane !== undefined && beat.lane >= 0 && beat.lane < 3) ? beat.lane : 1;
      const targetX = this.laneX[lane];
      const isHold = beat.type === 'hold';

      if (isHold) {
        const duration = beat.duration || 0.6;
        const tailTime = beat.time + duration;
        const headTimeRemaining = beat.time - currentTime;
        const tailTimeRemaining = tailTime - currentTime;

        // Se a cauda já passou totalmente da janela
        if (tailTimeRemaining < -0.15) continue;
        // Se a cabeça ainda não entrou na barra
        if (headTimeRemaining > travelTime) continue;

        let headY, tailY;
        if (beat.holding) {
          // Cabeça fixada na linha de corte durante o hold
          headY = this.targetY;
          const tailProgress = 1 - (tailTimeRemaining / travelTime);
          tailY = Math.max(0, Math.min(this.targetY, tailProgress * availableDistance));
        } else {
          const headProgress = 1 - (headTimeRemaining / travelTime);
          const tailProgress = 1 - (tailTimeRemaining / travelTime);
          headY = Math.max(0, Math.min(this.targetY, headProgress * availableDistance));
          tailY = Math.max(0, Math.min(this.targetY, tailProgress * availableDistance));
        }

        // Desenha o feixe de raio de energia contínuo (Hold Beam)
        this.drawHoldBeam(ctx, targetX, headY, tailY, lane, beat.holding, currentTime);

        // Indicador de aproximação
        if (!beat.holding && headTimeRemaining > 0 && headTimeRemaining < 0.35) {
          const approachRadius = 18 + (headTimeRemaining / 0.35) * 25;
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - headTimeRemaining / 0.35})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(targetX, this.targetY, approachRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Desenha a cabeça do marcador de Hold
        this.drawBeatMarker(ctx, targetX, headY, 'hold', lane, currentTime, beat.holding);
      } else {
        const timeRemaining = beat.time - currentTime;

        if (timeRemaining < -0.15) continue;
        if (timeRemaining > travelTime) continue;

        const progress = 1 - (timeRemaining / travelTime);
        const beatY = progress * availableDistance;

        // Anel indicador de aproximação
        if (timeRemaining > 0 && timeRemaining < 0.35) {
          const approachRadius = 18 + (timeRemaining / 0.35) * 25;
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - timeRemaining / 0.35})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(targetX, this.targetY, approachRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Renderiza o marcador de ritmo descendo
        this.drawBeatMarker(ctx, targetX, beatY, beat.type, lane, currentTime);
      }
    }
  }

  drawHoldBeam(ctx, x, headY, tailY, lane, isHolding, currentTime) {
    if (tailY >= headY) return;

    ctx.save();
    const meta = this.laneMeta[lane] || this.laneMeta[1];
    const beamWidth = isHolding ? 18 : 14;

    // Brilho exterior do feixe
    ctx.shadowColor = meta.color;
    ctx.shadowBlur = isHolding ? 16 : 8;

    // Fita de energia com gradiente vertical
    const beamGrad = ctx.createLinearGradient(0, tailY, 0, headY);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    beamGrad.addColorStop(0.3, meta.glow);
    beamGrad.addColorStop(1, meta.color);

    // Corpo do feixe
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.roundRect(x - beamWidth / 2, tailY, beamWidth, headY - tailY, 6);
    ctx.fill();

    // Linha central de choque elétrico / raio de katana
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = isHolding ? 3.5 : 2;
    ctx.beginPath();
    ctx.moveTo(x, tailY);
    if (isHolding) {
      // Efeito de oscilação elétrica enquanto segura
      for (let y = tailY; y < headY; y += 15) {
        const offset = Math.sin(currentTime * 25 + y * 0.2) * 3;
        ctx.lineTo(x + offset, y + 7.5);
      }
    }
    ctx.lineTo(x, headY);
    ctx.stroke();

    // Nó terminal na cauda (topo do hold)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, tailY, isHolding ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBeatMarker(ctx, x, y, type, lane, currentTime, isHolding = false) {
    ctx.save();
    ctx.translate(x, y);

    const meta = this.laneMeta[lane] || this.laneMeta[1];
    let mainColor = meta.color;
    let secondaryColor = '#ffffff';
    let radius = 15;

    if (type === 'fast') {
      radius = 13;
      secondaryColor = '#ffffff';
    } else if (type === 'heavy') {
      radius = 18;
      mainColor = '#ff003c';
      secondaryColor = '#800020';
    } else if (type === 'hold') {
      radius = isHolding ? 19 : 16;
      mainColor = meta.color;
      secondaryColor = '#fff7b2';
    }

    // Brilho exterior do marcador
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = isHolding ? 18 : 10;

    // Corpo circular do marcador
    const markerGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
    markerGrad.addColorStop(0, secondaryColor);
    markerGrad.addColorStop(0.5, mainColor);
    markerGrad.addColorStop(1, 'rgba(20, 0, 10, 0.85)');
    ctx.fillStyle = markerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Borda brilhante
    ctx.strokeStyle = isHolding ? '#ffde59' : '#ffffff';
    ctx.lineWidth = isHolding ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Rotação estilizada de shuriken no centro
    const rot = currentTime * (isHolding ? 16 : 8);
    ctx.rotate(rot);

    if (type === 'heavy') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      for (let j = 0; j < 4; j++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.7);
        ctx.lineTo(2.5, 0);
        ctx.lineTo(0, radius * 0.7);
        ctx.stroke();
      }
    } else if (type === 'hold') {
      // Símbolo de raio / lâmina sustentada de 8 pontas
      ctx.fillStyle = '#ffffff';
      for (let j = 0; j < 8; j++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.75);
        ctx.lineTo(radius * 0.2, -radius * 0.2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-radius * 0.2, -radius * 0.2);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#ffffff';
      for (let j = 0; j < 4; j++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.75);
        ctx.lineTo(radius * 0.25, -radius * 0.25);
        ctx.lineTo(0, 0);
        ctx.lineTo(-radius * 0.25, -radius * 0.25);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  }

  renderHitEffects(ctx) {
    for (let i = 0; i < this.hitEffects.length; i++) {
      const fx = this.hitEffects[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, fx.alpha);

      if (fx.type === 'ring') {
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = fx.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (fx.type === 'particle') {
        ctx.fillStyle = fx.color;
        ctx.shadowColor = fx.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
