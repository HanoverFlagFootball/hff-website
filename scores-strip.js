// scores-strip.js

function stripDivision(teamName) {
  return String(teamName || '').replace(/\s*\((U\d+|Adult)\)\s*/i, '').trim();
}

function getTeamLogo(teamName) {
  const cleanName = stripDivision(teamName).replace(/\s+/g, '');
  return `${cleanName}.png`;
}

function hasRealValue(value) {
  return value !== '' && value !== null && value !== undefined;
}

function hasRealScore(value) {
  return hasRealValue(value);
}

function weekHasAnyScores(week) {
  return (week.games || []).some(g => hasRealScore(g.homeScore) || hasRealScore(g.awayScore));
}

function formatStripTitle(week, game) {
  if (!game.dateText) {
    return game.datetime || '';
  }

  const date = new Date(game.dateText);

  if (isNaN(date)) {
    return game.datetime || '';
  }

  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();

  let time = game.datetime || '';

  // Clean up time (remove space before AM/PM)
  time = time.replace(' AM', 'AM').replace(' PM', 'PM');

  return `${month} ${day} - ${time}`;
}

function buildStripGames() {
  if (!window.HFF_SCHEDULE || typeof window.HFF_SCHEDULE.getAllWeeks !== 'function') {
    return [];
  }

  const weeks = window.HFF_SCHEDULE.getAllWeeks() || [];
  if (!weeks.length) return [];

  let latestScoredWeekIndex = -1;

  weeks.forEach((week, idx) => {
    if (weekHasAnyScores(week)) {
      latestScoredWeekIndex = idx;
    }
  });

  const output = [];

  if (latestScoredWeekIndex >= 0) {
    const scoredWeek = weeks[latestScoredWeekIndex];

    (scoredWeek.games || []).forEach(game => {
      output.push({
        title: formatStripTitle(scoredWeek, game),
        status: 'Final',
        home: game.home,
        away: game.away,
        homeLogo: getTeamLogo(game.home),
        awayLogo: getTeamLogo(game.away),
        homeDisplay: hasRealScore(game.homeScore) ? game.homeScore : (game.homeRecord || ''),
        awayDisplay: hasRealScore(game.awayScore) ? game.awayScore : (game.awayRecord || '')
      });
    });

    const nextWeek = weeks[latestScoredWeekIndex + 1];
    if (nextWeek) {
      (nextWeek.games || []).forEach(game => {
        output.push({
          title: formatStripTitle(nextWeek, game),
          status: game.field ? `Field ${game.field}` : 'Upcoming',
          home: game.home,
          away: game.away,
          homeLogo: getTeamLogo(game.home),
          awayLogo: getTeamLogo(game.away),
          homeDisplay: game.homeRecord || '',
          awayDisplay: game.awayRecord || ''
        });
      });
    }
  } else {
    const firstWeek = weeks[0];

    (firstWeek.games || []).forEach(game => {
      output.push({
        title: formatStripTitle(firstWeek, game),
        status: game.field ? `Field ${game.field}` : 'Upcoming',
        home: game.home,
        away: game.away,
        homeLogo: getTeamLogo(game.home),
        awayLogo: getTeamLogo(game.away),
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
      if (firstBox) {
        scoreRow.appendChild(firstBox);
      }
    }, 5000);
  }
}

window.addEventListener('load', function () {
  renderScoreStrip();
});