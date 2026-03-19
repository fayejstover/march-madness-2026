// ─── Full Bracket Print View ──────────────────────────────────────────────────
// Opens a modal showing the complete bracket across all 6 rounds.
// Each region is shown as a column progression. Print button calls window.print().
// ─────────────────────────────────────────────────────────────────────────────

const BracketView = (() => {

  // Build a region's rounds (R64→E8) as HTML columns
  function regionColumns(region, simResult, side) {
    // side: 'left' (East/South flow left→right) or 'right' (West/Midwest flow right→left)
    const roundIdxs = [0,1,2,3]; // R64, R32, S16, E8
    const cols = roundIdxs.map(ri => {
      const matches = simResult.rounds[ri].filter(m => m.region === region);
      const slots = matches.flatMap(m => [
        {team: m.teamA, isWinner: m.winner===m.teamA, isManual: m.isManualPick && m.winner===m.teamA, prob: Math.round(m.probA*100)},
        {team: m.teamB, isWinner: m.winner===m.teamB, isManual: m.isManualPick && m.winner===m.teamB, prob: Math.round(m.probB*100)},
      ]);
      const colSlots = slots.map(s => {
        const cls = s.isWinner ? (s.isManual?'bslot winner manual':'bslot winner') : 'bslot';
        return `<div class="${cls}">
          <span class="bs-seed">${s.team.seed}</span>
          <span class="bs-name">${s.team.name}</span>
          <span class="bs-prob">${s.prob}%</span>
        </div>`;
      }).join('');
      return `<div class="bcol round-${ri}">${colSlots}</div>`;
    });
    return side==='left' ? cols.join('') : cols.reverse().join('');
  }

  // Final Four + Championship center block
  function centerBlock(simResult) {
    const ff = simResult.rounds[4];
    const champ = simResult.rounds[5][0];
    const ffTeamLeft = ff[0].winner;  // East/South winner
    const ffTeamRight = ff[1].winner; // West/Midwest winner
    const champion = champ.winner;
    const pLeft = Math.round((champ.teamA === ffTeamLeft ? champ.probA : champ.probB)*100);
    const pRight = 100-pLeft;
    const champIsLeft = champion === ffTeamLeft;
    return `
      <div class="bcenter">
        <div class="bc-title">Final Four</div>
        <div class="bc-ff-slot ${champIsLeft?'winner':''}">
          <span class="bs-seed">${ffTeamLeft.seed}</span>
          <span class="bs-name">${ffTeamLeft.name}</span>
          <span class="bs-prob">${pLeft}%</span>
        </div>
        <div class="bc-champ-wrap">
          <div class="bc-champ-label">Champion</div>
          <div class="bc-champ-name">${champion.name}</div>
          <div class="bc-champ-seed">${champion.region} · #${champion.seed}</div>
        </div>
        <div class="bc-ff-slot ${!champIsLeft?'winner':''}">
          <span class="bs-seed">${ffTeamRight.seed}</span>
          <span class="bs-name">${ffTeamRight.name}</span>
          <span class="bs-prob">${pRight}%</span>
        </div>
      </div>`;
  }

  // Full bracket HTML
  function buildHTML(simResult) {
    return `
      <div class="bv-overlay" id="bv-bg" onclick="BracketView.closeOverlay(event)">
        <div class="bv-panel">

          <div class="bv-header">
            <div>
              <div class="bv-title">2026 March Madness Bracket</div>
              <div class="bv-sub">Full bracket · All 6 rounds · Algorithm + manual picks</div>
            </div>
            <div class="bv-actions">
              <button class="bv-print-btn" onclick="BracketView.print()">🖨 Print / Save PDF</button>
              <button class="bv-close-btn" onclick="BracketView.close()">✕ Close</button>
            </div>
          </div>

          <div class="bv-legend">
            <span class="leg-item"><span class="leg-dot algo"></span>Algorithm pick</span>
            <span class="leg-item"><span class="leg-dot manual"></span>Your pick</span>
            <span class="leg-item"><span class="leg-dot champ-dot"></span>Champion</span>
          </div>

          <div class="bv-bracket" id="printable-bracket">

            <!-- ── East ──────────────────────────────────────────── -->
            <div class="bregion">
              <div class="breg-label">East</div>
              <div class="bregion-cols left">
                ${regionColumns('East', simResult, 'left')}
              </div>
            </div>

            <!-- ── South ─────────────────────────────────────────── -->
            <div class="bregion">
              <div class="breg-label">South</div>
              <div class="bregion-cols left">
                ${regionColumns('South', simResult, 'left')}
              </div>
            </div>

            <!-- ── Center ─────────────────────────────────────────── -->
            ${centerBlock(simResult)}

            <!-- ── West ──────────────────────────────────────────── -->
            <div class="bregion right-region">
              <div class="breg-label">West</div>
              <div class="bregion-cols right">
                ${regionColumns('West', simResult, 'right')}
              </div>
            </div>

            <!-- ── Midwest ────────────────────────────────────────── -->
            <div class="bregion right-region">
              <div class="breg-label">Midwest</div>
              <div class="bregion-cols right">
                ${regionColumns('Midwest', simResult, 'right')}
              </div>
            </div>

          </div>

          <div class="bv-footer">
            <em>Probabilities calculated using the round-adaptive P_base algorithm. ·
            2026 March Madness Bracket Simulator</em>
          </div>

        </div>
      </div>`;
  }

  function open(simResult) {
    document.getElementById('bracket-view-root').innerHTML = buildHTML(simResult);
    document.body.classList.add('modal-open');
  }

  function close() {
    document.getElementById('bracket-view-root').innerHTML = '';
    document.body.classList.remove('modal-open');
  }

  function closeOverlay(e) { if (e.target.id==='bv-bg') close(); }

  function print() {
    // Temporarily show the bracket panel full-screen for printing
    document.body.classList.add('printing');
    window.print();
    document.body.classList.remove('printing');
  }

  return {open, close, closeOverlay, print};
})();
