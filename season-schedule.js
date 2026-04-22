(function () {
  const RAW_SCHEDULE = [
    // =========================================================
    // UPDATE THIS ARRAY EACH WEEK
    // Keep this format:
    // {
    //   date: "2026-05-16",
    //   time: "09:15:00",
    //   home: "Giants (U6)",
    //   away: "Giants (U6)",
    //   homeScore: 0,
    //   awayScore: 0,
    //   field: "Field 1"
    // }
    // =========================================================

    { date: "2026-05-16", time: "09:15:00", home: "Giants (U6)",  away: "Giants (U6)",  homeScore: 0, awayScore: 0, field: "Field 1" },
    { date: "2026-05-16", time: "09:30:00", home: "Saints (U9)",  away: "Packers (U9)", homeScore: 1, awayScore: 0, field: "Field 1" },
    { date: "2026-05-16", time: "10:00:00", home: "Jets (U12)",   away: "Browns (U12)", homeScore: 2, awayScore: 0, field: "Field 1" },
    { date: "2026-05-16", time: "10:30:00", home: "Saints (U9)",  away: "Saints (U9)",  homeScore: 0, awayScore: 0, field: "Field 1" }
  ];

  function safeString(value) {
    return String(value ?? "").trim();
  }

  function normalizeTeamName(name) {
    return safeString(name).toLowerCase();
  }

  function inferDivision(teamName) {
    const match = safeString(teamName).match(/\((U\d+|Adult)\)/i);
    if (!match) return "";
    const value = match[1];
    return /^adult$/i.test(value) ? "Adult" : value.toUpperCase();
  }

  function formatWeekDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);

    if (Number.isNaN(dt.getTime())) return dateStr;

    return dt.toLocaleDateString("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatTime(timeStr) {
    const raw = safeString(timeStr);
    if (!raw) return "";

    const parts = raw.split(":");
    if (parts.length < 2) return raw;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return raw;

    const dt = new Date();
    dt.setHours(hours, minutes, 0, 0);

    return dt.toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function getTeamDirectoryList() {
    if (
      window.HFF_TEAM_DIRECTORY &&
      typeof window.HFF_TEAM_DIRECTORY.getAllTeams === "function"
    ) {
      return window.HFF_TEAM_DIRECTORY.getAllTeams() || [];
    }
    return [];
  }

  function findTeamRecord(teamName) {
    const target = normalizeTeamName(teamName);
    const teams = getTeamDirectoryList();

    let exact = teams.find(
      (t) => normalizeTeamName(t.teamLabel) === target
    );
    if (exact) return exact;

    exact = teams.find(
      (t) => normalizeTeamName(t.cardTitle) === target
    );
    if (exact) return exact;

    const stripped = target.replace(/\s*\((u\d+|adult)\)\s*/i, "").trim();

    return teams.find((t) => {
      const label = normalizeTeamName(t.teamLabel).replace(/\s*\((u\d+|adult)\)\s*/i, "").trim();
      const card = normalizeTeamName(t.cardTitle).replace(/\s*\((u\d+|adult)\)\s*/i, "").trim();
      return label === stripped || card === stripped;
    }) || null;
  }

  function getTeamLogo(teamName) {
    const team = findTeamRecord(teamName);
    return (team && team.teamLogo) ? team.teamLogo : "White Logo.jpg";
  }

  function getTeamPage(teamName) {
    const team = findTeamRecord(teamName);
    return (team && team.page) ? team.page : "#";
  }

  function normalizeGame(row, index) {
    const date = safeString(row.date);
    const time = safeString(row.time);
    const home = safeString(row.home);
    const away = safeString(row.away);

    if (!date || !time || !home || !away) return null;

    const homeScore =
      row.homeScore === null || row.homeScore === undefined || row.homeScore === ""
        ? ""
        : String(row.homeScore);

    const awayScore =
      row.awayScore === null || row.awayScore === undefined || row.awayScore === ""
        ? ""
        : String(row.awayScore);

    return {
      id: `${date}_${time}_${home}_${away}_${index}`,
      date,
      time,
      sortKey: `${date}T${time}`,
      division: inferDivision(home) || inferDivision(away),
      home,
      away,
      homeScore,
      awayScore,
      homeLogo: getTeamLogo(home),
      awayLogo: getTeamLogo(away),
      homePage: getTeamPage(home),
      awayPage: getTeamPage(away),
      homeRecord: safeString(row.homeRecord || ""),
      awayRecord: safeString(row.awayRecord || ""),
      datetime: formatTime(time),
      field: safeString(row.field || "Field TBD"),
      raw: row
    };
  }

  function getAllGames() {
    return RAW_SCHEDULE
      .map(normalizeGame)
      .filter(Boolean)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  function getAllWeeks() {
    const games = getAllGames();
    const byDate = new Map();

    games.forEach((game) => {
      if (!byDate.has(game.date)) {
        byDate.set(game.date, []);
      }
      byDate.get(game.date).push(game);
    });

    const dates = Array.from(byDate.keys()).sort();

    return dates.map((date, idx) => ({
      weekTitle: `Week ${idx + 1}`,
      weekDate: formatWeekDate(date),
      games: byDate.get(date)
    }));
  }

  function getGamesForTeam(teamName) {
    const target = normalizeTeamName(teamName);
    return getAllGames().filter((g) => {
      return (
        normalizeTeamName(g.home) === target ||
        normalizeTeamName(g.away) === target
      );
    });
  }

  window.HFF_SCHEDULE = {
    getAllGames,
    getAllWeeks,
    getGamesForTeam
  };
})();