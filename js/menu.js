// js/menu.js — Menu Principal & Sistema de Configuração de Teclas

// =============================================
// CONFIGURAÇÕES DE TECLAS PADRÃO
// =============================================

const DEFAULT_KEYBINDS = {
  attack1: { code: 'KeyA',   label: 'A' },
  attack2: { code: 'KeyS',   label: 'S' },
  attack3: { code: 'KeyD',   label: 'D' },
  attack4: { code: 'Space',  label: 'Espaço' },
  attack5: { code: 'KeyZ',   label: 'Z' },
  pause:   { code: 'KeyP',   label: 'P' },
};

// Metadados de exibição para cada ação
const KEYBIND_META = {
  attack1: { name: '⚔ TRILHA SUPERIOR',  desc: 'Corte Alto (Trilha 1: A / Z / 1 / ↑)' },
  attack2: { name: '⚔ TRILHA MÉDIA',     desc: 'Corte Central (Trilha 2: S / X / 2 / Espaço)' },
  attack3: { name: '⚔ TRILHA INFERIOR',  desc: 'Corte Baixo (Trilha 3: D / C / 3 / ↓)' },
  attack4: { name: '⚔ CORTE CENTRAL 2',  desc: 'Tecla alternativa da trilha média' },
  attack5: { name: '⚔ CORTE SUPERIOR 2', desc: 'Tecla alternativa da trilha superior' },
  pause:   { name: '⏸ PAUSA',            desc: 'Pausar / Retomar o jogo' },
};

// =============================================
// CLASSE DE CONFIGURAÇÃO DE TECLAS
// =============================================

class KeybindManager {
  constructor() {
    this.binds = this._load();
  }

  _load() {
    try {
      const saved = localStorage.getItem('shinobi_keybinds_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_KEYBINDS };
        for (const key in parsed) {
          if (merged[key]) merged[key] = parsed[key];
        }
        return merged;
      }
    } catch (_) {}
    return { ...DEFAULT_KEYBINDS };
  }

  _save() {
    try {
      localStorage.setItem('shinobi_keybinds_v1', JSON.stringify(this.binds));
    } catch (_) {}
  }

  getLabelFor(action) {
    return this.binds[action]?.label ?? '?';
  }

  getCodeFor(action) {
    return this.binds[action]?.code ?? null;
  }

  set(action, code, label) {
    if (!this.binds[action]) return;
    this.binds[action] = { code, label };
    this._save();
  }

  resetToDefaults() {
    this.binds = { ...DEFAULT_KEYBINDS };
    this._save();
  }

  getAttackCodes() {
    return [
      this.binds.attack1?.code,
      this.binds.attack2?.code,
      this.binds.attack3?.code,
      this.binds.attack4?.code,
      this.binds.attack5?.code,
    ].filter(Boolean);
  }

  getPauseCode() {
    return this.binds.pause?.code ?? 'KeyP';
  }
}

// Instância global
const keybindManager = new KeybindManager();

// =============================================
// CLASSE DO MENU PRINCIPAL
// =============================================

class MainMenuController {
  constructor() {
    this.mainMenuModal   = document.getElementById('main-menu-modal');
    this.keybindModal    = document.getElementById('keybind-modal');
    this.menuModal       = document.getElementById('menu-modal');

    this.btnPlay         = document.getElementById('btn-main-play');
    this.btnKeybinds     = document.getElementById('btn-main-keybinds');
    this.btnQuit         = document.getElementById('btn-main-quit');

    this.btnKeybindBack  = document.getElementById('btn-keybind-back');
    this.btnKeybindReset = document.getElementById('btn-keybind-reset');
    this.keybindList     = document.getElementById('keybind-list');
    this.statusBar       = document.getElementById('keybind-status-bar');

    this._listeningAction = null;
    this._listeningBtn    = null;
    this._keyListener     = null;

    this._buildKeybindList();
    this._bindEvents();
  }

  // ---- Navegação ----

  showMainMenu() {
    this._setVisible(this.mainMenuModal, true);
    this._setVisible(this.keybindModal,  false);
    this._setVisible(this.menuModal,     false);
  }

  showPhaseSelector() {
    this._setVisible(this.mainMenuModal, false);
    this._setVisible(this.keybindModal,  false);
    this._setVisible(this.menuModal,     true);
  }

