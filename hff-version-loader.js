const HFF_VERSION = "2026-05-16-2";

function loadScript(src) {
  const script = document.createElement("script");
  script.src = `${src}?v=${HFF_VERSION}`;
  script.defer = true;
  document.head.appendChild(script);
}

loadScript("season-schedule.js");
loadScript("scores-strip.js");