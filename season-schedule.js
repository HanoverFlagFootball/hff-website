/* season-schedule.js */

(function () {

  const SEASON_WEEKS = [
    {
      weekTitle: 'Week 1',
      weekDate: 'Saturday, May 16th, 2026',
      games: [
        {
          away: 'Packers (U9)',
          awayLogo: 'Packers.png',
          awayRecord: '(0-1)',
          awayScore: '0',
          home: 'Saints (U9)',
          homeLogo: 'Saints.png',
          homeRecord: '(1-1)',
          homeScore: '1',
          datetime: 'Sat, May 16 • 9:30 AM',
          field: 'Field A'
        }
      ]
    }
  ];

  // =========================
  // HELPERS
  // =========================

  function getAllWeeks() {
    return SEASON_WEEKS.slice();
  }

  function getAllGames() {
    return SEASON_WEEKS.flatMap(week => week.games || []);
  }

  function getGamesForTeam(teamLabel) {
    const t = String(teamLabel || '').trim().toLowerCase();

    return getAllGames().filter(g =>
      String(g.away || '').toLowerCase() === t ||
      String(g.home || '').toLowerCase() === t
    );
  }

  function getWeeksForTeam(teamLabel) {
    const t = String(teamLabel || '').trim().toLowerCase();

    return SEASON_WEEKS.map(week => {
      const games = (week.games || []).filter(g =>
        String(g.away || '').toLowerCase() === t ||
        String(g.home || '').toLowerCase() === t
      );

      return {
        weekTitle: week.weekTitle,
        weekDate: week.weekDate,
        games
      };
    }).filter(week => week.games.length > 0);
  }

  // =========================
  // EXPOSE GLOBAL
  // =========================

  window.HFF_SCHEDULE = {
    weeks: SEASON_WEEKS,
    getAllWeeks,
    getAllGames,
    getGamesForTeam,
    getWeeksForTeam
  };

})();