  showKeybindScreen() {
    this._refreshKeybindList();
    this._setVisible(this.keybindModal,  true);
    this._setVisible(this.mainMenuModal, false);
    this._setVisible(this.menuModal,     false);
    this._setStatus('Pronto', '');
  }

  returnToMainMenu() {
    this._stopListening();
    this.showMainMenu();
  }

  _setVisible(el, visible) {
    if (!el) return;
    visible ? el.classList.remove('hidden') : el.classList.add('hidden');
  }

  // ---- Lista de keybinds ----

  _buildKeybindList() {
    if (!this.keybindList) return;
    this.keybindList.innerHTML = '';

    for (const action in KEYBIND_META) {
      const meta = KEYBIND_META[action];
      const row  = document.createElement('div');
      row.className = 'keybind-row';
      row.dataset.action = action;

      const info = document.createElement('div');
      info.className = 'keybind-row-info';
      info.innerHTML = `
        <span class="keybind-action-name">${meta.name}</span>
        <span class="keybind-action-desc">${meta.desc}</span>
      `;

      const btn = document.createElement('button');
      btn.className = 'btn-keybind-capture';
      btn.dataset.action = action;
      btn.textContent = keybindManager.getLabelFor(action);
      btn.addEventListener('click', () => this._startListening(action, btn));

      row.appendChild(info);
      row.appendChild(btn);
      this.keybindList.appendChild(row);
    }
  }

  _refreshKeybindList() {
    if (!this.keybindList) return;
    const buttons = this.keybindList.querySelectorAll('.btn-keybind-capture');
    buttons.forEach(btn => {
      btn.textContent = keybindManager.getLabelFor(btn.dataset.action);
      btn.classList.remove('listening');
    });
  }

  // ---- Captura de teclas ----

  _startListening(action, btn) {
    this._stopListening();
    this._listeningAction = action;
    this._listeningBtn    = btn;

    btn.classList.add('listening');
    btn.textContent = '[ PRESSIONE UMA TECLA ]';
    this._setStatus('Aguardando pressão de tecla...', 'listening');

    this._keyListener = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const ignored = ['ShiftLeft','ShiftRight','AltLeft','AltRight',
                       'ControlLeft','ControlRight','MetaLeft','MetaRight',
                       'CapsLock','Tab'];
      if (ignored.includes(e.code)) return;

      const label = this._codeToLabel(e.code, e.key);
      keybindManager.set(action, e.code, label);
      btn.classList.remove('listening');
      btn.textContent = label;
      this._setStatus('✔ "' + KEYBIND_META[action].name + '" → ' + label, 'saved');
      this._stopListening();
    };

