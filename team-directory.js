/* team-directory.js
   Central directory for:
   1) schedule pages -> which team label they represent (used by scheduleA1.html, etc.)
   2) Scores & Schedules "By Team" cards (division sections + cards)
*/

(function () {
  // =========================================================
  // A) TEAM LIST (used to build Scores & Schedules "By Team")
  // =========================================================
  // IMPORTANT:
  // - teamLabel MUST match the labels used in season-schedule.js exactly
  //   e.g., "Giants (U6)"
  // - page is the schedule page filename for that team card
  // - cardTitle is what you want displayed on the card (usually just the nickname)
  const TEAMS = [
    // U6
    { division: 'U6', teamLabel: 'Giants (U6)', cardTitle: 'Giants', teamLogo: 'Giants.png', page: 'scheduleA1.html' },

    // U9
    { division: 'U9', teamLabel: 'Packers (U9)', cardTitle: 'Packers', teamLogo: 'Packers.png', page: 'scheduleB1.html' },
    { division: 'U9', teamLabel: 'Saints (U9)', cardTitle: 'Saints', teamLogo: 'Saints.png', page: 'scheduleB2.html' },
    { division: 'U9', teamLabel: 'Bears (U9)', cardTitle: 'Bears', teamLogo: 'Bears.png', page: 'scheduleB3.html' },

    // U12
    { division: 'U12', teamLabel: 'Ravens (U12)', cardTitle: 'Ravens', teamLogo: 'Ravens.png', page: 'scheduleC1.html' },
    { division: 'U12', teamLabel: 'Bills (U12)', cardTitle: 'Bills', teamLogo: 'Bills.png', page: 'scheduleC2.html' },
    { division: 'U12', teamLabel: 'Jets (U12)', cardTitle: 'Jets', teamLogo: 'Jets.png', page: 'scheduleC3.html' },
    { division: 'U12', teamLabel: 'Browns (U12)', cardTitle: 'Browns', teamLogo: 'Browns.png', page: 'scheduleC4.html' },

    // U16
    { division: 'U16', teamLabel: 'Cowboys (U16)', cardTitle: 'Cowboys', teamLogo: 'Cowboys.png', page: 'scheduleD1.html' },
    { division: 'U16', teamLabel: 'Chiefs (U16)', cardTitle: 'Chiefs', teamLogo: 'Chiefs.png', page: 'scheduleD2.html' },
    { division: 'U16', teamLabel: 'Vikings (U16)', cardTitle: 'Vikings', teamLogo: 'Vikings.png', page: 'scheduleD3.html' },
    { division: 'U16', teamLabel: 'Panthers (U16)', cardTitle: 'Panthers', teamLogo: 'Panthers.png', page: 'scheduleD4.html' },
    { division: 'U16', teamLabel: 'Commanders (U16)', cardTitle: 'Commanders', teamLogo: 'Commanders.png', page: 'scheduleD5.html' }
  ];

  // =========================================================
  // B) PAGE -> TEAM (used by schedule pages like scheduleA1)
  // =========================================================
  // Build automatically from TEAMS so you only maintain one list.
  const PAGE_TO_TEAM = {};
  TEAMS.forEach(t => {
    if (!t || !t.page) return;
    PAGE_TO_TEAM[String(t.page).toLowerCase()] = {
      teamLabel: t.teamLabel,
      teamLogo: t.teamLogo,
      headerText: (t.division ? (t.division + ' ') : '') + (t.cardTitle || t.teamLabel || 'Schedule')
    };
  });

  // =========================================================
  // C) HELPERS
  // =========================================================
  function getCurrentPageName() {
    const path = window.location.pathname || '';
    const parts = path.split('/');
    return (parts[parts.length - 1] || '').toLowerCase();
  }

  function getTeamForPage(pageName) {
    const key = String(pageName || '').trim().toLowerCase();
    return PAGE_TO_TEAM[key] || null;
  }

  function getAllTeams() {
    return TEAMS.slice();
  }

  function getDivisions() {
    const set = {};
    TEAMS.forEach(t => {
      const d = String(t.division || '').trim();
      if (d) set[d] = true;
    });
    return Object.keys(set);
  }

  function getTeamsByDivision(division) {
    const d = String(division || '').trim().toLowerCase();
    return TEAMS.filter(t => String(t.division || '').trim().toLowerCase() === d);
  }

  // =========================================================
  // D) EXPOSE GLOBAL
  // =========================================================
  window.HFF_TEAM_DIRECTORY = {
    teams: TEAMS,
    pageMap: PAGE_TO_TEAM,
    getCurrentPageName,
    getTeamForPage,
    getAllTeams,
    getDivisions,
    getTeamsByDivision
  };
})();