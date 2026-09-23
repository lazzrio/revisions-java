/* Suivi « fait », recherche, filtres et « tout déplier » pour les exercices corrigés */
(function () {
  "use strict";
  var KEY = "java_faits";
  var faits = {};
  try { faits = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { faits = {}; }
  function sauver() { try { localStorage.setItem(KEY, JSON.stringify(faits)); } catch (e) {} }

  var items = Array.prototype.slice.call(document.querySelectorAll(".qa-item[id]"));

  function peindre(item) {
    var ok = !!faits[item.id];
    item.classList.toggle("done", ok);
    var b = item.querySelector(".qa-donebtn");
    if (b) {
      b.textContent = ok ? "✓ Fait — annuler" : "Marquer comme fait";
      b.setAttribute("aria-pressed", ok ? "true" : "false");
    }
  }

  items.forEach(function (item) {
    var zone = item.querySelector(".qa-a-in");
    if (!zone) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "qa-donebtn";
    b.addEventListener("click", function () {
      faits[item.id] = !faits[item.id];
      if (!faits[item.id]) delete faits[item.id];
      sauver();
      peindre(item);
      progression();
    });
    zone.appendChild(b);
    peindre(item);
  });

  function progression() {
    var el = document.getElementById("cxProgress");
    if (!el) return;
    var vis = items.filter(function (i) { return !i.hidden; });
    var n = vis.filter(function (i) { return faits[i.id]; }).length;
    el.textContent = n + " / " + vis.length + " faits";
  }

  /* ----- barre d'outils (page Corrigés) ----- */
  var champ = document.getElementById("cxSearch");
  var puces = document.querySelectorAll("#cxChips [data-cat]");
  var cat = "all";

  function normaliser(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function filtrer() {
    var q = normaliser(champ ? champ.value.trim() : "");
    document.querySelectorAll("section[data-cat]").forEach(function (sec) {
      var okCat = cat === "all" || sec.getAttribute("data-cat") === cat;
      var visibles = 0;
      sec.querySelectorAll(".qa-item[id], .cx-week").forEach(function (it) {
        var montre = okCat && (!q || normaliser(it.textContent).indexOf(q) !== -1);
        it.hidden = !montre;
        if (montre) visibles++;
      });
      sec.hidden = !okCat || (q && visibles === 0);
    });
    progression();
  }
  if (champ) champ.addEventListener("input", filtrer);
  puces.forEach(function (p) {
    p.addEventListener("click", function () {
      cat = p.getAttribute("data-cat");
      puces.forEach(function (x) { x.classList.toggle("active", x === p); });
      filtrer();
    });
  });

  var tout = document.getElementById("cxExpand");
  if (tout) {
    tout.addEventListener("click", function () {
      var ouvrir = tout.getAttribute("data-open") !== "1";
      items.forEach(function (it) {
        if (it.hidden) return;
        it.classList.toggle("open", ouvrir);
        var q = it.querySelector(".qa-q");
        if (q) q.setAttribute("aria-expanded", ouvrir ? "true" : "false");
      });
      tout.setAttribute("data-open", ouvrir ? "1" : "0");
      tout.textContent = ouvrir ? "Tout replier" : "Tout déplier";
    });
  }

  /* impression : tout déplier */
  window.addEventListener("beforeprint", function () { items.forEach(function (it) { it.classList.add("open"); }); });

  /* ouverture directe via l'adresse (#an-2023-ex2) */
  function ouvrirAncre() {
    var h = decodeURIComponent((location.hash || "").slice(1));
    var el = h && document.getElementById(h);
    if (el && el.classList.contains("qa-item")) {
      el.classList.add("open");
      setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 50);
    }
  }
  window.addEventListener("hashchange", ouvrirAncre);
  ouvrirAncre();
  progression();
})();
