# 🥷 Ritmo Shinobi: Dança das Lâminas

Um jogo de ritmo 2D com temática de ninjas e samurais construído em **HTML5 Canvas**, **CSS3** e **Web Audio API**.

---

## 🎮 Como Jogar

1. Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).
2. Escolha uma das **10 Fases do Jogo** no menu inicial:
   - **Fase 1: Caminho do Bambuzal** (80 BPM - Aprendiz)
   - **Fase 2: Pátio dos Cerejais** (92 BPM - Fácil)
   - **Fase 3: Ponte das Névoas** (105 BPM - Cadenciado)
   - **Fase 4: Portão Torii Rubro** (116 BPM - Intermediário)
   - **Fase 5: Templo da Meia-Noite** (126 BPM - Moderado)
   - **Fase 6: Dança das Lâminas** (136 BPM - Rápido)
   - **Fase 7: Fortaleza do Vendaval** (146 BPM - Difícil)
   - **Fase 8: Cume do Vulcão Sangrento** (158 BPM - Feroz)
   - **Fase 9: Salão das Sombras do Shogun** (170 BPM - Mestre)
   - **Fase 10: O Despertar do Lorde Oni** (185 BPM - Supremo)
3. Clique em **INICIAR FASE**.
4. Observe a **Barra de Ritmo na parte inferior da tela**. Os marcadores deslizam em direção ao **Selo de Corte ("斬")**.
5. No exato instante em que o marcador atingir o centro do selo, desfira o golpe no ritmo!

---

## ⚔️ Controles

| Ação | Teclado | Mouse / Touch |
| :--- | :--- | :--- |
| **Ataque com Katana** | `[ESPAÇO]`, `[Z]`, `[X]`, `[J]`, `[K]` ou `[ENTER]` | Clique ou toque na tela |
| **Pausar / Retomar** | `[P]` ou `[ESC]` | Botão `⏸️` no canto superior direito |
| **Mutar Áudio** | - | Botão `🔊` no canto superior direito |

---

## ⏸️ Sistema de Pausa

- Clique no botão **⏸️** no canto superior direito ou aperte `[P]` ou `[ESC]`.
- O jogo congela o tempo exato, notas e animações instantaneamente.
- O **Modal de Pausa** exibe:
  - Fase atual e BPM
  - Pontuação, sequência de combo e precisão em tempo real
  - Inimigos superados até o momento
  - Opções para: **Continuar**, **Reiniciar Fase** ou **Seleção de Fases**.

---

## 🎯 Sistema de Julgamento e Pontuação

- **PERFEITO** ($\le \pm 55\text{ ms}$): 300 pontos $\times$ multiplicador de combo, regenera 2 de vida, corte dourado com faíscas.
- **BOM** ($\le \pm 125\text{ ms}$): 100 pontos $\times$ multiplicador de combo, mantém combo, corte ciano.
- **ERRO**: Perde 15 de vida, zera o combo, tela treme e o ninja cambaleia.

### Multiplicadores de Combo:
- 1 a 9 combos: **1x**
- 10 a 24 combos: **2x**
- 25 a 49 combos: **3x**
- 50+ combos: **4x**

### Sistema de Classificação (Ranks):
- **SSS**: 98% a 100% de precisão e sem nenhum erro.
- **S**: $\ge 90\%$ de precisão.
- **A**: $\ge 80\%$ de precisão.
- **B**: $\ge 70\%$ de precisão.
- **C** / **D**: Abaixo de 70%.

---

## 📁 Estrutura de Arquivos

```
ideia de jogo-2A/
├── index.html           # Estrutura do jogo, telas (Menu com 10 Fases, Pausa, HUD, Game Over, Vitória)
├── README.md            # Guia do jogo e documentação completa
├── css/
│   └── style.css        # Visual japonês moderno, botões das 10 fases, HUD e modais
└── js/
    ├── audio.js         # Sintetizador procedural com Web Audio API (Taiko, cortes e impactos)
    ├── beatmaps.js      # 10 Fases completas, BPMs, temas visuais e padrões de inimigos
    ├── rhythm_bar.js    # Barra de ritmo inferior com selo de impacto ZAN e marcadores
    ├── renderer.js      # Cenário dinâmico por fase, lua, fuji, física do ninja e samurais
    └── game.js          # Loop de jogo, sistema de pausa preciso, recordes e troca de fases
```
