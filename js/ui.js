
// ─── UI Rendering ─────────────────────────────────────────────────────────────
const UI = (() => {

  // ── Tabs ───────────────────────────────────────────────────────────────────
  function renderTabs(state) {
    const {currentRound} = state;
    document.getElementById('round-tabs').innerHTML = ROUND_NAMES.map((n,i) =>
      `<button class="rtab ${i===currentRound?'active':''}" onclick="App.setRound(${i})">${n}</button>`
    ).join('');
  }

  // ── Navigation bar (Back / round title / Next) ─────────────────────────────
  function renderNav(state) {
    const {currentRound} = state;
    const picks = state.picks[currentRound];
    const total = state.simResult.rounds[currentRound].length;
    const picked = Object.keys(picks).length;

    document.getElementById('round-nav').innerHTML = `
      <div class="nav-row">
        <button class="nav-btn" onclick="App.back()" ${currentRound===0?'disabled':''}>
          ← Back
        </button>
        <div class="nav-center">
          <div class="nav-title">${ROUND_NAMES[currentRound]}</div>
          <div class="nav-sub">${picked} of ${total} manually picked · ${total-picked} by algorithm</div>
        </div>
        <button class="nav-btn" onclick="App.next()" ${currentRound===5?'disabled':''}>
          Next →
        </button>
      </div>`;
  }

  // ── Weight Bars ────────────────────────────────────────────────────────────
  function renderWeightBars(ri) {
    const w = ROUND_WEIGHTS[ri];
    const prev = ri > 0 ? ROUND_WEIGHTS[ri-1] : null;
    document.getElementById('weight-bars').innerHTML = FACTOR_META.map(f => {
      const pct = Math.round(w[f.key]*100);
      const prevPct = prev ? Math.round(prev[f.key]*100) : pct;
      const diff = pct - prevPct;
      const badge = diff > 0 ? `<span class="chg up">+${diff}%</span>`
                  : diff < 0 ? `<span class="chg dn">${diff}%</span>`
                  : `<span class="chg fl">—</span>`;
      return `<div class="wrow">
        <span class="wlbl">${f.label}</span>
        <div class="wtrack"><div class="wfill" style="width:${Math.min(pct*2.2,100)}%;background:${f.color}"></div></div>
        <span class="wpct">${pct}%</span>${badge}
      </div>`;
    }).join('');
  }

  // ── Single Match Card ──────────────────────────────────────────────────────
  function matchCard(m, mi, ri, picks) {
    const winA = m.probA >= m.probB;
    const algoA = m.algorithmWinner === m.teamA;
    const pickData = picks[mi];
    const pickedA = pickData && pickData.region===m.teamA.region && pickData.seed===m.teamA.seed;
    const pickedB = pickData && pickData.region===m.teamB.region && pickData.seed===m.teamB.seed;
    const pA = Math.round(m.probA*100), pB = 100-pA;
    const actualWinA = m.winner === m.teamA;
    const isUpset = m.winner.seed > (actualWinA ? m.teamB.seed : m.teamA.seed);

    const row = (team, prob, isAlgoWin, isPicked, isActualWin) => {
      const cls = isPicked ? 'team-row picked' : isAlgoWin && !pickData ? 'team-row algo-win' : 'team-row';
      const overrideIcon = isPicked && !isAlgoWin ? '<span class="override-dot" title="Manual pick overrides algorithm">●</span>' : '';
      const upsetBadge = isActualWin && isUpset ? '<span class="upset-tag">UPSET</span>' : '';
      return `<div class="${cls}" onclick="App.setPick(${ri},${mi},{region:'${team.region}',seed:${team.seed}})">
        <span class="t-seed">${team.seed}</span>
        <button class="t-name" onclick="event.stopPropagation();Editor.open('${team.region}',${team.seed})" title="Edit ${team.name}">${team.name}</button>
        ${overrideIcon}${upsetBadge}
        <span class="t-prob">${prob}%</span>
      </div>`;
    };

    return `<div class="mcard ${m.isManualPick?'manual':''}">
      ${row(m.teamA, pA, algoA, pickedA, actualWinA)}
      <div class="m-vs">vs</div>
      ${row(m.teamB, pB, !algoA, pickedB, !actualWinA)}
      <div class="pbar-w"><div class="pbar" style="width:${pA}%"></div></div>
    </div>`;
  }

  // ── Matchups Grid ──────────────────────────────────────────────────────────
  function renderMatchups(state) {
    const {currentRound, simResult, picks} = state;
    const round = simResult.rounds[currentRound];
    const rPicks = picks[currentRound];
    const container = document.getElementById('matchups');

    if (currentRound >= 4) {
      container.innerHTML = `<div class="region-block">
        <div class="match-grid">${round.map((m,i)=>matchCard(m,i,currentRound,rPicks)).join('')}</div>
      </div>`;
      return;
    }

    container.innerHTML = ['East','South','West','Midwest'].map(region => {
      const ms = round.filter(m => m.region===region);
      const startIdx = round.indexOf(ms[0]);
      return `<div class="region-block">
        <div class="region-lbl">${region}</div>
        <div class="match-grid">${ms.map((m,i)=>matchCard(m,startIdx+i,currentRound,rPicks)).join('')}</div>
      </div>`;
    }).join('');
  }

  // ── Champion Sidebar ───────────────────────────────────────────────────────
  function renderChampion(simResult) {
    const {champion, path} = simResult;
    document.getElementById('champion-panel').innerHTML = `
      <div class="champ-inner">
        <div class="champ-eye">Projected Champion</div>
        <div class="champ-name">${champion.name}</div>
        <div class="champ-meta">${champion.region} · Seed #${champion.seed}</div>
        <div class="path-lbl">Path to the title</div>
        <div class="champ-path">
          ${path.map(p=>`<div class="path-chip">
            <div class="path-opp">#${p.oppSeed} ${p.opp}</div>
            <div class="path-rnd">${p.round} · ${Math.round(p.prob*100)}%</div>
          </div>`).join('')}
        </div>
        <button class="btn-view-bracket" onclick="App.openFullBracket()">View full bracket ↗</button>
      </div>`;
  }

  // ── Legend ─────────────────────────────────────────────────────────────────
  function renderLegend() {
    document.getElementById('pick-legend').innerHTML = `
      <span class="leg-item"><span class="leg-dot algo"></span> Algorithm pick</span>
      <span class="leg-item"><span class="leg-dot manual"></span> Your pick</span>
      <span class="leg-item"><span class="leg-dot override"></span> Override</span>`;
  }

  // ── Full Render ────────────────────────────────────────────────────────────
  function render(state) {
    renderTabs(state);
    renderNav(state);
    renderWeightBars(state.currentRound);
    renderMatchups(state);
    renderChampion(state.simResult);
    renderLegend();
  }

  return {render};
})();

