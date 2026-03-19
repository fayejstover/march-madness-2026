// ─── P_base Engine v2 ─────────────────────────────────────────────────────────
const ROUND_NAMES = ['Round of 64','Round of 32','Sweet 16','Elite 8','Final Four','Championship'];

const ROUND_WEIGHTS = [
  { seed:0.38, eff:0.20, form:0.15, reg:0.10, coach:0.17 },
  { seed:0.32, eff:0.27, form:0.15, reg:0.11, coach:0.15 },
  { seed:0.22, eff:0.34, form:0.18, reg:0.13, coach:0.13 },
  { seed:0.16, eff:0.37, form:0.20, reg:0.13, coach:0.14 },
  { seed:0.12, eff:0.39, form:0.21, reg:0.10, coach:0.18 },
  { seed:0.07, eff:0.38, form:0.26, reg:0.05, coach:0.24 },
];

// Round-specific seed survival rates from historical data.
// Sweet 16: #1=68%, #2=58%, #3=47%, #4=38%, #5=28%, #6=25%, #7=22%, #8/#9=20%, #10-16<15%
// Elite 8:  #1=58%, #2=50%, #3-4=40-45%
// Championship: #1=20-25%, #2 nearly 0 last 20 yrs, #3-6 occasional
const ROUND_SURVIVAL = {
  0: {1:.985,2:.935,3:.855,4:.795,5:.655,6:.630,7:.610,8:.515,9:.485,10:.390,11:.370,12:.345,13:.205,14:.145,15:.065,16:.015},
  1: {1:.875,2:.720,3:.640,4:.560,5:.430,6:.380,7:.340,8:.280,9:.260,10:.220,11:.240,12:.200,13:.100,14:.080,15:.040,16:.010},
  2: {1:.680,2:.580,3:.470,4:.380,5:.280,6:.250,7:.220,8:.200,9:.200,10:.145,11:.140,12:.120,13:.075,14:.048,15:.022,16:.005},
  3: {1:.580,2:.500,3:.450,4:.425,5:.200,6:.180,7:.150,8:.120,9:.110,10:.095,11:.085,12:.065,13:.035,14:.018,15:.008,16:.002},
  4: {1:.520,2:.380,3:.300,4:.275,5:.155,6:.135,7:.118,8:.090,9:.080,10:.068,11:.058,12:.038,13:.018,14:.010,15:.004,16:.001},
  5: {1:.225,2:.028,3:.125,4:.095,5:.072,6:.060,7:.050,8:.040,9:.030,10:.024,11:.018,12:.014,13:.005,14:.003,15:.001,16:.000},
};

// Upset modifiers: boost the higher-numbered (weaker) seed in specific matchups.
// 12-5 upsets most common in R64/R32; 6-11 and 7-10 more evenly distributed in R32.
// 12-seeds fizzle post-Sweet-16 (modifier < 1).
const UPSET_MODS = {
  0: {'12v5':1.38,'11v6':1.28,'13v4':1.22,'10v7':1.15,'9v8':1.10,'15v2':1.08},
  1: {'12v5':1.08,'11v6':1.38,'10v7':1.30,'9v8':1.22,'13v4':1.05},
  2: {'11v6':1.22,'10v7':1.18,'9v8':1.16,'12v5':0.93},
  3: {'11v6':1.12,'10v7':1.10},
  4: {}, 5: {},
};

// Programs that historically outperform seed expectations.
const PROGRAM_MODS = {
  'Duke':1.06,'Kansas':1.05,'Connecticut':1.05,'Gonzaga':1.05,
  'Michigan St.':1.04,'Kentucky':1.04,'Florida':1.04,'Houston':1.04,
  'Arizona':1.03,'Iowa St.':1.03,'Alabama':1.02,'Purdue':1.02,
  'Illinois':1.02,'Virginia':1.02,'VCU':1.03,'Michigan':1.02,
};

// 2026 is slightly upset-heavy — boosts weaker seeds marginally.
const SEASON_TREND = { upsetBoost: 1.05 };

const BRACKET_PAIRS = [[1,16],[8,9],[5,12],[4,13],[6,11],[3,14],[7,10],[2,15]];

const FACTOR_META = [
  {key:'seed',  label:'Seed survival rate', color:'#3b82f6'},
  {key:'eff',   label:'Efficiency rating',  color:'#22c55e'},
  {key:'form',  label:'Recent form',        color:'#f97316'},
  {key:'reg',   label:'Regional difficulty',color:'#a855f7'},
  {key:'coach', label:'Coaching factor',    color:'#f59e0b'},
];

// ─── Core Formula ─────────────────────────────────────────────────────────────

function computeRawP(team, ri) {
  const w = ROUND_WEIGHTS[ri];
  const srv = ROUND_SURVIVAL[ri][team.seed] || 0.01;
  return w.seed*srv + w.eff*(team.efficiency/100) + w.form*((team.form-1)/9) + w.reg*((team.regDiff-1)/9) + w.coach*((team.coaching-1)/9);
}

function applyUpsetMods(pa, pb, tA, tB, ri) {
  const mods = UPSET_MODS[ri] || {};
  const lo = Math.min(tA.seed,tB.seed), hi = Math.max(tA.seed,tB.seed);
  const mod = mods[`${hi}v${lo}`] || 1.0;
  if (mod === 1.0) return {pa, pb};
  let [a,b] = tA.seed > tB.seed ? [pa*mod,pb] : [pa,pb*mod];
  const t = a+b; return {pa:a/t, pb:b/t};
}

