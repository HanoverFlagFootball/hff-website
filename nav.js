(function () {
  const NAV_ITEMS = [
    { label: "Home", href: "index.html" },
    { label: "Scores & Schedules", href: "scores&schedules.html" },
    { label: "Standings", href: "standings.html" },
    { label: "Shop", href: "shop.html" },
    { label: "Rules & Info", href: "rules.html" },
    { label: "About HFF", href: "aboutHFF.html" },
    { label: "Register", href: "register.html" },
    { label: "Rep", href: "rep-home.html" },
    { label: "My HFF", href: "my-hff.html" }
  ];

  // Centre the main six tabs on the page itself, independent of side groups.
  // Only the desktop layout changes; mobile retains the existing hamburger menu.
  const groupStyle = document.createElement("style");
  groupStyle.textContent = `
    @media (min-width: 981px) {
      .hff-nav-inner { position: relative; }
      .hff-nav-links { flex: 1; min-width: 0; margin-left: 0; justify-content: flex-end; }
      .hff-nav-main {
        position: absolute;
        left: 50%;
        top: 0;
        height: 100%;
        transform: translateX(-50%);
        display: flex;
        align-items: stretch;
        justify-content: center;
      }
      .hff-nav-account { display: flex; align-items: stretch; margin-left: auto; }
      .hff-nav-links a { padding-left: 9px; padding-right: 9px; }
    }
    @media (max-width: 980px) {
      .hff-nav-main, .hff-nav-account { display: contents; }
    }
  `;
  document.head.appendChild(groupStyle);

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
        <div class="hff-nav-main">
          ${NAV_ITEMS.slice(0, 6).map(item => `<a href="${item.href}" class="${item.href.toLowerCase() === current ? "active" : ""}">${item.label}</a>`).join("")}
        </div>
        <div class="hff-nav-account">
          ${NAV_ITEMS.slice(6).map(item => `<a href="${item.href}" class="${item.href.toLowerCase() === current ? "active" : ""}">${item.label}</a>`).join("")}
        </div>
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
