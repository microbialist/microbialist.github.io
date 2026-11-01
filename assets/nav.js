/* Shared site navbar for article pages.
   Add this to any article's <head>:  <script src="../assets/nav.js" defer></script>
   It injects the same navbar as index.html (Home + Articles dropdown fed by articles/manifest.json). */
(function () {
  var script = document.currentScript;
  var root = new URL("../", script.src).href;           // site root
  var current = location.pathname.split("/").pop();    // e.g. read-mapping.html

  var css = `
  .sn{--sn-bg:#f6efdf;--sn-text:#000;--sn-muted:#5c574c;--sn-line:#e0d8c1;--sn-accent:#2a44ff;--sn-tint:#ece4cf;
    --sn-body:Georgia,"Times New Roman",serif;--sn-ui:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
    background:var(--sn-bg);color:var(--sn-text);box-sizing:border-box;padding:calc(0.25rem + env(safe-area-inset-top,0px)) 1.25rem 0;
    font-size:1.125rem;line-height:1.65;-webkit-font-smoothing:antialiased;position:relative;z-index:50}
  .sn *,.sn *::before,.sn *::after{box-sizing:inherit}
  .sn-nav{max-width:39.5rem;margin:0 auto;display:flex;align-items:stretch;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--sn-line)}
  .sn-brand{display:block;margin:0;padding:1rem 0;font:700 1.25rem/1 var(--sn-body);letter-spacing:-0.01em;color:var(--sn-text);text-decoration:none}
  .sn-tabs{display:flex;align-items:stretch;gap:1.5rem}
  .sn-tab{appearance:none;background:none;border:0;border-bottom:2px solid transparent;margin:0 0 -1px;padding:1rem 0;
    font:500 0.95rem/1 var(--sn-ui);color:var(--sn-muted);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
  .sn-tab:hover{color:var(--sn-text)}
  .sn-tab[aria-selected="true"]{color:var(--sn-text);border-bottom-color:var(--sn-accent)}
  .sn a:focus-visible,.sn button:focus-visible{outline:2px solid var(--sn-accent);outline-offset:4px}
  .sn-wrap{position:relative;display:flex}
  .sn-caret{display:inline-block;margin-left:0.3rem;font-size:0.75em;transition:transform .15s ease}
  .sn-tab[aria-expanded="true"] .sn-caret{transform:rotate(180deg)}
  .sn-menu{position:absolute;top:calc(100% + 0.4rem);right:0;z-index:60;min-width:18rem;max-width:calc(100vw - 2.5rem);margin:0;padding:0.4rem;
    list-style:none;background:var(--sn-bg);border:1px solid var(--sn-text);box-shadow:0 10px 28px rgba(0,0,0,.12)}
  .sn-menu[hidden]{display:none}
  .sn-menu a{display:block;padding:0.65rem 0.8rem;color:var(--sn-text);text-decoration:none;font-family:var(--sn-ui)}
  .sn-menu a:hover,.sn-menu a:focus-visible{background:var(--sn-tint);outline:none}
  .sn-menu a[aria-current="page"]{box-shadow:inset 2px 0 0 var(--sn-accent)}
  .sn-title{display:block;font-weight:600;font-size:0.95rem;line-height:1.3}
  .sn-tag{display:block;font-size:0.78rem;color:var(--sn-muted);margin-top:0.15rem}`;

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  if (!document.querySelector('link[href*="IBM+Plex+Sans"]')) {
    var f = document.createElement("link");
    f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(f);
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  var menu = el("ul", { "class": "sn-menu", id: "sn-menu", role: "menu", "aria-label": "Article pages", hidden: "" });
  var articlesTab = el("button", {
    "class": "sn-tab", type: "button", id: "sn-tab-articles", "aria-selected": "true",
    "aria-haspopup": "menu", "aria-expanded": "false", "aria-controls": "sn-menu"
  }, [document.createTextNode("Articles"), el("span", { "class": "sn-caret", "aria-hidden": "true", text: "▾" })]);

  var header = el("header", { "class": "sn" }, [
    el("nav", { "class": "sn-nav", "aria-label": "Main" }, [
      el("a", { "class": "sn-brand", href: root, text: "The Microbialist" }),
      el("div", { "class": "sn-tabs" }, [
        el("a", { "class": "sn-tab", href: root, "aria-selected": "false", text: "Home" }),
        el("div", { "class": "sn-wrap" }, [articlesTab, menu])
      ])
    ])
  ]);

  function setMenu(open) {
    menu.hidden = !open;
    articlesTab.setAttribute("aria-expanded", String(open));
  }
  articlesTab.addEventListener("click", function (e) { e.stopPropagation(); setMenu(menu.hidden); });
  document.addEventListener("click", function (e) { if (!e.target.closest(".sn-wrap")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) { setMenu(false); articlesTab.focus(); }
  });

  function mount() {
    document.body.insertBefore(header, document.body.firstChild);
    fetch(root + "articles/manifest.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (list) {
        list.forEach(function (p) {
          var a = el("a", { href: root + "articles/" + encodeURIComponent(p.file), role: "menuitem" },
            [el("span", { "class": "sn-title", text: p.title })]);
          if (p.tag) a.appendChild(el("span", { "class": "sn-tag", text: p.tag }));
          if (p.file === current) a.setAttribute("aria-current", "page");
          menu.appendChild(el("li", { role: "none" }, [a]));
        });
      });
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
