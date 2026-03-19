# 🏀 March Madness Bracket Simulator — 2026 (v2)

A probabilistic bracket simulator built around a round-adaptive **P_base v2 algorithm**. Weights shift each round as seed history becomes less predictive. Click any team row to pick your winner — click again to unselect. At the end, click **View full bracket** to see all 6 rounds laid out and print to PDF.

---

## What's new in v2

| Feature | v1 | v2 |
|---|---|---|
| Seed component | Flat historical win rate | **Round-specific survival rates** — #2 seeds drop to near-zero at Championship, matching 20-yr data |
| Upset modeling | None | **Timing modifiers** — 12-5 boosts in R64/R32, penalized post-Sweet 16; 6-11 and 7-10 peak in R32 |
| Program DNA | None | **Elite program modifiers** — Duke +6%, Kansas/UConn/Gonzaga +5%, 8 others baked in |
| Path dependency | None | **Close-game penalty** (−2%/win), **blowout boost** (+1.5%), **cumulative fatigue** after 3–4 games |
| Upset clustering | None | **Region cascade** — each upset in a region lifts next upset probability by 4–7% |
| Season trend | None | **2026 adjustment** — slightly upset-heavy year boosts weaker seeds by 5% |
| Picks | Algorithm only | **Manual picks**: click to pick, click again to unselect; cascades clear downstream |
| Bracket view | None | **Full bracket modal** with print / save PDF |

---

## Algorithm

```
P_base = weighted_avg(
  RoundSurvival[seed][round],   // 38% → 7%   (Round of 64 → Championship)
  EfficiencyRating / 100,       // 20% → 38%
  RecentForm / 10,              // 15% → 26%
  RegionalDifficulty / 10,      // 10% →  5%
  CoachingFactor / 10           // 17% → 24%
)

P_base *= ProgramModifier       // Elite programs: +2–6%
P_base *= PathFactor            // Close wins: −2%; blowouts: +1.5%; fatigue after 3–4 games
P_base *= ClusterBoost          // Upset clustering: +4–7% per region upset
P_base *= SeasonTrend           // 2026 upset-heavy: +5% to weaker seeds

WinProb(A vs B) = P_base(A) / (P_base(A) + P_base(B))
```

Round survival rates used in the seed component (historically derived):

| Seed | R64 | R32 | S16 | E8 | FF | Champ |
|---|---|---|---|---|---|---|
| #1 | 98.5% | 87.5% | **68%** | **58%** | 52% | **22.5%** |
| #2 | 93.5% | 72% | **58%** | **50%** | 38% | **~3%** |
| #3 | 85.5% | 64% | **47%** | **45%** | 30% | 12.5% |
| #4 | 79.5% | 56% | **38%** | **42.5%** | 27.5% | 9.5% |
| #5 | 65.5% | 43% | **28%** | 20% | 15.5% | 7.2% |
| #6–#9 | varies | varies | **20–25%** | ~15% | ~10% | ~5% |
| #10–#16 | varies | varies | **<15%** | <10% | <6% | <2% |

---

## Deploying

### GitHub Pages (free, zero config)
1. Push this repo to GitHub
2. **Settings → Pages → Source:** `main` branch, `/ (root)`
3. Live at `https://your-username.github.io/bracket-simulator`

### Netlify (drop-and-go)
Drag the entire folder onto [netlify.com](https://netlify.com). Done.

```bash
# Or via CLI:
npm install -g netlify-cli
netlify deploy --dir . --prod
```

### Vercel
```bash
npm install -g vercel
cd bracket-simulator
vercel --prod
```

### Local
```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# Then open http://localhost:8080
```

No build step, no dependencies — pure HTML/CSS/JS.

---

## Customizing

### Team data — `js/data.js`
Each team: `name`, `seed`, `efficiency` (0–100, ≈ inverse KenPom rank), `form` (1–10), `coaching` (1–10), `regDiff` (1–10).

### Slider bounds — `js/bounds.js`
The orange "realistic zone" on each slider. Adjust per-seed ranges if this year's field feels different. Has no effect on simulation math.

### Algorithm constants — `js/engine.js`
- `ROUND_WEIGHTS` — adjust weight decay curves
- `ROUND_SURVIVAL` — per-seed per-round survival rates
- `UPSET_MODS` — per-matchup upset timing modifiers
- `PROGRAM_MODS` — elite program multipliers
- `SEASON_TREND` — yearly upset-heavy/light adjustment

---

## File Structure

```
bracket-simulator/
├── index.html              App shell
├── css/
│   └── styles.css          Full design system + print styles
├── js/
│   ├── data.js             64 teams with default values
│   ├── bounds.js           Seed-based realistic bounds (slider zones)
│   ├── engine.js           P_base v2 formula + bracket simulation
│   ├── bracket-view.js     Full bracket modal + print
│   ├── ui.js               Rendering + team editor modal
│   └── main.js             App bootstrap + state + pick management
└── README.md
```

---

## License

MIT — use freely, credit appreciated.
