(() => {
  const SUPABASE_URL = 'https://wnhzgxnwlmohfldnhhyt.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_x5Xkl7tfpUwhz_ENftiaqQ_am915vqY';

  function esc(s='') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function safeHref(url='') {
    const v = String(url).trim();
    if (!v) return '#';
    if (/^(https?:\/\/|\/|\.\/|\.\.\/|[\w .%()_+-]+\.html(?:[?#].*)?$)/i.test(v)) return v;
    return '#';
  }
  function mediaUrl(v='') { return String(v).trim(); }

  async function run() {
    if (!window.supabase || !document.getElementById('latestStories')) return;
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
      const [{ data: news, error: newsErr }, { data: dates, error: datesErr }, { data: settings, error: settingsErr }] = await Promise.all([
        sb.from('homepage_news').select('*').eq('published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
        sb.from('homepage_dates').select('*').eq('published', true).order('sort_order', { ascending: true }).order('event_date', { ascending: true }),
        sb.from('homepage_settings').select('*').eq('id', 'hero').maybeSingle()
      ]);

      if (!newsErr && news && news.length) {
        document.getElementById('latestStories').innerHTML = news.map(item => {
          const body = `<img src="${esc(mediaUrl(item.image_url))}" alt="${esc(item.image_alt || item.title || 'HFF update')}" loading="lazy"><div class="story-copy">${item.eyebrow ? `<div class="eyebrow">${esc(item.eyebrow)}</div>` : ''}<h3>${esc(item.title || '')}</h3>${item.description ? `<p>${esc(item.description)}</p>` : ''}</div>`;
          return `<article class="story-card">${item.link_url ? `<a href="${esc(safeHref(item.link_url))}" style="text-decoration:none">${body}</a>` : body}</article>`;
        }).join('');
      }

      if (!datesErr && dates && dates.length) {
        document.getElementById('importantDatesList').innerHTML = dates.map(item => `
          <div class="date-item">
            <div class="date-thumb">${item.image_url ? `<img src="${esc(mediaUrl(item.image_url))}" alt="${esc(item.image_alt || item.title || 'Important date')}" loading="lazy">` : ''}</div>
            <div class="date-copy">
              <h3>${item.link_url ? `<a href="${esc(safeHref(item.link_url))}" style="text-decoration:none">${esc(item.title || '')}</a>` : esc(item.title || '')}</h3>
              ${item.description ? `<p>${esc(item.description)}</p>` : ''}
            </div>
          </div>`).join('');
      }

      if (!settingsErr && settings) {
        const hero = document.querySelector('.hero-feature');
        const video = document.getElementById('heroVideo');
        const fallback = document.getElementById('heroFallback');
        if (hero) {
          hero.style.setProperty('--hero-pos-desktop', settings.desktop_position || 'center center');
          hero.style.setProperty('--hero-pos-mobile', settings.mobile_position || 'center center');
        }
        if (fallback) {
          if (settings.poster_url) {
            fallback.src = settings.poster_url;
            fallback.style.display = 'block';
            fallback.alt = settings.poster_alt || 'Hanover Flag Football action';
          } else {
            fallback.removeAttribute('src');
            fallback.style.display = 'none';
          }
        }
        if (video) {
          if (settings.video_enabled && settings.video_url) {
            const source = video.querySelector('source');
            if (source && source.src !== settings.video_url) {
              source.src = settings.video_url;
              video.load();
            }
            video.hidden = false;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.hidden = true;
          }
        }
      }
    } catch (e) {
      console.warn('Homepage CMS content unavailable; using built-in fallback content.', e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
