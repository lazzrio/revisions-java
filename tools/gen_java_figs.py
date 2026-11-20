#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Générateur idempotent des schémas SVG et des compléments du site « POO Java ».

Usage :  python tools/gen_java_figs.py            (écrit index.html et css/style.css)
         python tools/gen_java_figs.py --dry      (n'écrit rien, affiche seulement les avertissements)
         python tools/gen_java_figs.py --test OUT (écrit OUT/jfig-test.html : toutes les figures seules, pour contrôle visuel)

Principe
  * chaque figure est un bloc  <!-- jfig:nom --> ... <!-- /jfig:nom -->  inséré à une ancre précise de index.html ;
  * chaque complément de cours est un bloc  <!-- jadd:nom --> ... <!-- /jadd:nom --> ;
  * à chaque exécution, tous les blocs jfig/jadd sont d'abord retirés, puis réinsérés : on peut relancer sans doublon ;
  * le CSS est écrit entre  /* jfig:debut */  et  /* jfig:fin */  dans css/style.css (le bloc /* tfig:... */ d'un autre
    outil n'est jamais touché) ;
  * les couleurs viennent uniquement des variables CSS de style.css (thèmes clair et sombre).
"""
import html as _html
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
CSS = os.path.join(ROOT, "css", "style.css")
CODE = os.path.join(ROOT, "code")
W = 360  # largeur de toutes les figures (lisible à 360 px)


# ----------------------------------------------------------------------------------------------
#  Outils texte
# ----------------------------------------------------------------------------------------------
def esc(s):
    return _html.escape(s, quote=False)


def rich(s):
    """Texte SVG : _{indice}, ^{exposant}, `code` (police mono)."""
    out = []
    shift = 0
    for tk in re.split(r"(_\{[^}]*\}|\^\{[^}]*\}|`[^`]*`)", s):
        if not tk:
            continue
        if tk.startswith("_{"):
            out.append('<tspan class="jf-sub" dy="3">%s</tspan>' % esc(tk[2:-1]))
            shift = -3
        elif tk.startswith("^{"):
            out.append('<tspan class="jf-sub" dy="-4">%s</tspan>' % esc(tk[2:-1]))
            shift = 4
        else:
            body = ('<tspan class="jf-m">%s</tspan>' % esc(tk[1:-1])) if tk.startswith("`") else esc(tk)
            if shift:
                body = '<tspan dy="%d">%s</tspan>' % (shift, body)
                shift = 0
            out.append(body)
    return "".join(out)


def plain(s):
    return re.sub(r"_\{([^}]*)\}|\^\{([^}]*)\}|`([^`]*)`", lambda m: m.group(1) or m.group(2) or m.group(3), s)


def font_size(cls):
    if "jf-m" in cls.split() or "jf-ms" in cls.split():
        return 11.0 if "jf-ms" in cls.split() else 11.5
    if "jf-s" in cls.split():
        return 11.5
    return 12.5


def est_width(s, cls):
    size = font_size(cls)
    mono = "jf-m" in cls.split() or "jf-ms" in cls.split()
    k = 0.60 if mono else (0.55 if "jf-b" in cls.split() else 0.52)
    total = 0.0
    for part in re.split(r"(`[^`]*`)", s):
        if part.startswith("`"):
            total += len(plain(part)) * size * 0.60
        else:
            total += len(plain(part)) * size * k
    return total


# ----------------------------------------------------------------------------------------------
#  Classe de dessin
# ----------------------------------------------------------------------------------------------
class Fig:
    def __init__(self, name, title, desc, caption):
        self.name, self.title, self.desc, self.caption = name, title, desc, caption
        self.el = []
        self.maxy = 0.0
        self.warns = []

    # -- utilitaires
    def _y(self, y):
        self.maxy = max(self.maxy, y)

    def raw(self, s):
        self.el.append(s)

    def rect(self, x, y, w, h, cls="f-sf", rx=4, dash=False, color=""):
        c = "jf-box %s %s%s" % (cls, color, " jf-d" if dash else "")
        self.el.append('<rect class="%s" x="%g" y="%g" width="%g" height="%g" rx="%g"/>' % (c.strip(), x, y, w, h, rx))
        self._y(y + h)

    def text(self, x, y, s, cls="jf-t", anchor="start", maxw=None, color=""):
        c = ("%s %s" % (cls, color)).strip()
        w = est_width(s, cls)
        x0 = x if anchor == "start" else (x - w / 2 if anchor == "middle" else x - w)
        if x0 < 1 or x0 + w > W - 1:
            self.warns.append("texte hors cadre (%s) : %r x0=%.0f x1=%.0f" % (self.name, plain(s), x0, x0 + w))
        if maxw is not None and w > maxw:
            self.warns.append("texte trop large (%s) : %r %.0f > %.0f" % (self.name, plain(s), w, maxw))
        a = "" if anchor == "start" else ' text-anchor="%s"' % anchor
        self.el.append('<text class="%s" x="%g" y="%g"%s>%s</text>' % (c, x, y, a, rich(s)))
        self._y(y + 5)

    def lines(self, x, y, items, lh=16, cls="jf-t", anchor="start", color="", maxw=None):
        for i, s in enumerate(items):
            self.text(x, y + i * lh, s, cls, anchor, maxw=maxw, color=color)

    def line(self, pts, cls="", dash=False, color=""):
        d = "M" + " L".join("%g %g" % p for p in pts)
        c = ("jf-ln %s %s%s" % (cls, color, " jf-d" if dash else "")).strip()
        self.el.append('<path class="%s" d="%s"/>' % (c, d))
        for p in pts:
            self._y(p[1])

    def circle(self, x, y, r, cls="f-sf", color=""):
        self.el.append('<circle class="jf-box %s %s" cx="%g" cy="%g" r="%g"/>' % (cls, color, x, y, r))
        self._y(y + r)

    def dot(self, x, y, color="c-a"):
        self.el.append('<circle class="jf-dot %s" cx="%g" cy="%g" r="3.4"/>' % (color, x, y))

    def badge(self, x, y, n):
        self.el.append('<circle class="jf-badge" cx="%g" cy="%g" r="8.5"/>' % (x, y))
        self.el.append('<text class="jf-bn" x="%g" y="%g" text-anchor="middle">%s</text>' % (x, y + 4, n))
        self._y(y + 9)

    # -- flèches
    def arrow(self, pts, end=None, start=None, dash=False, color="", label=None):
        """end : open | tri | filled ; start : diamond | diamondf."""
        pts = [tuple(map(float, p)) for p in pts]

        def move(a, b, d):
            L = math.hypot(b[0] - a[0], b[1] - a[1]) or 1.0
            return (a[0] + (b[0] - a[0]) * d / L, a[1] + (b[1] - a[1]) * d / L)

        tip_end, tip_start = pts[-1], pts[0]
        body = list(pts)
        if end == "tri":
            body[-1] = move(pts[-1], pts[-2], 11)
        elif end == "filled":
            body[-1] = move(pts[-1], pts[-2], 8)
        if start in ("diamond", "diamondf"):
            body[0] = move(pts[0], pts[1], 14)
        self.line(body, dash=dash, color=color)
        col = color

        def head(tip, frm, kind):
            dx, dy = tip[0] - frm[0], tip[1] - frm[1]
            L = math.hypot(dx, dy) or 1.0
            ux, uy = dx / L, dy / L
            nx, ny = -uy, ux
            if kind == "open":
                a = (tip[0] - ux * 9 + nx * 5, tip[1] - uy * 9 + ny * 5)
                b = (tip[0] - ux * 9 - nx * 5, tip[1] - uy * 9 - ny * 5)
                self.el.append('<path class="jf-ln %s" d="M%.1f %.1f L%.1f %.1f L%.1f %.1f"/>' % (col, a[0], a[1], tip[0], tip[1], b[0], b[1]))
            elif kind in ("tri", "filled"):
                ln = 11 if kind == "tri" else 8
                wd = 6.5 if kind == "tri" else 4.5
                a = (tip[0] - ux * ln + nx * wd, tip[1] - uy * ln + ny * wd)
                b = (tip[0] - ux * ln - nx * wd, tip[1] - uy * ln - ny * wd)
                cl = "jf-ho" if kind == "tri" else "jf-hf"
                self.el.append('<path class="%s %s" d="M%.1f %.1f L%.1f %.1f L%.1f %.1f Z"/>' % (cl, col, tip[0], tip[1], a[0], a[1], b[0], b[1]))
            elif kind in ("diamond", "diamondf"):
                mid = (tip[0] - ux * 7, tip[1] - uy * 7)
                far = (tip[0] - ux * 14, tip[1] - uy * 14)
                a = (mid[0] + nx * 5, mid[1] + ny * 5)
                b = (mid[0] - nx * 5, mid[1] - ny * 5)
                cl = "jf-ho" if kind == "diamond" else "jf-hf"
                self.el.append('<path class="%s %s" d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z"/>' % (cl, col, tip[0], tip[1], a[0], a[1], far[0], far[1], b[0], b[1]))

        if end:
            head(tip_end, pts[-2], end)
        if start:
            head(tip_start, pts[1], start)

    # -- gabarits UML
    def classbox(self, x, y, w, name, attrs=(), meths=(), kind="class", fill="f-sf", color="", rowh=15, abstract=False):
        stereo = kind == "interface"
        top = 36 if stereo else 24
        ah = 0 if stereo else (len(attrs) * rowh + 8 if attrs else 8)
        mh = len(meths) * rowh + 8 if meths else 8
        h = top + ah + mh
        self.rect(x, y, w, h, fill, rx=3, color=color)
        self.el.append('<path class="jf-ln %s" d="M%g %g H%g"/>' % (color, x, y + top, x + w))
        if ah or not stereo:
            self.el.append('<path class="jf-ln %s" d="M%g %g H%g"/>' % (color, x, y + top + ah, x + w))
        if stereo:
            self.text(x + w / 2, y + 13, "«interface»", "jf-s", "middle")
        ncls = "jf-t jf-b" + (" jf-i" if abstract else "")
        self.text(x + w / 2, y + top - 8, name, ncls, "middle", maxw=w - 8)
        rows = {}
        for i, a in enumerate(attrs):
            self.text(x + 7, y + top + 13 + i * rowh, a, "jf-m", maxw=w - 10)
            rows[("a", i)] = y + top + 9 + i * rowh
        for i, m in enumerate(meths):
            self.text(x + 7, y + top + ah + 13 + i * rowh, m, "jf-m", maxw=w - 10)
            rows[("m", i)] = y + top + ah + 9 + i * rowh
        return dict(x=x, y=y, w=w, h=h, cx=x + w / 2, bottom=y + h, right=x + w, rows=rows)

    def objbox(self, x, y, w, title, fields=(), fill="f-2", color="c-2", rowh=15):
        h = 22 + len(fields) * rowh + (6 if fields else 0)
        self.rect(x, y, w, h, fill, rx=3, color=color)
        self.text(x + w / 2, y + 15, title, "jf-t jf-u", "middle", maxw=w - 6)
        for i, fl in enumerate(fields):
            self.text(x + 8, y + 22 + 11 + i * rowh, fl, "jf-m", maxw=w - 10)
        return dict(x=x, y=y, w=w, h=h, cx=x + w / 2, cy=y + h / 2, bottom=y + h, right=x + w)

    def simple(self, x, y, w, h, label, fill="f-sf", color="", cls="jf-t", dash=False):
        self.rect(x, y, w, h, fill, rx=4, dash=dash, color=color)
        self.text(x + w / 2, y + h / 2 + 4.3, label, cls, "middle", maxw=w - 4)
        return dict(x=x, y=y, w=w, h=h, cx=x + w / 2, cy=y + h / 2, bottom=y + h, right=x + w)

    # -- sortie
    def svg(self):
        h = int(math.ceil(self.maxy + 8))
        head = ('<svg viewBox="0 0 %d %d" role="img" aria-labelledby="jfig-%s-t jfig-%s-d" focusable="false">'
                '<title id="jfig-%s-t">%s</title><desc id="jfig-%s-d">%s</desc>') % (
            W, h, self.name, self.name, self.name, esc(self.title), self.name, esc(self.desc))
        return head + "\n" + "\n".join(self.el) + "\n</svg>"

    def block(self):
        n = self.name
        return ("      <!-- jfig:%s -->\n      <figure class=\"jfig\" id=\"jfig-%s\">\n%s\n"
                "      <figcaption>%s</figcaption>\n      </figure>\n      <!-- /jfig:%s -->") % (n, n, self.svg(), self.caption, n)


# ----------------------------------------------------------------------------------------------
#  Registre des figures
# ----------------------------------------------------------------------------------------------
FIGS = []  # (name, func, title, desc, caption, anchor, at)


def fig(name, title, desc, caption, anchor=None, at="before"):
    def deco(fn):
        FIGS.append(dict(name=name, fn=fn, title=title, desc=desc, caption=caption, anchor=anchor, at=at))
        return fn
    return deco


def build(spec):
    f = Fig(spec["name"], spec["title"], spec["desc"], spec["caption"])
    spec["fn"](f)
    return f


# ======================================================================================  SEMAINE 1
@fig("s1-classe-objet", "Classe et objets",
     "Une classe Etudiant sert de plan ; deux objets e1 et e2 créés avec new ont chacun leurs valeurs.",
     "<b>Classe = plan, objet = réalisation.</b> La classe décrit une seule fois les attributs et les méthodes ; chaque "
     "<code>new</code> fabrique un objet distinct, avec ses propres valeurs.",
     anchor='<h3 style="font-size:17px;margin-bottom:8px">Une classe minimale complète</h3>')
def _(f):
    f.text(10, 16, "La classe (le plan)", "jf-s", color="c-m")
    f.text(204, 16, "Les objets (en mémoire)", "jf-s", color="c-m")
    c = f.classbox(10, 24, 150, "Etudiant", ["- nom : String", "- age : int"], ["+ getAge() : int"], fill="f-a", color="c-a")
    o1 = f.objbox(204, 24, 146, "e1 : Etudiant", ['nom = "Lea"', "age = 19"])
    o2 = f.objbox(204, 108, 146, "e2 : Etudiant", ['nom = "Tom"', "age = 21"])
    f.arrow([(c["right"], 52), (204, 52)], end="open", dash=True)
    f.arrow([(c["right"], 90), (204, 132)], end="open", dash=True)
    f.text(182, 44, "new", "jf-m", "middle", color="c-a")
    f.text(188, 108, "new", "jf-m", "middle", color="c-a")
    f.lines(10, 150, ["Un seul plan, écrit une fois :", "attributs + méthodes."], 15, "jf-s")
    f.lines(204, 186, ["Un objet par new,", "valeurs propres à chacun."], 15, "jf-s")


@fig("s1-static-instance", "static contre instance",
     "L'attribut static i existe en un seul exemplaire dans la classe ; chaque objet a sa propre copie de j.",
     "<b>static = une case pour la classe, partagée.</b> <code>s2.i++</code> change la case commune (11 pour tous) ; "
     "<code>s1.j++</code> ne change que la copie de <code>s1</code>.",
     anchor='<h3 style="font-size:17px;margin:24px 0 8px">static — l\'exemple à comprendre</h3>')
def _(f):
    f.rect(30, 10, 300, 62, "f-a", rx=5, color="c-a")
    f.text(180, 28, "classe StaticTest", "jf-t jf-b", "middle")
    f.rect(66, 38, 228, 26, "f-sf", rx=4, color="c-a")
    f.text(180, 55, "static int i = 11", "jf-m", "middle")
    s1 = f.objbox(14, 122, 150, "s1 : StaticTest", ["j = 21"])
    s2 = f.objbox(196, 122, 150, "s2 : StaticTest", ["j = 20"])
    f.arrow([(110, 122), (120, 66)], end="filled", dash=True, color="c-a")
    f.arrow([(250, 122), (240, 66)], end="filled", dash=True, color="c-a")
    f.text(98, 98, "s1.i", "jf-m jf-halo", "middle", color="c-a")
    f.text(262, 98, "s2.i", "jf-m jf-halo", "middle", color="c-a")
    f.lines(14, 196, ["`s2.i++;`  la case commune passe à 11 pour tous", "`s1.j++;`  seul `s1` change (20 devient 21)"], 17, "jf-s")


# ======================================================================================  SEMAINE 2
@fig("s2-relations-code", "Des relations UML au code Java",
     "Six relations UML avec leur flèche et la ligne Java correspondante : héritage, implémentation, association, "
     "agrégation, composition, dépendance.",
     "<b>Chaque flèche UML a sa ligne Java.</b> Hériter ou implémenter se lit dans l'en-tête de la classe ; "
     "association, agrégation et composition sont des <i>attributs</i> ; la dépendance n'est qu'un <i>paramètre</i>.",
     anchor='<div class="eyebrow">Diagrammes UML</div>', at="sec_end_before")
def _(f):
    rows = [
        ("Chien", "Mammifere", dict(end="tri"), "class Chien extends Mammifere", "Héritage : « est un », reçoit tout"),
        ("Chien", "Animal", dict(end="tri", dash=True), "class Chien implements Animal", "Interface : contrat à remplir"),
        ("Client", "Adresse", dict(end="open"), "private Adresse adresse;", "Association : attribut de ce type"),
        ("Commande", "Plat", dict(start="diamond"), "List<Plat> plats;", "Agrégation : Plat existe seul"),
        ("Commande", "Livraison", dict(start="diamondf"), "l = new Livraison();", "Composition : meurt avec la mère"),
        ("Chien", "Os", dict(end="open", dash=True), "void manger(Os o) { }", "Dépendance : paramètre, rien stocké"),
    ]
    y = 6
    for a, b, kw, code, gloss in rows:
        cy = y + 22
        f.simple(2, cy - 13, 68, 26, a, "f-sf", cls="jf-s")
        f.simple(96, cy - 13, 68, 26, b, "f-sf", cls="jf-s")
        f.arrow([(70, cy), (96, cy)], **kw)
        f.text(174, cy - 3, code, "jf-m", maxw=184)
        f.text(174, cy + 13, gloss, "jf-s", color="c-m", maxw=184)
        if y < 6 + 5 * 50:
            f.line([(4, y + 46), (356, y + 46)], color="c-l")
        y += 50


@fig("s2-cycle-vie", "Agrégation ou composition : la question de la suppression",
     "Si on supprime la Commande, le Plat (agrégation) reste alors que la Livraison (composition) disparaît.",
     "<b>La question qui tranche :</b> « si je supprime le contenant, le contenu disparaît-il ? » Non = agrégation "
     "(losange creux). Oui = composition (losange plein).",
     anchor='<div class="tip" style="margin-top:16px"><b>Mnémotechnique</b>')
def _(f):
    for x0, titre, b, kw, reste in ((4, "Agrégation (◇)", "Plat", "diamond", True), (184, "Composition (◆)", "Livraison", "diamondf", False)):
        f.text(x0 + 86, 16, titre, "jf-t jf-b", "middle")
        f.text(x0 + 86, 38, "avant", "jf-s", "middle", color="c-m")
        f.simple(x0 + 6, 46, 66, 26, "Commande", "f-sf", cls="jf-s")
        f.simple(x0 + 104, 46, 66, 26, b, "f-sf", cls="jf-s")
        f.arrow([(x0 + 72, 59), (x0 + 104, 59)], start=kw)
        f.text(x0 + 86, 96, "on supprime la Commande", "jf-s", "middle", color="c-m")
        f.simple(x0 + 6, 106, 66, 26, "Commande", "f-sf", color="c-m", cls="jf-s", dash=True)
        f.line([(x0 + 10, 110), (x0 + 68, 128)], color="c-r")
        f.line([(x0 + 10, 128), (x0 + 68, 110)], color="c-r")
        if reste:
            f.simple(x0 + 104, 106, 66, 26, b, "f-g", color="c-g", cls="jf-s")
            f.text(x0 + 86, 152, "Plat reste (menu)", "jf-s", "middle", color="c-g")
        else:
            f.simple(x0 + 104, 106, 66, 26, b, "f-sf", color="c-m", cls="jf-s", dash=True)
            f.line([(x0 + 108, 110), (x0 + 166, 128)], color="c-r")
            f.line([(x0 + 108, 128), (x0 + 166, 110)], color="c-r")
            f.text(x0 + 86, 152, "disparaît aussi", "jf-s", "middle", color="c-r")
    f.line([(180, 8), (180, 160)], color="c-l")


@fig("s2-heritage-5", "Les 5 mécanismes de l'héritage",
     "Vertebres et Mammifere en UML avec les cinq mécanismes numérotés : extends, super(30), super.afficher(), protected, @Override.",
     "<b>À associer à chaque ligne de code :</b> ① <code>extends</code> crée la relation, ② <code>super(...)</code> "
     "appelle le constructeur du parent, ③ <code>super.m()</code> réutilise une méthode du parent, ④ <code>protected</code> "
     "ouvre aux filles, ⑤ <code>@Override</code> fait vérifier la signature.",
     anchor='ce que chacun <b>fait vraiment</b> quand le programme s\'exécute.</p>\n      </div>\n', at="after")
def _(f):
    v = f.classbox(70, 10, 220, "Vertebres", ["# i : int"], ["+ Vertebres(nb : int)", "+ afficher()"], fill="f-a", color="c-a")
    m = f.classbox(70, 150, 220, "Mammifere", [], ["+ Mammifere()", "+ afficher()"], fill="f-2", color="c-2")
    f.arrow([(180, 150), (180, v["bottom"])], end="tri")
    f.badge(198, 126, "1")
    f.text(212, 130, "extends", "jf-m")
    # ② super(30)
    f.arrow([(70, m["rows"][("m", 0)]), (44, m["rows"][("m", 0)]), (44, v["rows"][("m", 0)]), (70, v["rows"][("m", 0)])], end="open", color="c-a")
    f.badge(44, 118, "2")
    # ③ super.afficher()
    f.arrow([(290, m["rows"][("m", 1)]), (324, m["rows"][("m", 1)]), (324, v["rows"][("m", 1)]), (290, v["rows"][("m", 1)])], end="open", color="c-a")
    f.badge(324, 118, "3")
    f.badge(276, v["rows"][("a", 0)], "4")
    f.badge(276, m["rows"][("m", 1)], "5")
    items = ["`extends` : la fille reçoit i et afficher()", "`super(30);` : 1re ligne du constructeur fille",
             "`super.afficher();` : réutilise le code du parent", "`protected` (# en UML) : visible dans les filles",
             "`@Override` : le compilateur vérifie la signature"]
    for i, s in enumerate(items):
        y = 246 + i * 19
        f.badge(16, y - 4, str(i + 1))
        f.text(32, y, s, "jf-s", maxw=322)


@fig("s2-ordre-construction", "Ordre de construction d'un objet d'une classe fille",
     "new Mammifere() : les appels super() montent jusqu'à Object, puis les corps des constructeurs s'exécutent en redescendant.",
     "<b>On monte pour appeler, on descend pour exécuter.</b> <code>new Mammifere()</code> appelle d'abord le constructeur "
     "de <code>Vertebres</code>, qui appelle celui d'<code>Object</code> ; ce sont les corps qui s'exécutent dans l'ordre racine → fille.",
     anchor='Les 5 mécanismes ensemble — code + sortie + trace</h3>')
def _(f):
    ys = (14, 78, 142)
    names = ("Object", "Vertebres", "Mammifere")
    fills = ("f-s2", "f-a", "f-2")
    cols = ("c-m", "c-a", "c-2")
    boxes = []
    for y, n, fl, c in zip(ys, names, fills, cols):
        boxes.append(f.simple(40, y, 100, 32, n, fl, c, "jf-t jf-b"))
    f.arrow([(90, ys[2]), (90, ys[1] + 32)], end="tri")
    f.arrow([(90, ys[1]), (90, ys[0] + 32)], end="tri")
    # montée des appels
    f.arrow([(24, 196), (24, 30)], end="filled", dash=True, color="c-a")
    f.text(24, 214, "appels", "jf-s", "middle", color="c-a")
    f.text(24, 228, "super()", "jf-m", "middle", color="c-a")
    f.arrow([(90, 196), (90, 174)], end="open")
    f.text(104, 203, "new Mammifere()", "jf-m")
    steps = [("1", "corps de `Object()`", "la racine d'abord"),
             ("2", "attributs, puis corps", "affiche « nombre=30 »"),
             ("3", "attributs, puis corps", "la fille en dernier")]
    for y, (n, a, b) in zip(ys, steps):
        f.badge(166, y + 16, n)
        f.text(182, y + 13, a, "jf-s", maxw=170)
        f.text(182, y + 28, b, "jf-s", color="c-m", maxw=170)


@fig("s2-cast", "Upcasting et downcasting",
     "La variable p de type Personne désigne un objet Homme. Le cast vers Homme réussit ; vers un vrai Personne il plante ; "
     "sans cast il ne compile pas.",
     "<b>Deux types :</b> celui de la <i>variable</i> (ce que le compilateur autorise) et celui de l'<i>objet</i> "
     "(ce qu'il est vraiment). Vers le haut, c'est automatique ; vers le bas, il faut un cast, vérifié à l'exécution.",
     anchor='<h3 style="font-size:17px;margin:24px 0 8px">Transtypage (upcasting / downcasting)</h3>')
def _(f):
    f.text(10, 14, "variable (type statique)", "jf-s", color="c-m")
    f.text(188, 14, "objet (type réel)", "jf-s", color="c-m")
    f.simple(10, 24, 104, 30, "p : Personne", "f-a", "c-a", "jf-m")
    o = f.objbox(188, 22, 168, ": Homme", ["attributs de Personne", "+ ceux de Homme"])
    f.arrow([(114, 39), (188, 39)], end="filled", color="c-a")
    f.text(10, 100, "p ne « voit » que ce que Personne déclare.", "jf-s", color="c-m")
    rows = [
        ("`Homme h = (Homme) p;`", "OK", "f-g", "c-g", "l'objet est bien un Homme"),
        ("`Homme h2 = (Homme) p2;`", "plante à l'exécution", "f-r", "c-r", "p2 désigne un vrai Personne : ClassCastException"),
        ("`Homme h3 = p;`", "ne compile pas", "f-r", "c-r", "descendre exige un cast explicite"),
    ]
    y = 130
    for code, tag, fl, c, gl in rows:
        f.text(10, y, code, "jf-m")
        f.rect(228, y - 14, 122, 22, fl, rx=11, color=c)
        f.text(289, y + 1, tag, "jf-s", "middle", color=c, maxw=118)
        f.text(10, y + 20, gl, "jf-s", color="c-m", maxw=340)
        y += 46


# ======================================================================================  SEMAINE 3
@fig("s3-pile-tas", "Pile et tas",
     "La pile contient les valeurs des types primitifs et les références ; le tas contient les objets et tableaux. "
     "Une référence null ne désigne rien.",
     "<b>Primitif : la valeur est dans la variable. Objet : la variable ne contient qu'une flèche</b> (référence) vers le tas. "
     "<code>null</code> = flèche vers rien : y accéder lève <code>NullPointerException</code>.",
     anchor="@@s3mem@@")
def _(f):
    f.rect(6, 8, 156, 196, "f-s2", rx=6, dash=True, color="c-m")
    f.rect(196, 8, 158, 196, "f-s2", rx=6, dash=True, color="c-m")
    f.text(84, 25, "PILE : variables", "jf-s jf-b", "middle", color="c-m")
    f.text(275, 25, "TAS : objets, tableaux", "jf-s jf-b", "middle", color="c-m")
    ys = (56, 96, 136, 176)
    labels = ("n", "a", "t", "c")
    types = ("int", "Point", "int[]", "Point")
    for y, l, t in zip(ys, labels, types):
        f.text(14, y + 4, "%s" % l, "jf-m jf-b")
        f.text(30, y + 4, t, "jf-ms", color="c-m")
        f.rect(86, y - 13, 66, 26, "f-sf", rx=3)
    f.text(119, 61, "5", "jf-m jf-b", "middle")
    f.dot(119, 96)
    f.dot(119, 136)
    f.text(119, 181, "null", "jf-m", "middle", color="c-r")
    o1 = f.objbox(212, 52, 128, ": Point", ["x = 1", "y = 2"])
    f.rect(212, 124, 128, 44, "f-2", rx=3, color="c-2")
    f.text(276, 139, ": int[]", "jf-t jf-u", "middle")
    for i in range(3):
        f.rect(222 + i * 36, 146, 32, 16, "f-sf", rx=2)
        f.text(238 + i * 36, 158, "0", "jf-m", "middle")
    f.arrow([(119, 96), (212, 96)], end="filled", color="c-a")
    f.arrow([(119, 136), (212, 136)], end="filled", color="c-a")
    f.text(14, 224, "`c.x` ou `c.y = 3` : NullPointerException", "jf-s", color="c-r")
    f.text(14, 241, "`new String[3]` : 3 références null, aucun String créé", "jf-s", color="c-m")


@fig("s3-affectation", "Affectation et égalité d'objets",
     "Après a = b, les deux variables désignent le même objet et l'ancien objet de a n'est plus référencé. "
     "== compare les références, equals compare le contenu.",
     "<b>a = b ne copie pas l'objet, seulement la flèche.</b> <code>==</code> demande « même objet ? », "
     "<code>equals()</code> demande « même contenu ? » (à condition de la redéfinir, sinon elle se comporte comme <code>==</code>).",
     anchor="@@s3mem@@")
def _(f):
    f.text(8, 14, "① `a = b;` copie la référence, pas l'objet", "jf-t jf-b")
    for x0, apres in ((4, False), (188, True)):
        f.text(x0 + 82, 36, "après" if apres else "avant", "jf-s", "middle", color="c-m")
        f.simple(x0, 44, 34, 24, "a", "f-sf", cls="jf-m")
        f.simple(x0, 92, 34, 24, "b", "f-sf", cls="jf-m")
        if apres:
            f.simple(x0 + 102, 40, 64, 34, "x=1 y=2", "f-sf", "c-m", "jf-ms", dash=True)
            f.simple(x0 + 102, 88, 64, 34, "x=3 y=4", "f-2", "c-2", "jf-ms")
            f.arrow([(x0 + 34, 56), (x0 + 102, 100)], end="filled", color="c-a")
            f.arrow([(x0 + 34, 104), (x0 + 102, 106)], end="filled", color="c-a")
            f.lines(x0, 142, ["l'objet (1,2) n'a plus de", "référence : ramasse-miettes"], 14, "jf-s", color="c-r")
        else:
            f.simple(x0 + 102, 40, 64, 34, "x=1 y=2", "f-2", "c-2", "jf-ms")
            f.simple(x0 + 102, 88, 64, 34, "x=3 y=4", "f-2", "c-2", "jf-ms")
            f.arrow([(x0 + 34, 56), (x0 + 102, 57)], end="filled", color="c-a")
            f.arrow([(x0 + 34, 104), (x0 + 102, 105)], end="filled", color="c-a")
    f.line([(8, 176), (352, 176)], color="c-l")
    f.text(8, 196, "② `==` compare les références, `equals` le contenu", "jf-t jf-b")
    for y, n in ((212, "a"), (244, "c"), (276, "b")):
        f.simple(8, y, 34, 24, n, "f-sf", cls="jf-m")
    f.simple(102, 214, 64, 34, "x=1 y=2", "f-2", "c-2", "jf-ms")
    f.simple(102, 268, 64, 34, "x=1 y=2", "f-2", "c-2", "jf-ms")
    f.arrow([(42, 224), (102, 228)], end="filled", color="c-a")
    f.arrow([(42, 256), (102, 236)], end="filled", color="c-a")
    f.arrow([(42, 288), (102, 285)], end="filled", color="c-a")
    res = [("`a == c`", "true", "c-g", "même objet"), ("`a == b`", "false", "c-r", "2 objets"),
           ("`a.equals(b)`", "true*", "c-g", "même contenu")]
    for i, (e, r, c, g) in enumerate(res):
        y = 224 + i * 30
        f.text(176, y, e, "jf-m")
        f.text(270, y, r, "jf-m jf-b", color=c)
        f.text(176, y + 13, g, "jf-s", color="c-m", maxw=170)
    f.text(176, 322, "* si equals() est redéfinie", "jf-s", color="c-m")
    f.text(176, 337, "(sinon : identique à ==)", "jf-s", color="c-m")


@fig("s3-passage", "Passage de paramètres : toujours une copie",
     "Dans la méthode, q est une copie de la référence p : modifier l'objet est visible, réaffecter q ne l'est pas ; "
     "m est une copie de n et sa modification est invisible.",
     "<b>Java passe toujours une copie.</b> Copie de la valeur pour un primitif (l'original ne bouge jamais), copie de la "
     "<i>référence</i> pour un objet ou un tableau : on peut modifier l'objet partagé, pas faire pointer l'appelant ailleurs.",
     anchor="@@s3mem@@")
def _(f):
    f.rect(6, 10, 160, 90, "f-sf", rx=5)
    f.text(86, 27, "main", "jf-t jf-b", "middle")
    f.rect(194, 10, 160, 90, "f-sf", rx=5)
    f.text(274, 27, "modifier(q, m)", "jf-m jf-b", "middle")
    for x0, v1, v2, val in ((6, "p", "n", "5"), (194, "q", "m", "5")):
        f.text(x0 + 12, 52, v2, "jf-m jf-b")
        f.rect(x0 + 40, 39, 50, 24, "f-sf", rx=3)
        f.text(x0 + 65, 56, val, "jf-m jf-b", "middle")
        f.text(x0 + 12, 82, v1, "jf-m jf-b")
        f.rect(x0 + 40, 69, 50, 24, "f-sf", rx=3)
        f.dot(x0 + 65, 81)
    f.objbox(130, 124, 100, ": Point", ["x = 1"])
    f.arrow([(71, 81), (71, 140), (130, 140)], end="filled", color="c-a")
    f.arrow([(259, 81), (259, 140), (230, 140)], end="filled", color="c-a")
    f.text(180, 112, "même objet", "jf-s", "middle", color="c-a")
    rows = [("`q.x = 9;`", "l'objet partagé change : p le voit", "c-g"),
            ("`q = new Point();`", "q pointe ailleurs, p inchangé", "c-r"),
            ("`m = 0;`", "copie locale : n reste à 5", "c-r")]
    y = 194
    for code, eff, c in rows:
        f.text(8, y, code, "jf-m")
        f.text(140, y, eff, "jf-s", color=c, maxw=214)
        y += 22
    f.text(8, y + 8, "Un tableau est un objet : `echanger(t, i, j)` agit sur", "jf-s", color="c-m")
    f.text(8, y + 23, "celui de l'appelant, `echanger(int a, int b)` non.", "jf-s", color="c-m")


@fig("s3-this-chaine", "Constructeurs chaînés avec this(...)",
     "new D(5, 6) appelle D(a,b) qui appelle this(b), D(a) qui appelle this(), D() : les corps s'exécutent du plus simple au plus complet.",
     "<b>this(...) délègue et doit être la 1re ligne.</b> On descend dans la chaîne des appels, puis on remonte en exécutant "
     "ce qui reste dans chaque constructeur : ici <code>x</code> vaut 3, puis 9, puis <b>4</b> (QCM 2025).",
     anchor='<h3 style="font-size:17px;margin-bottom:8px">this — auto-référence et chaînage de constructeurs</h3>')
def _(f):
    f.text(10, 16, "`new D(5, 6)`", "jf-m jf-b")
    bx = [(24, "D(a=5, b=6)", "`this(b);  x = x - a;`"), (104, "D(a=6)", "`this();  x = x + a;`"), (184, "D()", "`x = 3;`")]
    for y, t, c in bx:
        f.rect(14, y, 186, 50, "f-sf", rx=4)
        f.text(24, y + 19, t, "jf-t jf-b")
        f.text(24, y + 38, c, "jf-s")
    f.arrow([(107, 74), (107, 104)], end="filled", dash=True, color="c-a")
    f.arrow([(107, 154), (107, 184)], end="filled", dash=True, color="c-a")
    f.text(117, 93, "appelle", "jf-s", color="c-a")
    f.text(117, 173, "appelle", "jf-s", color="c-a")
    f.badge(222, 209, "1")
    f.text(238, 213, "x = 3", "jf-m", maxw=116)
    f.badge(222, 129, "2")
    f.text(238, 133, "x = 3 + 6 = 9", "jf-m", maxw=116)
    f.badge(222, 49, "3")
    f.text(238, 53, "x = 9 - 5 = 4", "jf-m", maxw=116)
    f.arrow([(214, 200), (214, 142)], end="filled", color="c-g")
    f.arrow([(214, 120), (214, 62)], end="filled", color="c-g")
    f.text(10, 258, "Résultat : `a.x` vaut 4", "jf-t jf-b")


# ======================================================================================  SEMAINE 4
@fig("s4-abstract-interface", "Classe abstraite contre interface",
     "Deux colonnes : la classe abstraite Personnels (extends, une seule mère, attributs et constructeurs) et l'interface Sportif "
     "(implements, plusieurs, signatures seulement).",
     "<b>Classe abstraite = famille « est un »</b> (une seule mère, état et code partagés). <b>Interface = contrat « sait faire »</b> "
     "(plusieurs possibles, aucun état). Ni l'une ni l'autre ne s'instancie avec <code>new</code>.",
     anchor='      <div class="notions" style="margin-top:16px">\n        <div class="notion" style="border-left:3px solid var(--bad)">\n          <h3>Polymorphisme</h3>')
def _(f):
    f.rect(4, 6, 172, 24, "f-a", rx=4, color="c-a")
    f.text(90, 23, "Classe abstraite", "jf-t jf-b", "middle")
    f.rect(184, 6, 172, 24, "f-2", rx=4, color="c-2")
    f.text(270, 23, "Interface", "jf-t jf-b", "middle")
    f.classbox(24, 40, 132, "Personnels", [], ["+ travailler()"], abstract=True, fill="f-a", color="c-a")
    f.rect(24, 114, 132, 24, "f-sf", rx=3)
    f.text(90, 130, "Enseignant", "jf-t", "middle")
    f.arrow([(90, 114), (90, 88)], end="tri")
    f.classbox(204, 40, 132, "Sportif", [], ["+ jouer()"], kind="interface", fill="f-2", color="c-2")
    f.rect(204, 126, 132, 24, "f-sf", rx=3)
    f.text(270, 142, "Personne", "jf-t", "middle")
    f.arrow([(270, 126), (270, 98)], end="tri", dash=True)
    f.text(98, 108, "extends", "jf-m", color="c-m")
    f.text(282, 118, "implements", "jf-m", color="c-m")
    rows = [
        ("Instanciable (new) ?", ["non"], ["non"]),
        ("Mot-clé", ["extends : une seule mère"], ["implements : plusieurs"]),
        ("Attributs", ["oui, de tout type"], ["constantes seulement", "(static final)"]),
        ("Constructeur", ["oui (appelé par super)"], ["non"]),
        ("Méthodes", ["abstraites + concrètes"], ["signatures (public", "abstract implicite)"]),
        ("Sert à", ["factoriser : « est un »"], ["contrat : « sait faire »"]),
    ]
    y = 172
    for lab, a, b in rows:
        f.line([(4, y - 6), (356, y - 6)], color="c-l")
        f.text(180, y + 8, lab, "jf-s jf-b jf-halo", "middle", color="c-m")
        for i, s in enumerate(a):
            f.text(90, y + 25 + i * 14, s, "jf-s", "middle", maxw=168)
        for i, s in enumerate(b):
            f.text(270, y + 25 + i * 14, s, "jf-s", "middle", maxw=168)
        y += 50 if (len(a) > 1 or len(b) > 1) else 42
    f.line([(180, 166), (180, y - 6)], color="c-l")


@fig("s4-polymorphisme", "Type statique et type dynamique",
     "Forme f = new Cercle() : le compilateur vérifie avec le type de la variable (Forme), la JVM choisit la méthode avec le type de l'objet (Cercle).",
     "<b>Le compilateur lit le type de la variable ; la JVM exécute la méthode de l'objet réel.</b> "
     "Une méthode absente de <code>Forme</code> ne compile pas, même si <code>Cercle</code> la possède.",
     anchor='<tr><td><code>abstract class</code></td>', at="sec_end_before")
def _(f):
    f.classbox(112, 6, 136, "Forme", [], ["+ getSurface()"], abstract=True, fill="f-a", color="c-a")
    f.rect(20, 84, 110, 26, "f-sf", rx=3)
    f.text(75, 101, "Cercle", "jf-t", "middle")
    f.rect(230, 84, 110, 26, "f-sf", rx=3)
    f.text(285, 101, "Carre", "jf-t", "middle")
    f.arrow([(75, 84), (150, 60)], end="tri")
    f.arrow([(285, 84), (210, 60)], end="tri")
    f.text(180, 138, "`Forme f = new Cercle();`", "jf-m jf-b", "middle")
    f.simple(14, 152, 112, 34, "f : Forme", "f-a", "c-a", "jf-m")
    f.objbox(214, 150, 132, ": Cercle")
    f.arrow([(126, 169), (214, 169)], end="filled", color="c-a")
    f.text(170, 162, "référence", "jf-s", "middle", color="c-a")
    f.rect(4, 208, 172, 98, "f-a", rx=5, color="c-a")
    f.text(90, 226, "Compilateur", "jf-t jf-b", "middle")
    f.lines(12, 244, ["type statique : Forme", "`getSurface()` est-elle", "déclarée dans Forme ?", "sinon : erreur"], 15, "jf-s")
    f.rect(184, 208, 172, 98, "f-2", rx=5, color="c-2")
    f.text(270, 226, "JVM (exécution)", "jf-t jf-b", "middle")
    f.lines(192, 244, ["type réel : Cercle", "appelle `Cercle.getSurface()`", "(liaison dynamique)", "méthodes d'instance"], 15, "jf-s")


@fig("s4-collections", "Les collections Java",
     "Collection se spécialise en List et Set ; Map est à part. Implémentations : ArrayList, LinkedList, Vector ; HashSet, TreeSet ; HashMap, TreeMap, Hashtable.",
     "<b>List</b> : ordonnée, doublons permis. <b>Set</b> : pas de doublon. <b>Map</b> : clé → valeur, et "
     "<b>n'hérite pas de Collection</b>. On déclare le type d'interface : <code>List&lt;Forme&gt; l = new ArrayList&lt;&gt;();</code>",
     anchor='<div class="tbl-wrap" style="margin-top:18px">\n        <table class="tbl">\n          <thead><tr><th>Besoin</th>')
def _(f):
    col = f.classbox(46, 8, 120, "Collection", kind="interface", meths=[], fill="f-a", color="c-a")
    lst = f.simple(6, 84, 100, 28, "List", "f-a", "c-a", "jf-t jf-b")
    st = f.simple(124, 84, 100, 28, "Set", "f-a", "c-a", "jf-t jf-b")
    mp = f.simple(250, 84, 104, 28, "Map", "f-2", "c-2", "jf-t jf-b")
    f.arrow([(56, 84), (84, col["bottom"])], end="tri")
    f.arrow([(174, 84), (130, col["bottom"])], end="tri")
    f.text(302, 70, "pas une Collection", "jf-s", "middle", color="c-2")
    def impls(x, w, y, items, color):
        for i, (n, t) in enumerate(items):
            yy = y + i * 42
            f.rect(x + 10, yy, w - 10, 34, "f-sf", rx=3)
            f.text(x + 10 + (w - 10) / 2, yy + 15, n, "jf-m jf-b", "middle")
            f.text(x + 10 + (w - 10) / 2, yy + 28, t, "jf-s", "middle", color="c-m")
            f.arrow([(x + 10, yy + 17), (x + 3, yy + 17), (x + 3, y - 14 - 0)] if False else [(x + 10, yy + 17), (x + 3, yy + 17)], dash=True)
        f.line([(x + 3, y - 4 + 0), (x + 3, y + (len(items) - 1) * 42 + 17)], dash=True)
    impls(6, 100, 136, [("ArrayList", "tableau"), ("LinkedList", "chaînée"), ("Vector", "synchronisé")], "")
    impls(124, 100, 136, [("HashSet", "non ordonné"), ("TreeSet", "trié")], "")
    impls(250, 104, 136, [("HashMap", "non ordonnée"), ("TreeMap", "clés triées"), ("Hashtable", "synchronisée")], "")
    for x, w in ((6, 100), (124, 100), (250, 104)):
        f.arrow([(x + 3, 136), (x + 3, 112)], end="tri", dash=True)


@fig("s4-hachage", "Table de hachage d'une HashMap",
     "Trois clés avec leur hashCode d'exemple, le tableau de seaux 0 à 3, et la liste chaînée du seau 2 où pizza et wrap sont en collision.",
     "<b>Une HashMap range par seau.</b> ① <code>hashCode()</code> de la clé, ② seau = valeur mod taille, ③ dans le seau on "
     "compare avec <code>equals()</code>. Deux clés égales doivent avoir le même <code>hashCode()</code>. (Valeurs simplifiées.)",
     anchor="@@s4ens@@")
def _(f):
    f.text(8, 14, "`HashMap<String, Integer>`", "jf-m jf-b")
    f.text(8, 34, "clés", "jf-s", color="c-m")
    f.text(166, 34, "seaux", "jf-s", "middle", color="c-m")
    f.text(260, 34, "chaîne (collision)", "jf-s", "middle", color="c-m")
    cy = (52, 96, 140, 184)
    for i, y in enumerate(cy):
        f.rect(148, y - 15, 36, 30, "f-sf" if i in (1, 2) else "f-s2", rx=3, color="" if i in (1, 2) else "c-m")
        f.text(166, y + 5, str(i), "jf-m jf-b", "middle")
    keys = [(96, '"sushi"', "h=9 : 9 mod 4 = 1", 1), (140, '"pizza"', "h=14 : 14 mod 4 = 2", 2), (184, '"wrap"', "h=6 : 6 mod 4 = 2", 2)]
    for y, k, c, b in keys:
        f.text(6, y - 3, k, "jf-m jf-b")
        f.text(6, y + 12, c, "jf-ms", color="c-m")
    f.arrow([(128, 93), (148, 96)], end="filled", color="c-a")
    f.arrow([(128, 137), (148, 140)], end="filled", color="c-a")
    f.arrow([(134, 187), (140, 187), (140, 150), (148, 146)], end="filled", color="c-a")
    f.simple(204, 83, 76, 26, "sushi=9", "f-2", "c-2", "jf-m")
    f.simple(204, 127, 76, 26, "pizza=12", "f-2", "c-2", "jf-m")
    f.simple(298, 127, 54, 26, "wrap=7", "f-2", "c-2", "jf-m")
    f.arrow([(184, 96), (204, 96)], end="filled")
    f.arrow([(184, 140), (204, 140)], end="filled")
    f.arrow([(280, 140), (298, 140)], end="filled")
    f.lines(8, 222, ["`get(\"wrap\")` : seau 2, puis equals() sur chaque clé :", "pizza ? non. wrap ? oui, on renvoie 7."], 16, "jf-s")
    f.text(8, 262, "sans hashCode cohérent, la clé n'est pas retrouvée.", "jf-s", color="c-r")


@fig("s4-tri", "Comparable et Comparator",
     "Comparable : compareTo dans la classe (ordre naturel). Comparator : compare dans une classe à part (ordre externe). Le signe du résultat décide de l'ordre.",
     "<b>Comparable</b> : un seul ordre « naturel », écrit dans la classe. <b>Comparator</b> : autant d'ordres que l'on veut, "
     "écrits ailleurs. Dans les deux cas : négatif = « avant », 0 = égaux, positif = « après ».",
     anchor='<h3 style="font-size:17px;margin:24px 0 8px">Collections + Comparable + Comparator — <code>comparatorForme</code></h3>')
def _(f):
    f.rect(4, 6, 172, 108, "f-a", rx=5, color="c-a")
    f.text(90, 24, "Comparable<Forme>", "jf-t jf-b", "middle")
    f.lines(12, 42, ["`Forme implements`", "`  Comparable<Forme>`", "`int compareTo(Forme o)`"], 15, "jf-s", maxw=160)
    f.text(90, 106, "ordre naturel, dans la classe", "jf-s", "middle", color="c-m")
    f.rect(184, 6, 172, 108, "f-2", rx=5, color="c-2")
    f.text(270, 24, "Comparator<Forme>", "jf-t jf-b", "middle")
    f.lines(192, 42, ["`ParSurface implements`", "`  Comparator<Forme>`", "`int compare(Forme a,`", "`            Forme b)`"], 15, "jf-s", maxw=160)
    f.text(270, 106, "ordre externe, ailleurs", "jf-s", "middle", color="c-m")
    f.text(8, 136, "`Collections.sort(l);`", "jf-m")
    f.text(180, 136, "appelle `compareTo`", "jf-s", color="c-a")
    f.text(8, 156, "`Collections.sort(l, cmp);`", "jf-m")
    f.text(180, 156, "appelle `compare`", "jf-s", color="c-a")
    f.text(8, 188, "`a.compareTo(b)` ou `compare(a, b)` renvoie :", "jf-s", color="c-m")
    for x, t1, t2, c, fl in ((4, "< 0", "a avant b", "c-g", "f-g"), (124, "= 0", "équivalents", "c-m", "f-s2"), (244, "> 0", "a après b", "c-2", "f-2")):
        f.rect(x, 198, 112, 40, fl, rx=4, color=c)
        f.text(x + 56, 215, t1, "jf-m jf-b", "middle")
        f.text(x + 56, 231, t2, "jf-s", "middle")
    f.text(8, 262, "tri par surface :", "jf-s", color="c-m")
    for i, v in enumerate((9, 3, 5)):
        f.simple(112 + i * 36, 248, 30, 22, str(v), "f-sf", cls="jf-m")
    f.arrow([(224, 259), (246, 259)], end="filled")
    for i, v in enumerate((3, 5, 9)):
        f.simple(254 + i * 36, 248, 30, 22, str(v), "f-g", "c-g", "jf-m")


# ======================================================================================  SEMAINE 5
@fig("s5-try-catch", "Déroulement de try / catch / finally",
     "Organigramme : une exception dans le try saute au premier catch compatible, finally s'exécute dans tous les cas, "
     "puis le programme continue ou l'exception remonte.",
     "<b>finally s'exécute toujours</b>, même après un <code>return</code> ou une exception non attrapée (dans ce cas "
     "l'exception remonte <i>après</i> le finally). Un seul <code>catch</code> s'exécute : le premier compatible, du plus précis au plus général.",
     anchor='<h2>Mots-clés, classes et méthodes de la semaine</h2>', at="sec_end_before")
def _(f):
    f.simple(110, 6, 140, 28, "try { … }", "f-a", "c-a", "jf-m jf-b")
    f.arrow([(180, 34), (180, 50)], end="filled")
    # losange
    f.raw('<path class="jf-box f-sf" d="M180 50 L262 76 L180 102 L98 76 Z"/>')
    f.text(180, 80, "exception lancée ?", "jf-s", "middle", maxw=112)
    f.text(92, 100, "oui", "jf-s jf-b", "start", color="c-r")
    f.text(304, 100, "non", "jf-s jf-b", "start", color="c-g")
    f.arrow([(98, 76), (86, 76), (86, 124)], end="filled", color="c-r")
    f.arrow([(262, 76), (298, 76), (298, 124)], end="filled", color="c-g")
    f.rect(6, 124, 190, 46, "f-sf", rx=4)
    f.text(101, 142, "catch compatible ?", "jf-s jf-b", "middle")
    f.text(101, 159, "(du plus précis au plus général)", "jf-s", "middle", color="c-m", maxw=186)
    f.simple(224, 124, 130, 40, "le try se termine", "f-g", "c-g", "jf-s")
    f.arrow([(48, 170), (48, 198)], end="filled")
    f.arrow([(150, 170), (150, 198)], end="filled")
    f.text(56, 187, "oui", "jf-s jf-b", "start", color="c-g")
    f.text(158, 187, "non", "jf-s jf-b", "start", color="c-r")
    f.simple(4, 198, 90, 38, "corps du catch", "f-2", "c-2", "jf-s")
    f.simple(102, 198, 96, 38, "rien ne convient", "f-r", "c-r", "jf-s")
    f.simple(40, 258, 280, 30, "finally { … } : TOUJOURS exécuté", "f-a", "c-a", "jf-m jf-b")
    f.arrow([(48, 236), (48, 258)], end="filled")
    f.arrow([(150, 236), (150, 258)], end="filled")
    f.arrow([(289, 164), (289, 258)], end="filled", color="c-g")
    f.simple(4, 316, 160, 34, "la suite du programme", "f-g", "c-g", "jf-s")
    f.simple(196, 316, 160, 34, "l'exception remonte", "f-r", "c-r", "jf-s")
    f.arrow([(90, 288), (90, 316)], end="filled", color="c-g")
    f.arrow([(270, 288), (270, 316)], end="filled", color="c-r")
    f.text(100, 306, "catch ou try normal", "jf-s", color="c-g", maxw=90)
    f.text(280, 306, "aucun catch", "jf-s", color="c-r", maxw=74)


@fig("s5-hierarchie", "Hiérarchie des exceptions Java",
     "Throwable se divise en Error et Exception ; RuntimeException et ses filles sont non contrôlées, les autres Exception sont contrôlées.",
     "<b>Contrôlée</b> (orange) : hérite d'<code>Exception</code> sans passer par <code>RuntimeException</code> ; "
     "<code>try/catch</code> ou <code>throws</code> obligatoire. <b>Non contrôlée</b> (bleu) : le compilateur n'exige rien. "
     "Ta propre exception : <code>extends Exception</code> (contrôlée) ou <code>extends RuntimeException</code>.",
     anchor='<h2>Mots-clés, classes et méthodes de la semaine</h2>', at="sec_end_before")
def _(f):
    nodes = [
        (0, "Throwable", "f-sf", "c-m", None),
        (1, "Error (on ne traite pas) : OutOfMemoryError", "f-s2", "c-m", 0),
        (1, "Exception", "f-a", "c-a", 0),
        (2, "IOException", "f-a", "c-a", 2),
        (3, "FileNotFoundException", "f-a", "c-a", 3),
        (2, "RuntimeException", "f-2", "c-2", 2),
        (3, "NullPointerException", "f-2", "c-2", 5),
        (3, "ArithmeticException (/ 0 entier)", "f-2", "c-2", 5),
        (3, "ArrayIndexOutOfBoundsException", "f-2", "c-2", 5),
        (3, "ClassCastException", "f-2", "c-2", 5),
        (3, "IllegalArgumentException", "f-2", "c-2", 5),
        (4, "NumberFormatException", "f-2", "c-2", 10),
    ]
    y = 8
    pos = []
    for lvl, name, fl, c, parent in nodes:
        x = 8 + lvl * 22
        w = min(344 - lvl * 22, int(est_width(name, "jf-m") + 16))
        f.rect(x, y, w, 24, fl, rx=3, color=c)
        f.text(x + 8, y + 16, name, "jf-m", maxw=w - 8)
        pos.append((x, y))
        if parent is not None:
            px, py = pos[parent]
            f.line([(px + 10, py + 24), (px + 10, y + 12), (x, y + 12)])
        y += 30
    f.text(8, y + 14, "orange : contrôlée (traiter ou déclarer)", "jf-s", color="c-a")
    f.text(8, y + 30, "bleu : non contrôlée (aucune obligation)", "jf-s", color="c-2")
    f.text(8, y + 52, "`class MonErreur extends Exception`  contrôlée", "jf-s", color="c-a")
    f.text(8, y + 68, "`class MonErreur extends RuntimeException`  non", "jf-s", color="c-2")


@fig("s5-flux", "Flux : fichier texte et sérialisation",
     "Quatre chaînes : écrire et lire un fichier texte avec PrintWriter et Scanner ; écrire et lire des objets avec ObjectOutputStream et ObjectInputStream.",
     "<b>Texte</b> : une ligne par objet, <code>split(\";\")</code> pour relire, chaque champ reconverti à la main. "
     "<b>Sérialisation</b> : l'objet entier (et ce qu'il référence) en octets ; la classe <code>implements Serializable</code>, "
     "<code>readObject()</code> demande un cast, <code>transient</code> exclut un attribut.",
     anchor='<h3 style="font-size:17px;margin:24px 0 8px">Écrire puis relire un fichier texte (séparateur « ; »)</h3>')
def _(f):
    def lane(y, titre, ecr, lec, fich, gauche_ecr, gauche_lec):
        f.text(8, y, titre, "jf-t jf-b")
        # écrire
        f.simple(2, y + 12, 68, 40, "Programme", "f-sf", cls="jf-s")
        f.rect(94, y + 12, 166, 40, "f-a", rx=4, color="c-a")
        f.text(177, y + 29, ecr[0], "jf-m jf-b", "middle", maxw=166)
        f.text(177, y + 45, ecr[1], "jf-s", "middle", maxw=166)
        f.simple(288, y + 12, 68, 40, fich, "f-2", "c-2", "jf-m")
        f.arrow([(70, y + 32), (94, y + 32)], end="filled")
        f.arrow([(260, y + 32), (288, y + 32)], end="filled")
        # lire
        f.simple(2, y + 64, 68, 40, "Programme", "f-sf", cls="jf-s")
        f.rect(94, y + 64, 166, 40, "f-a", rx=4, color="c-a")
        f.text(177, y + 81, lec[0], "jf-m jf-b", "middle", maxw=166)
        f.text(177, y + 97, lec[1], "jf-s", "middle", maxw=166)
        f.simple(288, y + 64, 68, 40, fich, "f-2", "c-2", "jf-m")
        f.arrow([(94, y + 84), (70, y + 84)], end="filled")
        f.arrow([(288, y + 84), (260, y + 84)], end="filled")
    lane(14, "Fichier texte (caractères)", ("PrintWriter(FileWriter)", "println(ligne)"), ("Scanner(new File(..))", "nextLine() + split"), "menu.txt", 0, 0)
    f.line([(4, 134), (356, 134)], color="c-l")
    lane(156, "Sérialisation (octets)", ("ObjectOutputStream", "writeObject(obj)"), ("ObjectInputStream", "(Type) readObject()"), "plats.ser", 0, 0)
    f.text(8, 284, "`try (…)` ferme le flux ; `IOException` à traiter ;", "jf-s", color="c-m")
    f.text(8, 300, "`ClassNotFoundException` en plus pour `readObject()`.", "jf-s", color="c-m")


# ======================================================================================  SEMAINE 6
@fig("s6-arbre", "Arbre des composants Swing",
     "Une fenêtre JFrame contient un contentPane en BorderLayout : un JPanel au nord avec un JLabel, un JTextField et un JButton, "
     "un JScrollPane au centre avec un JTextArea, un JLabel au sud.",
     "<b>Une fenêtre est un arbre.</b> Le <code>JFrame</code> est la racine, les <code>JPanel</code> sont des conteneurs intermédiaires, "
     "les composants (<code>JButton</code>, <code>JLabel</code>…) sont les feuilles. Chaque conteneur a <i>son</i> layout.",
     anchor='<h2>Méthodes à connaître par cœur</h2>', at="sec_end_before")
def _(f):
    f.rect(30, 8, 300, 134, "f-sf", rx=6)
    f.rect(30, 8, 300, 22, "f-s2", rx=6)
    f.text(42, 24, "JFrame", "jf-s jf-b", color="c-m")
    f.rect(38, 36, 284, 30, "f-a", rx=3, color="c-a")
    f.text(46, 55, "JLabel", "jf-ms")
    f.rect(100, 41, 112, 20, "f-sf", rx=2)
    f.text(106, 55, "JTextField", "jf-ms", color="c-m")
    f.rect(226, 41, 86, 20, "f-sf", rx=10)
    f.text(269, 55, "JButton", "jf-ms", "middle")
    f.rect(38, 72, 284, 44, "f-2", rx=3, color="c-2")
    f.text(46, 88, "JTextArea (dans un JScrollPane)", "jf-ms")
    f.rect(38, 120, 284, 18, "f-sf", rx=3)
    f.text(46, 133, "JLabel (barre d'état)", "jf-ms", color="c-m")
    f.text(340, 52, "N", "jf-s jf-b", color="c-a")
    f.text(340, 98, "C", "jf-s jf-b", color="c-2")
    f.text(340, 134, "S", "jf-s jf-b", color="c-m")
    tree = [
        (0, "JFrame", "f-sf", ""), (1, "contentPane  (BorderLayout)", "f-sf", ""),
        (2, "NORTH : JPanel  (FlowLayout)", "f-a", "c-a"), (3, "JLabel", "f-sf", ""), (3, "JTextField", "f-sf", ""), (3, "JButton", "f-sf", ""),
        (2, "CENTER : JScrollPane", "f-2", "c-2"), (3, "JTextArea", "f-sf", ""), (2, "SOUTH : JLabel", "f-sf", ""),
    ]
    y = 160
    last = {}
    for lvl, name, fl, c in tree:
        x = 8 + lvl * 24
        w = int(est_width(name, "jf-m") + 16)
        f.rect(x, y, w, 22, fl, rx=3, color=c)
        f.text(x + 8, y + 15, name, "jf-m", maxw=w)
        if lvl > 0:
            px = 8 + (lvl - 1) * 24 + 10
            top = last.get(lvl - 1, y - 6)
            f.line([(px, top + 22), (px, y + 11), (x, y + 11)])
        last[lvl] = y
        for k in list(last):
            if k > lvl:
                del last[k]
        y += 28
    f.text(8, y + 10, "`add(panel, BorderLayout.NORTH)` ajoute une branche.", "jf-s", color="c-m")


@fig("s6-layouts", "Les trois layouts à connaître",
     "BorderLayout : cinq zones nord, sud, est, ouest et centre ; FlowLayout : composants à la suite ; GridLayout : grille de cases égales.",
     "<b>BorderLayout</b> : défaut de <code>JFrame</code> ; <code>add(c)</code> sans zone = CENTER. <b>FlowLayout</b> : défaut de "
     "<code>JPanel</code>. <b>GridLayout(l, c)</b> : cases de même taille, remplies ligne par ligne.",
     anchor='<h2>Méthodes à connaître par cœur</h2>', at="sec_end_before")
def _(f):
    # Border
    f.rect(6, 8, 168, 104, "f-sf", rx=4)
    f.rect(10, 12, 160, 20, "f-a", rx=2, color="c-a"); f.text(90, 26, "NORTH", "jf-ms", "middle")
    f.rect(10, 88, 160, 20, "f-a", rx=2, color="c-a"); f.text(90, 102, "SOUTH", "jf-ms", "middle")
    f.rect(10, 36, 40, 48, "f-a", rx=2, color="c-a"); f.text(30, 64, "WEST", "jf-ms", "middle")
    f.rect(130, 36, 40, 48, "f-a", rx=2, color="c-a"); f.text(150, 64, "EAST", "jf-ms", "middle")
    f.rect(54, 36, 72, 48, "f-2", rx=2, color="c-2"); f.text(90, 64, "CENTER", "jf-ms", "middle")
    f.text(188, 24, "BorderLayout", "jf-t jf-b")
    f.lines(188, 42, ["défaut de JFrame", "`add(c, NORTH)` (zone)", "`add(c)` seul : CENTER", "le centre prend la place"], 15, "jf-s")
    # Flow
    f.line([(4, 124), (356, 124)], color="c-l")
    f.rect(6, 134, 168, 76, "f-sf", rx=4)
    for i, x in enumerate((12, 56, 100)):
        f.rect(x, 142, 40, 20, "f-2", rx=10, color="c-2"); f.text(x + 20, 156, "B%d" % (i + 1), "jf-ms", "middle")
    f.rect(12, 170, 40, 20, "f-2", rx=10, color="c-2"); f.text(32, 184, "B4", "jf-ms", "middle")
    f.rect(56, 170, 40, 20, "f-2", rx=10, color="c-2"); f.text(76, 184, "B5", "jf-ms", "middle")
    f.text(188, 150, "FlowLayout", "jf-t jf-b")
    f.lines(188, 168, ["défaut de JPanel", "à la suite, taille naturelle", "à la ligne si trop étroit"], 15, "jf-s")
    # Grid
    f.line([(4, 222), (356, 222)], color="c-l")
    f.rect(6, 232, 168, 76, "f-sf", rx=4)
    n = 1
    for r in range(2):
        for c in range(3):
            f.rect(10 + c * 54, 236 + r * 35, 50, 31, "f-a", rx=2, color="c-a")
            f.text(35 + c * 54, 256 + r * 35, str(n), "jf-ms", "middle")
            n += 1
    f.text(188, 248, "GridLayout(2, 3)", "jf-t jf-b")
    f.lines(188, 266, ["2 lignes, 3 colonnes", "cases de même taille", "remplies ligne par ligne"], 15, "jf-s")


@fig("s6-ecouteur", "Les 3 étapes d'un écouteur d'événements",
     "Le bouton plus mémorise son écouteur grâce à addActionListener(this) ; au clic il crée un ActionEvent et appelle actionPerformed de la fenêtre.",
     "<b>3 étapes, dans cet ordre :</b> ① la classe <code>implements ActionListener</code> ; ② elle écrit <code>actionPerformed</code> ; "
     "③ on <b>abonne</b> chaque source avec <code>addActionListener</code>. Oublier le ③ : le clic ne fait rien.",
     anchor='<h2>Le squelette à savoir écrire les yeux fermés</h2>\n      </div>\n', at="after")
def _(f):

    f.rect(4, 8, 352, 80, "f-a", rx=5, color="c-a")
    f.text(180, 26, "class Compteur", "jf-t jf-b", "middle")
    f.badge(18, 46, "1")
    f.text(34, 50, "`implements ActionListener`", "jf-m")
    f.badge(18, 70, "2")
    f.text(34, 74, "`void actionPerformed(ActionEvent e) { … }`", "jf-m", maxw=316)
    f.rect(4, 120, 170, 76, "f-sf", rx=5)
    f.text(12, 138, "JButton plus", "jf-t jf-b")
    f.rect(14, 148, 150, 38, "f-s2", rx=3, color="c-m")
    f.text(22, 163, "écouteurs :", "jf-s", color="c-m")
    f.simple(30, 166, 100, 16, "Compteur", "f-a", "c-a", "jf-ms")
    f.arrow([(130, 174), (150, 174), (150, 88)], end="filled", dash=True, color="c-a")
    f.badge(150, 130, "3")
    f.text(184, 126, "`plus.addActionListener(`", "jf-ms", color="c-a", maxw=170)
    f.text(184, 141, "`    this);`", "jf-ms", color="c-a")
    f.text(184, 163, "abonnement : une seule fois,", "jf-s", color="c-m")
    f.text(184, 178, "à la construction de la fenêtre", "jf-s", color="c-m", maxw=172)
    f.line([(4, 212), (356, 212)], color="c-l")
    f.text(8, 232, "Au clic :", "jf-t jf-b")
    f.simple(4, 244, 90, 34, "clic utilisateur", "f-sf", cls="jf-s")
    f.simple(116, 244, 110, 34, "ActionEvent e", "f-2", "c-2", "jf-m")
    f.simple(248, 244, 108, 34, "actionPerformed", "f-a", "c-a", "jf-s")
    f.arrow([(94, 261), (116, 261)], end="filled")
    f.arrow([(226, 261), (248, 261)], end="filled")
    f.text(180, 298, "`e.getSource()` : le bouton qui a été cliqué", "jf-s", "middle", color="c-m")


# ======================================================================================  SEMAINE 7
@fig("s7-mvc", "Le pattern Modèle – Vue – Contrôleur",
     "L'utilisateur agit sur la Vue ; la Vue prévient le Contrôleur ; le Contrôleur appelle le Modèle ; le Modèle notifie la Vue qui se met à jour.",
     "<b>Le cycle :</b> clic → Vue → Contrôleur → Modèle → notification → Vue. Le Modèle ne connaît ni la Vue ni le Contrôleur "
     "(il prévient seulement des <i>abonnés</i>). Flèche pleine = « appelle » ; pointillé = « notifie ».",
     anchor='<h2>Un compteur en MVC (4 classes, compile tel quel)</h2>', at="sec_end_before")
def _(f):

    f.simple(130, 6, 100, 28, "Utilisateur", "f-sf", cls="jf-s")
    f.simple(10, 100, 110, 36, "Vue", "f-2", "c-2", "jf-t jf-b")
    f.simple(240, 100, 110, 36, "Contrôleur", "f-a", "c-a", "jf-t jf-b")
    f.simple(125, 230, 110, 36, "Modèle", "f-g", "c-g", "jf-t jf-b")
    f.text(8, 152, "affichage", "jf-s", color="c-m")
    f.text(180, 284, "données + règles", "jf-s", "middle", color="c-m")
    f.arrow([(150, 34), (75, 100)], end="filled")
    f.badge(104, 62, "1")
    f.text(124, 66, "clic", "jf-s")
    f.arrow([(120, 118), (240, 118)], end="filled")
    f.badge(180, 118, "2")
    f.text(180, 142, "événement", "jf-s", "middle")
    f.arrow([(270, 136), (270, 196), (225, 230)], end="filled", color="c-a")
    f.badge(270, 170, "3")
    f.text(284, 168, "appelle", "jf-s", color="c-a")
    f.text(284, 183, "le modèle", "jf-s", color="c-a")
    f.arrow([(150, 230), (80, 138)], end="filled", dash=True, color="c-2")
    f.badge(124, 196, "4")
    f.text(46, 200, "notifie", "jf-s", color="c-2")
    f.text(8, 318, "La Vue lit le Modèle pour se redessiner (`getValeur()`),", "jf-s", color="c-m")
    f.text(8, 334, "mais ne le modifie jamais : c'est le travail du Contrôleur.", "jf-s", color="c-m")


@fig("s7-observateur", "Le patron Observateur dans le MVC",
     "CompteurModele garde une liste de CompteurListener ; CompteurVue implémente cette interface ; CompteurControleur connaît le modèle et la vue.",
     "<b>Le modèle ne connaît que l'interface</b> <code>CompteurListener</code>, jamais <code>CompteurVue</code> : on peut brancher "
     "plusieurs vues sans le modifier. Chaque changement se termine par <code>prevenir()</code> ; oublier de notifier = écran figé.",
     anchor='<h2>Un compteur en MVC (4 classes, compile tel quel)</h2>\n      </div>\n', at="after")
def _(f):
    li = f.classbox(100, 8, 160, "CompteurListener", [], ["+ compteurModifie(m)"], kind="interface", fill="f-sf")
    mo = f.classbox(4, 110, 168, "CompteurModele", ["- abonnes : List"], ["+ ajouterAbonne(l)", "+ incrementer()", "- prevenir()"], fill="f-g", color="c-g")
    vu = f.classbox(196, 110, 160, "CompteurVue", [], ["+ compteurModifie(m)"], fill="f-2", color="c-2")
    co = f.classbox(100, 250, 160, "CompteurControleur", [], ["+ actionPerformed(e)"], fill="f-a", color="c-a")
    f.arrow([(88, 110), (120, li["bottom"] + 0)], end="open", color="c-g")
    f.text(52, 100, "0..* abonnés", "jf-s", "middle", color="c-g")
    f.arrow([(276, 110), (240, li["bottom"])], end="tri", dash=True)
    f.text(352, 96, "implements", "jf-m", "end", color="c-m")
    f.arrow([(130, 250), (88, mo["bottom"])], end="open", color="c-a")
    f.arrow([(230, 250), (276, vu["bottom"])], end="open", color="c-a")
    f.text(50, 232, "appelle", "jf-s", "middle", color="c-a")
    f.text(312, 232, "écoute", "jf-s", "middle", color="c-a")


# ======================================================================================  MÉTHODES
@fig("meth-compil-exec", "Compilation, exécution, résultat faux",
     "De Monde.java à l'exécution : javac produit Monde.class, la JVM l'exécute. Trois familles de problèmes selon l'étape.",
     "<b>Avant d'analyser un code, dire à quelle étape il échoue.</b> Une erreur de compilation empêche tout affichage ; "
     "une exception plante en cours de route ; un résultat faux ne produit aucune erreur : on trace à la main.",
     anchor='<h2>Débloquer seul : erreurs, plantages, documentation</h2>\n      </div>\n', at="after")
def _(f):
    f.simple(4, 8, 84, 34, "Monde.java", "f-sf", cls="jf-m")
    f.simple(138, 8, 84, 34, "Monde.class", "f-sf", cls="jf-m")
    f.simple(272, 8, 84, 34, "exécution", "f-sf", cls="jf-s")
    f.arrow([(88, 25), (138, 25)], end="filled")
    f.arrow([(222, 25), (272, 25)], end="filled")
    f.text(113, 18, "javac", "jf-m jf-b", "middle", color="c-a")
    f.text(247, 18, "java", "jf-m jf-b", "middle", color="c-a")
    cards = [
        (60, "f-r", "c-r", "1 · Erreur de COMPILATION : rien ne s'exécute",
         ["type incompatible : `int x = \"a\";`", "symbole ou méthode inconnus pour le type de la variable",
          "exception contrôlée ni attrapée ni déclarée", "`new` sur une classe abstraite ou une interface",
          "`final` réaffecté, `private` inaccessible, `;` oublié"]),
        (182, "f-a", "c-a", "2 · EXCEPTION à l'exécution : ça plante en route",
         ["`NullPointerException` : référence null utilisée", "`ArrayIndexOutOfBoundsException` : indice hors tableau",
          "`ClassCastException` : mauvais downcast", "`ArithmeticException` : division entière par 0",
          "`NumberFormatException` : `Integer.parseInt(\"a\")`"]),
        (304, "f-s2", "c-m", "3 · RÉSULTAT FAUX : ni erreur ni plantage",
         ["`==` au lieu de `equals` sur des objets", "division entière : `7 / 2` vaut 3",
          "méthode appelée sur la mauvaise variable (alias)", "modèle modifié sans prévenir la vue",
          "boucle qui commence à 1 au lieu de 0"]),
    ]
    for y, fl, c, titre, items in cards:
        f.rect(4, y, 352, 112, fl, rx=5, color=c)
        f.text(12, y + 17, titre, "jf-t jf-b", maxw=336)
        for i, s in enumerate(items):
            f.text(12, y + 36 + i * 15, s, "jf-s", maxw=336)


# ----------------------------------------------------------------------------------------------
#  Compléments de cours (blocs jadd)
# ----------------------------------------------------------------------------------------------
KW = set("""abstract boolean break byte case catch char class continue default do double else enum extends final finally float
for if implements import instanceof int interface long new package private protected public return short static super switch
this throw throws try void volatile while transient null true false var""".split())


def hl(src):
    """Colorisation Java identique à celle du site (kw, cls, fn, str, cmt, num)."""
    out = []
    tok = re.compile(r'(//[^\n]*)|("(?:\\.|[^"\\])*")|(\'(?:\\.|[^\'\\])\')|(@\w+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|(.)', re.S)
    for m in tok.finditer(src):
        cm, st, ch, an, nu, idn, ws, ot = m.groups()
        if cm:
            out.append('<span class="cmt">%s</span>' % esc(cm))
        elif st or ch:
            out.append('<span class="str">%s</span>' % esc(st or ch))
        elif an:
            out.append('<span class="kw">%s</span>' % esc(an))
        elif nu:
            out.append('<span class="num">%s</span>' % nu)
        elif idn:
            nxt = src[m.end():m.end() + 1]
            if idn in KW:
                out.append('<span class="kw">%s</span>' % idn)
            elif idn[0].isupper():
                out.append('<span class="cls">%s</span>' % idn)
            elif nxt == "(":
                out.append('<span class="fn">%s</span>' % idn)
            else:
                out.append(idn)
        elif ws:
            out.append(ws)
        else:
            out.append(esc(ot))
    return "".join(out)


def code_file(rel, start=None, end=None):
    with open(os.path.join(CODE, rel), encoding="utf-8") as fh:
        txt = fh.read().rstrip("\n")
    if start or end:
        lines = txt.split("\n")
        txt = "\n".join(lines[(start or 1) - 1:end])
    return '<pre class="code">%s</pre>' % hl(txt)


ADDS = []  # dict(name, html (avec {{fig:nom}}), anchor, at)


def add(name, anchor, at):
    def deco(fn):
        ADDS.append(dict(name=name, fn=fn, anchor=anchor, at=at))
        return fn
    return deco


@add("s3-memoire", '        <h2>Code annoté</h2>\n      </div>\n\n      <h3 style="font-size:17px;margin-bottom:8px">this — auto-référence et chaînage de constructeurs</h3>', "sec_start_before")
def _():
    return """    <section id="s3-memoire">
      <div class="section-head">
        <div class="eyebrow">Complément · modèle mémoire</div>
        <h2>Pile, tas, références : comprendre <code>a = b</code>, <code>==</code>, <code>null</code> et les paramètres</h2>
        <p>Le cours parle d'affectation d'objets et de ramasse-miettes sans jamais dessiner la mémoire. Or presque tous les « qu'affiche ce programme ? » des annales reviennent à cette image : <b>deux zones, la pile et le tas</b>.</p>
      </div>
      <div class="notions">
        <div class="notion" style="border-left:3px solid var(--accent)">
          <h3>La pile</h3>
          <p>Les <b>variables locales</b> et les paramètres des méthodes en cours. Un type primitif (<code>int</code>, <code>double</code>, <code>boolean</code>, <code>char</code>) y garde sa <b>valeur</b> ; une variable d'objet n'y garde qu'une <b>référence</b>.</p>
        </div>
        <div class="notion" style="border-left:3px solid var(--accent2)">
          <h3>Le tas</h3>
          <p>Les <b>objets</b> et les <b>tableaux</b> créés par <code>new</code>. Un objet vit tant qu'une référence y mène ; sans référence, le ramasse-miettes peut le détruire.</p>
        </div>
        <div class="notion" style="border-left:3px solid var(--bad)">
          <h3>null</h3>
          <p>Une référence qui ne désigne <b>aucun objet</b>. Valeur par défaut des attributs et des cases de tableau d'objets. Appeler une méthode ou lire un attribut dessus : <code>NullPointerException</code>.</p>
        </div>
        <div class="notion" style="border-left:3px solid var(--good)">
          <h3>Paramètres</h3>
          <p>Java passe <b>toujours une copie</b> : de la valeur (primitif) ou de la référence (objet, tableau). On peut donc modifier l'objet de l'appelant, pas le remplacer.</p>
        </div>
      </div>
{{fig:s3-pile-tas}}
{{fig:s3-affectation}}
{{fig:s3-passage}}
      <h3 style="font-size:17px;margin:24px 0 8px">Tout en un exemple (compile tel quel : <code>code/complements/Memoire.java</code>)</h3>
""" + code_file("complements/Memoire.java") + """
      <p class="diagram-caption">Sortie : <code>true</code>, <code>true</code>, <code>(1,2)</code>, <code>false</code>, <code>true</code>, <code>(9,4) 5</code>, <code>ba</code>, <code>1 2</code>, <code>NPE</code>, <code>null</code>.</p>
      <div class="trap-list">
        <div class="trap"><b>Compter les objets</b>On compte les <code>new</code>, pas les variables : <code>A x,u,v; x=new A(); A y=x; A z=new A();</code> crée <b>2</b> objets (QCM 2025). <code>A y = x</code> ne crée rien.</div>
        <div class="trap"><b>Tableau d'objets</b><code>new String[10]</code> crée 10 <b>références</b> égales à <code>null</code> et <b>aucun</b> objet <code>String</code> : chaque case doit recevoir son propre <code>new</code>.</div>
        <div class="trap"><b>swap sur deux int</b><code>echanger(int a, int b)</code> n'échange rien chez l'appelant (copies). Sur un <b>tableau</b>, <code>echanger(t, i, j)</code> fonctionne : l'objet est partagé (exercice 1 du DS 2023).</div>
        <div class="trap"><b>== sur des objets</b><code>==</code> compare les flèches. Pour le contenu : <code>equals()</code>, à redéfinir dans <i>ta</i> classe (<code>String</code> le fait déjà).</div>
      </div>
    </section>"""


@add("s4-pieges", '    <section id="s4-map">', "before")
def _():
    return """    <section id="s4-pieges">
      <div class="section-head">
        <div class="eyebrow">Complément · pièges d'évaluation</div>
        <h2>Héritage, static, constructeurs, surcharge : ce qui piège en QCM</h2>
        <p>Six situations qui reviennent dans les annales (QCM 2025 surtout) et que les pages du cours n'énonçaient pas explicitement. Le code complet est dans <code>code/complements/Pieges.java</code>.</p>
      </div>
      <div class="notions">
        <div class="notion" style="border-left:3px solid var(--bad)">
          <h3>static n'est pas polymorphe</h3>
          <p>Une méthode <code>static</code> est résolue d'après la <b>classe écrite</b> dans l'appel : une « redéfinition » static ne fait que <b>masquer</b>. <code>A.f(2) * a.g(3)</code> avec <code>f</code> static et <code>g</code> redéfinie vaut <b>7 × 11 = 77</b>, pas 6 × 11.</p>
        </div>
        <div class="notion" style="border-left:3px solid var(--bad)">
          <h3>Le constructeur du parent appelle une méthode redéfinie</h3>
          <p>C'est la version de la <b>fille</b> qui s'exécute, <b>avant</b> que les attributs de la fille soient initialisés (<code>null</code> pour un objet, 0 pour un nombre). QCM 2025 : <code>new Fifille()</code> affiche « Fifille ».</p>
        </div>
        <div class="notion" style="border-left:3px solid var(--bad)">
          <h3>Les attributs ne sont pas polymorphes</h3>
          <p><code>a.nom</code> est lu selon le type de la <b>variable</b> (<code>A</code>), même si l'objet est un <code>B</code> qui a son propre <code>nom</code>. Seules les <b>méthodes</b> d'instance redéfinies sont dynamiques.</p>
        </div>
        <div class="notion" style="border-left:3px solid var(--bad)">
          <h3>Surcharge : choix à la compilation</h3>
          <p>Entre <code>t(Object)</code> et <code>t(String)</code>, Java choisit d'après le type <b>déclaré</b> de l'argument : <code>Object o = "x"; t(o)</code> appelle <code>t(Object)</code>. La redéfinition, elle, se décide à l'exécution.</p>
        </div>
      </div>
      <div class="tbl-wrap" style="margin-top:18px">
        <table class="tbl">
          <thead><tr><th></th><th>Surcharge (overload)</th><th>Redéfinition (override)</th></tr></thead>
          <tbody>
            <tr><td><b>Où ?</b></td><td>même classe (ou héritée)</td><td>classe fille</td></tr>
            <tr><td><b>Signature</b></td><td>même nom, paramètres <b>différents</b></td><td>même nom et <b>mêmes</b> paramètres</td></tr>
            <tr><td><b>Choix</b></td><td>compilation, type <b>déclaré</b> des arguments</td><td>exécution, type <b>réel</b> de l'objet</td></tr>
            <tr><td><b>@Override</b></td><td>non</td><td>oui : erreur de compilation si la signature ne correspond pas</td></tr>
            <tr><td><b>Impossible pour</b></td><td>—</td><td><code>static</code> (masquée), <code>private</code>, <code>final</code></td></tr>
          </tbody>
        </table>
      </div>
      <p class="qa-intro" style="margin-top:12px">Le PDF du cours 3 écrit « surcharge (redéfinition) » : à l'examen, <b>surcharge = overload</b> (signatures différentes) et <b>redéfinition = override</b> (même signature dans la fille).</p>
""" + code_file("complements/Pieges.java") + """
      <p class="diagram-caption">Sortie : <code>A() voit : Bnull</code>, <code>77</code>, <code>A</code>, <code>B</code>, <code>Object</code>, <code>String</code>.</p>
      <div class="trap-list">
        <div class="trap"><b>Constructeur absent chez le parent</b>Si la mère n'a <b>que</b> <code>Base(int i)</code>, la fille doit écrire <code>super(10);</code> en 1re ligne de <i>chacun</i> de ses constructeurs, sinon : erreur de compilation. Un constructeur ne contient pas à la fois <code>this(...)</code> et <code>super(...)</code>.</div>
        <div class="trap"><b>Un cast qui compile n'est pas un cast qui marche</b><code>Triangle t = (Triangle) uneFigure;</code> compile si <code>Triangle</code> hérite de <code>Figure</code>, mais plante (<code>ClassCastException</code>) si l'objet réel est une autre <code>Figure</code>. Utiliser <code>instanceof</code> avant.</div>
      </div>
    </section>"""


@add("s4-ensembles", '    <section id="s4-ecueils">', "before")
def _():
    return """    <section id="s4-ensembles">
      <div class="section-head">
        <div class="eyebrow">Complément · Set et table de hachage</div>
        <h2>Set, hashCode et equals : pourquoi une clé « égale » n'est pas retrouvée</h2>
        <p>La partie Map du cours précise que les clés doivent redéfinir <code>hashCode()</code>. Voici comment cela se passe réellement, avec le <code>Set</code> qui repose sur le même mécanisme.</p>
      </div>
{{fig:s4-hachage}}
      <div class="notions">
        <div class="notion" style="border-left:3px solid var(--accent)">
          <h3>Set : pas de doublon</h3>
          <p><code>add(x)</code> renvoie <code>false</code> et ne change rien si un élément <b>égal</b> (au sens de <code>equals</code>) est déjà là. <code>HashSet</code> : sans ordre. <code>TreeSet</code> : trié, il exige que les éléments soient <code>Comparable</code> (ou un <code>Comparator</code>), sinon <code>ClassCastException</code>.</p>
        </div>
        <div class="notion" style="border-left:3px solid var(--bad)">
          <h3>La règle d'or</h3>
          <p>Si <code>a.equals(b)</code> est vrai, alors <code>a.hashCode() == b.hashCode()</code>. On redéfinit <b>toujours les deux ensemble</b>, avec les mêmes attributs.</p>
        </div>
        <div class="notion" style="border-left:3px solid var(--warn)">
          <h3>Signature exacte de equals</h3>
          <p>C'est <code>equals(Object o)</code>. Écrire <code>equals(Plat p)</code> est une <b>surcharge</b> : <code>contains</code>, <code>HashSet</code> et <code>HashMap</code> continuent d'appeler celle d'<code>Object</code>. Avec <code>@Override</code>, le compilateur refuse.</p>
        </div>
      </div>
""" + code_file("complements/Ensembles.java") + """
      <p class="diagram-caption">Sortie : <code>true</code>, <code>false</code>, <code>1</code>, <code>12</code>, <code>[pizza, sushi, wrap]</code>, <code>false</code>, <code>true</code>, <code>ClassCastException</code>.</p>
    </section>"""


@add("meth-cours", '        <h2>Écrire du Java sur papier (DS) sans perdre de points bêtes</h2>', "sec_start_before")
def _():
    defs = [
        ("Encapsulation", "Attributs <code>private</code>, accès contrôlé par des méthodes publiques (getters, setters) : l'objet protège son état."),
        ("Constructeur", "Méthode sans type de retour, de même nom que la classe, appelée par <code>new</code> pour initialiser l'objet."),
        ("static", "Appartient à la classe, pas à un objet : une seule copie partagée, pas de <code>this</code>, pas redéfinissable."),
        ("this / super", "<code>this</code> : l'objet courant (lever l'ambiguïté, <code>this(...)</code>). <code>super</code> : la partie parent (<code>super(...)</code> en 1re ligne, <code>super.m()</code>)."),
        ("Surcharge / redéfinition", "Surcharge : même nom, paramètres différents, choix à la compilation. Redéfinition : même signature dans la fille, choix à l'exécution."),
        ("Classe abstraite", "Non instanciable ; peut avoir attributs, constructeurs et méthodes concrètes ; ses filles concrètes implémentent ses méthodes <code>abstract</code>."),
        ("Interface", "Contrat de signatures (<code>public abstract</code> implicite) ; <code>implements</code>, plusieurs possibles ; ni état ni constructeur ; réduit le couplage."),
        ("Polymorphisme", "Une variable de type parent ou interface désigne un objet de n'importe quelle fille ; c'est la méthode du <b>type réel</b> qui s'exécute."),
        ("Upcasting / downcasting", "Vers le parent : implicite et sûr. Vers la fille : cast explicite, vérifié à l'exécution (<code>ClassCastException</code>), précédé d'<code>instanceof</code>."),
        ("Exception contrôlée", "Sous-classe d'<code>Exception</code> hors <code>RuntimeException</code> : à attraper (<code>catch</code>) ou à déclarer (<code>throws</code>), sinon erreur de compilation."),
        ("throw / throws", "<code>throw</code> lance une exception dans le corps ; <code>throws</code> annonce, dans la signature, celles que la méthode laisse sortir."),
        ("Sérialisation", "Convertir un objet (et ce qu'il référence) en octets ; classe <code>Serializable</code>, attributs <code>transient</code> exclus."),
        ("Layout manager", "Objet qui calcule position et taille des composants d'un conteneur (<code>BorderLayout</code>, <code>FlowLayout</code>, <code>GridLayout</code>)."),
        ("Écouteur", "Objet abonné à une source d'événements : <code>implements ActionListener</code> + <code>actionPerformed</code> + <code>addActionListener</code>."),
        ("MVC", "Modèle : données et règles. Vue : affichage. Contrôleur : écoute la vue et appelle le modèle. Le modèle ignore l'affichage."),
        ("Comparable / Comparator", "<code>compareTo</code> dans la classe (un ordre naturel) / <code>compare</code> dans une classe à part (autant d'ordres que voulu)."),
    ]
    rows = "\n".join("            <tr><td><b>%s</b></td><td>%s</td></tr>" % d for d in defs)
    return """    <section id="meth-cours">
      <div class="section-head">
        <div class="eyebrow">Évaluation finale</div>
        <h2>Définitions à ressortir et réflexes de lecture</h2>
        <p>Les questions de cours se notent sur un mot-clé juste et l'effet qu'il a. Les QCM (25 questions, +0,8 / −0,4, <b>une case vide coûte autant qu'une erreur</b> dans le sujet 2025) se gagnent en vérifiant dans le même ordre.</p>
      </div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th>Notion</th><th>La phrase qui rapporte le point</th></tr></thead>
          <tbody>
""" + rows + """
          </tbody>
        </table>
      </div>
      <h3 style="font-size:17px;margin:28px 0 12px">Les 10 réflexes devant un code d'examen</h3>
      <ul class="checklist">
        <li><b>Ça compile ?</b> Types incompatibles, méthode absente du type déclaré, exception contrôlée oubliée, <code>new</code> d'une classe abstraite, <code>final</code>, <code>private</code>. Si non : c'est la réponse.</li>
        <li><b>Dessiner pile et tas</b> pour toute affectation d'objets : combien de <code>new</code> ? qui désigne quoi ?</li>
        <li><b>Type déclaré ou type réel ?</b> Le compilateur lit le premier, la JVM exécute avec le second (méthodes d'instance seulement).</li>
        <li><b>Constructeurs</b> : monter jusqu'à la racine, puis exécuter en redescendant ; <code>this(...)</code> et <code>super(...)</code> en 1re ligne.</li>
        <li><b>static</b> : une seule copie, pas de <code>this</code>, pas de polymorphisme.</li>
        <li><b>== ou equals ?</b> Références contre contenu ; et <code>equals(Object)</code> avec cette signature exacte.</li>
        <li><b>Arithmétique</b> : <code>7 / 2</code> vaut 3, <code>'a' + 1</code> est un <code>int</code>, <code>"a" + 1 + 2</code> vaut <code>"a12"</code>.</li>
        <li><b>Exceptions</b> : où est-elle lancée ? quel est le 1er <code>catch</code> compatible ? <code>finally</code> s'exécute toujours, même après <code>return</code>.</li>
        <li><b>Collections</b> : indices depuis 0 ; <code>length</code> (tableau), <code>length()</code> (String), <code>size()</code> (collection) ; doublons et ordre selon <code>List</code>, <code>Set</code>, <code>Map</code>.</li>
        <li><b>Swing</b> : layout par défaut (JFrame : Border, JPanel : Flow), 3 étapes de l'écouteur, <code>setVisible(true)</code> en dernier.</li>
      </ul>
    </section>"""


# ----------------------------------------------------------------------------------------------
#  CSS
# ----------------------------------------------------------------------------------------------
CSS_BLOCK = """/* jfig:debut */
/* Schémas SVG du cours (généré par tools/gen_java_figs.py : ne pas modifier à la main) */
.jfig{margin:22px auto;max-width:480px;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:12px 12px 14px;color:var(--ink)}
.jfig svg{display:block;width:100%;height:auto;color:var(--ink);overflow:visible}
.jfig figcaption{font-size:13px;line-height:1.55;color:var(--muted);margin-top:10px}
.jfig figcaption b{color:var(--ink)}
.jfig figcaption code{font-size:.9em}
.jfig .jf-t{font-family:var(--f-body);font-size:12.5px;fill:currentColor}
.jfig .jf-s{font-family:var(--f-body);font-size:11.5px;fill:currentColor}
.jfig .jf-m{font-family:var(--f-mono);font-size:11.5px;fill:currentColor}
.jfig .jf-ms{font-family:var(--f-mono);font-size:11px;fill:currentColor}
.jfig .jf-b{font-weight:600}
.jfig .jf-i{font-style:italic}
.jfig .jf-u{text-decoration:underline}
.jfig .jf-sub{font-size:75%}
.jfig .jf-halo{stroke:var(--surface2);stroke-width:4px;stroke-linejoin:round;paint-order:stroke}
.jfig .jf-box{stroke:currentColor;stroke-width:1.3}
.jfig .jf-ln{stroke:currentColor;stroke-width:1.5;fill:none;stroke-linejoin:round}
.jfig .jf-d{stroke-dasharray:5 4}
.jfig .jf-ho{fill:var(--surface2);stroke:currentColor;stroke-width:1.4;stroke-linejoin:round}
.jfig .jf-hf{fill:currentColor;stroke:currentColor;stroke-width:1;stroke-linejoin:round}
.jfig .jf-dot{fill:currentColor}
.jfig .jf-badge{fill:var(--accent)}
.jfig .jf-bn{font-family:var(--f-body);font-size:11px;font-weight:700;fill:var(--bg)}
.jfig .f-sf{fill:var(--surface)}
.jfig .f-s2{fill:var(--surface2)}
.jfig .f-a{fill:var(--accent-soft)}
.jfig .f-2{fill:var(--teal-soft)}
.jfig .f-g{fill:var(--good-soft)}
.jfig .f-r{fill:var(--bad-soft)}
.jfig .c-a{color:var(--accent)}
.jfig .c-2{color:var(--accent2)}
.jfig .c-g{color:var(--good)}
.jfig .c-r{color:var(--bad)}
.jfig .c-w{color:var(--warn)}
.jfig .c-m{color:var(--muted)}
.jfig .c-l{color:var(--line);stroke-width:1}
@media(max-width:480px){.jfig{margin-left:-8px;margin-right:-8px;padding:10px 6px 12px}}
@media print{.jfig{break-inside:avoid;background:#fff}}
/* jfig:fin */
"""


def write_atomic(path, data, newline_crlf=False):
    tmp = path + ".tmp-jfig"
    raw = data.replace("\n", "\r\n") if newline_crlf else data
    try:
        with open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(raw)
        return
    except OSError:
        pass
    with open(tmp, "w", encoding="utf-8", newline="") as fh:
        fh.write(raw)
    os.replace(tmp, path)


def update_css():
    with open(CSS, encoding="utf-8", newline="") as fh:  # relecture juste avant écriture
        css = fh.read()
    pat = re.compile(r"/\* jfig:debut \*/.*?/\* jfig:fin \*/\n?", re.S)
    if pat.search(css):
        new = pat.sub(lambda m: CSS_BLOCK, css, count=1)
    else:
        new = css + ("" if css.endswith("\n") else "\n") + "\n" + CSS_BLOCK
    if new != css:
        write_atomic(CSS, new)
    return new != css


# ----------------------------------------------------------------------------------------------
#  Insertion dans index.html
# ----------------------------------------------------------------------------------------------
def read_index():
    with open(INDEX, encoding="utf-8", newline="") as fh:
        raw = fh.read()
    crlf = raw.count("\r\n") > raw.count("\n") / 2
    ends_crlf = raw.endswith("\r\n")
    return raw.replace("\r\n", "\n"), crlf, ends_crlf


def strip_blocks(txt):
    pat = re.compile(r"[ \t]*<!-- (jfig|jadd):([\w-]+) -->.*?<!-- /\1:\2 -->[ \t]*\n", re.S)
    # jadd contient des jfig : on retire d'abord les jadd
    txt = re.compile(r"[ \t]*<!-- jadd:([\w-]+) -->.*?<!-- /jadd:\1 -->[ \t]*\n", re.S).sub("", txt)
    txt = re.compile(r"[ \t]*<!-- jfig:([\w-]+) -->.*?<!-- /jfig:\1 -->[ \t]*\n", re.S).sub("", txt)
    return txt


def find_pos(txt, anchor, at, label):
    n = txt.count(anchor)
    if n != 1:
        raise SystemExit("ANCRE %s : %d occurrence(s) pour %r" % (label, n, anchor[:70]))
    i = txt.index(anchor)
    if at == "before":
        return txt.rfind("\n", 0, i) + 1
    if at == "after":
        j = i + len(anchor)
        return j if txt[j - 1] == "\n" else txt.index("\n", j) + 1
    if at == "sec_end_before":
        k = txt.rfind("</section>", 0, i)
        return txt.rfind("\n", 0, k) + 1
    if at == "sec_start_before":
        k = txt.rfind("<section", 0, i)
        return txt.rfind("\n", 0, k) + 1
    raise SystemExit("position inconnue " + at)


def run(dry=False, test_out=None, only=None, theme=None, width="480"):
    figs = {}
    warns = []
    for spec in FIGS:
        f = build(spec)
        figs[spec["name"]] = f.block()
        warns.extend(f.warns)
    names = [s["name"] for s in FIGS]
    if len(set(names)) != len(names):
        raise SystemExit("noms de figures en double")
    if test_out:
        os.makedirs(test_out, exist_ok=True)
        body = "\n".join(figs[n] for n in names if not only or n in only)
        page = ("<!doctype html><html lang=\"fr\"%s><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                "<link rel=\"stylesheet\" href=\"/css/style.css\"></head><body><div class=\"wrap\" style=\"max-width:%spx\">%s</div></body></html>")
        th = ' data-theme="%s"' % theme if theme else ""
        with open(os.path.join(test_out, "jfig-test.html"), "w", encoding="utf-8") as fh:
            fh.write(page % (th, width, body))
        update_css()
    txt, crlf, ends_crlf = read_index()
    base = strip_blocks(txt)
    # 1. compléments (ils contiennent des {{fig:..}} remplacés plus bas)
    adds_html = {}
    for a in ADDS:
        adds_html[a["name"]] = a["fn"]()
    used_inline = set()
    for a in ADDS:
        h = a["html"] = adds_html[a["name"]]

        def rep(m):
            used_inline.add(m.group(1))
            return figs[m.group(1)]
        a["html"] = re.sub(r"^\{\{fig:([\w-]+)\}\}$", rep, h, flags=re.M)
    out = base
    for a in ADDS:
        pos = find_pos(out, a["anchor"], a["at"], "jadd:" + a["name"])
        block = "    <!-- jadd:%s -->\n%s\n\n    <!-- /jadd:%s -->\n" % (a["name"], a["html"], a["name"])
        out = out[:pos] + block + out[pos:]
    # 2. figures ancrées
    for spec in FIGS:
        if spec["anchor"] in (None, "@@s3mem@@", "@@s4ens@@"):
            if spec["name"] not in used_inline:
                raise SystemExit("figure %s non placée" % spec["name"])
            continue
        pos = find_pos(out, spec["anchor"], spec["at"], "jfig:" + spec["name"])
        out = out[:pos] + figs[spec["name"]] + "\n" + out[pos:]
    if dry:
        print("dry-run : %d figures, %d compléments" % (len(FIGS), len(ADDS)))
    else:
        data = out
        if crlf:
            data = out.replace("\n", "\r\n")
            if not ends_crlf and data.endswith("\r\n"):
                data = data[:-2] + "\n"
        write_atomic(INDEX, data)
        changed = update_css()
        print("index.html écrit (%d figures, %d compléments) ; css %s" % (len(FIGS), len(ADDS), "mis à jour" if changed else "inchangé"))
    for w in warns:
        print("AVERT", w)


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "--test":
        only = args[args.index("--only") + 1].split(",") if "--only" in args else None
        theme = args[args.index("--theme") + 1] if "--theme" in args else None
        width = args[args.index("--width") + 1] if "--width" in args else "480"
        run(dry=True, test_out=args[1], only=only, theme=theme, width=width)
    else:
        run(dry="--dry" in args)
