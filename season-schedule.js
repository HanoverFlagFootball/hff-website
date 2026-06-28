console.log("season-schedule.js loaded v9");

window.HFF_SCHEDULE = (function () {
  const scheduleRows = [
    ["2026-05-16", "09:15", "B", "Game", "Giants (U6)", "Giants (U6)", "", "", "", "0-0", "0-0"],
["2026-05-16", "09:30", "A", "Game", "Saints (U9)", "Packers (U9)", "", "30", "32", "1-1", "1-0"],
["2026-05-16", "10:00", "C", "Game", "Jets (U12)", "Browns (U12)", "", "58", "6", "1-0", "0-1"],
["2026-05-16", "10:30", "A", "Game", "Saints (U9)", "Bears (U9)", "", "40", "24", "1-1", "0-1"],
["2026-05-16", "11:00", "C", "Game", "Ravens (U12)", "Bills (U12)", "", "40", "12", "1-0", "0-1"],
["2026-05-16", "11:30", "A", "Game", "Cowboys (U16)", "Chiefs (U16)", "", "48", "18", "1-1", "0-1"],
["2026-05-16", "12:00", "C", "Game", "Vikings (U16)", "Panthers (U16)", "", "86", "8", "1-0", "0-1"],
["2026-05-16", "12:30", "A", "Game", "Commanders (U16)", "Cowboys (U16)", "", "20", "50", "0-1", "2-0"],

   ["2026-05-23", "09:00", "A", "Practice", "", "", "Bears (U9)", "", "", "0-0", "0-0"],
["2026-05-23", "09:15", "B", "Game", "Giants (U6)", "Giants (U6)", "", "", "", "0-0", "0-0"],
["2026-05-23", "09:30", "C", "Practice", "", "", "Bills (U12)", "", "", "0-0", "0-0"],
["2026-05-23", "09:30", "C", "Practice", "", "", "Jets (U12)", "", "", "0-0", "0-0"],
["2026-05-23", "09:30", "A", "Game", "Packers (U9)", "Bears (U9)", "", "68", "32", "2-0", "0-2"],
["2026-05-23", "10:00", "B", "Practice", "", "", "Saints (U9)", "", "", "0-0", "0-0"],
["2026-05-23", "10:00", "C", "Game", "Bills (U12)", "Jets (U12)", "", "36", "26", "1-1", "1-1"],
["2026-05-23", "10:30", "B", "Practice", "", "", "Browns (U12)", "", "", "0-0", "0-0"],
["2026-05-23", "10:30", "B", "Practice", "", "", "Ravens (U12)", "", "", "0-0", "0-0"],
["2026-05-23", "10:30", "A", "Game", "Packers (U9)", "Saints (U9)", "", "56", "44", "3-0", "1-2"],
["2026-05-23", "11:00", "B", "Practice", "", "", "Panthers (U16)", "", "", "0-0", "0-0"],
["2026-05-23", "11:00", "C", "Game", "Browns (U12)", "Ravens (U12)", "", "12", "50", "0-2", "2-0"],
["2026-05-23", "11:30", "B", "Practice", "", "", "Cowboys (U16)", "", "", "0-0", "0-0"],
["2026-05-23", "11:30", "B", "Practice", "", "", "Vikings (U16)", "", "", "0-0", "0-0"],
["2026-05-23", "11:30", "A", "Game", "Chiefs (U16)", "Panthers (U16)", "", "0", "18", "0-2", "1-1"],
["2026-05-23", "12:00", "B", "Practice", "", "", "Commanders (U16)", "", "", "0-0", "0-0"],
["2026-05-23", "12:00", "C", "Game", "Cowboys (U16)", "Vikings (U16)", "", "8", "20", "2-1", "2-0"],
["2026-05-23", "12:30", "A", "Game", "Commanders (U16)", "Chiefs (U16)", "", "14", "36", "0-2", "1-2"],

    ["2026-05-30", "09:00", "A", "Practice", "", "", "Saints (U9)", "", "", "0-0", "0-0"],
["2026-05-30", "09:15", "B", "Game", "Giants (U6)", "Giants (U6)", "", "", "", "0-0", "0-0"],
["2026-05-30", "09:30", "C", "Practice", "", "", "Browns (U12)", "", "", "0-0", "0-0"],
["2026-05-30", "09:30", "C", "Practice", "", "", "Bills (U12)", "", "", "0-0", "0-0"],
["2026-05-30", "09:30", "A", "Game", "Saints (U9)", "Bears (U9)", "", "54", "28", "2-1", "0-3"],
["2026-05-30", "10:00", "B", "Practice", "", "", "Packers (U9)", "", "", "0-0", "0-0"],
["2026-05-30", "10:00", "C", "Game", "Bills (U12)", "Browns (U12)", "", "52", "20", "2-1", "0-3"],
["2026-05-30", "10:30", "B", "Practice", "", "", "Ravens (U12)", "", "", "0-0", "0-0"],
["2026-05-30", "10:30", "B", "Practice", "", "", "Jets (U12)", "", "", "0-0", "0-0"],
["2026-05-30", "10:30", "A", "Game", "Packers (U9)", "Bears (U9)", "", "63", "24", "3-0", "0-4"],
["2026-05-30", "11:00", "B", "Practice", "", "", "Chiefs (U16)", "", "", "0-0", "0-0"],
["2026-05-30", "11:00", "C", "Game", "Jets (U12)", "Ravens (U12)", "", "18", "42", "1-2", "3-0"],
["2026-05-30", "11:30", "B", "Practice", "", "", "Vikings (U16)", "", "", "0-0", "0-0"],
["2026-05-30", "11:30", "B", "Practice", "", "", "Cowboys (U16)", "", "", "0-0", "0-0"],
["2026-05-30", "11:30", "A", "Game", "Panthers (U16)", "Chiefs (U16)", "", "42", "20", "2-1", "1-3"],
["2026-05-30", "12:00", "B", "Practice", "", "", "Commanders (U16)", "", "", "0-0", "0-0"],
["2026-05-30", "12:00", "C", "Game", "Cowboys (U16)", "Vikings (U16)", "", "30", "36", "2-2", "3-0"],
["2026-05-30", "12:30", "A", "Game", "Commanders (U16)", "Panthers (U16)", "", "24", "36", "0-3", "3-1"],

    ["2026-06-06", "09:00", "A", "Practice", "", "", "Packers (U9)", "", "", "0-0", "0-0"],
["2026-06-06", "09:15", "B", "Game", "Giants (U6)", "Giants (U6)", "", "", "", "0-0", "0-0"],
["2026-06-06", "09:30", "C", "Practice", "", "", "Bills (U12)", "", "", "0-0", "0-0"],
["2026-06-06", "09:30", "C", "Practice", "", "", "Ravens (U12)", "", "", "0-0", "0-0"],
["2026-06-06", "09:30", "A", "Game", "Saints (U9)", "Packers (U9)", "", "6", "46", "2-2", "4-0"],
["2026-06-06", "10:00", "B", "Practice", "", "", "Bears (U9)", "", "", "0-0", "0-0"],
["2026-06-06", "10:00", "C", "Game", "Ravens (U12)", "Bills (U12)", "", "41", "26", "4-0", "2-2"],
["2026-06-06", "10:30", "B", "Practice", "", "", "Jets (U12)", "", "", "0-0", "0-0"],
["2026-06-06", "10:30", "B", "Practice", "", "", "Browns (U12)", "", "", "0-0", "0-0"],
["2026-06-06", "10:30", "A", "Game", "Saints (U9)", "Bears (U9)", "", "32", "38", "2-3", "1-4"],
["2026-06-06", "11:00", "B", "Practice", "", "", "Chiefs (U16)", "", "", "0-0", "0-0"],
["2026-06-06", "11:00", "C", "Game", "Browns (U12)", "Jets (U12)", "", "6", "70", "0-4", "2-2"],
["2026-06-06", "11:30", "B", "Practice", "", "", "Cowboys (U16)", "", "", "0-0", "0-0"],
["2026-06-06", "11:30", "B", "Practice", "", "", "Panthers (U16)", "", "", "0-0", "0-0"],
["2026-06-06", "11:30", "A", "Game", "Commanders (U16)", "Chiefs (U16)", "", "60", "20", "1-3", "1-4"],
["2026-06-06", "12:00", "B", "Practice", "", "", "Vikings (U16)", "", "", "0-0", "0-0"],
["2026-06-06", "12:00", "C", "Game", "Panthers (U16)", "Cowboys (U16)", "", "38", "28", "4-1", "2-3"],
["2026-06-06", "12:30", "A", "Game", "Commanders (U16)", "Vikings (U16)", "", "12", "82", "1-4", "4-0"],

    ["2026-06-13", "09:00", "A", "Practice", "", "", "Bears (U9)", "", "", "0-0", "0-0"],
["2026-06-13", "09:15", "B", "Game", "Giants (U6)", "Giants (U6)", "", "", "", "0-0", "0-0"],
["2026-06-13", "09:30", "C", "Practice", "", "", "Browns (U12)", "", "", "0-0", "0-0"],
["2026-06-13", "09:30", "C", "Practice", "", "", "Ravens (U12)", "", "", "0-0", "0-0"],
["2026-06-13", "09:30", "A", "Game", "Bears (U9)", "Packers (U9)", "", "50", "40", "2-4", "4-1"],
["2026-06-13", "10:00", "B", "Practice", "", "", "Saints (U9)", "", "", "0-0", "0-0"],
["2026-06-13", "10:00", "C", "Game", "Browns (U12)", "Ravens (U12)", "", "6", "34", "0-5", "5-0"],
["2026-06-13", "10:30", "B", "Practice", "", "", "Jets (U12)", "", "", "0-0", "0-0"],
["2026-06-13", "10:30", "B", "Practice", "", "", "Bills (U12)", "", "", "0-0", "0-0"],
["2026-06-13", "10:30", "A", "Game", "Saints (U9)", "Packers (U9)", "", "54", "22", "3-3", "4-2"],
["2026-06-13", "11:00", "B", "Practice", "", "", "Chiefs (U16)", "", "", "0-0", "0-0"],
["2026-06-13", "11:00", "C", "Game", "Jets (U12)", "Bills (U12)", "", "18", "46", "2-3", "3-2"],["2026-06-13", "11:30", "B", "Practice", "", "", "Cowboys (U16)", "", "", "0-0", "0-0"],
["2026-06-13", "11:30", "B", "Practice", "", "", "Commanders (U16)", "", "", "0-0", "0-0"],
["2026-06-13", "11:30", "A", "Game", "Vikings (U16)", "Chiefs (U16)", "", "84", "6", "5-0", "1-5"],
["2026-06-13", "12:00", "B", "Practice", "", "", "Panthers (U16)", "", "", "0-0", "0-0"],
["2026-06-13", "12:00", "C", "Game", "Cowboys (U16)", "Commanders (U16)", "", "40", "30", "3-3", "1-5"],
["2026-06-13", "12:30", "A", "Game", "Panthers (U16)", "Vikings (U16)", "", "0", "54", "4-2", "6-0"],

    ["2026-06-20", "09:00", "A", "Practice", "", "", "Saints (U9)", "", "", "0-0", "0-0"],
["2026-06-20", "09:15", "B", "Game", "Giants (U6)", "Giants (U6)", "", "", "", "0-0", "0-0"],
["2026-06-20", "09:30", "C", "Practice", "", "", "Jets (U12)", "", "", "0-0", "0-0"],
["2026-06-20", "09:30", "C", "Practice", "", "", "Ravens (U12)", "", "", "0-0", "0-0"],
["2026-06-20", "09:30", "A", "Game", "Saints (U9)", "Bears (U9)", "", "14", "36", "3-4", "3-4"],
["2026-06-20", "10:00", "B", "Practice", "", "", "Packers (U9)", "", "", "0-0", "0-0"],
["2026-06-20", "10:00", "C", "Game", "Ravens (U12)", "Jets (U12)", "", "32", "0", "6-0", "2-4"],
["2026-06-20", "10:30", "B", "Practice", "", "", "Bills (U12)", "", "", "0-0", "0-0"],
["2026-06-20", "10:30", "B", "Practice", "", "", "Browns (U12)", "", "", "0-0", "0-0"],
["2026-06-20", "10:30", "A", "Game", "Packers (U9)", "Bears (U9)", "", "44", "34", "5-2", "3-5"],
["2026-06-20", "11:00", "C", "Game", "Bills (U12)", "Browns (U12)", "", "30", "7", "4-2", "0-6"],
["2026-06-20", "11:30", "A", "Game", "Cowboys (U16)", "Chiefs (U16)", "", "41", "14", "4-3", "1-6"],
["2026-06-20", "12:00", "C", "Game", "Commanders (U16)", "Vikings (U16)", "", "12", "63", "1-6", "7-0"],
["2026-06-20", "12:30", "A", "Game", "Panthers (U16)", "Cowboys (U16)", "", "34", "29", "5-2", "4-4"],
["2026-06-20", "13:00", "C", "Game", "Commanders (U16)", "Chiefs (U16)", "", "58", "6", "2-6", "1-7"],

    ["2026-06-27", "09:00", "A", "Game", "U9 Skills", "U9 Skills", "", "", "", "0-0", "0-0"],
["2026-06-27", "09:15", "B", "Game", "Giants (U6) Mini Skills", "Giants (U6) Mini Skills", "", "", "", "0-0", "0-0"],
["2026-06-27", "09:30", "A", "Game", "Bears (U9)", "Packers (U9)", "", "44", "30", "4-5", "5-3"],
["2026-06-27", "10:00", "C", "Game", "Bills (U12)", "Ravens (U12)", "", "26", "20", "5-2", "6-1"],
["2026-06-27", "10:30", "A", "Game", "Saints (U9)", "Packers (U9)", "", "40", "28", "4-4", "5-4"],
["2026-06-27", "11:00", "B", "Game", "U16 Skills", "U16 Skills", "", "", "", "0-0", "0-0"],
["2026-06-27", "11:00", "C", "Game", "Jets (U12)", "Browns (U12)", "", "36", "13", "3-4", "0-7"],
["2026-06-27", "11:30", "A", "Game", "Panthers (U16)", "Vikings (U16)", "", "6", "63", "5-3", "8-0"],
["2026-06-27", "12:00", "C", "Game", "Commanders (U16)", "Cowboys (U16)", "", "20", "54", "2-7", "5-4"],
["2026-06-27", "12:30", "A", "Game", "Chiefs (U16)", "Panthers (U16)", "", "6", "12", "1-8", "6-3"],
["2026-06-27", "13:00", "C", "Game", "Vikings (U16)", "Cowboys (U16)", "", "45", "14", "9-0", "5-5"],

    ["2026-07-04", "09:00", "A", "Game", "Saints (U9)", "Bears (U9)", "", "", "", "4-4", "4-5"],
["2026-07-04", "09:00", "C", "Game", "Jets (U12)", "Bills (U12)", "", "", "", "3-4", "5-2"],
["2026-07-04", "09:15", "B", "Game", "Giants (U6)", "Giants (U6)", "", "", "", "0-0", "0-0"],
["2026-07-04", "10:00", "A", "Game", "Winner of 9:30am game (U9)", "Packers (U9)", "", "", "", "0-0", "5-4"],
["2026-07-04", "10:00", "C", "Game", "Browns (U12)", "Ravens (U12)", "", "", "", "0-7", "6-1"],
["2026-07-04", "11:00", "A", "Game", "Loser of 9am game (U12)", "Loser of 10am game (U12)", "", "", "", "0-0", "0-0"],
["2026-07-04", "11:00", "C", "Game", "Winner of 9am game (U12)", "Winner of 10am game (U12)", "", "", "", "0-0", "0-0"],
["2026-07-04", "12:00", "A", "Game", "Commanders (U16)", "Chiefs (U16)", "", "", "", "2-7", "1-8"],
["2026-07-04", "13:00", "A", "Game", "Cowboys (U16)", "Panthers (U16)", "", "", "", "5-5", "6-3"],
["2026-07-04", "13:00", "C", "Game", "Winner of 12pm game (U12)", "Vikings (U16)", "", "", "", "0-0", "9-0"],
["2026-07-04", "14:00", "A", "Game", "Loser of 1pm game", "Loser of 1pm game", "", "", "", "0-0", "0-0"],
["2026-07-04", "14:00", "C", "Game", "Winner of 1pm game", "Winner of 1pm game", "", "", "", "0-0", "0-0"],
  ];

  function formatDate(dateString) {
    const parts = String(dateString || '').split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatTime(timeString) {
    const parts = String(timeString || '').split(':');
    let hour = Number(parts[0]);
    const minute = parts[1] || '00';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${suffix}`;
  }

  function logoFor(teamName) {
    const clean = String(teamName || '').trim();

    if (!clean) return '';
    if (clean.startsWith('#')) return 'Logo.jpg';
    if (clean.toLowerCase().startsWith('winner')) return 'Logo.jpg';

    const base = clean
      .replace(/\s*\(.*?\)/g, '')
      .trim()
      .split(' ')[0];

    return base ? `${base}.png` : 'Logo.jpg';
  }

  function weekTitle(index) {
    if (index === 6) return 'Week 7 - Playoffs';
    if (index === 7) return 'Week 8 - Championship Week';
    return `Week ${index + 1}`;
  }

  function buildWeeks() {
    const grouped = {};

    scheduleRows.forEach(row => {
      const date = row[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(row);
    });

    return Object.keys(grouped).map((date, index) => {
      const weekDate = formatDate(date);
      const games = [];
      const practices = [];

      grouped[date].forEach(row => {
        const [
          dateValue,
          timeValue,
          field,
          type,
          homeTeam,
          awayTeam,
          practiceTeam,
          homeScore,
          awayScore,
          homeRecord,
          awayRecord
        ] = row;

        const base = {
          type,
          datetime: formatTime(timeValue),
          dateText: weekDate,
          field
        };

        if (type === 'Practice') {
          practices.push({
            ...base,
            practiceTeam,
            teamLogo: logoFor(practiceTeam)
          });
          return;
        }

        games.push({
          ...base,
          away: awayTeam,
          awayLogo: logoFor(awayTeam),
          awayRecord: awayRecord || '0-0',
          awayScore: awayScore || '',
          home: homeTeam,
          homeLogo: logoFor(homeTeam),
          homeRecord: homeRecord || '0-0',
          homeScore: homeScore || ''
        });
      });

      return {
        weekTitle: weekTitle(index),
        weekDate,
        games,
        practices
      };
    });
  }

  return {
    getAllWeeks: function () {
      return buildWeeks();
    }
  };
})();