// scores-strip.js

function stripDivision(teamName) {
  return String(teamName || '').replace(/\s*\((U\d+|Adult)\)\s*/i, '').trim();
}

function getTeamLogo(teamName) {
  const cleanName = stripDivision(teamName).replace(/\s+/g, '');

  if (
    window.HFF_TEAM_DIRECTORY &&
    typeof window.HFF_TEAM_DIRECTORY.getAllTeams === 'function'
  ) {
    const teams = window.HFF_TEAM_DIRECTORY.getAllTeams() || [];
    const match = teams.find(t => {
      const label = stripDivision(t.teamLabel || '').toLowerCase();
      const card = stripDivision(t.cardTitle || '').toLowerCase();
      const target = stripDivision(teamName).toLowerCase();
      return label === target || card === target;
    });

    if (match && match.teamLogo) return match.teamLogo;
  }

  return `${cleanName}.png`;
}

function hasRealScore(value) {
  return value !== '' && value !== null && value !== undefined;
}

function weekHasAnyScores(week) {
  return (week.games || []).some(g => hasRealScore(g.homeScore) || hasRealScore(g.awayScore));
}

function formatUpcomingTitle(week, game) {
  if (game.datetime) return game.datetime;
  return week.weekDate || week.weekTitle || '';
}

function buildStripGames() {
  if (!window.HFF_SCHEDULE || typeof window.HFF_SCHEDULE.getAllWeeks !== 'function') {
    return [];
  }

  const weeks = window.HFF_SCHEDULE.getAllWeeks() || [];
  if (!weeks.length) return [];

  let latestScoredWeekIndex = -1;

  weeks.forEach((week, idx) => {
    if (weekHasAnyScores(week)) latestScoredWeekIndex = idx;
  });

  const output = [];

  if (latestScoredWeekIndex >= 0) {
    const scoredWeek = weeks[latestScoredWeekIndex];
    (scoredWeek.games || []).forEach(game => {
      output.push({
        type: 'final',
        title: scoredWeek.weekTitle || scoredWeek.weekDate || '',
        status: 'Final',
        home: game.home,
        away: game.away,
        homeLogo: game.homeLogo || getTeamLogo(game.home),
        awayLogo: game.awayLogo || getTeamLogo(game.away),
        homeDisplay: hasRealScore(game.homeScore) ? game.homeScore : (game.homeRecord || ''),
        awayDisplay: hasRealScore(game.awayScore) ? game.awayScore : (game.awayRecord || '')
      });
    });

    const nextWeek = weeks[latestScoredWeekIndex + 1];
    if (nextWeek) {
      (nextWeek.games || []).forEach(game => {
        output.push({
          type: 'upcoming',
          title: formatUpcomingTitle(nextWeek, game),
          status: game.field ? `Field ${game.field}` : 'Upcoming',
          home: game.home,
          away: game.away,
          homeLogo: game.homeLogo || getTeamLogo(game.home),
          awayLogo: game.awayLogo || getTeamLogo(game.away),
          homeDisplay: game.homeRecord || '',
          awayDisplay: game.awayRecord || ''
        });
      });
    }
  } else {
    const firstWeek = weeks[0];
    (firstWeek.games || []).forEach(game => {
      output.push({
        type: 'upcoming',
        title: formatUpcomingTitle(firstWeek, game),
        status: game.field ? `Field ${game.field}` : 'Upcoming',
        home: game.home,
        away: game.away,
        homeLogo: game.homeLogo || getTeamLogo(game.home),
        awayLogo: game.awayLogo || getTeamLogo(game.away),
        homeDisplay: game.homeRecord || '',
        awayDisplay: game.awayRecord || ''
      });
    });
  }

  return output;
}

function renderScoreStrip(targetId = 'scoreRow') {
  const scoreRow = document.getElementById(targetId);
  if (!scoreRow) return;

  const games = buildStripGames();
  scoreRow.innerHTML = '';

  games.forEach(game => {
    const box = document.createElement('a');
    box.className = 'score-box';
    box.href = 'scores&schedules.html';
    box.style.textDecoration = 'none';
    box.style.color = '#000';

    box.innerHTML = `
      <div class="score-title" style="color:#000;">${game.title || ''}</div>
      <div class="team-row">
        <div class="team-left">
          <img src="${game.homeLogo}" alt="${game.home}" class="team-logo">
          <span class="team-name" style="color:#000;">${game.home}</span>
        </div>
        <span class="team-score" style="color:#000;">${game.homeDisplay}</span>
      </div>
      <div class="team-row">
        <div class="team-left">
          <img src="${game.awayLogo}" alt="${game.away}" class="team-logo">
          <span class="team-name" style="color:#000;">${game.away}</span>
        </div>
        <span class="team-score" style="color:#000;">${game.awayDisplay}</span>
      </div>
      <div class="score-status" style="color:#000;">${game.status}</div>
    `;

    scoreRow.appendChild(box);
  });

  if (scoreRow.children.length > 1) {
    setInterval(() => {
      const firstBox = scoreRow.firstElementChild;
      if (firstBox) scoreRow.appendChild(firstBox);
    }, 5000);
  }
}

window.addEventListener('load', function () {
  renderScoreStrip();
});