// ─── App State & Bootstrap ─────────────────────────────────────────────────────
const App = (() => {
  const state = {
    currentRound: 0,
    // picks[roundIdx][matchIdx] = {region, seed} | undefined
    picks: [{},{},{},{},{},{}],
    simResult: null,
    lookup: null,
    defaults: null,
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    const {lookup} = buildTeamLookup(BRACKET_TEAMS);
    state.lookup = lookup;
    // Deep-copy defaults for reset
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
  function refresh() {
    state.simResult = simulate(state.lookup, state.picks);
    UI.render(state);
  }

  // ── Round Navigation ───────────────────────────────────────────────────────
  function setRound(ri) {
    state.currentRound = Math.max(0, Math.min(5, ri));
    UI.render(state);
  }

  function back() {
    if (state.currentRound > 0) setRound(state.currentRound - 1);
  }

  function next() {
    if (state.currentRound < 5) setRound(state.currentRound + 1);
  }

  // ── Pick Management ────────────────────────────────────────────────────────
  // Toggle a pick. Clicking already-picked team → unselects.
  // Clears cascade downstream when pick changes.
  function setPick(roundIdx, matchIdx, team) {
    const existing = state.picks[roundIdx][matchIdx];
    const isSame = existing && existing.region === team.region && existing.seed === team.seed;

    const newPicks = state.picks.map(r => ({...r}));

    if (isSame) {
      // Unselect
      delete newPicks[roundIdx][matchIdx];
    } else {
      newPicks[roundIdx][matchIdx] = {region: team.region, seed: team.seed};
    }

    // Cascade: clear downstream affected matches
    const cascade = getCascade(roundIdx, matchIdx);
    cascade.forEach(({ri, mi}) => { delete newPicks[ri][mi]; });

    state.picks = newPicks;
    refresh();
  }

  // ── Full Bracket Modal ─────────────────────────────────────────────────────
  function openFullBracket() {
    BracketView.open(state.simResult);
  }

  function resetAllPicks() {
    state.picks = [{},{},{},{},{},{}];
    refresh();
  }

  return {state, init, refresh, setRound, back, next, setPick, openFullBracket, resetAllPicks};
})();

document.addEventListener('DOMContentLoaded', () => App.init());
