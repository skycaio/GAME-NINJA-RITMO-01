// js/renderer.js - Motor Gráfico Canvas 2D (Cenário Japonês, Ninja, Inimigos, Animações e Partículas)

class GameRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;

    // Estado do Ninja
    this.ninja = {
      x: 220,
      y: 0, // calculado no resize (linha do chão)
      state: 'idle', // 'idle', 'slash1', 'slash2', 'slash3', 'hurt'
      stateTimer: 0,
      scarfPoints: [], // Pontos para a física do cachecol
      swordGlow: 0
    };

    // Coleções visuais
    this.enemies = []; // Inimigos ativos no cenário
    this.slicedParts = []; // Metades de inimigos cortados em combate
    this.particles = []; // Faíscas de lâmina e impactos
    this.sakuraPetals = []; // Pétalas de cerejeira caindo
    this.slashTrails = []; // Arcos luminosos de corte de katana
    this.floatingTexts = []; // Julgamentos flutuantes (PERFEITO, BOM, ERRO)

    // Efeito de trepidação de tela (Screen Shake)
    this.trauma = 0;

    // Inicializa física do cachecol
    for (let i = 0; i < 8; i++) {
      this.ninja.scarfPoints.push({ x: 0, y: 0 });
    }

    this.resize();
    this.initSakuraPetals();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    // Ajusta a posição do ninja relativo à largura disponível (deslocado à direita do painel vertical)
    this.groundY = this.height * 0.68;
    this.ninja.x = Math.max(330, this.width * 0.35);
    this.ninja.y = this.groundY;
  }

  initSakuraPetals() {
    this.sakuraPetals = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      this.sakuraPetals.push({
        x: Math.random() * (this.width || 1200),
        y: Math.random() * (this.height || 800),
        size: Math.random() * 6 + 4,
        speedX: Math.random() * 2 + 1.2,
        speedY: Math.random() * 1.5 + 0.8,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.04 + 0.02,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        alpha: Math.random() * 0.5 + 0.4
      });
    }
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  // Adiciona animação de corte de espada do ninja adaptada para a altura da trilha
  triggerNinjaSlash(slashIndex = 1, isPerfect = false, lane = 1) {
    this.ninja.state = `slash${((slashIndex - 1) % 3) + 1}`;
    this.ninja.stateTimer = 0.22; // Duração da pose de golpe
    this.ninja.swordGlow = 1.0;

    const startX = this.ninja.x + 20;
    // Ajusta o ponto Y do golpe baseado na trilha: 0: Corte Alto, 1: Corte Médio, 2: Corte Baixo
    const laneOffset = lane === 0 ? -65 : (lane === 2 ? -15 : -45);
    const startY = this.ninja.y + laneOffset;
    const endX = this.ninja.x + 130;
    const endY = this.ninja.y + laneOffset + (lane === 0 ? -30 : (lane === 2 ? 20 : 0));

    // Adiciona arco de luz de corte
    this.slashTrails.push({
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY,
      controlX: (startX + endX) / 2 + (Math.random() * 20 - 10),
      controlY: (startY + endY) / 2 - (lane === 0 ? 35 : (lane === 2 ? -25 : 10)),
      color: isPerfect ? '#ffcf40' : (lane === 0 ? '#ffcf40' : (lane === 2 ? '#ff2a5f' : '#00f0ff')),
      alpha: 1.0,
      width: isPerfect ? 7.5 : 5.0
    });

    // Cria faíscas de golpe de espada
    const sparkCount = isPerfect ? 24 : 14;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = Math.random() * 7 + 4;
      this.particles.push({
        x: endX - 20,
        y: (startY + endY) / 2,
        vx: Math.cos(angle) * speed * (Math.random() > 0.3 ? 1 : -0.5),
        vy: Math.sin(angle) * speed - 2,
        color: isPerfect ? (Math.random() > 0.3 ? '#ffcf40' : '#ffffff') : (lane === 0 ? '#ffcf40' : (lane === 2 ? '#ff2a5f' : '#00f0ff')),
        radius: Math.random() * 3.5 + 1.5,
        alpha: 1.0,
        life: 0.35 + Math.random() * 0.2
      });
    }

    this.addTrauma(isPerfect ? 0.35 : 0.2);
  }

  triggerNinjaHurt() {
    this.ninja.state = 'hurt';
    this.ninja.stateTimer = 0.3;
    this.addTrauma(0.5);

    // Partículas de impacto negativo
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: this.ninja.x,
        y: this.ninja.y - 40,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        color: '#ff2a5f',
        radius: Math.random() * 4 + 2,
        alpha: 1.0,
        life: 0.4
      });
    }
  }

  // Corta o inimigo em duas metades com respingos de tinta sumi-e e faíscas
  sliceEnemy(enemy, isPerfect = false) {
    const x = enemy.x;
    const y = enemy.y;

    // Metade superior desliza para cima e para a direita
    this.slicedParts.push({
      x: x,
      y: y,
      vx: 3.5,
      vy: -4.5,
      rot: 0,
      rotSpeed: 0.12,
      part: 'top',
      type: enemy.type,
      alpha: 1.0
    });

    // Metade inferior cai e desliza
    this.slicedParts.push({
      x: x,
      y: y,
      vx: -1.2,
      vy: 1.5,
      rot: 0,
      rotSpeed: -0.05,
      part: 'bottom',
      type: enemy.type,
      alpha: 1.0
    });

    // Respingo de tinta preta e faíscas brilhantes
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y - 35,
        vx: (Math.random() - 0.3) * 8,
        vy: (Math.random() - 0.8) * 8,
        color: Math.random() > 0.4 ? (isPerfect ? '#ffcf40' : '#ff2a5f') : '#111116',
        radius: Math.random() * 4 + 2,
        alpha: 1.0,
        life: 0.45
      });
    }
  }

  // Exibe texto flutuante de julgamento
  addFloatingText(text, isPerfect, isMiss) {
    const color = isMiss ? '#ff2a5f' : (isPerfect ? '#ffcf40' : '#00f0ff');
    this.floatingTexts.push({
      text: text,
      x: this.ninja.x + 80,
      y: this.ninja.y - 90,
      color: color,
      scale: 1.5,
      alpha: 1.0,
      vy: -1.8
    });
  }

  update(dt, currentTime) {
    // 1. Atualiza estado do Ninja
    if (this.ninja.stateTimer > 0) {
      this.ninja.stateTimer -= dt;
      if (this.ninja.stateTimer <= 0) {
        this.ninja.state = 'idle';
      }
    }
    this.ninja.swordGlow = Math.max(0, this.ninja.swordGlow - dt * 2.5);

    // Física do cachecol ninja esvoaçante
    const headX = this.ninja.x - 12;
    const headY = this.ninja.y - 62;
    this.ninja.scarfPoints[0] = { x: headX, y: headY };
    for (let i = 1; i < this.ninja.scarfPoints.length; i++) {
      const prev = this.ninja.scarfPoints[i - 1];
      const curr = this.ninja.scarfPoints[i];
      const wind = Math.sin(currentTime * 6 + i * 0.7) * 3 - 6; // Vento soprando para trás
      curr.x += (prev.x + wind - curr.x) * 16 * dt;
      curr.y += (prev.y + Math.cos(currentTime * 5 + i * 0.5) * 2 + 1 - curr.y) * 16 * dt;
    }

    // 2. Atualiza trepidação de tela
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
    }

    // 3. Atualiza metades cortadas de inimigos
    for (let i = this.slicedParts.length - 1; i >= 0; i--) {
      const p = this.slicedParts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += dt * 18; // Gravidade
      p.rot += p.rotSpeed;
      p.alpha -= dt * 1.8;
      if (p.alpha <= 0) {
        this.slicedParts.splice(i, 1);
      }
    }

    // 4. Atualiza partículas de corte e faíscas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += dt * 10;
      p.alpha -= dt / p.life;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 5. Atualiza arcos de lâmina
    for (let i = this.slashTrails.length - 1; i >= 0; i--) {
      const trail = this.slashTrails[i];
      trail.alpha -= dt * 4.5;
      if (trail.alpha <= 0) {
        this.slashTrails.splice(i, 1);
      }
    }

    // 6. Atualiza textos de julgamento flutuantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.scale = Math.max(1.0, ft.scale - dt * 2.0);
      ft.alpha -= dt * 1.5;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 7. Atualiza pétalas de sakura caindo
    for (let i = 0; i < this.sakuraPetals.length; i++) {
      const p = this.sakuraPetals[i];
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 1.5;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      // Reseta pétala quando sai da tela
      if (p.y > this.height + 20 || p.x > this.width + 20) {
        p.y = -20;
        p.x = Math.random() * (this.width + 200) - 200;
      }
    }
  }

  render(currentTime, activeBeats, travelTime, combo = 0, currentTheme = null) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // Aplica Screen Shake baseado no trauma
    if (this.trauma > 0) {
      const shakeAmt = this.trauma * this.trauma * 16;
      const offsetX = (Math.random() - 0.5) * shakeAmt;
      const offsetY = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(offsetX, offsetY);
    }

    ctx.clearRect(-20, -20, w + 40, h + 40);

    // 1. Céu noturno e elementos do fundo (Parallax) com tema dinâmico
    this.renderBackground(ctx, w, h, currentTime, currentTheme);

    // 2. Ponte de combate e lanternas
    this.renderStage(ctx, w, h, currentTime);

    // 3. Inimigos marchando no ritmo da música
    this.renderEnemies(ctx, currentTime, activeBeats, travelTime);

    // 4. Metades cortadas de inimigos derrotados
    this.renderSlicedParts(ctx);

    // 5. Ninja Protagonista
    this.renderNinja(ctx, currentTime);

    // 6. Arcos de corte de lâmina da Katana
    this.renderSlashTrails(ctx);

    // 7. Partículas e faíscas
    this.renderParticles(ctx);

    // 8. Pétalas e partículas temáticas da fase
    this.renderSakuraPetals(ctx, currentTheme);

    // 9. Textos de Julgamento flutuantes
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  renderBackground(ctx, w, h, currentTime, currentTheme = null) {
    // Gradiente do céu noturno com tema da fase
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (currentTheme) {
      skyGrad.addColorStop(0, currentTheme.skyTop || '#090714');
      skyGrad.addColorStop(0.55, currentTheme.skyMid || '#19152b');
      skyGrad.addColorStop(1, currentTheme.skyBottom || '#0e0b1c');
    } else {
      skyGrad.addColorStop(0, '#090714');
      skyGrad.addColorStop(0.55, '#19152b');
      skyGrad.addColorStop(1, '#0e0b1c');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Estrelas fixas e cintilantes
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const starX = (i * 12347) % w;
      const starY = (i * 8761) % (h * 0.45);
      const twinkle = Math.sin(currentTime * 3 + i) * 0.4 + 0.6;
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillRect(starX, starY, (i % 3 === 0) ? 2.5 : 1.5, (i % 3 === 0) ? 2.5 : 1.5);
    }
    ctx.globalAlpha = 1.0;

    // Grande Lua Carmesim/Dourada com halo místico baseado na fase
    const moonX = w * 0.76;
    const moonY = h * 0.28;
    const moonR = Math.min(100, w * 0.1);

    // Halo da lua
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.6, moonX, moonY, moonR * 2.2);
    moonGlow.addColorStop(0, currentTheme ? (currentTheme.moonGlow || 'rgba(255, 42, 95, 0.4)') : 'rgba(255, 42, 95, 0.4)');
    moonGlow.addColorStop(0.5, 'rgba(255, 120, 80, 0.15)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Disco da Lua
    const moonDisc = ctx.createRadialGradient(moonX - 25, moonY - 25, 10, moonX, moonY, moonR);
    if (currentTheme && currentTheme.moonDisc) {
      moonDisc.addColorStop(0, currentTheme.moonDisc[0]);
      moonDisc.addColorStop(0.7, currentTheme.moonDisc[1]);
      moonDisc.addColorStop(1, currentTheme.moonDisc[2]);
    } else {
      moonDisc.addColorStop(0, '#fff5eb');
      moonDisc.addColorStop(0.7, '#ff8a7a');
      moonDisc.addColorStop(1, '#d82148');
    }
    ctx.fillStyle = moonDisc;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Silhueta distante do Monte Fuji
    ctx.fillStyle = (currentTheme && currentTheme.mountainColor) ? currentTheme.mountainColor : '#141224';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, this.groundY);
    ctx.lineTo(w * 0.58, h * 0.35);
    ctx.lineTo(w * 0.62, h * 0.35);
    ctx.lineTo(w * 0.8, this.groundY);
    ctx.closePath();
    ctx.fill();

    // Neve no topo do Monte Fuji
    ctx.fillStyle = 'rgba(230, 240, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h * 0.42);
    ctx.lineTo(w * 0.58, h * 0.35);
    ctx.lineTo(w * 0.62, h * 0.35);
    ctx.lineTo(w * 0.65, h * 0.42);
    ctx.closePath();
    ctx.fill();

    // Silhueta de Templo Pagode Japonês à esquerda
    this.renderPagodaSilhouette(ctx, w * 0.05, this.groundY);

    // Silhueta de Portão Torii no horizonte à direita
    this.renderToriiSilhouette(ctx, w * 0.88, this.groundY);
  }

  renderPagodaSilhouette(ctx, x, baseY) {
    ctx.fillStyle = '#100e1c';
    const levels = 3;
    let currY = baseY;
    let width = 90;

    for (let i = 0; i < levels; i++) {
      const roofH = 14;
      const bodyH = 22;

      // Telhado oriental curvado
      ctx.beginPath();
      ctx.moveTo(x - width / 2 - 12, currY - bodyH);
      ctx.quadraticCurveTo(x, currY - bodyH - roofH, x + width / 2 + 12, currY - bodyH);
      ctx.lineTo(x + width / 2 - 8, currY - bodyH - roofH + 6);
      ctx.quadraticCurveTo(x, currY - bodyH - roofH + 2, x - width / 2 + 8, currY - bodyH - roofH + 6);
      ctx.closePath();
      ctx.fill();

      // Corpo do nível
      ctx.fillRect(x - width / 2 + 10, currY - bodyH, width - 20, bodyH);

      currY -= (bodyH + roofH - 4);
      width *= 0.82;
    }
  }

  renderToriiSilhouette(ctx, x, baseY) {
    ctx.fillStyle = '#131122';
    const toriiW = 75;
    const toriiH = 95;

    // Colunas verticais
    ctx.fillRect(x - toriiW / 2 + 10, baseY - toriiH, 9, toriiH);
    ctx.fillRect(x + toriiW / 2 - 19, baseY - toriiH, 9, toriiH);

    // Vigas horizontais
    ctx.fillRect(x - toriiW / 2, baseY - toriiH + 8, toriiW, 8);
    // Viga superior curvada
    ctx.beginPath();
    ctx.moveTo(x - toriiW / 2 - 10, baseY - toriiH);
    ctx.quadraticCurveTo(x, baseY - toriiH - 6, x + toriiW / 2 + 10, baseY - toriiH);
    ctx.lineTo(x + toriiW / 2 + 8, baseY - toriiH + 7);
    ctx.quadraticCurveTo(x, baseY - toriiH + 2, x - toriiW / 2 - 8, baseY - toriiH + 7);
    ctx.closePath();
    ctx.fill();
  }

  renderStage(ctx, w, h, currentTime) {
    const gy = this.groundY;

    // Piso de madeira de ponte / pátio do templo
    const floorGrad = ctx.createLinearGradient(0, gy, 0, h);
    floorGrad.addColorStop(0, '#1d1726');
    floorGrad.addColorStop(0.15, '#120f1a');
    floorGrad.addColorStop(1, '#08070d');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, gy, w, h - gy);

    // Tábua da borda da ponte iluminada
    ctx.strokeStyle = '#ffcf40';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();

    // Vigas de apoio da ponte
    ctx.fillStyle = '#161320';
    for (let x = 40; x < w; x += 110) {
      ctx.fillRect(x, gy, 12, h - gy);
    }

    // Lanternas de papel vermelhas suspensas oscilando suavemente
    const lanternSwing = Math.sin(currentTime * 2.5) * 4;
    this.renderPaperLantern(ctx, w * 0.15, gy - 120 + lanternSwing);
    this.renderPaperLantern(ctx, w * 0.42, gy - 130 - lanternSwing * 0.8);
    this.renderPaperLantern(ctx, w * 0.72, gy - 125 + lanternSwing * 0.6);

    // Névoa rasteira translúcida sobre o solo
    const mistGrad = ctx.createLinearGradient(0, gy - 35, 0, gy + 15);
    mistGrad.addColorStop(0, 'rgba(180, 200, 255, 0)');
    mistGrad.addColorStop(0.6, 'rgba(140, 160, 220, 0.12)');
    mistGrad.addColorStop(1, 'rgba(100, 120, 180, 0)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, gy - 35, w, 50);
  }

  renderPaperLantern(ctx, x, y) {
    // Corda da lanterna
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Brilho quente da lanterna
    const glow = ctx.createRadialGradient(x, y + 16, 4, x, y + 16, 45);
    glow.addColorStop(0, 'rgba(255, 90, 50, 0.5)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y + 16, 45, 0, Math.PI * 2);
    ctx.fill();

    // Corpo da lanterna vermelha japonesa
    ctx.fillStyle = '#e62b48';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 12, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Topo e base pretos
    ctx.fillStyle = '#111';
    ctx.fillRect(x - 9, y - 2, 18, 5);
    ctx.fillRect(x - 8, y + 31, 16, 4);

    // Franja inferior
    ctx.strokeStyle = '#ffcf40';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 35);
    ctx.lineTo(x, y + 46);
    ctx.stroke();
  }

  renderNinja(ctx, currentTime) {
    const n = this.ninja;
    const x = n.x;
    const y = n.y;
    const isHurt = n.state === 'hurt';
    const isSlashing = n.state.startsWith('slash');

    ctx.save();
    ctx.translate(x, y);

    // Sombra do Ninja no chão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isHurt) {
      ctx.shadowColor = '#ff2a5f';
      ctx.shadowBlur = 15;
    }

    // 1. Pernas em postura de combate (Shinobi Kamae)
    ctx.fillStyle = '#12141f'; // Tecido escuro shinobi
    if (isSlashing) {
      // Posição de avanço rápido para ataque
      ctx.fillRect(-20, -28, 12, 28);
      ctx.fillRect(8, -25, 12, 25);
    } else {
      // Postura agachada de prontidão
      ctx.fillRect(-18, -26, 11, 26);
      ctx.fillRect(4, -26, 11, 26);
    }

    // Faixas douradas nas canelas (Kyahan)
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-18, -12, 11, 3);
    ctx.fillRect(4, -12, 11, 3);

    // 2. Tronco / Armadura Shinobi
    const breathe = Math.sin(currentTime * 4) * 2;
    const bodyY = isSlashing ? -52 : -50 + breathe;

    ctx.fillStyle = '#1c1f2e';
    ctx.beginPath();
    ctx.moveTo(-16, bodyY + 26);
    ctx.lineTo(-18, bodyY);
    ctx.lineTo(16, bodyY);
    ctx.lineTo(14, bodyY + 26);
    ctx.closePath();
    ctx.fill();

    // Faixa vermelha na cintura (Obi)
    ctx.fillStyle = '#ff2a5f';
    ctx.fillRect(-15, bodyY + 21, 29, 6);

    // 3. Cachecol Vermelho Shinobi com ondulação física
    this.renderNinjaScarf(ctx, x, y);

    // 4. Cabeça e Máscara Ninja (Hachigane e Menpo)
    const headY = bodyY - 14;
    ctx.fillStyle = '#12141f';
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Viseira/Olhos afiados focados
    ctx.fillStyle = '#ffcf40';
    ctx.shadowColor = '#ffcf40';
    ctx.shadowBlur = 6;
    ctx.fillRect(-2, headY - 3, 9, 3);
    ctx.shadowBlur = 0;

    // Placa metálica na testa (Hachigane)
    ctx.fillStyle = '#7a8296';
    ctx.fillRect(-10, headY - 10, 18, 4);

    // 5. Braços e Lâmina de Katana
    this.renderNinjaKatana(ctx, bodyY, n.state, n.swordGlow);

    ctx.restore();
  }

  renderNinjaScarf(ctx, parentX, parentY) {
    const pts = this.ninja.scarfPoints;
    if (pts.length < 2) return;

    ctx.save();
    // Move para coordenadas relativas da cabeça do ninja
    ctx.strokeStyle = '#ff2a5f';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#ff2a5f';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(pts[0].x - parentX, pts[0].y - parentY);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x - parentX, pts[i].y - parentY);
    }
    ctx.stroke();

    // Linha dourada central no cachecol
    ctx.strokeStyle = '#ffcf40';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(pts[0].x - parentX, pts[0].y - parentY);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x - parentX, pts[i].y - parentY);
    }
    ctx.stroke();

    ctx.restore();
  }

  renderNinjaKatana(ctx, bodyY, state, glow) {
    ctx.save();

    if (state === 'slash1') {
      // Corte horizontal rápido frontal
      ctx.translate(15, bodyY + 12);
      ctx.rotate(-0.2);

      // Braço estendido
      ctx.fillStyle = '#1c1f2e';
      ctx.fillRect(0, -6, 28, 10);

      // Cabo da Katana (Tsuka)
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(26, -5, 12, 6);
      ctx.fillStyle = '#111';
      ctx.fillRect(36, -9, 3, 14); // Tsuba (guarda)

      // Lâmina de aço brilhante (Katana)
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = glow > 0 ? '#ffcf40' : '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(39, -5);
      ctx.lineTo(95, -7);
      ctx.lineTo(105, -3);
      ctx.lineTo(39, -1);
      ctx.closePath();
      ctx.fill();
    } else if (state === 'slash2') {
      // Corte ascendente em arco
      ctx.translate(10, bodyY + 10);
      ctx.rotate(-1.1);

      ctx.fillStyle = '#1c1f2e';
      ctx.fillRect(0, -6, 26, 10);

      ctx.fillStyle = '#d4af37';
      ctx.fillRect(24, -5, 12, 6);
      ctx.fillStyle = '#111';
      ctx.fillRect(34, -9, 3, 14);

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffcf40';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(37, -5);
      ctx.lineTo(92, -6);
      ctx.lineTo(100, -2);
      ctx.lineTo(37, -1);
      ctx.closePath();
      ctx.fill();
    } else {
      // Postura de guarda (Katana embainhada ou pronta para desembainhar em Iaijutsu)
      ctx.translate(-5, bodyY + 15);
      ctx.rotate(0.65);

      // Bainha da Katana (Saya) na cintura
      ctx.fillStyle = '#2a1a1f';
      ctx.fillRect(-22, -4, 46, 6);

      // Empunhadura dourada (Tsuka)
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(20, -5, 14, 7);
      ctx.fillStyle = '#ff2a5f';
      ctx.fillRect(23, -5, 3, 7);
      ctx.fillRect(28, -5, 3, 7);

      // Mão do ninja na empunhadura
      ctx.fillStyle = '#1c1f2e';
      ctx.beginPath();
      ctx.arc(24, -2, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Renderiza inimigos no campo de combate que estão se aproximando no ritmo
  renderEnemies(ctx, currentTime, beats, travelTime) {
    const gy = this.groundY;
    const targetX = this.ninja.x + 80; // Ponto de encontro onde o ninja corta o inimigo
    const spawnX = this.width + 40;

    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      if (beat.hit || beat.missed) continue;

      const timeRemaining = beat.time - currentTime;
      if (timeRemaining > travelTime || timeRemaining < -0.15) continue;

      // Interpola a posição do inimigo da direita em direção ao ponto de impacto
      const progress = 1 - (timeRemaining / travelTime);
      const enemyX = targetX + (1 - progress) * (spawnX - targetX);

      // Altura baseada na lane: 0 (Aéreo/Salto), 1 (Padrão/Médio), 2 (Rasteiro/Agachado)
      const lane = beat.lane || 0;
      const laneYOffset = lane === 0 ? -40 : (lane === 2 ? 8 : 0);
      const enemyY = gy + laneYOffset;

      this.drawEnemy(ctx, enemyX, enemyY, beat.type, currentTime, beat.time, lane);
    }
  }

  drawEnemy(ctx, x, y, type, currentTime, beatTime, lane = 1) {
    ctx.save();
    ctx.translate(x, y);

    // Sombra no chão (posicionada no chão mesmo se o inimigo saltar)
    const groundDistance = this.groundY - y;
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.15, 0.5 - groundDistance * 0.005)})`;
    ctx.beginPath();
    ctx.ellipse(0, groundDistance, Math.max(12, 30 - groundDistance * 0.2), 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animação de corrida no ritmo (passos saltitantes)
    const runCycle = Math.sin((currentTime - beatTime) * 16) * 5;

    if (type === 'heavy') {
      // Samurai Shogun Oni Pesado com Chifres Dourados
      this.drawOniSamurai(ctx, runCycle);
    } else if (type === 'fast') {
      // Shinobi das Sombras com Kunai Dupla
      this.drawShadowShinobi(ctx, runCycle);
    } else {
      // Samurai Ronin padrão com Armadura
      this.drawStandardSamurai(ctx, runCycle);
    }

    ctx.restore();
  }

  drawStandardSamurai(ctx, runCycle) {
    // Pernas correndo
    ctx.fillStyle = '#2d1820';
    ctx.fillRect(-15, -28 + runCycle, 11, 28 - runCycle);
    ctx.fillRect(4, -28 - runCycle, 11, 28 + runCycle);

    // Armadura vermelha samurai (Do)
    ctx.fillStyle = '#8f1d2c';
    ctx.fillRect(-16, -55, 30, 28);
    // Placas de armadura horizontais
    ctx.fillStyle = '#ffcf40';
    ctx.fillRect(-16, -48, 30, 3);
    ctx.fillRect(-16, -38, 30, 3);

    // Elmo Samurai (Kabuto) com crista
    ctx.fillStyle = '#1c1518';
    ctx.beginPath();
    ctx.arc(0, -66, 14, 0, Math.PI * 2);
    ctx.fill();

    // Crista do elmo dourada em crescente (Maedate)
    ctx.fillStyle = '#ffcf40';
    ctx.beginPath();
    ctx.arc(0, -78, 12, 0.4, Math.PI - 0.4, false);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffcf40';
    ctx.stroke();

    // Espada desembainhada apontada para o ninja
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff2a5f';
    ctx.shadowBlur = 8;
    ctx.fillRect(-55, -45, 45, 5);
    ctx.fillStyle = '#ffcf40';
    ctx.fillRect(-12, -47, 5, 9); // Guarda
  }

  drawShadowShinobi(ctx, runCycle) {
    // Shinobi rápido com capa preta esvoaçante
    ctx.fillStyle = '#0f1118';
    ctx.fillRect(-12, -26 + runCycle, 9, 26 - runCycle);
    ctx.fillRect(3, -26 - runCycle, 9, 26 + runCycle);

    // Capa/Manto
    ctx.fillStyle = '#181b29';
    ctx.beginPath();
    ctx.moveTo(-12, -50);
    ctx.lineTo(12, -50);
    ctx.lineTo(22 + runCycle, -24);
    ctx.lineTo(-18, -24);
    ctx.closePath();
    ctx.fill();

    // Máscara com olhos amarelos faiscantes
    ctx.fillStyle = '#0a0b10';
    ctx.beginPath();
    ctx.arc(0, -60, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcf40';
    ctx.fillRect(-8, -62, 5, 3);

    // Kunai afiada
    ctx.fillStyle = '#c0d0e0';
    ctx.beginPath();
    ctx.moveTo(-35, -42);
    ctx.lineTo(-15, -46);
    ctx.lineTo(-15, -38);
    ctx.closePath();
    ctx.fill();
  }

  drawOniSamurai(ctx, runCycle) {
    // Armadura colossal demoníaca
    ctx.fillStyle = '#15080c';
    ctx.fillRect(-20, -32 + runCycle, 15, 32 - runCycle);
    ctx.fillRect(6, -32 - runCycle, 15, 32 + runCycle);

    // Placas de armadura negra com detalhes em carmesim
    ctx.fillStyle = '#4a0e17';
    ctx.fillRect(-22, -68, 42, 38);
    ctx.fillStyle = '#ff2a5f';
    ctx.fillRect(-22, -58, 42, 4);

    // Máscara Oni Vermelha com Presas e Chifres
    ctx.fillStyle = '#d01438';
    ctx.beginPath();
    ctx.arc(0, -82, 17, 0, Math.PI * 2);
    ctx.fill();

    // Chifres brancos
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-12, -88);
    ctx.lineTo(-24, -108);
    ctx.lineTo(-6, -92);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, -88);
    ctx.lineTo(24, -108);
    ctx.lineTo(6, -92);
    ctx.closePath();
    ctx.fill();

    // Grande Lâmina Nodachi Sangrenta
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff003c';
    ctx.shadowBlur = 15;
    ctx.fillRect(-75, -55, 60, 8);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-18, -60, 8, 18);
  }

  renderSlicedParts(ctx) {
    for (let i = 0; i < this.slicedParts.length; i++) {
      const p = this.slicedParts[i];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.alpha);

      ctx.fillStyle = '#8f1d2c';
      if (p.part === 'top') {
        // Metade superior cortada diagonalmente
        ctx.beginPath();
        ctx.moveTo(-16, -55);
        ctx.lineTo(16, -55);
        ctx.lineTo(14, -30);
        ctx.lineTo(-18, -42);
        ctx.closePath();
        ctx.fill();

        // Cabeça
        ctx.fillStyle = '#1c1518';
        ctx.beginPath();
        ctx.arc(0, -66, 13, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Metade inferior
        ctx.beginPath();
        ctx.moveTo(-18, -42);
        ctx.lineTo(14, -30);
        ctx.lineTo(12, -2);
        ctx.lineTo(-14, -2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  renderSlashTrails(ctx) {
    for (let i = 0; i < this.slashTrails.length; i++) {
      const t = this.slashTrails[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = t.width;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 18;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.quadraticCurveTo(t.controlX, t.controlY, t.x2, t.y2);
      ctx.stroke();

      ctx.restore();
    }
  }

  renderParticles(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  renderSakuraPetals(ctx, currentTheme = null) {
    const petalType = currentTheme?.petalType || 'sakura';
    let fill = '#ffb7c5';
    let isGlowCircle = false;

    if (petalType === 'leaf') {
      fill = '#2ed573'; // Folhas verdes de bambu
    } else if (petalType === 'mist') {
      fill = '#7efff5'; // Gotas de névoa ciano
    } else if (petalType === 'ember') {
      fill = '#ff793f'; // Brasas laranja
      isGlowCircle = true;
    } else if (petalType === 'spirit') {
      fill = '#a29bfe'; // Orbes espirituais violetas
      isGlowCircle = true;
    } else if (petalType === 'gold') {
      fill = '#ffd32a'; // Faíscas douradas
    } else if (petalType === 'wind') {
      fill = '#4bcffa'; // Fragmentos de vendaval azul
    } else if (petalType === 'magma') {
      fill = '#ff3838'; // Brasas vulcânicas
      isGlowCircle = true;
    } else if (petalType === 'shadow') {
      fill = '#be2edd'; // Fragmentos sombrios
    } else if (petalType === 'bloodMoon') {
      fill = '#ff0055'; // Pétalas de sangue
    }

    for (let i = 0; i < this.sakuraPetals.length; i++) {
      const p = this.sakuraPetals[i];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = fill;

      if (isGlowCircle) {
        ctx.shadowColor = fill;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  renderFloatingTexts(ctx) {
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);
      ctx.globalAlpha = Math.max(0, ft.alpha);

      ctx.font = '900 24px "Cinzel", "Noto Sans JP", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 16;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }
  }
}
