(function () {
  const NAV_ITEMS = [
    { label: "Home", href: "index.html" },
    { label: "Scores & Schedules", href: "scores&schedules.html" },
    { label: "Standings", href: "standings.html" },
    { label: "Register", href: "register.html" },
    { label: "Shop", href: "shop.html" },
    { label: "Rules & Info", href: "rules.html" },
    { label: "About HFF", href: "aboutHFF.html" },
    { label: "Rep", href: "rep-home.html" },
    { label: "My HFF", href: "my-hff.html" }
  ];

  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  let host = document.getElementById("site-nav");
  let header = document.querySelector(".hff-global-header");
  if (!header && host && host.parentElement && host.parentElement.classList.contains("site-header")) {
    header = host.parentElement;
    header.classList.add("hff-global-header");
  }

  if (!header) {
    header = document.createElement("header");
    header.className = "hff-global-header";
    if (host) {
      host.parentNode && host.parentNode.removeChild(host);
      header.appendChild(host);
    } else {
      host = document.createElement("div");
      host.id = "site-nav";
      header.appendChild(host);
    }
    document.body.insertBefore(header, document.body.firstChild);
  } else if (!host) {
    host = document.createElement("div");
    host.id = "site-nav";
    header.appendChild(host);
  }

  host.innerHTML = `
    <div class="hff-nav-inner">
      <a class="hff-nav-brand" href="${(current === "rep-home.html" || current.startsWith("hustle-u16-")) ? "rep-home.html" : "index.html"}" aria-label="Website home">
        <img src="${(current === "rep-home.html" || current.startsWith("hustle-u16-")) ? "HanoverHustleLogo.png" : "White Logo.jpg"}" onerror="if(this.src.includes('HanoverHustleLogo.png'))this.src='hustle.png'" alt="${(current === "rep-home.html" || current.startsWith("hustle-u16-")) ? "Hanover Hustle" : "Hanover Flag Football"}">
      </a>
      <button class="hff-menu-btn" id="hffMenuBtn" aria-label="Open menu" aria-expanded="false" type="button">
        <span></span><span></span><span></span>
      </button>
      <nav class="hff-nav-links" id="hffNavLinks" aria-label="Main navigation">
        ${NAV_ITEMS.map(item => `<a href="${item.href}" class="${item.href.toLowerCase() === current ? "active" : ""}">${item.label}</a>`).join("")}
      </nav>
    </div>
  `;

  const btn = document.getElementById("hffMenuBtn");
  const links = document.getElementById("hffNavLinks");
  if (!btn || !links) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!host.contains(e.target)) {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
})();