// ─── Team Editor Modal ────────────────────────────────────────────────────────
const Editor = (() => {
  let currentTeam = null;

  function buildSlider(team, key, label, unit) {
    const b = getBounds(team.seed, key);
    const val = team[key];
    const zoneL = ((b.lo-b.min)/(b.max-b.min)*100).toFixed(1);
    const zoneW = ((b.hi-b.lo)/(b.max-b.min)*100).toFixed(1);
    const fillW = ((val-b.min)/(b.max-b.min)*100).toFixed(1);
    const outside = val < b.lo || val > b.hi;
    return `<div class="sl-block" data-key="${key}">
      <div class="sl-hdr"><span class="sl-lbl">${label}</span><span class="sl-val" id="sv-${key}">${val}${unit}</span></div>
      <div class="sl-wrap">
        <div class="sl-track">
          <div class="sl-zone" style="left:${zoneL}%;width:${zoneW}%" title="${b.lo}–${b.hi}${unit} typical for seed #${team.seed}"></div>
          <div class="sl-fill" id="sf-${key}" style="width:${fillW}%"></div>
        </div>
        <input type="range" class="sl-input" id="si-${key}" min="${b.min}" max="${b.max}" step="1" value="${val}"
          oninput="Editor.slide('${key}',this.value)">
      </div>
      <div class="sl-bounds">
        <span class="sl-floor">Floor: ${b.lo}${unit}</span>
        <span class="sl-desc">${b.desc}</span>
        <span class="sl-ceil">Ceiling: ${b.hi}${unit}</span>
      </div>
      ${outside?`<span class="sl-warn">Outside typical range for a #${team.seed} seed</span>`:''}
    </div>`;
  }

  function open(region, seed) {
    currentTeam = App.state.lookup[region][parseInt(seed)];
    const t = currentTeam;
    const srv = (ROUND_SURVIVAL[0][t.seed]*100).toFixed(0);
    document.getElementById('modal-root').innerHTML = `
      <div class="mo-overlay" id="mo-bg" onclick="Editor.closeOverlay(event)">
        <div class="mo-panel">
          <div class="mo-hdr">
            <div>
              <div class="mo-eye">${t.region} · Seed #${t.seed}</div>
              <div class="mo-title">${t.name}</div>
            </div>
            <button class="mo-close" onclick="Editor.close()">✕</button>
          </div>
          <div class="mo-note">
            <strong>Seed survival rate</strong> is fixed at <strong>${srv}%</strong> for this round — derived from historical data. Adjust below to fine-tune.
          </div>
          <div class="mo-sliders">
            ${buildSlider(t,'efficiency','Efficiency rating','')}
            ${buildSlider(t,'form','Recent form',' /10')}
            ${buildSlider(t,'coaching','Coaching factor',' /10')}
            ${buildSlider(t,'regDiff','Regional difficulty',' /10')}
          </div>
          <div class="mo-footer">
            <button class="btn-reset" onclick="Editor.reset()">Reset to defaults</button>
            <button class="btn-done" onclick="Editor.close()">Done</button>
          </div>
        </div>
      </div>`;
    document.body.classList.add('modal-open');
  }

  function close() {
    document.getElementById('modal-root').innerHTML = '';
    document.body.classList.remove('modal-open');
    currentTeam = null;
  }

  function closeOverlay(e) { if (e.target.id==='mo-bg') close(); }

  function slide(key, raw) {
    if (!currentTeam) return;
    const val = parseInt(raw);
    currentTeam[key] = val;
    const unit = key==='efficiency'?'':' /10';
    const sv = document.getElementById(`sv-${key}`);
    if (sv) sv.textContent = val+unit;
    const b = getBounds(currentTeam.seed, key);
    const fw = ((val-b.min)/(b.max-b.min)*100).toFixed(1);
    const sf = document.getElementById(`sf-${key}`);
    if (sf) sf.style.width = fw+'%';
    const block = document.querySelector(`[data-key="${key}"]`);
    if (block) {
      const outside = val < b.lo || val > b.hi;
      let warn = block.querySelector('.sl-warn');
      if (outside && !warn) {
        const w = document.createElement('span');
        w.className='sl-warn';
        w.textContent=`Outside typical range for a #${currentTeam.seed} seed`;
        block.appendChild(w);
      } else if (!outside && warn) warn.remove();
    }
    App.refresh();
  }

  function reset() {
    if (!currentTeam) return;
    const orig = App.state.defaults[currentTeam.region][currentTeam.seed];
    ['efficiency','form','coaching','regDiff'].forEach(k => currentTeam[k]=orig[k]);
    open(currentTeam.region, currentTeam.seed);
    App.refresh();
  }

  return {open, close, closeOverlay, slide, reset};
})();
