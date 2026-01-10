// scores-strip.js

// Automatically get logo path based on team name (spaces removed)
function getTeamLogo(teamName) {
  const cleanName = teamName.replace(/\s+/g, '');
  return `${cleanName}.png`;
}

// === GAMES DATA (EDIT THIS WEEKLY IN ONE PLACE) ===
const games = [
  { home: "Bengals", homeRecord: "0-0", away: "Broncos", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "Patriots", homeRecord: "0-0", away: "Jets", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "Packers", homeRecord: "0-0", away: "Bears", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "49ers",   homeRecord: "0-0", away: "Seahawks", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "Giants",  homeRecord: "0-0", away: "Jets", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "Lions",   homeRecord: "0-0", away: "Cowboys", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "Raiders", homeRecord: "0-0", away: "Falcons", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "Bills",   homeRecord: "0-0", away: "Bears", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "Packers",  homeRecord: "0-0", away: "Dolphins", awayRecord: "0-0", date: "TBD", status: "Field TBD" },
  { home: "Commanders",   homeRecord: "0-0", away: "Chargers", awayRecord: "0-0", date: "TBD", status: "Field TBD" }


// { home: "Packers", homeRecord: "4-2", away: "Bears", awayRecord: "1-6", date: "Nov 12, 2:30 PM", status: "Field C" },
// { home: "Bills",   homeScore: 30, away: "Dolphins", awayScore: 28, date: "Nov 7, 6:00 PM", status: "Final" },

];

function renderScoreStrip(targetId = 'scoreRow') {
  const scoreRow = document.getElementById(targetId);
  if (!scoreRow) return;

  games.forEach(game => {
    const box = document.createElement('a');
    box.className = 'score-box';
    box.href = "scores&schedules.html"; // link for every box
    box.style.textDecoration = "none";
    box.style.color = "#000"; // force black text on the anchor itself

    const homeLogo = getTeamLogo(game.home);
    const awayLogo = getTeamLogo(game.away);

    const homeDisplay = (typeof game.homeScore === 'number')
      ? game.homeScore : (game.homeRecord || '');
    const awayDisplay = (typeof game.awayScore === 'number')
      ? game.awayScore : (game.awayRecord || '');

    box.innerHTML = `
      <div class="score-title" style="color:#000;">${game.date || ""}</div>
      <div class="team-row">
        <div class="team-left">
          <img src="${homeLogo}" alt="${game.home}" class="team-logo">
          <span class="team-name" style="color:#000;">${game.home}</span>
        </div>
        <span class="team-score" style="color:#000;">${homeDisplay}</span>
      </div>
      <div class="team-row">
        <div class="team-left">
          <img src="${awayLogo}" alt="${game.away}" class="team-logo">
          <span class="team-name" style="color:#000;">${game.away}</span>
        </div>
        <span class="team-score" style="color:#000;">${awayDisplay}</span>
      </div>
      <div class="score-status" style="color:#000;">${game.status}</div>
    `;

    scoreRow.appendChild(box);
  });

  // rotate score boxes every 5 seconds
  setInterval(() => {
    const firstBox = scoreRow.firstElementChild;
    if (firstBox) scoreRow.appendChild(firstBox);
  }, 5000);
}

// Run automatically on each page that includes this file
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => renderScoreStrip());
} else {
  renderScoreStrip();
}

