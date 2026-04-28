// scores-strip.js (CSV-powered)

function getTeamLogo(teamName) {
  if (!teamName || teamName.startsWith('#') || teamName.toLowerCase().includes('winner')) {
    return "Logo.jpg";
  }
  return teamName.replace(/\s*\(.*?\)/, '').replace(/\s+/g, '') + ".png";
}

function getMostRecentGames(allGames) {
  // sort by date (latest first)
  const sorted = allGames.slice().sort((a, b) => {
    const da = new Date(a.dateText || a.datetime);
    const db = new Date(b.dateText || b.datetime);
    return db - da;
  });

  // get latest date
  const latestDate = sorted.length ? sorted[0].dateText : null;

  return sorted.filter(g => g.dateText === latestDate);
}

function getUpcomingGames(allGames) {
  const now = new Date();

  const upcoming = allGames
    .map(g => {
      const date = new Date(g.dateText + " " + g.datetime);
      return { ...g, dateObj: date };
    })
    .filter(g => g.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj);

  return upcoming.slice(0, 6); // next 6 games
}

function renderScoreStrip(targetId = 'scoreRow') {
  const scoreRow = document.getElementById(targetId);
  if (!scoreRow) return;

  if (!window.HFF_SCHEDULE || !window.HFF_SCHEDULE.getAllGames) return;

  const allGames = window.HFF_SCHEDULE.getAllGames();

  const recentGames = getMostRecentGames(allGames);
  const upcomingGames = getUpcomingGames(allGames);

  const displayGames = [...recentGames, ...upcomingGames];

  displayGames.forEach(game => {
    const box = document.createElement('a');
    box.className = 'score-box';
    box.href = "scores&schedules.html";

    const homeLogo = getTeamLogo(game.home);
    const awayLogo = getTeamLogo(game.away);

    const homeDisplay = game.homeScore || game.homeRecord || '';
    const awayDisplay = game.awayScore || game.awayRecord || '';

    box.innerHTML = `
      <div class="score-title">${game.datetime || ''}</div>
      <div class="team-row">
        <div class="team-left">
          <img src="${homeLogo}" class="team-logo">
          <span class="team-name">${game.home}</span>
        </div>
        <span class="team-score">${homeDisplay}</span>
      </div>
      <div class="team-row">
        <div class="team-left">
          <img src="${awayLogo}" class="team-logo">
          <span class="team-name">${game.away}</span>
        </div>
        <span class="team-score">${awayDisplay}</span>
      </div>
      <div class="score-status">${game.field || ''}</div>
    `;

    scoreRow.appendChild(box);
  });

  // rotation
  setInterval(() => {
    const firstBox = scoreRow.firstElementChild;
    if (firstBox) scoreRow.appendChild(firstBox);
  }, 5000);
}

// WAIT for CSV to load
if (window.HFF_SCHEDULE_LOADED) {
  window.HFF_SCHEDULE_LOADED.then(() => renderScoreStrip());
} else {
  document.addEventListener('DOMContentLoaded', () => renderScoreStrip());
}