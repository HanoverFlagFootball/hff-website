/*
 * HFF public schedule loader
 * Loads the most recent published season for a program and calculates
 * each team's win-loss record after every completed game.
 */
window.HFF_SCHEDULE_DB = (() => {
  const URL = 'https://wnhzgxnwlmohfldnhhyt.supabase.co';
  const KEY = 'sb_publishable_x5Xkl7tfpUwhz_ENftiaqQ_am915vqY';

  function formatDate(value) {
    const [year, month, day] = String(value).split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  function formatTime(value) {
    if (!value) return '';
    let [hour, minute] = String(value).slice(0, 5).split(':').map(Number);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${String(minute).padStart(2, '0')} ${suffix}`;
  }

  function hasScore(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  function teamKey(name) {
    return String(name || '').trim().toLowerCase();
  }

  function buildGameRecords(rows) {
    const records = new Map();
    const gameRecords = new Map();

    // Process all events chronologically, even if the display groups them
    // into administrator-defined sections in a different order.
    const chronological = rows.slice().sort((a, b) =>
      String(a.event_date || '').localeCompare(String(b.event_date || '')) ||
      String(a.start_time || '').localeCompare(String(b.start_time || '')) ||
      String(a.id || '').localeCompare(String(b.id || ''))
    );

    function getRecord(name) {
      const key = teamKey(name);
      if (!records.has(key)) records.set(key, { wins: 0, losses: 0 });
      return records.get(key);
    }

    function displayRecord(name) {
      const record = getRecord(name);
      return `${record.wins}-${record.losses}`;
    }

    chronological.forEach(event => {
      const home = event.home_team_name || '';
      const away = event.away_team_name || '';
      const type = String(event.event_type || '').toLowerCase();
      const scored = hasScore(event.home_score) && hasScore(event.away_score);
      const distinctTeams = teamKey(home) && teamKey(away) && teamKey(home) !== teamKey(away);
      const homeScore = Number(event.home_score);
      const awayScore = Number(event.away_score);

      // Practices, skills events, unscored games and ties do not add a win/loss.
      if (type === 'game' && scored && distinctTeams &&
          Number.isFinite(homeScore) && Number.isFinite(awayScore)) {
        if (homeScore > awayScore) {
          getRecord(home).wins++;
          getRecord(away).losses++;
        } else if (awayScore > homeScore) {
          getRecord(away).wins++;
          getRecord(home).losses++;
        }
      }

      gameRecords.set(event, {
        homeRecord: displayRecord(home),
        awayRecord: displayRecord(away)
      });
    });

    return gameRecords;
  }

  async function load(program = 'house') {
    const sb = supabase.createClient(URL, KEY);
    const { data: all, error: eventsError } = await sb
      .from('hff_events')
      .select('*')
      .eq('program', program)
      .eq('published', true)
      .order('season', { ascending: false })
      .order('event_date')
      .order('start_time');

    if (eventsError) throw eventsError;
    if (!all || !all.length) return { season: '', weeks: [], teams: [] };

    const season = all[0].season;
    const rows = all.filter(row => String(row.season) === String(season));

    const { data: sections, error: sectionsError } = await sb
      .from('hff_schedule_sections')
      .select('*')
      .eq('program', program)
      .eq('season', season)
      .order('sort_order')
      .order('start_date');

    if (sectionsError) throw sectionsError;

    const teams = [...new Set(rows.flatMap(row => [
      row.home_team_name, row.away_team_name, row.participant_team_name
    ]).filter(Boolean))].sort();

    const recordsByEvent = buildGameRecords(rows);
    const configured = (sections || []).map(section => ({ ...section, rows: [] }));
    const other = [];

    rows.forEach(row => {
      const section = configured.find(item =>
        row.event_date >= item.start_date && row.event_date <= item.end_date
      );
      (section ? section.rows : other).push(row);
    });

    const groups = configured
      .filter(section => section.rows.length)
      .map(section => ({ title: section.title, dateText: '', rows: section.rows }));

    if (other.length) {
      groups.push({ title: 'Other Events', dateText: '', rows: other });
    }

    const weeks = groups.map(group => {
      const games = [];
      const practices = [];

      group.rows.sort((a, b) =>
        String(a.event_date || '').localeCompare(String(b.event_date || '')) ||
        String(a.start_time || '').localeCompare(String(b.start_time || ''))
      ).forEach(row => {
        const isPractice = String(row.event_type || '').toLowerCase() === 'practice';
        const base = {
          type: isPractice ? 'Practice' : row.event_type,
          datetime: `${formatDate(row.event_date)}${row.start_time ? ' · ' + formatTime(row.start_time) : ''}`,
          dateText: formatDate(row.event_date),
          sortKey: `${row.event_date || ''}T${String(row.start_time || '00:00').slice(0, 5)}`,
          field: row.field || row.location || ''
        };

        if (isPractice) {
          practices.push({ ...base, practiceTeam: row.participant_team_name || '' });
        } else {
          const record = recordsByEvent.get(row) || { homeRecord: '0-0', awayRecord: '0-0' };
          games.push({
            ...base,
            away: row.away_team_name || '',
            awayRecord: record.awayRecord,
            awayScore: row.away_score ?? '',
            home: row.home_team_name || '',
            homeRecord: record.homeRecord,
            homeScore: row.home_score ?? ''
          });
        }
      });

      return {
        weekTitle: group.title,
        weekDate: group.dateText,
        games,
        practices
      };
    });

    return { season, weeks, teams };
  }

  return { load };
})();
