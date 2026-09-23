/* POO Java · Ing2 — navigation, thème, accordéons, jalons, QCM */
(function () {
  "use strict";

  /* ---------- Thème ---------- */
  var root = document.documentElement;
  try { var saved = localStorage.getItem("theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  window.toggleTheme = function () {
    var cur = root.getAttribute("data-theme");
    var dark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    var next = cur === "dark" ? "light" : cur === "light" ? "dark" : (dark ? "light" : "dark");
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  };

  /* ---------- Accordéons ---------- */
  window.toggleQA = function (btn) {
    var item = btn.closest(".qa-item");
    if (!item) return;
    var open = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };
  function openItem(item) {
    if (!item || !item.classList.contains("qa-item")) return;
    item.classList.add("open");
    var b = item.querySelector(".qa-q");
    if (b) b.setAttribute("aria-expanded", "true");
  }

  /* ---------- Menu mobile ---------- */
  var nav = document.querySelector(".nav");
  var burger = document.getElementById("burger");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", o ? "true" : "false");
    });
  }

  /* ---------- Navigation entre vues (avec adresse partageable #s4, #s5-ex2…) ---------- */
  function viewOf(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    return el.classList.contains("view") ? el : el.closest(".view");
  }
  window.showView = function (id, anchor) {
    var v = viewOf(id);
    if (!v) return;
    document.querySelectorAll(".view").forEach(function (x) { x.classList.toggle("active", x === v); });
    document.querySelectorAll(".nav [data-view]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-view") === v.id);
    });
    if (nav) nav.classList.remove("open");
    var target = anchor ? document.getElementById(anchor) : (id !== v.id ? document.getElementById(id) : null);
    try { history.replaceState(null, "", "#" + (target ? target.id : v.id)); } catch (e) {}
    if (target) {
      openItem(target);
      setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  function route() {
    var h = decodeURIComponent((location.hash || "").slice(1));
    if (h && viewOf(h)) window.showView(h);
  }
  window.addEventListener("hashchange", route);
  if (document.querySelector(".view")) route();

  /* ---------- Jalons (emploi du temps officiel) ---------- */
  var JALONS = [
    { d: "2026-09-28T08:00:00+02:00", t: "Évaluation écrite de la semaine 5", s: "1 h sur feuille, semaine du 28 septembre · cours et TP des semaines 1 à 4" },
    { d: "2026-10-12T08:00:00+02:00", t: "Test 5 (QCM Safe Exam Browser)", s: "50 questions en 20 min, semaine du 12 octobre · semaines 5, 6 et 7" },
    { d: "2026-11-07T11:00:00+01:00", t: "Évaluation finale POO Java", s: "samedi 7 novembre, 11 h 00 – 12 h 30 · tout le programme" }
  ];
  var now = new Date();
  function jours(d) { return Math.max(0, Math.ceil((new Date(d) - now) / 864e5)); }
  var ds = document.getElementById("daysLeft");
  if (ds) ds.textContent = jours(JALONS[2].d);
  var prochain = null;
  for (var i = 0; i < JALONS.length; i++) { if (new Date(JALONS[i].d) > now) { prochain = JALONS[i]; break; } }
  var m1 = document.getElementById("nextMilestone"), m2 = document.getElementById("nextMilestoneDate");
  if (m1 && m2) {
    if (prochain) { m1.textContent = prochain.t; m2.textContent = "J-" + jours(prochain.d) + " · " + prochain.s; }
    else { m1.textContent = "Évaluations Java terminées"; m2.textContent = "Garde les corrigés pour l'ING3 !"; }
  }

  /* ---------- QCM ---------- */
  if (typeof ALL_QUESTIONS === "undefined" || !document.getElementById("qcmApp")) return;
  var LETTERS = ["A", "B", "C", "D"];
  var LABELS = { all: "Tout", s1: "S1", s2: "S2", s3: "S3", s4: "S4", s5: "S5", s6: "S6", s7: "S7", meth: "Méthodes" };
  var state = { list: [], idx: 0, score: 0, history: [], filter: "all", timer: null, fin: 0 };

  var qc = document.getElementById("qcmCount");
  if (qc) qc.textContent = ALL_QUESTIONS.length;

  function melange(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function melangerReponses(q) {
    var ordre = melange([0, 1, 2, 3].slice(0, q.choices.length));
    return { wk: q.wk, topic: q.topic, q: q.q, exp: q.exp,
      choices: ordre.map(function (k) { return q.choices[k]; }), c: ordre.indexOf(q.c) };
  }

  var bar = document.getElementById("qcmFilter");
  if (bar) {
    var keys = ["all", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "meth"];
    bar.innerHTML = keys.map(function (k) {
      var n = k === "all" ? ALL_QUESTIONS.length : ALL_QUESTIONS.filter(function (q) { return q.wk === k; }).length;
      return n ? '<button data-filter="' + k + '" onclick="filterQCM(\'' + k + '\')">' + LABELS[k] + " (" + n + ")</button>" : "";
    }).join("");
  }

  function stopTimer() { if (state.timer) { clearInterval(state.timer); state.timer = null; } var t = document.getElementById("qcmTimer"); if (t) t.textContent = ""; }

  window.filterQCM = function (f) {
    stopTimer();
    document.querySelectorAll("#qcmFilter button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-filter") === f); });
    state.filter = f;
    var base = f === "all" ? ALL_QUESTIONS.slice() : ALL_QUESTIONS.filter(function (q) { return q.wk === f; });
    var mix = document.getElementById("qcmShuffle");
    if (mix && mix.checked) base = melange(base).map(melangerReponses);
    state.list = base; state.idx = 0; state.score = 0; state.history = [];
    render();
  };
  window.startQCM = function (f) { window.showView("qcm"); window.filterQCM(f); };

  window.examQCM = function () {
    stopTimer();
    var base = state.filter === "all" ? ALL_QUESTIONS.slice() : ALL_QUESTIONS.filter(function (q) { return q.wk === state.filter; });
    state.list = melange(base).slice(0, 20).map(melangerReponses);
    state.idx = 0; state.score = 0; state.history = [];
    state.fin = Date.now() + 15 * 60 * 1000;
    var t = document.getElementById("qcmTimer");
    state.timer = setInterval(function () {
      var r = Math.max(0, state.fin - Date.now());
      if (t) t.textContent = "⏱ " + Math.floor(r / 60000) + ":" + ("0" + Math.floor(r / 1000) % 60).slice(-2);
      if (r <= 0) { stopTimer(); results(true); }
    }, 500);
    render();
  };

  function render() {
    var app = document.getElementById("qcmApp");
    var list = state.list;
    if (!list.length) { app.innerHTML = '<div class="panel">Aucune question dans ce filtre.</div>'; return; }
    var q = list[state.idx];
    var pct = (state.idx / list.length) * 100;
    app.innerHTML =
      '<div class="qcm-progress"><div class="meta"><span>Question ' + (state.idx + 1) + " / " + list.length + "</span><span>Score " + state.score + "</span></div>" +
      '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div></div>' +
      '<div class="qcm-card"><div class="qcm-topic">' + q.wk.toUpperCase() + " · " + q.topic + "</div>" +
      '<div class="qcm-q">' + q.q + "</div>" +
      '<div class="qcm-answers">' + q.choices.map(function (c, i) {
        return '<button class="qcm-ans" data-i="' + i + '"><span class="letter">' + LETTERS[i] + "</span><span>" + c + "</span></button>";
      }).join("") + "</div>" +
      '<div id="fb"></div><div class="qcm-actions" id="actions"></div></div>';
    app.querySelectorAll(".qcm-ans").forEach(function (b) {
      b.addEventListener("click", function () { answer(parseInt(b.getAttribute("data-i"), 10)); });
    });
  }

  function answer(picked) {
    var q = state.list[state.idx];
    var ok = picked === q.c;
    if (ok) state.score++;
    state.history.push({ ok: ok, topic: q.topic, wk: q.wk });
    document.querySelectorAll(".qcm-ans").forEach(function (b, i) {
      b.disabled = true;
      if (i === q.c) b.classList.add("correct"); else if (i === picked) b.classList.add("wrong"); else b.classList.add("dim");
    });
    document.getElementById("fb").innerHTML = '<div class="qcm-fb ' + (ok ? "good" : "bad") + '"><span class="lbl">' +
      (ok ? "✓ Bonne réponse" : "✗ Réponse : " + LETTERS[q.c]) + "</span><div>" + q.exp + "</div></div>";
    var last = state.idx === state.list.length - 1;
    document.getElementById("actions").innerHTML = '<button class="btn btn-primary" onclick="nextQCM()">' + (last ? "Voir les résultats" : "Question suivante →") + "</button>";
  }
  window.nextQCM = function () { state.idx++; if (state.idx >= state.list.length) results(false); else render(); };

  function results(tempsEcoule) {
    stopTimer();
    var total = state.list.length, pct = Math.round((state.score / total) * 100), v;
    if (pct >= 85) v = "Excellent — tu maîtrises.";
    else if (pct >= 70) v = "Bonne maîtrise. Relis les questions ratées.";
    else if (pct >= 50) v = "Base correcte. Refais les corrigés de la semaine et retente demain.";
    else v = "Reprends les notions clés et les exercices corrigés, puis retente.";
    document.getElementById("qcmApp").innerHTML =
      '<div class="qcm-card qcm-results"><div class="qcm-topic">Résultat' + (tempsEcoule ? " — temps écoulé" : "") + "</div>" +
      '<div class="score">' + state.score + '<span class="tot"> / ' + total + "</span></div>" +
      '<div class="verdict">' + pct + "% · " + v + "</div>" +
      '<div class="qcm-breakdown">' + state.history.map(function (h, i) {
        return '<div class="review-item"><span class="num">' + h.wk.toUpperCase() + "·" + ("0" + (i + 1)).slice(-2) + "</span><span>" + h.topic +
          '</span><span class="mark ' + (h.ok ? "good" : "bad") + '">' + (h.ok ? "✓" : "✗") + "</span></div>";
      }).join("") + "</div>" +
      '<div class="qcm-actions" style="justify-content:center;margin-top:24px">' +
      '<button class="btn btn-ghost" onclick="filterQCM(\'' + state.filter + '\')">Recommencer</button>' +
      '<button class="btn btn-primary" onclick="reviewWrongQCM()">Ne revoir que mes erreurs</button></div></div>';
    window._lastList = state.list;
  }
  window.reviewWrongQCM = function () {
    var wrong = [];
    state.history.forEach(function (h, i) { if (!h.ok) wrong.push(window._lastList[i]); });
    if (!wrong.length) { alert("Aucune erreur — sans-faute !"); return; }
    state.list = wrong; state.idx = 0; state.score = 0; state.history = [];
    render();
  };

  window.filterQCM("all");
})();

/* ---------- Hors ligne (téléphone) : service worker, seulement en https ---------- */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
