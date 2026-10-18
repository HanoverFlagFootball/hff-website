/* HFF Hero editor PREVIEW ONLY: local browser draft, no database writes. */
(()=>{
 const KEY='hff_hero_draft_v1';
 const defaults={mode:'image-overlay',image:'catch.jpg',video:'',headline:'2027 REGISTRATION',description:'HOUSE LEAGUE & HANOVER HUSTLE',desktopPosition:'center center',mobilePosition:'center center',buttons:[{text:'HOUSE LEAGUE',url:'register.html'},{text:'HUSTLE TRYOUTS',url:'RepRegister.html'}]};
 let cfg;try{cfg={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{cfg={...defaults}};
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){
  const root=document.getElementById('hffHeroEditor');if(!root)return;
  root.innerHTML=`<h2 style="margin:0 0 6px">Homepage Hero — Test Editor</h2><p style="font-size:.85rem">Preview only: changes are saved in this browser, not published to Supabase. Use the View Preview button to inspect.</p>
  <label>Hero format <select id="heMode"><option value="image-overlay">Photo + overlay</option><option value="image-only">Photo only</option><option value="video">Looping video (no overlay)</option></select></label>
  <label>Image filename or URL <input id="heImage" value="${esc(cfg.image)}"></label>
  <label>Video filename or URL <input id="heVideo" value="${esc(cfg.video)}"></label>
  <label>Headline <input id="heHeadline" value="${esc(cfg.headline)}"></label>
  <label>Description <input id="heDescription" value="${esc(cfg.description)}"></label>
  <label>Desktop image position <input id="heDesktop" value="${esc(cfg.desktopPosition)}" placeholder="center center"></label>
  <label>Mobile image position <input id="heMobile" value="${esc(cfg.mobilePosition)}" placeholder="center center"></label>
  <div id="heButtons"><strong>Buttons</strong>${(cfg.buttons||[]).map((b,i)=>`<div class="he-button"><input aria-label="Button ${i+1} text" placeholder="Button text" value="${esc(b.text)}"><input aria-label="Button ${i+1} link" placeholder="Destination e.g. register.html" value="${esc(b.url)}"><button type="button" data-remove="${i}">Remove</button></div>`).join('')}</div>
  <button type="button" id="heAdd">+ Add Button</button> <button type="button" id="heSave" style="background:black;color:white">Save Test Draft</button> <button type="button" id="heView">View Preview</button>
  <p id="heMessage" style="font-size:.82rem"></p>`;
  root.querySelector('#heMode').value=cfg.mode;
  root.querySelector('#heAdd').onclick=()=>{collect();cfg.buttons.push({text:'',url:''});render()};
  root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{collect();cfg.buttons.splice(Number(b.dataset.remove),1);render()});
  root.querySelector('#heSave').onclick=()=>{collect();localStorage.setItem(KEY,JSON.stringify(cfg));root.querySelector('#heMessage').textContent='Saved in this browser only — not published.';apply()};
  root.querySelector('#heView').onclick=()=>window.open('index.html','_blank');
 }
 function collect(){const r=document.getElementById('hffHeroEditor');if(!r)return;for(const [k,id] of [['mode','heMode'],['image','heImage'],['video','heVideo'],['headline','heHeadline'],['description','heDescription'],['desktopPosition','heDesktop'],['mobilePosition','heMobile']])cfg[k]=r.querySelector('#'+id).value;cfg.buttons=[...r.querySelectorAll('.he-button')].map(x=>({text:x.children[0].value.trim(),url:x.children[1].value.trim()}))}
 function apply(){const hero=document.querySelector('.hero-feature'),img=document.getElementById('heroFallback'),video=document.getElementById('heroVideo'),overlay=document.getElementById('heroOverlay');if(!hero)return;hero.classList.remove('hero-mode-image-only','hero-mode-image-overlay','hero-mode-video');hero.classList.add('hero-mode-'+cfg.mode);hero.style.setProperty('--hero-pos-desktop',cfg.desktopPosition);hero.style.setProperty('--hero-pos-mobile',cfg.mobilePosition);if(img&&cfg.image){img.src=cfg.image;img.style.display='block'}if(video){if(cfg.mode==='video'&&cfg.video){const s=video.querySelector('source');s.src=cfg.video;video.load();video.style.display='block';video.play().catch(()=>{})}else{video.pause();video.style.display='none'}}if(overlay){overlay.style.display=cfg.mode==='image-overlay'?'flex':'none';document.getElementById('heroHeadline').textContent=cfg.headline;document.getElementById('heroDescription').textContent=cfg.description;const actions=document.getElementById('heroActions');actions.innerHTML='';for(const b of cfg.buttons){if(!b.text)continue;const a=document.createElement('a');a.className='hero-cta';a.textContent=b.text;a.href=b.url||'#';actions.appendChild(a)}}}
 function init(){const host=document.querySelector('.hero-grid');if(!host)return;const r=document.createElement('section');r.id='hffHeroEditor';r.style.cssText='grid-column:1/-1;background:white;border:2px solid black;padding:18px;display:grid;gap:10px';const st=document.createElement('style');st.textContent='#hffHeroEditor label{display:grid;gap:3px;font-size:.85rem;font-weight:bold}#hffHeroEditor input,#hffHeroEditor select{padding:9px;width:100%;border:1px solid #aaa}#hffHeroEditor button{padding:9px 12px;cursor:pointer}#hffHeroEditor .he-button{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin:7px 0}@media(max-width:700px){#hffHeroEditor .he-button{grid-template-columns:1fr}}';document.head.appendChild(st);host.after(r);render();apply()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
