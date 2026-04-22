/* season-schedule.js
   Full season schedule + scores.
   Grouped by week so Scores & Schedules can render the full season.
   Team names must match team-directory.js exactly, e.g. "Giants (U6)"
*/

(function () {
  // =========================================================
  // 1) FULL SEASON WEEKS LIST
  // =========================================================
  const SEASON_WEEKS = [
    {
      weekTitle: 'Week 1',
      weekDate: 'Saturday, May 16th, 2026',
      games: [
        {
          away: 'Giants (U6)',
          awayLogo: 'Giants.png',
          awayRecord: '(0-0)',
          awayScore: 'TBD',
          home: 'Giants (U6)',
          homeLogo: 'Giants.png',
          homeRecord: '(0-0)',
          homeScore: 'TBD',
          datetime: 'Sat, May 16 • 10:15 AM',
          field: 'Field A'
        },
        {
          away: 'Packers (U9)',
          awayLogo: 'Packers.png',
          awayRecord: '(0-0)',
          awayScore: 'TBD',
          home: 'Saints (U9)',
          homeLogo: 'Saints.png',
          homeRecord: '(0-0)',
          homeScore: 'TBD',
          datetime: 'Sat, May 16 • 11:00 AM',
          field: 'Field B'
        },
        {
          away: 'Bears (U9)',
          awayLogo: 'Bears.png',
          awayRecord: '(0-0)',
          awayScore: 'TBD',
          home: 'Packers (U9)',
          homeLogo: 'Packers.png',
          homeRecord: '(0-0)',
          homeScore: 'TBD',
          datetime: 'Sat, May 16 • 11:45 AM',
          field: 'Field C'
        },
        {
          away: 'Ravens (U12)',
          awayLogo: 'Ravens.png',
          awayRecord: '(0-0)',
          awayScore: 'TBD',
          home: 'Bills (U12)',
          homeLogo: 'Bills.png',
          homeRecord: '(0-0)',
          homeScore: 'TBD',
          datetime: 'Sat, May 16 • 12:30 PM',
          field: 'Field A'
        },
        {
          away: 'Jets (U12)',
          awayLogo: 'Jets.png',
          awayRecord: '(0-0)',
          awayScore: 'TBD',
          home: 'Browns (U12)',
          homeLogo: 'Browns.png',
          homeRecord: '(0-0)',
          homeScore: 'TBD',
          datetime: 'Sat, May 16 • 1:15 PM',
          field: 'Field B'
        },
        {
          away: 'Cowboys (U16)',
          awayLogo: 'Cowboys.png',
          awayRecord: '(0-0)',
          awayScore: 'TBD',
          home: 'Chiefs (U16)',
          homeLogo: 'Chiefs.png',
          homeRecord: '(0-0)',
          homeScore: 'TBD',
          datetime: 'Sat, May 16 • 2:00 PM',
          field: 'Field C'
        },
        {
          away: 'Patriots (U16)',
          awayLogo: 'Patriots.png',
          awayRecord: '(0-0)',
          awayScore: 'TBD',
          home: 'Panthers (U16)',
          homeLogo: 'Panthers.png',
          homeRecord: '(0-0)',
          homeScore: 'TBD',
          datetime: 'Sat, May 16 • 2:45 PM',
          field: 'Field A'
        },
        {
          away: 'Commanders (U16)',
          awayLogo: 'Commanders.png',
          awayRecord: '(0-0)',
          awayScore: 'TBD',
          home: 'Cowboys (U16)',
          homeLogo: 'Cowboys.png',
          homeRecord: '(0-0)',
          homeScore: 'TBD',
          datetime: 'Sat, May 16 • 3:30 PM',
          field: 'Field B'
        }
      ]
    },

    {
      weekTitle: 'Week 2',
      weekDate: 'Saturday, May 23rd, 2026',
      games: [
        {
          away: 'Saints (U9)',
          awayLogo: 'Saints.png',
          awayRecord: '(0-1)',
          awayScore: 'TBD',
          home: 'Bears (U9)',
          homeLogo: 'Bears.png',
          homeRecord: '(0-1)',
          homeScore: 'TBD',
          datetime: 'Sat, May 23 • 11:00 AM',
          field: 'Field A'
        },
        {
          away: 'Bills (U12)',
          awayLogo: 'Bills.png',
          awayRecord: '(1-0)',
          awayScore: 'TBD',
          home: 'Jets (U12)',
          homeLogo: 'Jets.png',
          homeRecord: '(0-1)',
          homeScore: 'TBD',
          datetime: 'Sat, May 23 • 12:00 PM',
          field: 'Field B'
        },
        {
          away: 'Chiefs (U16)',
          awayLogo: 'Chiefs.png',
          awayRecord: '(1-0)',
          awayScore: 'TBD',
          home: 'Patriots (U16)',
          homeLogo: 'Patriots.png',
          homeRecord: '(0-1)',
          homeScore: 'TBD',
          datetime: 'Sat, May 23 • 1:00 PM',
          field: 'Field C'
        }
      ]
    }
  ];

  // =========================================================
  // 2) HELPERS
  // =========================================================

  function getAllWeeks() {
    return SEASON_WEEKS.slice();
  }

  function getAllGames() {
    return SEASON_WEEKS.flatMap(week => week.games || []);
  }

  function getGamesForTeam(teamLabel) {
    const t = String(teamLabel || '').trim().toLowerCase();

    return getAllGames().filter(g =>
      String(g.away || '').trim().toLowerCase() === t ||
      String(g.home || '').trim().toLowerCase() === t
    );
  }

  function getWeeksForTeam(teamLabel) {
    const t = String(teamLabel || '').trim().toLowerCase();

    return SEASON_WEEKS.map(week => {
      const games = (week.games || []).filter(g =>
        String(g.away || '').trim().toLowerCase() === t ||
        String(g.home || '').trim().toLowerCase() === t
      );

      return {
        weekTitle: week.weekTitle,
        weekDate: week.weekDate,
        games
      };
    }).filter(week => week.games.length > 0);
  }

  // =========================================================
  // 3) EXPOSE GLOBAL
  // =========================================================
  window.HFF_SCHEDULE = {
    weeks: SEASON_WEEKS,
    getAllWeeks,
    getAllGames,
    getGamesForTeam,
    getWeeksForTeam
  };
})();