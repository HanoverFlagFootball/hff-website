/* HFF test homepage hero: one Supabase-backed configuration, with approved local fallback. */
(()=>{
 const U='https://wnhzgxnwlmohfldnhhyt.supabase.co',K='sb_publishable_x5Xkl7tfpUwhz_ENftiaqQ_am915vqY';
 const DEFAULT={id:'hero_test',hero_mode:'image-overlay',poster_url:'catch.jpg',poster_alt:'Hanover Flag Football player making a catch',video_url:'',video_enabled:false,desktop_position:'center center',mobile_position:'center center',headline:'2027 REGISTRATION',description:'HOUSE LEAGUE & HANOVER HUSTLE',buttons:[{text:'REGISTER NOW',url:''}]};
 const allowedHref=v=>{v=String(v||'').trim();return /^(https?:\/\/[^\s]+|\/?(?:[\w.%() +\-]+\/)*[\w.%() +\-]+\.html(?:[?#][^\s]*)?)$/i.test(v)?v:''};
 const allowedMedia=v=>{v=String(v||'').trim();return /^(https?:\/\/[^\s]+|\/?(?:[\w.%() +\-]+\/)*[\w.%() +\-]+\.(?:jpe?g|png|webp|gif|mp4|webm)(?:\?[^\s]*)?)$/i.test(v)?v:''};
 function apply(data){const c={...DEFAULT,...data},hero=document.querySelector('.hero-feature');if(!hero)return;
  const mode=['image-overlay','image-only','video'].includes(c.hero_mode)?c.hero_mode:'image-overlay';
  hero.classList.remove('hero-mode-image-overlay','hero-mode-image-only','hero-mode-video');hero.classList.add('hero-mode-'+mode);
  hero.style.setProperty('--hero-pos-desktop',c.desktop_position||'center center');hero.style.setProperty('--hero-pos-mobile',c.mobile_position||'center center');
  const img=document.getElementById('heroFallback'),vid=document.getElementById('heroVideo'),overlay=document.getElementById('heroOverlay');
  if(img){const src=allowedMedia(c.poster_url);if(src){img.src=src;img.alt=c.poster_alt||'Hanover Flag Football';img.style.display='block'}else{img.removeAttribute('src');img.style.display='none'}}
  if(vid){const src=allowedMedia(c.video_url);if(mode==='video'&&c.video_enabled&&src){const s=vid.querySelector('source');if(s&&s.getAttribute('src')!==src){s.src=src;vid.load()}vid.hidden=false;vid.style.display='block';vid.play().catch(()=>{})}else{vid.pause();vid.hidden=true;vid.style.display='none'}}
  if(overlay)overlay.style.display=mode==='image-overlay'?'flex':'none';
  for(const [id,value] of [['heroHeadline',c.headline],['heroDescription',c.description]]){const el=document.getElementById(id);if(el)el.textContent=value||''}
  const actions=document.getElementById('heroActions');if(actions){actions.replaceChildren();for(const [i,b] of (Array.isArray(c.buttons)?c.buttons:[]).entries()){if(!b?.text?.trim())continue;const a=document.createElement('a');a.className='hero-cta'+(i?' secondary':'');a.textContent=b.text;const href=allowedHref(b.url);if(href)a.href=href;else{a.removeAttribute('href');a.setAttribute('aria-disabled','true');a.style.opacity='.75';a.style.cursor='default'}actions.appendChild(a)}}
 }
 async function load(){apply(DEFAULT);if(!window.supabase)return DEFAULT;try{const sb=window.supabase.createClient(U,K);const {data,error}=await sb.from('homepage_settings').select('*').eq('id','hero_test').maybeSingle();if(error)throw error;if(data){apply(data);return {...DEFAULT,...data}}}catch(e){console.warn('Test hero could not load; using approved fallback',e)}return DEFAULT}
 window.HFF_TEST_HERO={DEFAULT,apply,load,allowedHref};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
