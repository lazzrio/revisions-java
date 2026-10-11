/* Page « Test 5 » : coloration du code, QCM mélangé (entraînement + simulation 50 q / 30 min), erreurs mémorisées */
(function () {
  "use strict";

  /* ---------- utilitaires ---------- */
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var KW = /^(abstract|boolean|break|catch|char|class|continue|double|else|extends|final|finally|for|if|implements|import|instanceof|int|interface|long|new|null|package|private|protected|public|return|static|super|this|throw|throws|try|void|while|true|false|transient|case|switch|default|float|byte|short)$/;
  function colorier(code) {
    var re = /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*")|(@[A-Za-z]+)|([A-Za-z_][A-Za-z0-9_]*)|(\b\d+(?:\.\d+)?\b)/g;
    var out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      var t = m[0];
      if (m[1]) out += '<span class="cmt">' + esc(t) + "</span>";
      else if (m[2]) out += '<span class="str">' + esc(t) + "</span>";
      else if (m[3]) out += '<span class="kw">' + esc(t) + "</span>";
      else if (m[4]) {
        if (KW.test(t)) out += '<span class="kw">' + t + "</span>";
        else if (/^[A-Z]/.test(t)) out += '<span class="cls">' + t + "</span>";
        else out += t;
      } else out += '<span class="num">' + t + "</span>";
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  function inline(s) {
    return esc(s).replace(/~(.+?)~/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  }
  /* texte avec blocs [[ ... ]] -> HTML */
  function riche(lignes) {
    var html = "", para = [], code = null;
    function flush() { if (para.length) { html += "<p>" + inline(para.join(" ")) + "</p>"; para = []; } }
    lignes.forEach(function (l) {
      if (code !== null) {
        if (l.trim() === "]]") { html += '<pre class="code">' + colorier(code.join("\n")) + "</pre>"; code = null; }
        else code.push(l);
      } else if (l.trim() === "[[") { flush(); code = []; }
      else if (l.trim() === "") flush();
      else para.push(l.trim());
    });
    flush();
    return html;
  }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); }
  function melange(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- coloration des blocs de la page ---------- */
  document.querySelectorAll("pre.code.hl").forEach(function (p) { p.innerHTML = colorier(p.textContent); });

  /* ---------- lecture de la banque ---------- */
  var THEMES = { exc: "Exceptions", fic: "Fichiers et sérialisation", swing: "Swing et listeners", mvc: "MVC" };
  var BANQUE = [];
  (function () {
    if (typeof T5_RAW === "undefined") return;
    var blocs = T5_RAW.split(/^## /m).slice(1);
    blocs.forEach(function (b) {
      var lignes = b.split("\n");
      var tete = lignes.shift().split("|");
      var theme = tete[0].trim(), sujet = (tete[1] || "").trim();
      var enonce = [], bonnes = [], fausses = [], expl = [], mode = "q";
      lignes.forEach(function (l) {
        if (mode === "q" && /^= /.test(l)) { mode = "r"; }
        else if (mode === "r" && /^\? /.test(l)) { mode = "e"; expl.push(l.slice(2)); return; }
        if (mode === "q") enonce.push(l);
        else if (mode === "r") { if (/^= /.test(l)) bonnes.push(l.slice(2)); else if (/^- /.test(l)) fausses.push(l.slice(2)); }
        else if (mode === "e") expl.push(l);
      });
      if (bonnes.length !== 1 || fausses.length < 2) { if (window.console) console.warn("Question mal formée :", sujet); return; }
      var q = { id: hash(theme + sujet + enonce.join("|") + bonnes[0]), theme: theme, sujet: sujet,
        code: enonce.some(function (l) { return l.trim() === "[["; }),
        q: riche(enonce), choix: [bonnes[0]].concat(fausses).map(inline), exp: riche(expl) };
      BANQUE.push(q);
    });
  })();

  var app = document.getElementById("t5App");
  if (!app) return;

  /* ---------- erreurs mémorisées ---------- */
  var CLE = "t5_erreurs";
  function lireErreurs() { try { return JSON.parse(localStorage.getItem(CLE) || "[]"); } catch (e) { return []; } }
  function ecrireErreurs(a) { try { localStorage.setItem(CLE, JSON.stringify(a)); } catch (e) {} }
  function majErreurs(q, ok) {
    var a = lireErreurs(), i = a.indexOf(q.id);
    if (ok && i >= 0) a.splice(i, 1);
    if (!ok && i < 0) a.push(q.id);
    ecrireErreurs(a);
  }

  /* ---------- état ---------- */
  var L = ["A", "B", "C", "D"];
  var S = { liste: [], i: 0, score: 0, hist: [], mode: "train", filtre: "all", timer: null, fin: 0, choisi: -1 };

  function preparer(q) {
    var ordre = melange(q.choix.map(function (_, k) { return k; }));
    return { src: q, choix: ordre.map(function (k) { return q.choix[k]; }), c: ordre.indexOf(0) };
  }
  function pool(f) {
    return BANQUE.filter(function (q) { return f === "all" ? true : f === "code" ? q.code : q.theme === f; });
  }
  function arreterChrono() {
    if (S.timer) { clearInterval(S.timer); S.timer = null; }
  }

  /* ---------- écran d'accueil ---------- */
  function accueil() {
    arreterChrono();
    var cles = ["all", "exc", "fic", "swing", "mvc", "code"];
    var noms = { all: "Tout", code: "Lecture de code" };
    for (var k in THEMES) noms[k] = THEMES[k];
    var erreurs = lireErreurs().filter(function (id) { return BANQUE.some(function (q) { return q.id === id; }); });
    app.innerHTML =
      '<div class="t5-setup">' +
      '<div class="qcm-filter" id="t5Filtre">' + cles.map(function (c) {
        return '<button data-f="' + c + '" class="' + (c === S.filtre ? "active" : "") + '">' + noms[c] + " (" + pool(c).length + ")</button>";
      }).join("") + "</div>" +
      '<div class="t5-modes">' +
      '<div class="t5-mode"><h4>🎓 Entraînement</h4><p>Toutes les questions du filtre, dans un <b>ordre aléatoire</b>, réponses mélangées, <b>correction expliquée</b> après chaque réponse.</p>' +
      '<button class="btn btn-primary" id="t5Train">Commencer</button></div>' +
      '<div class="t5-mode"><h4>⏱ Simulation du test</h4><p><b>50 questions</b> tirées au hasard dans toute la banque, <b>30 min</b>, une seule tentative, <b>pas de retour en arrière</b>, correction à la fin seulement.</p>' +
      '<button class="btn btn-primary" id="t5Exam">Lancer la simulation</button></div>' +
      '<div class="t5-mode"><h4>🔁 Mes erreurs</h4><p>' + (erreurs.length ? "<b>" + erreurs.length + "</b> question(s) ratées à rejouer (mémorisées dans ce navigateur)." : "Aucune erreur mémorisée pour l'instant. Lance un entraînement !") + "</p>" +
      '<button class="btn btn-ghost" id="t5Err"' + (erreurs.length ? "" : " disabled") + ">Rejouer mes erreurs</button></div>" +
      "</div></div>";
    app.querySelectorAll("#t5Filtre button").forEach(function (b) {
      b.addEventListener("click", function () { S.filtre = b.getAttribute("data-f"); accueil(); });
    });
    document.getElementById("t5Train").addEventListener("click", function () { demarrer("train", melange(pool(S.filtre).slice())); });
    document.getElementById("t5Exam").addEventListener("click", function () { demarrer("exam", melange(BANQUE.slice()).slice(0, 50)); });
    var be = document.getElementById("t5Err");
    be.addEventListener("click", function () {
      demarrer("train", melange(BANQUE.filter(function (q) { return erreurs.indexOf(q.id) >= 0; })));
    });
  }

  function demarrer(mode, qs) {
    arreterChrono();
    if (!qs.length) { accueil(); return; }
    S.mode = mode; S.liste = qs.map(preparer); S.i = 0; S.score = 0; S.hist = []; S.choisi = -1;
    if (mode === "exam") {
      S.fin = Date.now() + 30 * 60 * 1000;
      S.timer = setInterval(tic, 500);
    }
    afficher();
    app.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function tic() {
    var r = Math.max(0, S.fin - Date.now());
    var el = document.getElementById("t5Chrono");
    if (el) {
      el.textContent = "⏱ " + Math.floor(r / 60000) + ":" + ("0" + (Math.floor(r / 1000) % 60)).slice(-2);
      el.classList.toggle("urgent", r < 5 * 60000);
    }
    if (r <= 0) { arreterChrono(); resultats(true); }
  }

  /* ---------- une question ---------- */
  function afficher() {
    var p = S.liste[S.i], q = p.src, n = S.liste.length;
    var exam = S.mode === "exam";
    S.choisi = -1;
    app.innerHTML =
      '<div class="qcm-progress"><div class="meta"><span>Question ' + (S.i + 1) + " / " + n + "</span>" +
      (exam ? '<span id="t5Chrono"></span>' : "<span>Score " + S.score + "</span>") + "</div>" +
      '<div class="bar"><div class="fill" style="width:' + (S.i / n * 100) + '%"></div></div></div>' +
      '<div class="qcm-card"><div class="qcm-topic">' + THEMES[q.theme] + " · " + esc(q.sujet) + "</div>" +
      '<div class="qcm-q t5-q">' + q.q + "</div>" +
      '<div class="qcm-answers">' + p.choix.map(function (c, k) {
        return '<button class="qcm-ans" data-i="' + k + '"><span class="letter">' + L[k] + "</span><span>" + c + "</span></button>";
      }).join("") + "</div>" +
      '<div id="t5Fb"></div><div class="qcm-actions" id="t5Act">' +
      (exam ? '<button class="btn btn-primary" id="t5Next" disabled>' + (S.i === n - 1 ? "Terminer" : "Valider et suivant →") + "</button>" : "") +
      '<button class="btn btn-ghost" id="t5Stop">Abandonner</button></div></div>';
    if (exam) tic();
    app.querySelectorAll(".qcm-ans").forEach(function (b) {
      b.addEventListener("click", function () { choisir(parseInt(b.getAttribute("data-i"), 10)); });
    });
    document.getElementById("t5Stop").addEventListener("click", function () {
      if (exam && !confirm("Abandonner la simulation ? Les questions restantes comptent comme fausses.")) return;
      if (!exam || S.hist.length) resultats(false, true); else accueil();
    });
    var nx = document.getElementById("t5Next");
    if (nx) nx.addEventListener("click", suivante);
  }

  function choisir(k) {
    var p = S.liste[S.i], q = p.src;
    if (S.mode === "exam") {
      S.choisi = k;
      document.querySelectorAll(".qcm-ans").forEach(function (b, j) { b.classList.toggle("picked", j === k); });
      document.getElementById("t5Next").disabled = false;
      return;
    }
    var ok = k === p.c;
    if (ok) S.score++;
    majErreurs(q, ok);
    S.hist.push({ ok: ok, p: p, pick: k });
    document.querySelectorAll(".qcm-ans").forEach(function (b, j) {
      b.disabled = true;
      if (j === p.c) b.classList.add("correct"); else if (j === k) b.classList.add("wrong"); else b.classList.add("dim");
    });
    document.getElementById("t5Fb").innerHTML = '<div class="qcm-fb ' + (ok ? "good" : "bad") + '"><span class="lbl">' +
      (ok ? "✓ Bonne réponse" : "✗ Bonne réponse : " + L[p.c]) + "</span>" + q.exp + "</div>";
    var last = S.i === S.liste.length - 1;
    var act = document.getElementById("t5Act");
    act.insertAdjacentHTML("afterbegin", '<button class="btn btn-primary" id="t5Next">' + (last ? "Voir les résultats" : "Question suivante →") + "</button>");
    document.getElementById("t5Next").addEventListener("click", suivante);
    document.getElementById("t5Next").focus();
  }

  function suivante() {
    var p = S.liste[S.i];
    if (S.mode === "exam") {
      var ok = S.choisi === p.c;
      if (ok) S.score++;
      majErreurs(p.src, ok);
      S.hist.push({ ok: ok, p: p, pick: S.choisi });
    }
    S.i++;
    if (S.i >= S.liste.length) resultats(false); else afficher();
  }

  /* ---------- résultats ---------- */
  function resultats(tempsEcoule, abandon) {
    arreterChrono();
    /* simulation interrompue : les questions non traitées comptent fausses */
    if (S.mode === "exam" && (tempsEcoule || abandon)) {
      if (S.choisi >= 0 && S.hist.length === S.i && S.i < S.liste.length) {
        var pc = S.liste[S.i], okc = S.choisi === pc.c;
        if (okc) S.score++;
        majErreurs(pc.src, okc);
        S.hist.push({ ok: okc, p: pc, pick: S.choisi });
      }
      for (var j = S.hist.length; j < S.liste.length; j++) {
        S.hist.push({ ok: false, p: S.liste[j], pick: -1 });
        majErreurs(S.liste[j].src, false);
      }
    }
    var total = S.liste.length, repondu = S.hist.length;
    if (S.mode === "train" && abandon) total = repondu || 1;
    var pct = Math.round(S.score / total * 100);
    var note = (S.score / total * 20).toFixed(1).replace(".", ",");
    var verdict = pct >= 85 ? "Excellent, tu maîtrises." : pct >= 70 ? "Bonne maîtrise : relis les erreurs ci-dessous." :
      pct >= 50 ? "Base correcte : refais les sections de code de la page puis retente." : "Reprends les sections « Comprendre le code » puis retente.";
    var parTheme = {};
    S.hist.forEach(function (h) {
      var t = h.p.src.theme; parTheme[t] = parTheme[t] || { ok: 0, n: 0 };
      parTheme[t].n++; if (h.ok) parTheme[t].ok++;
    });
    var ratees = S.hist.filter(function (h) { return !h.ok; });
    app.innerHTML =
      '<div class="qcm-card qcm-results"><div class="qcm-topic">Résultat' + (tempsEcoule ? " · temps écoulé" : "") + (S.mode === "exam" ? " · simulation" : "") + "</div>" +
      '<div class="score">' + S.score + '<span class="tot"> / ' + total + "</span></div>" +
      '<div class="verdict">' + pct + " % · soit " + note + " / 20 · " + verdict + "</div>" +
      '<div class="t5-themes">' + Object.keys(parTheme).map(function (t) {
        var d = parTheme[t], r = Math.round(d.ok / d.n * 100);
        return '<div class="t5-th"><span>' + THEMES[t] + '</span><span class="t5-bar"><i style="width:' + r + '%"></i></span><span>' + d.ok + "/" + d.n + "</span></div>";
      }).join("") + "</div>" +
      (ratees.length ? '<h4 class="t5-h">À revoir (' + ratees.length + ")</h4>" +
        '<div class="t5-rev">' + ratees.map(function (h, k) {
          var q = h.p.src;
          return '<details class="t5-d"><summary><span class="t5-t">' + THEMES[q.theme] + "</span> " + esc(q.sujet) + "</summary>" +
            '<div class="t5-dq">' + q.q + "</div>" +
            '<ul class="t5-opt">' + h.p.choix.map(function (c, j) {
              var cl = j === h.p.c ? "ok" : j === h.pick ? "ko" : "";
              return '<li class="' + cl + '"><b>' + L[j] + ".</b> " + c + (j === h.p.c ? " ✓" : j === h.pick ? " (ta réponse)" : "") + "</li>";
            }).join("") + "</ul>" +
            '<div class="qcm-fb good"><span class="lbl">Explication</span>' + q.exp + "</div></details>";
        }).join("") + "</div>" : '<p class="t5-h">Aucune erreur, sans-faute 🎉</p>') +
      '<div class="qcm-actions" style="justify-content:center;margin-top:24px">' +
      '<button class="btn btn-ghost" id="t5Home">Retour</button>' +
      (S.mode === "exam" ? '<button class="btn btn-primary" id="t5Again">Nouvelle simulation</button>' : '<button class="btn btn-primary" id="t5Again">Recommencer</button>') + "</div></div>";
    document.getElementById("t5Home").addEventListener("click", accueil);
    document.getElementById("t5Again").addEventListener("click", function () {
      if (S.mode === "exam") demarrer("exam", melange(BANQUE.slice()).slice(0, 50));
      else demarrer("train", melange(pool(S.filtre).slice()));
    });
    app.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* compteurs de la page */
  var c = document.querySelectorAll(".t5-count");
  c.forEach(function (el) { el.textContent = BANQUE.length; });
  accueil();

  /* adresse #t5-qcm : défiler vers le QCM */
  window.t5Aller = function () { app.scrollIntoView({ behavior: "smooth", block: "start" }); };
})();
