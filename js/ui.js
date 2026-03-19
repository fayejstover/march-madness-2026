// ─── UI Rendering ─────────────────────────────────────────────────────────────
const UI = (() => {

  // ── Sim-mode control bar ───────────────────────────────────────────────────
  function renderSimControl(state) {
    const { mcMode, mcN, mcResult } = state;
    const el = document.getElementById('sim-control');
    if (!el) return;

    const nOpts = [1000, 5000, 10000];
    const simInfo = mcResult
      ? `<span class="sc-info">${mcResult.totalSims.toLocaleString()} sims complete</span>`
      : mcMode
        ? `<span class="sc-info sc-computing">computing…</span>`
        : '';

    el.innerHTML = `
      <div class="sc-wrap">
        <div class="sc-left">
          <div class="sc-mode-group">
            <button class="sc-pill ${!mcMode ? 'active' : ''}" onclick="App.toggleMC(false)">
              Deterministic
            </button>
            <button class="sc-pill sc-pill-mc ${mcMode ? 'active' : ''}" onclick="App.toggleMC(true)">
              <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" style="opacity:.85"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM8 7.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm4 5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/></svg>
              Monte Carlo
            </button>
          </div>
          ${simInfo}
        </div>
        ${mcMode ? `
          <div class="sc-right">
            <span class="sc-n-label">N =</span>
            <div class="sc-n-group">
              ${nOpts.map(n => `
                <button class="sc-n-btn ${mcN === n ? 'active' : ''}" onclick="App.setMcN(${n})">
                  ${n >= 1000 ? (n / 1000) + 'K' : n}
                </button>`).join('')}
            </div>
            <button class="sc-rerun" onclick="App.runMC()" title="Re-run simulation with current settings">
              <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 4l4-4m-4 4l-4-4m4 4A8 8 0 1118 10" stroke-linecap="round"/></svg>
              Re-run
            </button>
          </div>` : ''}
      </div>`;
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────
  function renderTabs(state) {
    const {currentRound} = state;
    document.getElementById('round-tabs').innerHTML = ROUND_NAMES.map((n,i) =>
      `<button class="rtab ${i===currentRound?'active':''}" onclick="App.setRound(${i})">${n}</button>`
    ).join('');
  }

  // ── Navigation bar ─────────────────────────────────────────────────────────
  function renderNav(state) {
    const {currentRound} = state;
    const picks = state.picks[currentRound];
    const total = state.simResult.rounds[currentRound].length;
    const picked = Object.keys(picks).length;

    document.getElementById('round-nav').innerHTML = `
      <div class="nav-row">
        <button class="nav-btn" onclick="App.back()" ${currentRound===0?'disabled':''}>← Back</button>
        <div class="nav-center">
          <div class="nav-title">${ROUND_NAMES[currentRound]}</div>
          <div class="nav-sub">${picked} of ${total} manually picked · ${total-picked} by algorithm</div>
        </div>
        <button class="nav-btn" onclick="App.next()" ${currentRound===5?'disabled':''}>Next →</button>
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

  // ── Single Match Card — Deterministic ──────────────────────────────────────
  function matchCardDet(m, mi, ri, picks) {
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

  // ── Single Match Card — Monte Carlo ────────────────────────────────────────
  // Shows round-advancement rates from N simulations.
  // Bar = head-to-head share (conditioned on at least one of these two advancing).
  // Percentage label = raw advancement rate across ALL simulated paths.
  function matchCardMC(m, mi, ri, picks, mcResult) {
    const pickData = picks[mi];
    const algoA = m.algorithmWinner === m.teamA;
    const pickedA = pickData && pickData.region===m.teamA.region && pickData.seed===m.teamA.seed;
    const pickedB = pickData && pickData.region===m.teamB.region && pickData.seed===m.teamB.seed;

    const keyA = `${m.teamA.region}-${m.teamA.seed}`;
    const keyB = `${m.teamB.region}-${m.teamB.seed}`;
    const N = mcResult.totalSims;
    const wA = mcResult.roundWins[keyA] ? mcResult.roundWins[keyA][ri] : 0;
    const wB = mcResult.roundWins[keyB] ? mcResult.roundWins[keyB][ri] : 0;

    // Head-to-head share for the bar (normalized to 100%)
    const denom = wA + wB;
    const h2hA = denom > 0 ? Math.round(wA / denom * 100) : 50;
    const h2hB = 100 - h2hA;

    // Raw advancement probability for the label
    const advA = (wA / N * 100).toFixed(1);
    const advB = (wB / N * 100).toFixed(1);

    const isUpsetA = m.teamA.seed > m.teamB.seed && wA > wB;  // A is the underdog leading
    const isUpsetB = m.teamB.seed > m.teamA.seed && wB > wA;

    const rowMC = (team, adv, h2h, isPicked, isAlgoWin, isUpset) => {
      const baseClass = isPicked ? 'team-row picked' : isAlgoWin && !pickData ? 'team-row algo-win' : 'team-row';
      const fillClass = isPicked ? 'mc-fill-manual' : isAlgoWin && !pickData ? 'mc-fill-algo' : 'mc-fill-neutral';
      const upsetBadge = isUpset ? '<span class="upset-tag">UPSET</span>' : '';
      return `<div class="${baseClass} mc-team-row" onclick="App.setPick(${ri},${mi},{region:'${team.region}',seed:${team.seed}})">
        <span class="t-seed">${team.seed}</span>
        <button class="t-name" onclick="event.stopPropagation();Editor.open('${team.region}',${team.seed})">${team.name}</button>
        ${upsetBadge}
        <div class="mc-inline-bar" title="${adv}% of simulations">
          <div class="mc-inline-fill ${fillClass}" style="width:${h2h}%"></div>
        </div>
        <span class="mc-adv-pct">${adv}%</span>
      </div>`;
    };

    // Round-specific note on what the percentage means
    const rateNote = ri === 0
      ? 'exact win probability'
      : `adv. rate · all paths`;

    return `<div class="mcard ${m.isManualPick?'manual':''} mc-card">
      ${rowMC(m.teamA, advA, h2hA, pickedA, algoA, isUpsetA)}
      <div class="m-vs mc-vs">vs <span class="mc-rate-label">${rateNote}</span></div>
      ${rowMC(m.teamB, advB, h2hB, pickedB, !algoA, isUpsetB)}
    </div>`;
  }

  // ── Matchups Grid ──────────────────────────────────────────────────────────
  function renderMatchups(state) {
    const {currentRound, simResult, picks, mcMode, mcResult} = state;
    const round = simResult.rounds[currentRound];
    const rPicks = picks[currentRound];
    const useMC = mcMode && mcResult;  // only show MC cards when result is ready
    const container = document.getElementById('matchups');

    const cardFn = (m, i) => useMC
      ? matchCardMC(m, i, currentRound, rPicks, mcResult)
      : matchCardDet(m, i, currentRound, rPicks);

    if (currentRound >= 4) {
      container.innerHTML = `<div class="region-block">
        <div class="match-grid">${round.map((m,i) => cardFn(m,i)).join('')}</div>
      </div>`;
      return;
    }

    container.innerHTML = ['East','South','West','Midwest'].map(region => {
      const ms = round.filter(m => m.region===region);
      const startIdx = round.indexOf(ms[0]);
      return `<div class="region-block">
        <div class="region-lbl">${region}</div>
        <div class="match-grid">${ms.map((m,i) => cardFn(m, startIdx+i)).join('')}</div>
      </div>`;
    }).join('');
  }

  // ── Champion Sidebar — Deterministic ───────────────────────────────────────
  function renderChampionDet(simResult) {
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

  // ── Champion Sidebar — Monte Carlo Distribution ────────────────────────────
  function renderChampionMC(state) {
    const { mcResult, simResult } = state;

    // Computing / null state
    if (!mcResult) {
      document.getElementById('champion-panel').innerHTML = `
        <div class="mc-computing-wrap">
          <div class="mc-spinner"></div>
          <div class="mc-computing-label">Running ${(state.mcN/1000).toFixed(0)}K simulations…</div>
        </div>`;
      return;
    }

    const { champList, totalSims, upsetFreq } = mcResult;
    const maxPct = champList[0] ? champList[0].pct : 1;
    const champKey = `${simResult.champion.region}-${simResult.champion.seed}`;

    const upsetRow = (ri) => {
      const pct = (upsetFreq[ri] * 100).toFixed(0);
      return `<div class="mc-upset-row">
        <span class="mc-upset-rnd">${ROUND_NAMES[ri].replace('Round of ','')} </span>
        <div class="mc-upset-bar-track">
          <div class="mc-upset-bar" style="width:${upsetFreq[ri]*100}%"></div>
        </div>
        <span class="mc-upset-pct">${pct}%</span>
      </div>`;
    };

    document.getElementById('champion-panel').innerHTML = `
      <div class="mc-dist-wrap">
        <div class="mc-dist-hdr">
          <span class="mc-dist-title">Championship Probability</span>
          <span class="mc-dist-n">N=${totalSims.toLocaleString()}</span>
        </div>

        <div class="mc-dist-list">
          ${champList.map((item) => {
            const barW = Math.round((item.pct / maxPct) * 100);
            const pctStr = (item.pct * 100).toFixed(1);
            const ciStr  = (item.ci  * 100).toFixed(1);
            const isTop  = `${item.team.region}-${item.team.seed}` === champKey;
            const regionInitial = item.team.region.slice(0,1);
            return `<div class="mc-dist-row ${isTop ? 'mc-dist-row-leader' : ''}">
              <div class="mc-dist-team-info">
                <span class="mc-dist-seed-badge">${item.team.seed}</span>
                <span class="mc-dist-team-name">${item.team.name}</span>
                <span class="mc-dist-region-tag" title="${item.team.region}">${regionInitial}</span>
              </div>
              <div class="mc-dist-bar-track">
                <div class="mc-dist-bar-fill ${isTop ? 'mc-bar-leader' : ''}" style="width:${barW}%"></div>
              </div>
              <div class="mc-dist-stats">
                <span class="mc-dist-pct">${pctStr}%</span>
                <span class="mc-dist-ci">±${ciStr}</span>
              </div>
            </div>`;
          }).join('')}
        </div>

        <div class="mc-upset-section">
          <div class="mc-upset-title">Upset probability by round</div>
          ${[0,1,2,3].map(upsetRow).join('')}
        </div>

        <div class="mc-dist-footer">
          <span>95% confidence intervals shown</span>
          <button class="mc-rerun-btn" onclick="App.runMC()">↺ Re-run</button>
        </div>
      </div>`;
  }

  // ── Champion panel dispatcher ──────────────────────────────────────────────
  function renderChampion(state) {
    if (state.mcMode) {
      renderChampionMC(state);
    } else {
      renderChampionDet(state.simResult);
    }
  }

  // ── Legend ─────────────────────────────────────────────────────────────────
  function renderLegend(state) {
    const { mcMode } = state;
    const extra = mcMode
      ? `<span class="leg-item"><span class="leg-dot" style="background:#0ea5e9"></span> MC rate</span>`
      : `<span class="leg-item"><span class="leg-dot override"></span> Override</span>`;
    document.getElementById('pick-legend').innerHTML = `
      <span class="leg-item"><span class="leg-dot algo"></span> Algorithm pick</span>
      <span class="leg-item"><span class="leg-dot manual"></span> Your pick</span>
      ${extra}`;
  }

  // ── Full Render ────────────────────────────────────────────────────────────
  function render(state) {
    renderSimControl(state);
    renderTabs(state);
    renderNav(state);
    renderWeightBars(state.currentRound);
    renderMatchups(state);
    renderChampion(state);
    renderLegend(state);
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
    // Debounced refresh: update deterministic instantly, debounce MC
    App.refresh(true);
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
