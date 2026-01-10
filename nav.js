(function () {
  const NAV_ITEMS = [
    { label: "Scores & Schedules", href: "scores&schedules.html" },
    { label: "Shop", href: "Shop.html" },
    { label: "Rules & Info", href: "rules.html" },
    { label: "About HFF", href: "aboutHFF.html" }
  ];

  const current = (location.pathname.split("/").pop() || "").toLowerCase();
  const host = document.getElementById("site-nav");
  if (!host) return;

  host.innerHTML = `
    <style>
      /* anchor to banner */
      #site-nav {
        position: absolute;
        bottom: 6px;
        left: 10px;
        z-index: 1000;
      }

      .hambtn {
        width: 34px;
        height: 28px;
        border: 1px solid #fff;
        background: rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        padding: 0;
      }

      .hambtn span {
        display: block;
        height: 2px;
        background: #fff;
      }

      .menu {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        background: #111;
        border: 1px solid #333;
        border-radius: 0.5rem;
        display: none;
        flex-direction: column;
        min-width: 180px;
      }

      .menu.open {
        display: flex;
      }

      .menu a {
        color: #fff;
        text-decoration: none;
        padding: 0.6rem 0.8rem;
        border-bottom: 1px solid #222;
        font-size: 0.9rem;
      }

      .menu a:last-child {
        border-bottom: none;
      }

      .menu a.active {
        background: #1c1c1c;
        font-weight: 700;
      }

      @media (min-width: 701px) {
        #site-nav {
          bottom: 38px;
          left: 44px;
        }
        .hambtn {
          width: 65px;
          height: 50px;
          gap: 5px;
          border-width: 2px;
        }
        .hambtn span {
          height: 3px;
        }
      }
    </style>

    <button class="hambtn" id="hamBtn" aria-label="Open menu">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="menu" id="hamMenu">
      ${NAV_ITEMS.map(item => {
        const active = item.href.toLowerCase() === current;
        return `<a href="${item.href}" class="${active ? "active" : ""}">${item.label}</a>`;
      }).join("")}
    </div>
  `;

  const btn = document.getElementById("hamBtn");
  const menu = document.getElementById("hamMenu");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    menu.classList.remove("open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") menu.classList.remove("open");
  });
})();
