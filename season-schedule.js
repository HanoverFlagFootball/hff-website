console.log("season-schedule.js loaded csv version");

window.HFF_SCHEDULE_READY = false;

function hffStripDivision(teamLabel) {
  return String(teamLabel || "").replace(/\s*\(.*?\)\s*/g, "").trim();
}

function hffLogoForTeam(teamLabel) {
  const team = String(teamLabel || "").trim();

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

function hffParseCSV(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(current);
      if (row.some(cell => String(cell).trim() !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some(cell => String(cell).trim() !== "")) rows.push(row);

  return rows;
}

function hffBuildScheduleFromCSV(csvText) {
  const parsed = hffParseCSV(csvText);
  const header = parsed.shift().map(h => String(h || "").trim());

  const rows = parsed.map(values => {
    const obj = {};
    header.forEach((key, index) => {
      obj[key] = String(values[index] || "").trim();
    });
    return obj;
  });

  const grouped = {};
  const order = [];

  rows.forEach(row => {
    const date = row["Date"];
    if (!date) return;

    if (!grouped[date]) {
      grouped[date] = [];
      order.push(date);
    }

    const type = String(row["Type"] || "Game").trim().toLowerCase();

    if (type === "practice") {
      const team = row["Practice Team"];

      grouped[date].push({
        type: "practice",
        team: team,
        teamLogo: hffLogoForTeam(team),
        teamRecord: row["Home Record"] || row["Away Record"] || "0-0",
        datetime: hffFormatTime(row["Time"]),
        dateText: hffFormatDate(date),
        field: row["Field"] || ""
      });
    } else {
      const home = row["Home Team"];
      const away = row["Away Team"];

      grouped[date].push({
        type: "game",
        away: away,
        awayLogo: hffLogoForTeam(away),
        awayRecord: row["Away Record"] || "0-0",
        awayScore: row["Away Team Score"] || "",
        home: home,
        homeLogo: hffLogoForTeam(home),
        homeRecord: row["Home Record"] || "0-0",
        homeScore: row["Home Team Score"] || "",
        datetime: hffFormatTime(row["Time"]),
        dateText: hffFormatDate(date),
        field: row["Field"] || ""
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

  getItemsForTeam: function (teamLabel) {
    const t = String(teamLabel || "").trim().toLowerCase();

    return this.getAllItems().filter(item => {
      const type = item.type || "game";

      if (type === "practice") {
        return String(item.team || "").trim().toLowerCase() === t;
      }

      return (
        String(item.away || "").trim().toLowerCase() === t ||
        String(item.home || "").trim().toLowerCase() === t
      );
    });
  },

  getWeeksForTeam: function (teamLabel) {
    const t = String(teamLabel || "").trim().toLowerCase();

    return this.getAllWeeks().map(week => {
      const games = (week.games || []).filter(item => {
        const type = item.type || "game";

        if (type === "practice") {
          return String(item.team || "").trim().toLowerCase() === t;
        }

        return (
          String(item.away || "").trim().toLowerCase() === t ||
          String(item.home || "").trim().toLowerCase() === t
        );
      });

      return {
        weekTitle: week.weekTitle,
        weekDate: week.weekDate,
        games: games
      };
    }).filter(week => week.games.length > 0);
  }
};

window.HFF_SCHEDULE_LOADED = fetch("schedule.csv")
  .then(response => {
    if (!response.ok) throw new Error("Could not load schedule.csv");
    return response.text();
  })
  .then(csvText => {
    window.HFF_SCHEDULE.weeks = hffBuildScheduleFromCSV(csvText);
    window.HFF_SCHEDULE_READY = true;
    console.log("schedule.csv loaded", window.HFF_SCHEDULE.weeks);
    return window.HFF_SCHEDULE;
  })
  .catch(error => {
    console.error("Schedule CSV error:", error);
    window.HFF_SCHEDULE_READY = false;
  });