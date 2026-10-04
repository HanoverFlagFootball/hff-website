window.HFF_SCHEDULE_DB = (() => {
  const URL='https://wnhzgxnwlmohfldnhhyt.supabase.co';
  const KEY='sb_publishable_x5Xkl7tfpUwhz_ENftiaqQ_am915vqY';
  function fmtDate(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
  function fmtTime(s){if(!s)return '';let [h,m]=s.slice(0,5).split(':').map(Number);const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${String(m).padStart(2,'0')} ${ap}`}
    async function load(program='house'){
    const sb=supabase.createClient(URL,KEY);
    const {data:all,error:e1}=await sb.from('hff_events').select('*').eq('program',program).eq('published',true).order('season',{ascending:false}).order('event_date').order('start_time');
    if(e1)throw e1;if(!all?.length)return {season:'',weeks:[],teams:[]};
    const season=all[0].season;const rows=all.filter(r=>String(r.season)===String(season));
    const {data:sections,error:e2}=await sb.from('hff_schedule_sections').select('*').eq('program',program).eq('season',season).order('sort_order').order('start_date');
    if(e2)throw e2;
    const teams=[...new Set(rows.flatMap(r=>[r.home_team_name,r.away_team_name,r.participant_team_name]).filter(Boolean))].sort();
    const configured=(sections||[]).map(s=>({...s,rows:[]}));const other=[];
    rows.forEach(r=>{const section=configured.find(s=>r.event_date>=s.start_date&&r.event_date<=s.end_date);(section?section.rows:other).push(r)});
    const groups=configured.filter(s=>s.rows.length).map(s=>({title:s.title,dateText:'',rows:s.rows}));
    if(other.length)groups.push({title:'Other Events',dateText:'',rows:other});
    const weeks=groups.map(group=>{const games=[],practices=[];group.rows.sort((a,b)=>(a.event_date||'').localeCompare(b.event_date||'')||(a.start_time||'').localeCompare(b.start_time||'')).forEach(r=>{const isPractice=String(r.event_type||'').toLowerCase()==='practice';const base={type:isPractice?'Practice':r.event_type,datetime:`${fmtDate(r.event_date)}${r.start_time?' · '+fmtTime(r.start_time):''}`,dateText:fmtDate(r.event_date),sortKey:`${r.event_date||''}T${(r.start_time||'00:00').slice(0,5)}`,field:r.field||r.location||''};if(isPractice){practices.push({...base,practiceTeam:r.participant_team_name||''})}else{games.push({...base,away:r.away_team_name||'',awayRecord:'',awayScore:r.away_score??'',home:r.home_team_name||'',homeRecord:'',homeScore:r.home_score??''})}});return {weekTitle:group.title,weekDate:group.dateText,games,practices}});
    return {season,weeks,teams};
  }
  return {load};
})();
