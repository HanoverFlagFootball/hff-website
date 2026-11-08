(() => {
  if (document.getElementById('hffAdminNav')) return;
  const current = (location.pathname.split('/').pop() || '').toLowerCase();
  const items = [
    ['admin-dashboard.html','Dashboard'],
    ['homepage-admin.html','Edit HFF Website'],
    ['rep-admin.html','Edit Hustle Website'],
    ['registrations_database.html','Registrations'],
    ['adminaccess.html','Orders'],
    ['inventory-admin.html','Inventory'],
    ['shop-products-admin.html','Shop Products'],
    ['teams-admin.html','Teams'],
    ['seasonal-controls-admin.html','Seasonal Controls']
  ];
  const style = document.createElement('style');
  style.textContent = `
    #hffAdminNav{position:relative;z-index:9998;background:#000;border-bottom:1px solid #333;font-family:Arial,Helvetica,sans-serif;color:#fff}
    #hffAdminNav .han-inner{max-width:1600px;margin:auto;padding:9px 2%;display:flex;align-items:center;gap:8px;overflow-x:auto;white-space:nowrap}
    #hffAdminNav .han-brand{font-weight:900;letter-spacing:.08em;margin-right:8px;color:#fff}
    #hffAdminNav a{color:#d9d9d9;text-decoration:none;font-size:.82rem;font-weight:800;padding:8px 10px;border-radius:5px}
    #hffAdminNav a:hover,#hffAdminNav a.active{background:#fff;color:#000}
  `;
  document.head.appendChild(style);
  const nav = document.createElement('nav');
  nav.id = 'hffAdminNav';
  nav.innerHTML = `<div class="han-inner"><span class="han-brand">HFF ADMIN</span>${items.map(([href,label])=>`<a href="${href}" class="${current===href.toLowerCase()?'active':''}">${label}</a>`).join('')}</div>`;
  document.body.prepend(nav);
})();
