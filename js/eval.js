/* Page Éval écrite S40 : section courante surlignée dans le sommaire, ouverture d'une question par l'adresse (#q7) */
(function () {
  "use strict";
  var liens = Array.prototype.slice.call(document.querySelectorAll(".ev-toc a"));
  var secs = liens.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function suivre() {
    var y = window.scrollY + 150, k = 0;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) k = i; });
    liens.forEach(function (a, i) {
      var on = i === k;
      a.classList.toggle("on", on);
      var p = a.parentNode;
      if (on && p.scrollWidth > p.clientWidth &&
          (a.offsetLeft < p.scrollLeft || a.offsetLeft + a.offsetWidth > p.scrollLeft + p.clientWidth)) {
        p.scrollLeft = a.offsetLeft - 16;
      }
    });
  }
  var t = null;
  window.addEventListener("scroll", function () { if (!t) t = setTimeout(function () { t = null; suivre(); }, 120); }, { passive: true });
  suivre();

  function ouvrirDepuisAdresse() {
    var el = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (el && el.classList.contains("qa-item") && !el.classList.contains("open")) {
      var b = el.querySelector(".qa-q");
      if (b) window.toggleQA(b);
    }
  }
  window.addEventListener("hashchange", ouvrirDepuisAdresse);
  ouvrirDepuisAdresse();
})();
