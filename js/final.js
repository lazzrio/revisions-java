/* Évaluation finale : QCM à points négatifs.
   Banques : F_S1..F_S4, F_ANN (format texte), T5_RAW/T5_RAW2 (semaines 5 à 7) et ALL_QUESTIONS (banque HTML du site). */
(function () {
  "use strict";

  /* ---------- utilitaires ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var KW = /^(abstract|boolean|break|catch|char|class|continue|double|else|extends|final|finally|for|if|implements|import|instanceof|int|interface|long|new|null|package|private|protected|public|return|static|super|this|throw|throws|try|void|while|true|false|transient|case|switch|default|float|byte|short)$/;
  function colorier(code) {
    var re = /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*")|(@[A-Za-z]+)|([A-Za-z_][A-Za-z0-9_]*)|(\b\d+(?:\.\d+)?\b)/g;
    var out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      var t = m[0];
      if (m[1] || m[2]) out += '<span class="cmt">' + esc(t) + "</span>";
      else if (m[3]) out += '<span class="str">' + esc(t) + "</span>";
      else if (m[4]) out += '<span class="kw">' + esc(t) + "</span>";
      else if (m[5]) {
        if (KW.test(t)) out += '<span class="kw">' + t + "</span>";
        else if (/^[A-Z]/.test(t)) out += '<span class="cls">' + t + "</span>";
        else out += t;
      } else out += '<span class="num">' + t + "</span>";
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  function inline(s) { return esc(s).replace(/~(.+?)~/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
  function riche(lignes) {
    var html = "", para = [], code = null;
    function flush() { if (para.length) { html += "<p>" + inline(para.join(" ")) + "</p>"; para = []; } }
    lignes.forEach(function (l) {
      if (code !== null) {
        if (l.trim() === "]]") { html += '<pre class="code">' + colorier(code.join("\n")) + "</pre>"; code = null; }
        else code.push(l);
      } else if (l.charAt(0) === "@") { /* consigne de vérification : non affichée */ }
      else if (l.trim() === "[[") { flush(); code = []; }
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

  /* ---------- chapitres ---------- */
  var CH = {
    s1: "S1 · Bases", s2: "S2 · UML et héritage", s3: "S3 · Concepts de base", s4: "S4 · Abstraction, interfaces, collections",
    s5: "S5 · Exceptions et fichiers", s6: "S6 · Swing et listeners", s7: "S7 · MVC", mix: "Méthodes", ann: "Annale 2025"
  };
  var ORDRE = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "mix"];
  var VERS_CH = { exc: "s5", fic: "s5", swing: "s6", mvc: "s7" };
  var POIDS = { s1: 10, s2: 9, s3: 10, s4: 14, s5: 12, s6: 11, s7: 8, mix: 6 };   /* 80 questions */

  /* ---------- lecture des banques ---------- */
  var BANQUE = [];
  function lireTexte(raw, mapCh) {
    if (!raw) return;
    raw.split(/^## /m).slice(1).forEach(function (b) {
      var lignes = b.split("\n");
      var tete = lignes.shift().split("|");
      var th = tete[0].trim(), sujet = (tete[1] || "").trim();
      var enonce = [], bonnes = [], fausses = [], expl = [], mode = "q";
      lignes.forEach(function (l) {
        if (mode === "q" && /^= /.test(l)) mode = "r";
        else if (mode === "r" && /^\? /.test(l)) { mode = "e"; expl.push(l.slice(2)); return; }
        if (mode === "q") enonce.push(l);
        else if (mode === "r") { if (/^= /.test(l)) bonnes.push(l.slice(2)); else if (/^- /.test(l)) fausses.push(l.slice(2)); }
        else expl.push(l);
      });
      if (bonnes.length !== 1 || fausses.length < 2) { if (window.console) console.warn("Question mal formée :", sujet); return; }
      var ch = mapCh ? (VERS_CH[th] || th) : th;
      BANQUE.push({ id: hash(ch + sujet + enonce.join("|") + bonnes[0]), ch: ch, sujet: sujet,
        code: enonce.some(function (l) { return l.trim() === "[["; }),
        q: riche(enonce), choix: [bonnes[0]].concat(fausses).map(inline), exp: riche(expl) });
    });
  }
  /* les const de niveau supérieur ne sont pas des propriétés de window : on les atteint par typeof */
  [typeof F_S1 !== "undefined" ? F_S1 : "", typeof F_S2 !== "undefined" ? F_S2 : "", typeof F_S3 !== "undefined" ? F_S3 : "",
    typeof F_S4 !== "undefined" ? F_S4 : "", typeof F_ANN !== "undefined" ? F_ANN : ""].forEach(function (r) { lireTexte(r, false); });
  lireTexte(typeof T5_RAW !== "undefined" ? T5_RAW : "", true);
  lireTexte(typeof T5_RAW2 !== "undefined" ? T5_RAW2 : "", true);
  (function () {
    var A = null;
    try { A = ALL_QUESTIONS; } catch (e) { A = null; }
    if (!A) return;
    A.forEach(function (q) {
      var ch = q.wk === "meth" ? "mix" : q.wk;
      if (!CH[ch]) return;
      var cs = q.choices.slice();
      BANQUE.push({ id: hash("old" + q.wk + q.topic + q.q), ch: ch, sujet: q.topic, code: /<pre|<code>/.test(q.q) && /\n/.test(q.q),
        q: "<p>" + q.q + "</p>", choix: [cs[q.c]].concat(cs.filter(function (_, i) { return i !== q.c; })), exp: "<p>" + q.exp + "</p>" });
    });
  })();

  var app = document.getElementById("finApp");
  if (!app) return;

  /* ---------- mémoire locale ---------- */
  function lire(cle, def) { try { var v = JSON.parse(localStorage.getItem(cle)); return v == null ? def : v; } catch (e) { return def; } }
  function ecrire(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) {} }
  function majErreurs(q, ok) {
    var a = lire("fin_erreurs", []), i = a.indexOf(q.id);
    if (ok && i >= 0) a.splice(i, 1);
    if (!ok && i < 0) a.push(q.id);
    ecrire("fin_erreurs", a);
  }

  /* ---------- état ---------- */
  var L = ["A", "B", "C", "D", "E"];
  var S = { mode: "", liste: [], i: 0, rep: [], marq: [], fin: 0, timer: null, filtre: "all", blancPen: true, pr: 1, pw: 0.5, dureeMin: 0, titre: "" };

  function preparer(q) {
    var ordre = melange(q.choix.map(function (_, k) { return k; }));
    return { src: q, choix: ordre.map(function (k) { return q.choix[k]; }), c: ordre.indexOf(0) };
  }
  function pool(f) {
    return BANQUE.filter(function (q) {
      if (f === "all") return q.ch !== "ann";
      if (f === "code") return q.code && q.ch !== "ann";
      return q.ch === f;
    });
  }
  function examen80() {
    var res = [], reste = [];
    ORDRE.forEach(function (ch) {
      var p = melange(pool(ch).slice()), n = Math.min(POIDS[ch], p.length);
      res = res.concat(p.slice(0, n)); reste = reste.concat(p.slice(n));
    });
    melange(reste);
    while (res.length < 80 && reste.length) res.push(reste.pop());
    return melange(res);
  }
  function arreter() { if (S.timer) { clearInterval(S.timer); S.timer = null; } document.removeEventListener("keydown", touches); }
  function fmt(r) { return Math.floor(r / 60000) + ":" + ("0" + (Math.floor(r / 1000) % 60)).slice(-2); }
  function nombre(x) { return (Math.round(x * 1000) / 1000).toString().replace(".", ","); }

  /* ---------- accueil ---------- */
  function accueil() {
    arreter();
    var filtres = ["all"].concat(ORDRE).concat(["code", "ann"]);
    var noms = { all: "Tout", code: "Lecture de code" };
    for (var k in CH) noms[k] = CH[k];
    var erreurs = lire("fin_erreurs", []).filter(function (id) { return BANQUE.some(function (q) { return q.id === id; }); });
    var hist = lire("fin_hist", []).slice(-6).reverse();
    var total = pool("all").length;
    app.innerHTML =
      '<div class="t5-modes">' +
      '<div class="t5-mode"><h4>🎓 Examen blanc : 80 questions</h4><p>80 questions tirées au hasard dans tous les chapitres, <b>1 h 30</b>, une seule bonne réponse, <b>points négatifs</b>. Tu peux naviguer et corriger tes réponses comme sur la grille papier. Correction à la fin.</p>' +
      '<label class="fin-opt"><input type="checkbox" id="finBlanc" ' + (S.blancPen ? "checked" : "") + '> une réponse laissée vide compte comme une erreur (règle du sujet 2025)</label>' +
      '<button class="btn btn-primary" id="finExam">Lancer l\'examen blanc</button></div>' +
      '<div class="t5-mode"><h4>📄 Annale 2025 réelle</h4><p>Le vrai QCM du DS 2025 (24 questions sur 25), même barème : <b>+0,8 / −0,4</b>. 45 minutes.</p>' +
      '<button class="btn btn-primary" id="finAnn">Faire l\'annale</button></div>' +
      '<div class="t5-mode"><h4>🎯 Entraînement</h4><p>Choisis un chapitre : questions mélangées avec <b>correction expliquée</b> après chaque réponse.</p>' +
      '<div class="qcm-filter" id="finFiltre">' + filtres.map(function (c) {
        return '<button data-f="' + c + '" class="' + (c === S.filtre ? "active" : "") + '">' + noms[c] + " (" + pool(c).length + ")</button>";
      }).join("") + '</div><button class="btn btn-primary" id="finTrain">Commencer</button></div>' +
      '<div class="t5-mode"><h4>🔁 Mes erreurs</h4><p>' + (erreurs.length ? "<b>" + erreurs.length + "</b> question(s) ratées à rejouer." : "Aucune erreur mémorisée pour l'instant.") + "</p>" +
      '<button class="btn btn-ghost" id="finErr"' + (erreurs.length ? "" : " disabled") + ">Rejouer mes erreurs</button></div>" +
      "</div>" +
      (hist.length ? '<h4 class="t5-h">Tes derniers résultats</h4><div class="fin-hist">' + hist.map(function (h) {
        return '<div><span>' + esc(h.d) + "</span><span>" + esc(h.m) + "</span><b>" + nombre(h.note) + " / 20</b></div>";
      }).join("") + "</div>" : "") +
      '<p class="ev-small" style="text-align:center;margin-top:16px">' + total + " questions dans la banque d'examen, plus l'annale de 24 questions.</p>";
    app.querySelectorAll("#finFiltre button").forEach(function (b) {
      b.addEventListener("click", function () { S.filtre = b.getAttribute("data-f"); accueil(); });
    });
    document.getElementById("finExam").addEventListener("click", function () {
      S.blancPen = document.getElementById("finBlanc").checked;
      var qs = examen80();
      demarrer("exam", qs, { pr: 20 / qs.length, pw: 10 / qs.length, dureeMin: 90, titre: "Examen blanc" });
    });
    document.getElementById("finAnn").addEventListener("click", function () {
      S.blancPen = true;
      demarrer("exam", BANQUE.filter(function (q) { return q.ch === "ann"; }), { pr: 0.8, pw: 0.4, dureeMin: 45, titre: "Annale 2025" });
    });
    document.getElementById("finTrain").addEventListener("click", function () {
      demarrer("train", melange(pool(S.filtre).slice()), { titre: "Entraînement" });
    });
    document.getElementById("finErr").addEventListener("click", function () {
      demarrer("train", melange(BANQUE.filter(function (q) { return erreurs.indexOf(q.id) >= 0; })), { titre: "Mes erreurs" });
    });
  }

  function demarrer(mode, qs, opt) {
    arreter();
    if (!qs.length) { accueil(); return; }
    S.mode = mode; S.liste = qs.map(preparer); S.i = 0; S.titre = opt.titre || "";
    S.rep = S.liste.map(function () { return -1; });
    S.marq = S.liste.map(function () { return false; });
    S.hist = [];
    S.score = 0;
    if (mode === "exam") {
      S.pr = opt.pr; S.pw = opt.pw; S.dureeMin = opt.dureeMin;
      S.fin = Date.now() + opt.dureeMin * 60000;
      S.timer = setInterval(tic, 500);
      document.addEventListener("keydown", touches);
    }
    afficher();
    app.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function tic() {
    var r = Math.max(0, S.fin - Date.now());
    var el = document.getElementById("finChrono");
    if (el) { el.textContent = "⏱ " + fmt(r); el.classList.toggle("urgent", r < 10 * 60000); }
    if (r <= 0) { arreter(); resultats(true); }
  }
  function touches(e) {
    if (S.mode !== "exam" || !document.getElementById("finGrille")) return;
    var t = e.target && e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
    var k = e.key.toLowerCase(), n = S.liste.length;
    if (k >= "a" && k <= "e" && S.liste[S.i].choix.length > k.charCodeAt(0) - 97) { choisirExam(k.charCodeAt(0) - 97); }
    else if (e.key === "ArrowRight" && S.i < n - 1) { aller(S.i + 1); }
    else if (e.key === "ArrowLeft" && S.i > 0) { aller(S.i - 1); }
  }

  /* ---------- affichage d'une question ---------- */
  function grille() {
    return S.liste.map(function (_, k) {
      var cl = "fin-n" + (k === S.i ? " cur" : "") + (S.rep[k] >= 0 ? " ans" : "") + (S.marq[k] ? " flag" : "");
      return '<button class="' + cl + '" data-k="' + k + '" aria-label="Question ' + (k + 1) + '">' + (k + 1) + "</button>";
    }).join("");
  }
  function afficher() {
    var p = S.liste[S.i], q = p.src, n = S.liste.length, exam = S.mode === "exam";
    var repondu = S.rep.filter(function (x) { return x >= 0; }).length;
    app.innerHTML =
      (exam ? '<div class="fin-bar"><span class="fin-titre">' + esc(S.titre) + '</span><span id="finChrono"></span><span>' + repondu + " / " + n + ' répondues</span></div>' +
        '<div class="fin-grille" id="finGrille">' + grille() + "</div>" :
        '<div class="qcm-progress"><div class="meta"><span>Question ' + (S.i + 1) + " / " + n + "</span><span>Score " + S.score + "</span></div>" +
        '<div class="bar"><div class="fill" style="width:' + (S.i / n * 100) + '%"></div></div></div>') +
      '<div class="qcm-card"><div class="qcm-topic">Q' + (S.i + 1) + " · " + CH[q.ch] + " · " + esc(q.sujet) + "</div>" +
      '<div class="qcm-q t5-q">' + q.q + "</div>" +
      '<div class="qcm-answers">' + p.choix.map(function (c, k) {
        return '<button class="qcm-ans' + (exam && S.rep[S.i] === k ? " picked" : "") + '" data-i="' + k + '"><span class="letter">' + L[k] + "</span><span>" + c + "</span></button>";
      }).join("") + "</div>" +
      '<div id="finFb"></div><div class="qcm-actions" id="finAct">' +
      (exam ? '<span class="fin-nav"><button class="btn btn-ghost" id="finPrev"' + (S.i === 0 ? " disabled" : "") + '>← Précédente</button>' +
        '<button class="btn btn-ghost" id="finFlag">' + (S.marq[S.i] ? "⚑ Retirer le repère" : "⚐ Marquer") + '</button>' +
        '<button class="btn btn-ghost" id="finNext"' + (S.i === n - 1 ? " disabled" : "") + '>Suivante →</button></span>' +
        '<button class="btn btn-primary" id="finEnd">Terminer et corriger</button>' :
        '<button class="btn btn-ghost" id="finStop">Abandonner</button>') + "</div></div>" +
      (exam ? '<p class="ev-small fin-keys">Raccourcis : touches A à D pour répondre, ← → pour naviguer.</p>' : "");
    if (exam) tic();
    app.querySelectorAll(".qcm-ans").forEach(function (b) {
      b.addEventListener("click", function () { var k = parseInt(b.getAttribute("data-i"), 10); if (exam) choisirExam(k); else choisirTrain(k); });
    });
    if (exam) {
      app.querySelectorAll(".fin-n").forEach(function (b) { b.addEventListener("click", function () { aller(parseInt(b.getAttribute("data-k"), 10)); }); });
      document.getElementById("finPrev").addEventListener("click", function () { aller(S.i - 1); });
      document.getElementById("finNext").addEventListener("click", function () { aller(S.i + 1); });
      document.getElementById("finFlag").addEventListener("click", function () { S.marq[S.i] = !S.marq[S.i]; afficher(); });
      document.getElementById("finEnd").addEventListener("click", terminer);
    } else {
      document.getElementById("finStop").addEventListener("click", function () { if (S.hist.length) resultats(false, true); else accueil(); });
    }
  }
  function aller(k) { if (k >= 0 && k < S.liste.length) { S.i = k; afficher(); } }

  function choisirExam(k) {
    S.rep[S.i] = S.rep[S.i] === k ? -1 : k;     /* un second clic décoche */
    afficher();
  }
  function terminer() {
    var vides = S.rep.filter(function (x) { return x < 0; }).length;
    var msg = vides ? vides + " question(s) sans réponse" + (S.blancPen ? " (chacune compte comme une erreur : réponds au hasard plutôt que de laisser vide).\n" : ".\n") : "";
    if (!confirm(msg + "Terminer et voir la correction ?")) return;
    arreter(); resultats(false);
  }

  function choisirTrain(k) {
    var p = S.liste[S.i], q = p.src, ok = k === p.c;
    if (ok) S.score++;
    majErreurs(q, ok);
    S.hist.push({ ok: ok, p: p, pick: k });
    app.querySelectorAll(".qcm-ans").forEach(function (b, j) {
      b.disabled = true;
      if (j === p.c) b.classList.add("correct"); else if (j === k) b.classList.add("wrong"); else b.classList.add("dim");
    });
    document.getElementById("finFb").innerHTML = '<div class="qcm-fb ' + (ok ? "good" : "bad") + '"><span class="lbl">' +
      (ok ? "✓ Bonne réponse" : "✗ Bonne réponse : " + L[p.c]) + "</span>" + q.exp + "</div>";
    var last = S.i === S.liste.length - 1;
    document.getElementById("finAct").insertAdjacentHTML("afterbegin", '<button class="btn btn-primary" id="finSuiv">' + (last ? "Voir les résultats" : "Question suivante →") + "</button>");
    var sv = document.getElementById("finSuiv");
    sv.addEventListener("click", function () { S.i++; if (S.i >= S.liste.length) resultats(false); else afficher(); });
    sv.focus();
  }

  /* ---------- résultats ---------- */
  function resultats(tempsEcoule, abandon) {
    arreter();
    var exam = S.mode === "exam";
    if (exam) {
      S.hist = S.liste.map(function (p, k) { return { ok: S.rep[k] === p.c, p: p, pick: S.rep[k] }; });
      S.score = S.hist.filter(function (h) { return h.ok; }).length;
    }
    var total = exam ? S.liste.length : (abandon ? S.hist.length || 1 : S.liste.length);
    var justes = S.score, vides = exam ? S.rep.filter(function (x) { return x < 0; }).length : 0;
    var fausses = (exam ? S.liste.length : total) - justes - vides;
    var pct = Math.round(justes / total * 100);
    var bloc = "";
    if (exam) {
      var pts = justes * S.pr - (fausses + (S.blancPen ? vides : 0)) * S.pw;
      var max = S.liste.length * S.pr;
      var note = pts / max * 20;
      bloc = '<div class="score">' + nombre(pts) + '<span class="tot"> / ' + nombre(max) + "</span></div>" +
        '<div class="verdict">' + justes + " justes · " + fausses + " fausses · " + vides + " vides · soit " + nombre(note) + " / 20 (barème : +" + nombre(S.pr) + " juste, −" + nombre(S.pw) + " faux" + (S.blancPen ? " ou vide" : "") + ")</div>";
      var h = lire("fin_hist", []);
      var dt = new Date();
      h.push({ d: dt.toLocaleDateString("fr-FR") + " " + ("0" + dt.getHours()).slice(-2) + "h" + ("0" + dt.getMinutes()).slice(-2), m: S.titre, note: Math.round(note * 100) / 100 });
      ecrire("fin_hist", h.slice(-20));
    } else {
      bloc = '<div class="score">' + justes + '<span class="tot"> / ' + total + "</span></div>" +
        '<div class="verdict">' + pct + " %</div>";
    }
    var parCh = {};
    S.hist.forEach(function (h) {
      var c = h.p.src.ch; parCh[c] = parCh[c] || { ok: 0, n: 0 };
      parCh[c].n++; if (h.ok) parCh[c].ok++;
    });
    if (exam) S.hist.forEach(function (h) { majErreurs(h.p.src, h.ok); });
    var ratees = S.hist.filter(function (h) { return !h.ok; });
    app.innerHTML =
      '<div class="qcm-card qcm-results"><div class="qcm-topic">Résultat · ' + esc(S.titre) + (tempsEcoule ? " · temps écoulé" : "") + "</div>" + bloc +
      '<div class="t5-themes">' + Object.keys(parCh).sort().map(function (c) {
        var d = parCh[c], r = Math.round(d.ok / d.n * 100);
        return '<div class="t5-th"><span>' + CH[c] + '</span><span class="t5-bar"><i style="width:' + r + '%"></i></span><span>' + d.ok + "/" + d.n + "</span></div>";
      }).join("") + "</div>" +
      (ratees.length ? '<h4 class="t5-h">À revoir (' + ratees.length + ")</h4><div class=\"t5-rev\">" + ratees.map(function (h) {
        var q = h.p.src;
        return '<details class="t5-d"><summary><span class="t5-t">' + CH[q.ch] + "</span> " + esc(q.sujet) + "</summary>" +
          '<div class="t5-dq">' + q.q + "</div>" +
          '<ul class="t5-opt">' + h.p.choix.map(function (c, j) {
            var cl = j === h.p.c ? "ok" : j === h.pick ? "ko" : "";
            return '<li class="' + cl + '"><b>' + L[j] + ".</b> " + c + (j === h.p.c ? " ✓" : j === h.pick ? " (ta réponse)" : "") + "</li>";
          }).join("") + (h.pick < 0 ? '<li class="ko">Pas de réponse</li>' : "") + "</ul>" +
          '<div class="qcm-fb good"><span class="lbl">Explication</span>' + q.exp + "</div></details>";
      }).join("") + "</div>" : '<p class="t5-h">Aucune erreur, sans-faute 🎉</p>') +
      '<div class="qcm-actions" style="justify-content:center;margin-top:24px"><button class="btn btn-ghost" id="finHome">Retour</button>' +
      (ratees.length ? '<button class="btn btn-primary" id="finRetry">Rejouer mes erreurs</button>' : "") + "</div></div>";
    document.getElementById("finHome").addEventListener("click", accueil);
    var rt = document.getElementById("finRetry");
    if (rt) rt.addEventListener("click", function () { demarrer("train", melange(ratees.map(function (h) { return h.p.src; })), { titre: "Mes erreurs" }); });
    app.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".fin-count").forEach(function (el) { el.textContent = pool("all").length; });
  accueil();
})();
