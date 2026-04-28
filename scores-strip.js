console.log("scores-strip.js loaded v13");

function stripDivision(teamName) {
  return String(teamName || '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();
}

function getTeamLogo(teamName) {
  const cleanName = stripDivision(teamName).split(' ')[0].trim();
  return `${cleanName}.png`;
}

function hasRealValue(value) {
  return value !== '' && value !== null && value !== undefined;
}

function hasRealScore(value) {
  return hasRealValue(value);
}

function weekHasAnyScores(week) {
  return (week.games || []).some(function (g) {
    return hasRealScore(g.homeScore) || hasRealScore(g.awayScore);
  });
}

function parseDisplayDate(dateSource) {
  if (!dateSource) return null;

  let date = new Date(dateSource);
  if (!isNaN(date)) return date;

  const match = String(dateSource).match(/([A-Za-z]+),?\s+([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (match) {
    date = new Date(`${match[2]} ${match[3]}, ${match[4]}`);
    if (!isNaN(date)) return date;
  }

  return null;
}

function formatStripTitle(week, game) {
  const dateSource = game.dateText || week.weekDate || '';
  const parsedDate = parseDisplayDate(dateSource);

  let time = String(game.datetime || '').trim();
  time = time.replace(' AM', 'AM').replace(' PM', 'PM');

  if (!parsedDate) {
    return time || '';
  }

  const month = parsedDate.toLocaleString('en-US', { month: 'short' });
  const day = parsedDate.getDate();

  if (time) {
    return `${month} ${day} - ${time}`;
  }

  return `${month} ${day}`;
}

function buildStripGames() {
  if (!window.HFF_SCHEDULE || typeof window.HFF_SCHEDULE.getAllWeeks !== 'function') {
    return [];
  }

  const weeks = window.HFF_SCHEDULE.getAllWeeks() || [];
  if (!weeks.length) return [];

  let latestScoredWeekIndex = -1;

  weeks.forEach(function (week, idx) {
    if (weekHasAnyScores(week)) {
      latestScoredWeekIndex = idx;
    }
  });

  const output = [];

  if (latestScoredWeekIndex >= 0) {
    const scoredWeek = weeks[latestScoredWeekIndex];

    (scoredWeek.games || []).forEach(function (game) {
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
      (nextWeek.games || []).forEach(function (game) {
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

    (firstWeek.games || []).forEach(function (game) {
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

function renderScoreStrip(targetId) {
  const scoreRow = document.getElementById(targetId || 'scoreRow');
  if (!scoreRow) return false;

  const games = buildStripGames();
  if (!games.length) return false;

  scoreRow.innerHTML = '';

  games.forEach(function (game) {
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

  if (scoreRow.children.length > 1 && !window.__hffScoreStripRotator) {
    window.__hffScoreStripRotator = setInterval(function () {
      const firstBox = scoreRow.firstElementChild;
      if (firstBox) {
        scoreRow.appendChild(firstBox);
      }
    }, 5000);
  }

  return true;
}

function waitForScheduleAndRender() {
  let attempts = 0;
  const maxAttempts = 100;

  function tryRender() {
    attempts += 1;

    const rendered = renderScoreStrip('scoreRow');
    if (rendered) {
      console.log('score strip rendered');
      return;
    }

    if (attempts < maxAttempts) {
      setTimeout(tryRender, 100);
    } else {
      console.log('score strip failed to render after waiting');
    }
  }

  tryRender();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForScheduleAndRender);
} else {
  waitForScheduleAndRender();
}
