(()=>{
  if(document.getElementById('hffEditModeBar')) return;
  const q=new URLSearchParams(location.search);
  const context=q.get('program')==='house'?'HFF':'HUSTLE';
  const bar=document.createElement('div'); bar.id='hffEditModeBar';
  bar.innerHTML=`<strong>EDIT MODE · ${context}</strong><span class="em-spacer"></span><a href="admin-dashboard.html">Admin Dashboard</a><a href="${context==='HUSTLE'?'rep-admin.html':'homepage-admin.html'}">${context} Homepage</a><a href="${context==='HUSTLE'?'rep-home.html':'index.html'}">Exit Edit Mode</a>`;
  const s=document.createElement('style');s.textContent=`#hffEditModeBar{position:sticky;top:0;z-index:10050;background:#000;color:#fff;padding:9px 14px;display:flex;gap:14px;align-items:center;font:800 13px Arial,sans-serif;border-bottom:2px solid #fff}#hffEditModeBar .em-spacer{flex:1}#hffEditModeBar a{color:#fff;text-decoration:none;padding:6px 8px;border:1px solid #555;border-radius:4px}#hffEditModeBar a:hover{background:#fff;color:#000}@media(max-width:650px){#hffEditModeBar{gap:6px;flex-wrap:wrap}#hffEditModeBar .em-spacer{display:none}}`;
  document.head.appendChild(s);document.body.prepend(bar);
})();