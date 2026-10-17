/* HFF HOMEPAGE HERO SETTINGS — edit only this file to switch hero modes.
   mode: 'image-overlay', 'image-only', or 'video'
   Use a local file name for image/video. Registration link can be changed later.
   This local configuration intentionally takes priority over the Supabase hero setting.
*/
window.HFF_HERO_LOCAL_OVERRIDE = true;
window.HFF_HERO_CONFIG = {
  mode: 'image-overlay',
  image: 'catch.jpg',
  imageAlt: 'Hanover Flag Football player making a catch',
  video: '',
  desktopPosition: 'center center',
  mobilePosition: 'center center',
  kicker: 'HANOVER FLAG FOOTBALL',
  headline: '2027 REGISTRATION',
  description: 'HOUSE LEAGUE & HANOVER HUSTLE',
  buttonText: 'REGISTER NOW',
  buttonUrl: '' // Set this to the actual 2027 registration page once ready
};
(function () {
  function init() {
    const cfg = window.HFF_HERO_CONFIG;
    const hero = document.querySelector('.hero-feature');
    const img = document.getElementById('heroFallback');
    const video = document.getElementById('heroVideo');
    if (!hero || !img || !video) return;
    const mode = ['image-overlay','image-only','video'].includes(cfg.mode) ? cfg.mode : 'image-only';
    hero.classList.add('hero-mode-' + mode);
    hero.style.setProperty('--hero-pos-desktop',cfg.desktopPosition || 'center center');
    hero.style.setProperty('--hero-pos-mobile',cfg.mobilePosition || 'center center');
    if (cfg.image) { img.src=cfg.image; img.alt=cfg.imageAlt || 'Hanover Flag Football'; img.style.display='block'; }
    if (mode==='video' && cfg.video) {
      const source=video.querySelector('source');
      source.src=cfg.video;
      video.style.display='block';
      video.hidden=false;
      video.load();
      video.play().catch(()=>{});
    } else { video.pause(); video.hidden=true; video.style.display='none'; }
    const values={heroKicker:cfg.kicker,heroHeadline:cfg.headline,heroDescription:cfg.description,heroCta:cfg.buttonText};
    for (const [id,value] of Object.entries(values)) document.getElementById(id).textContent=value || '';
    const button=document.getElementById('heroCta');
    // Do not send users to an unconfirmed registration endpoint.
    if (cfg.buttonUrl) button.href=cfg.buttonUrl;
    else { button.removeAttribute('href'); button.setAttribute('aria-disabled','true'); button.style.opacity='.75'; button.style.cursor='default'; button.addEventListener('click',e=>e.preventDefault()); }
    if (!cfg.buttonText) button.style.display='none';
    if (mode==='video' && !cfg.video) console.warn('Hero video mode selected but no video file configured.');
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
