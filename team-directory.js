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
  //   e.g., "Dolphins (U6)"
  // - page is the schedule page filename for that team card
  // - cardTitle is what you want displayed on the card (usually just the nickname)
  const TEAMS = [
    // U6
    { division: 'U6', teamLabel: 'Dolphins (U6)', cardTitle: 'Dolphins', teamLogo: 'Dolphins.png', page: 'scheduleA1.html' },

    // U8
    { division: 'U8', teamLabel: 'Bears (U8)', cardTitle: 'Bears', teamLogo: 'Bears.png', page: 'scheduleB1.html' },
    { division: 'U8', teamLabel: 'Saints (U8)', cardTitle: 'Saints', teamLogo: 'Saints.png', page: 'scheduleB2.html' },
    { division: 'U8', teamLabel: 'Bills (U8)', cardTitle: 'Bills', teamLogo: 'Bills.png', page: 'scheduleB3.html' }


    // Add more later, examples:
    // { division:'U8', teamLabel:'Ravens (U8)', cardTitle:'Ravens', teamLogo:'Ravens.png', page:'scheduleB1.html' },
    // { division:'U8', teamLabel:'Bills (U8)', cardTitle:'Bills', teamLogo:'Bills.png', page:'scheduleB2.html' },
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
