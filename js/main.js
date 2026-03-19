// ─── App State & Bootstrap ─────────────────────────────────────────────────────
const App = (() => {
  const state = {
    currentRound: 0,
    picks: [{},{},{},{},{},{}],
    simResult: null,
    lookup: null,
    defaults: null,
    // ── Monte Carlo state ──
    mcMode:   false,   // toggle between deterministic / MC view
    mcResult: null,    // latest MC result object (null while computing)
    mcN:      10000,   // simulation count; user-selectable
    _mcTimer: null,    // debounce handle for slider-triggered MC runs
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    const {lookup} = buildTeamLookup(BRACKET_TEAMS);
    state.lookup = lookup;
    state.defaults = {};
    ['East','South','West','Midwest'].forEach(region => {
      state.defaults[region] = {};
      Object.entries(lookup[region]).forEach(([seed, team]) => {
        state.defaults[region][seed] = {...team};
      });
    });
    refresh();
  }

  // ── Refresh ────────────────────────────────────────────────────────────────
  // debounced=true is passed by slider-drag calls to avoid hammering MC.
  function refresh(debounced = false) {
    state.simResult = simulate(state.lookup, state.picks);

    if (state.mcMode) {
      if (debounced) {
        // Show "computing" immediately, run MC after the user stops sliding
        state.mcResult = null;
        clearTimeout(state._mcTimer);
        state._mcTimer = setTimeout(() => {
          state.mcResult = simulateMonteCarlo(state.lookup, state.picks, state.mcN);
          UI.render(state);
        }, 450);
      } else {
        state.mcResult = simulateMonteCarlo(state.lookup, state.picks, state.mcN);
      }
    }

    UI.render(state);
  }

  // ── Round Navigation ───────────────────────────────────────────────────────
  function setRound(ri) {
    state.currentRound = Math.max(0, Math.min(5, ri));
    UI.render(state);
  }
  function back() { if (state.currentRound > 0) setRound(state.currentRound - 1); }
  function next() { if (state.currentRound < 5) setRound(state.currentRound + 1); }

  // ── Pick Management ────────────────────────────────────────────────────────
  function setPick(roundIdx, matchIdx, team) {
    const existing = state.picks[roundIdx][matchIdx];
    const isSame = existing && existing.region === team.region && existing.seed === team.seed;
    const newPicks = state.picks.map(r => ({...r}));
    if (isSame) {
      delete newPicks[roundIdx][matchIdx];
    } else {
      newPicks[roundIdx][matchIdx] = {region: team.region, seed: team.seed};
    }
    const cascade = getCascade(roundIdx, matchIdx);
    cascade.forEach(({ri, mi}) => { delete newPicks[ri][mi]; });
    state.picks = newPicks;
    refresh();      // picks are discrete — run MC immediately, no debounce
  }

  // ── Monte Carlo Controls ───────────────────────────────────────────────────

  /** Toggle between deterministic and Monte Carlo view */
  function toggleMC(enable) {
    state.mcMode = (enable !== undefined) ? enable : !state.mcMode;
    if (state.mcMode) {
      if (!state.mcResult) runMC();
      else UI.render(state);
    } else {
      state.mcResult = null;
      clearTimeout(state._mcTimer);
      UI.render(state);
    }
  }

  /** Run (or re-run) the MC simulation synchronously and refresh */
  function runMC() {
    if (!state.mcMode) return;
    state.mcResult = simulateMonteCarlo(state.lookup, state.picks, state.mcN);
    UI.render(state);
  }

  /** Change N and re-run if MC mode is active */
  function setMcN(n) {
    state.mcN = n;
    if (state.mcMode) runMC();
  }

  // ── Full Bracket Modal ─────────────────────────────────────────────────────
  function openFullBracket() {
    BracketView.open(state.simResult);
  }

  function resetAllPicks() {
    state.picks = [{},{},{},{},{},{}];
    refresh();
  }

  return {state, init, refresh, setRound, back, next, setPick,
          toggleMC, runMC, setMcN, openFullBracket, resetAllPicks};
})();

document.addEventListener('DOMContentLoaded', () => App.init());
