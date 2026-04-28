console.log("season-schedule.js loaded csv version 2");

window.HFF_SCHEDULE_READY = false;

function hffClean(text) {
  return String(text || "").replace(/^\uFEFF/, "").trim();
}

function hffSplitRows(text) {
  return String(text || "").trim().split(/\r?\n/);
}

function hffDetectDelimiter(headerLine) {
  if (headerLine.includes("\t")) return "\t";
  if (headerLine.includes(";")) return ";";
  return ",";
}

function hffParseScheduleCSV(text) {
  const lines = hffSplitRows(text);
  if (!lines.length) return [];

  const delimiter = hffDetectDelimiter(lines[0]);
  const headers = lines.shift().split(delimiter).map(hffClean);

  return lines.map(line => {
    const values = line.split(delimiter).map(hffClean);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
}

function hffStripDivision(teamLabel) {
  return String(teamLabel || "").replace(/\s*\(.*?\)\s*/g, "").trim();
}

function hffLogoForTeam(teamLabel) {
  const team = hffClean(teamLabel);

  if (!team || team.startsWith("#") || team.toLowerCase().startsWith("winner")) {
    return "Logo.jpg";
  }

  return hffStripDivision(team).replace(/\s+/g, "") + ".png";
}

function hffFormatTime(timeText) {
  const parts = String(timeText || "").split(":");
  if (parts.length < 2) return timeText || "";

  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${suffix}`;
}

function hffFormatDate(dateText) {
  const parts = String(dateText || "").split("-");
  if (parts.length !== 3) return dateText || "";

  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function hffWeekTitleForDate(dateText) {
  const titles = {
    "2026-05-16": "Week 1",
    "2026-05-23": "Week 2",
    "2026-05-30": "Week 3",
    "2026-06-06": "Week 4",
    "2026-06-13": "Week 5",
    "2026-06-20": "Week 6",
    "2026-06-27": "Week 7 - Playoffs",
    "2026-07-04": "Week 8 - Championship Week"
  };

  return titles[dateText] || hffFormatDate(dateText);
}

function hffBuildScheduleFromRows(rows) {
  const grouped = {};
  const order = [];

  rows.forEach(row => {
    const date = hffClean(row["Date"]);
    if (!date) return;

    if (!grouped[date]) {
      grouped[date] = [];
      order.push(date);
    }

    const type = hffClean(row["Type"] || "Game").toLowerCase();

    if (type === "practice") {
      const team = hffClean(row["Practice Team"]);

      grouped[date].push({
        type: "practice",
        team: team,
        teamLogo: hffLogoForTeam(team),
        teamRecord: hffClean(row["Home Record"] || row["Away Record"] || "0-0"),
        datetime: hffFormatTime(row["Time"]),
        dateText: hffFormatDate(date),
        field: hffClean(row["Field"])
      });
    } else {
      const home = hffClean(row["Home Team"]);
      const away = hffClean(row["Away Team"]);

      grouped[date].push({
        type: "game",
        away: away,
        awayLogo: hffLogoForTeam(away),
        awayRecord: hffClean(row["Away Record"] || "0-0"),
        awayScore: hffClean(row["Away Team Score"]),
        home: home,
        homeLogo: hffLogoForTeam(home),
        homeRecord: hffClean(row["Home Record"] || "0-0"),
        homeScore: hffClean(row["Home Team Score"]),
        datetime: hffFormatTime(row["Time"]),
        dateText: hffFormatDate(date),
        field: hffClean(row["Field"])
      });
    }
  });

  return order.map(date => ({
    weekTitle: hffWeekTitleForDate(date),
    weekDate: hffFormatDate(date),
    games: grouped[date]
  }));
}

window.HFF_SCHEDULE = {
  weeks: [],

  getAllWeeks: function () {
    return this.weeks || [];
  },

  getAllItems: function () {
    return this.getAllWeeks().flatMap(week => week.games || []);
  },

  getAllGames: function () {
    return this.getAllItems().filter(item => (item.type || "game") === "game");
  },

  getGameWeeks: function () {
    return this.getAllWeeks().map(week => ({
      weekTitle: week.weekTitle,
      weekDate: week.weekDate,
      games: (week.games || []).filter(item => (item.type || "game") === "game")
    }));
  },

  getWeeksForTeam: function (teamLabel) {
    const t = hffClean(teamLabel).toLowerCase();

    return this.getAllWeeks().map(week => {
      const games = (week.games || []).filter(item => {
        if ((item.type || "game") === "practice") {
          return hffClean(item.team).toLowerCase() === t;
        }

        return (
          hffClean(item.home).toLowerCase() === t ||
          hffClean(item.away).toLowerCase() === t
        );
      });

      return {
        weekTitle: week.weekTitle,
        weekDate: week.weekDate,
        games
      };
    }).filter(week => week.games.length > 0);
  }
};

window.HFF_SCHEDULE_LOADED = fetch("schedule.csv?v=2")
  .then(response => {
    if (!response.ok) throw new Error("Could not load schedule.csv");
    return response.text();
  })
  .then(text => {
    const rows = hffParseScheduleCSV(text);
    window.HFF_SCHEDULE.weeks = hffBuildScheduleFromRows(rows);
    window.HFF_SCHEDULE_READY = true;
    console.log("schedule.csv rows:", rows.length);
    console.log("schedule weeks:", window.HFF_SCHEDULE.weeks);
  })
  .catch(error => {
    console.error("Schedule CSV error:", error);
  });