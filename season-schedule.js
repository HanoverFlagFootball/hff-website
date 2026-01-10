/* season-schedule.js
   Single source of truth for schedules + scores.
   Team names include division in the label, e.g. "Lions (U10)".
*/

(function () {
  // =========================
  // 1) FULL SEASON GAMES LIST
  // =========================
  // Keep this format the same everywhere so your rendering code stays simple.
  const WEEK_GAMES = [
    {
      away: 'Ravens (U8)',
      awayLogo: 'Ravens.png',
      awayRecord: '(2-0)',
      awayScore: 'TBD',
      home: 'Bills (U8)',
      homeLogo: 'Bills.png',
      homeRecord: '(1-1)',
      homeScore: 'TBD',
      datetime: 'Sat, May 16 • 11:00 AM',
      field: 'Field A'
    },
    {
      away: 'Broncos (U8)',
      awayLogo: 'Broncos.png',
      awayRecord: '(1-1)',
      awayScore: 'TBD',
      home: 'Raiders (U8)',
      homeLogo: 'Raiders.png',
      homeRecord: '(0-2)',
      homeScore: 'TBD',
      datetime: 'Sat, May 16 • 11:45 AM',
      field: 'Field B'
    },
    {
      away: 'Bengals (U8)',
      awayLogo: 'Bengals.png',
      awayRecord: '(2-0)',
      awayScore: 'TBD',
      home: 'Steelers (U8)',
      homeLogo: 'Steelers.png',
      homeRecord: '(1-1)',
      homeScore: 'TBD',
      datetime: 'Sat, May 16 • 12:30 PM',
      field: 'Field C'
    },
    {
      away: 'Eagles (U10)',
      awayLogo: 'Eagles.png',
      awayRecord: '(1-1)',
      awayScore: 'TBD',
      home: 'Cowboys (U10)',
      homeLogo: 'Cowboys.png',
      homeRecord: '(2-0)',
      homeScore: 'TBD',
      datetime: 'Sat, May 16 • 1:30 PM',
      field: 'Field A'
    },
    {
      away: 'Rams (U16)',
      awayLogo: 'Rams.png',
      awayRecord: '(2-0)',
      awayScore: 'TBD',
      home: 'Chiefs (U16)',
      homeLogo: 'Chiefs.png',
      homeRecord: '(2-0)',
      homeScore: 'TBD',
      datetime: 'Sat, May 16 • 2:15 PM',
      field: 'Field B'
    },
    {
      away: 'Giants (U13)',
      awayLogo: 'Giants.png',
      awayRecord: '(0-2)',
      awayScore: 'TBD',
      home: 'Lions (U13)',
      homeLogo: 'Lions.png',
      homeRecord: '(2-0)',
      homeScore: 'TBD',
      datetime: 'Sat, May 16 • 3:00 PM',
      field: 'Field C'
    },

    // Example Dolphins (U6) entry – edit to match your real schedule
    {
      away: 'Dolphins (U6)',
      awayLogo: 'Dolphins.png',
      awayRecord: '(0-0)',
      awayScore: 'TBD',
      home: 'Ravens (U6)',
      homeLogo: 'Ravens.png',
      homeRecord: '(0-0)',
      homeScore: 'TBD',
      datetime: 'Sat, May 16 • 10:15 AM',
      field: 'Field A'
    }
  ];

  // =========================
  // 2) OPTIONAL: SIMPLE HELPERS
  // =========================

  // Return all games (for the big By Week view)
  function getAllGames() {
    return WEEK_GAMES.slice(); // copy
  }

  // Return only games for a specific team label, e.g. "Dolphins (U6)"
  function getGamesForTeam(teamLabel) {
    const t = String(teamLabel || '').trim().toLowerCase();
    return WEEK_GAMES.filter(g =>
      String(g.away || '').toLowerCase() === t ||
      String(g.home || '').toLowerCase() === t
    );
  }

  // Expose to pages (simple global)
  window.HFF_SCHEDULE = {
    games: WEEK_GAMES,
    getAllGames,
    getGamesForTeam
  };
})();