    window.addEventListener('keydown', this._keyListener, { capture: true });
  }

  _stopListening() {
    if (this._keyListener) {
      window.removeEventListener('keydown', this._keyListener, { capture: true });
      this._keyListener = null;
    }
    if (this._listeningBtn) {
      this._listeningBtn.classList.remove('listening');
      if (this._listeningAction) {
        this._listeningBtn.textContent = keybindManager.getLabelFor(this._listeningAction);
      }
    }
    this._listeningAction = null;
    this._listeningBtn    = null;
  }

  _codeToLabel(code, key) {
    const map = {
      'Space':'Espaço','Enter':'Enter','Escape':'Esc',
      'ArrowUp':'↑','ArrowDown':'↓','ArrowLeft':'←','ArrowRight':'→',
      'Backspace':'Backspace','Delete':'Del','Insert':'Ins',
      'Home':'Home','End':'End','PageUp':'PgUp','PageDown':'PgDn',
      'F1':'F1','F2':'F2','F3':'F3','F4':'F4','F5':'F5','F6':'F6',
      'F7':'F7','F8':'F8','F9':'F9','F10':'F10','F11':'F11','F12':'F12',
      'NumpadEnter':'Num Enter','NumpadAdd':'Num +','NumpadSubtract':'Num -',
      'NumpadMultiply':'Num *','NumpadDivide':'Num /',
    };
    if (map[code]) return map[code];
    if (code.startsWith('Key'))    return code.slice(3).toUpperCase();
    if (code.startsWith('Digit'))  return code.slice(5);
    if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
    return key && key.length === 1 ? key.toUpperCase() : code;
  }

  _setStatus(msg, cls) {
    if (!this.statusBar) return;
    this.statusBar.textContent = msg;
    this.statusBar.className = 'keybind-status-bar' + (cls ? ' ' + cls : '');
  }

  // ---- Eventos ----

  _bindEvents() {
    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => this.showPhaseSelector());
    }

    if (this.btnKeybinds) {
      this.btnKeybinds.addEventListener('click', () => this.showKeybindScreen());
    }

    if (this.btnQuit) {
      this.btnQuit.addEventListener('click', () => this._confirmQuit());
    }

    if (this.btnKeybindBack) {
      this.btnKeybindBack.addEventListener('click', () => {
        this._stopListening();
        this._setStatus('Configurações salvas!', 'saved');
        setTimeout(() => this.returnToMainMenu(), 500);
      });
    }

    if (this.btnKeybindReset) {
      this.btnKeybindReset.addEventListener('click', () => {
        this._stopListening();
        keybindManager.resetToDefaults();
        this._refreshKeybindList();
        this._setStatus('✔ Teclas restauradas para os padrões!', 'saved');
      });
    }

    // Botão "← MENU PRINCIPAL" da tela de seleção de fases
    const btnBackToMain = document.getElementById('btn-back-to-main');
    if (btnBackToMain) {
      btnBackToMain.addEventListener('click', () => this.returnToMainMenu());
    }
  }

  // ---- Sair ----

  _confirmQuit() {
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed','inset:0','background:rgba(0,0,0,0.78)',
      'display:flex','align-items:center','justify-content:center',
      'z-index:9999','backdrop-filter:blur(6px)'
    ].join(';');

    overlay.innerHTML = [
      '<div style="background:linear-gradient(145deg,rgba(20,24,38,0.98),rgba(10,11,18,0.99));',
      'border:2px solid rgba(255,42,95,0.5);border-radius:14px;padding:36px 48px;',
      'text-align:center;max-width:400px;width:90%;',
      'box-shadow:0 0 50px rgba(255,42,95,0.25);',
      'font-family:Rajdhani,sans-serif;color:#f5f6fa;">',
      '<div style="font-size:48px;margin-bottom:10px;">🥷</div>',
      '<h3 style="font-family:Cinzel,serif;font-size:22px;font-weight:900;',
      'letter-spacing:3px;color:#ff7b99;margin-bottom:8px;">SAIR DO JOGO?</h3>',
      '<p style="color:#8b949e;font-size:13px;letter-spacing:1px;margin-bottom:24px;">',
      'O caminho do ninja nunca termina...<br>Tem certeza que deseja sair?</p>',
      '<div style="display:flex;gap:14px;justify-content:center;">',
      '<button id="quit-no" style="background:transparent;border:1.5px solid rgba(255,255,255,0.25);',
      'color:#c9d1d9;padding:12px 28px;border-radius:7px;cursor:pointer;',
      'font-family:inherit;font-size:14px;font-weight:700;letter-spacing:2px;',
      'transition:all .2s;outline:none;">CANCELAR</button>',
      '<button id="quit-yes" style="background:linear-gradient(135deg,#ff2a5f,#b01030);',
      'border:1px solid #ff7b99;color:#fff;padding:12px 28px;border-radius:7px;',
      'cursor:pointer;font-family:Cinzel,serif;font-size:14px;font-weight:900;',
      'letter-spacing:2px;transition:all .2s;outline:none;',
      'box-shadow:0 0 20px rgba(255,42,95,0.4);">SAIR</button>',
      '</div></div>'
    ].join('');

    document.body.appendChild(overlay);

    const no  = overlay.querySelector('#quit-no');
    const yes = overlay.querySelector('#quit-yes');

    no.addEventListener('click', () => overlay.remove());
    yes.addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        window.close();
        // Fallback para browsers que bloqueiam window.close()
        document.body.innerHTML = [
          '<div style="display:flex;flex-direction:column;align-items:center;',
          'justify-content:center;height:100vh;background:#0b0c10;',
          'color:#8b949e;font-family:Rajdhani,sans-serif;font-size:18px;letter-spacing:3px;">',
          '<div style="font-size:60px;margin-bottom:20px;opacity:0.4;">🥷</div>',
          '<p>O ninja descansa em paz.</p>',
          '<p style="font-size:12px;margin-top:8px;opacity:0.5;">Você pode fechar esta aba.</p>',
          '</div>'
        ].join('');
      }, 320);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
}

// =============================================
// INICIALIZAÇÃO
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  window.mainMenuController = new MainMenuController();
  mainMenuController.showMainMenu();
});
