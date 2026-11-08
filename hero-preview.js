/* HFF HERO PREVIEW — TEST ONLY. Uses browser localStorage, not Supabase. */
(()=>{
 const KEY='hff_hero_draft_v1';
 const defaults={mode:'image-overlay',image:'catch.jpg',video:'',headline:'2027 REGISTRATION',description:'HOUSE LEAGUE & HANOVER HUSTLE',desktopPosition:'center center',mobilePosition:'center center',buttons:[{text:'HOUSE LEAGUE',url:'register.html'},{text:'HUSTLE TRYOUTS',url:'RepRegister.html'}]};
 const get=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaults}};
 function apply(){
  const cfg=get(), hero=document.querySelector('.hero-feature');if(!hero)return;
  const img=document.getElementById('heroFallback'),vid=document.getElementById('heroVideo'),overlay=document.getElementById('heroOverlay');
  hero.classList.remove('hero-mode-image-overlay','hero-mode-image-only','hero-mode-video');hero.classList.add('hero-mode-'+cfg.mode);
  hero.style.setProperty('--hero-pos-desktop',cfg.desktopPosition);hero.style.setProperty('--hero-pos-mobile',cfg.mobilePosition);
  if(img&&cfg.image){img.src=cfg.image;img.style.display='block'}
  if(vid){if(cfg.mode==='video'&&cfg.video){const s=vid.querySelector('source');if(s){s.src=cfg.video;vid.load()}vid.hidden=false;vid.style.display='block';vid.play().catch(()=>{})}else{vid.pause();vid.hidden=true;vid.style.display='none'}}
  if(overlay)overlay.style.display=cfg.mode==='image-overlay'?'flex':'none';
  const title=document.getElementById('heroHeadline'),desc=document.getElementById('heroDescription');if(title)title.textContent=cfg.headline||'';if(desc)desc.textContent=cfg.description||'';
  const actions=document.getElementById('heroActions');if(actions){actions.innerHTML='';for(const [i,b] of (cfg.buttons||[]).entries()){if(!b.text)continue;const a=document.createElement('a');a.className='hero-cta'+(i?' secondary':'');a.textContent=b.text;a.href=/^(https?:\/\/|[\w.-]+\.html(?:[?#].*)?)$/i.test(b.url||'')?b.url:'#';if(a.getAttribute('href')==='#')a.onclick=e=>e.preventDefault();actions.appendChild(a)}}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,150));else setTimeout(apply,150);
 window.HFF_applyHeroDraft=apply;
})();