function applyTrend(pa, pb, tA, tB) {
  if (tA.seed === tB.seed) return {pa,pb};
  const f = SEASON_TREND.upsetBoost;
  let [a,b] = tA.seed > tB.seed ? [pa*f,pb] : [pa,pb*f];
  const t = a+b; return {pa:a/t, pb:b/t};
}

// ─── Path-Dependent Factors ────────────────────────────────────────────────────
// Close-game penalty (-2% per close win), dominant-win boost (+1.5%),
// cumulative fatigue after 3-4 games.

function getPathFactor(team, pathData) {
  const d = pathData[`${team.region}-${team.seed}`];
  if (!d || d.games === 0) return 1.0;
  let f = 1.0;
  f -= d.closeWins * 0.020;
  f += d.bigWins   * 0.015;
  if (d.games >= 3) f -= 0.015;
  if (d.games >= 4) f -= 0.015;
  return Math.max(0.88, Math.min(1.12, f));
}

function updatePathData(team, winProb, pathData) {
  const key = `${team.region}-${team.seed}`;
  if (!pathData[key]) pathData[key] = {games:0, closeWins:0, bigWins:0};
  const d = pathData[key];
  d.games++;
  if (winProb < 0.54) d.closeWins++;
  else if (winProb > 0.72) d.bigWins++;
}

// ─── Region Upset Clustering ───────────────────────────────────────────────────
// When a region has already produced upsets, further upsets get a small boost.

function getClusterBoost(winner, loser, regionUpsets) {
  if (winner.seed <= loser.seed) return 1.0;
  const cnt = regionUpsets[winner.region] || 0;
  return cnt === 0 ? 1.0 : cnt === 1 ? 1.04 : 1.07;
}

// ─── Main Simulation ──────────────────────────────────────────────────────────

function simulate(lookup, picks) {
  picks = picks || {};
  const pathData = {}, regionUpsets = {East:0,South:0,West:0,Midwest:0};
  const allRounds = [];

  for (let ri = 0; ri < 6; ri++) {
    const matchups = buildRoundMatchups(ri, allRounds, lookup);

    matchups.forEach((m, mi) => {
      const pMod = t => (PROGRAM_MODS[t.name]||1.0) * getPathFactor(t, pathData);
      let pa = computeRawP(m.teamA, ri) * pMod(m.teamA);
      let pb = computeRawP(m.teamB, ri) * pMod(m.teamB);
      const t0 = pa+pb; pa /= t0; pb /= t0;

      const u  = applyUpsetMods(pa, pb, m.teamA, m.teamB, ri);
      const tr = applyTrend(u.pa, u.pb, m.teamA, m.teamB);
      pa = tr.pa; pb = tr.pb;

      // Cluster boost
      const cA = getClusterBoost(m.teamA, m.teamB, regionUpsets);
      const cB = getClusterBoost(m.teamB, m.teamA, regionUpsets);
      if (cA !== 1.0 || cB !== 1.0) {
        pa *= cA; pb *= cB;
        const tc = pa+pb; pa /= tc; pb /= tc;
      }

      m.probA = pa; m.probB = pb;
      m.algorithmWinner = pa >= pb ? m.teamA : m.teamB;

      // User pick override
      const pick = picks[ri] && picks[ri][mi];
      if (pick && pick.region === m.teamA.region && pick.seed === m.teamA.seed) {
        m.winner = m.teamA; m.isManualPick = true;
      } else if (pick && pick.region === m.teamB.region && pick.seed === m.teamB.seed) {
        m.winner = m.teamB; m.isManualPick = true;
      } else {
        m.winner = m.algorithmWinner; m.isManualPick = false;
      }

      const winProb = m.winner === m.teamA ? m.probA : m.probB;
      updatePathData(m.winner, winProb, pathData);
      const loser = m.winner === m.teamA ? m.teamB : m.teamA;
      if (m.winner.seed > loser.seed && m.winner.region === loser.region) {
        regionUpsets[m.winner.region]++;
      }
    });

    allRounds.push(matchups);
  }

  const champion = allRounds[5][0].winner;
  const path = allRounds.map((round, ri) => {
    const m = round.find(x => x.teamA === champion || x.teamB === champion);
    if (!m || m.winner !== champion) return null;
    const opp = m.teamA === champion ? m.teamB : m.teamA;
    return {round:ROUND_NAMES[ri], opp:opp.name, oppSeed:opp.seed, prob:m.winner===m.teamA?m.probA:m.probB};
  }).filter(Boolean);

  return {rounds:allRounds, champion, path};
}

function buildRoundMatchups(ri, prevRounds, lookup) {
  if (ri === 0) {
    const ms = [];
    ['East','South','West','Midwest'].forEach(region => {
      BRACKET_PAIRS.forEach(([sA,sB]) => {
        ms.push({region, teamA:lookup[region][sA], teamB:lookup[region][sB]});
      });
    });
    return ms;
  }
  const prev = prevRounds[ri-1];
  const ms = [];
  for (let i = 0; i < prev.length; i += 2) {
    const a = prev[i].winner, b = prev[i+1].winner;
    ms.push({region: a.region===b.region ? a.region : `${a.region}/${b.region}`, teamA:a, teamB:b});
  }
  return ms;
}

// Returns chain of downstream (ri, mi) affected when pick at (roundIdx, matchIdx) changes.
// Each parent match index = floor(child match index / 2) — uniform across all rounds.
function getCascade(roundIdx, matchIdx) {
  const chain = [];
  let ri = roundIdx+1, mi = Math.floor(matchIdx/2);
  while (ri <= 5) { chain.push({ri,mi}); mi = Math.floor(mi/2); ri++; }
  return chain;
}
