#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Générateur idempotent des schémas SVG de test5.html, final.html et eval-s40.html.

Usage :
    python tools/gen_test5_figs.py              # insère / met à jour les figures, le CSS et les blocs de texte
    python tools/gen_test5_figs.py --preview X  # écrit une page de test X (figures seules) à la racine du site

Chaque figure est encadrée par <!-- tfig:nom --> ... <!-- /tfig:nom --> : relancer le script remplace
le bloc existant au lieu de le dupliquer.  Le CSS vit entre /* tfig:debut */ et /* tfig:fin */ dans
css/style.css (le bloc /* jfig:debut */ d'un autre outil n'est jamais touché).
Aucune couleur en dur : uniquement les variables CSS de style.css (thèmes clair et sombre).
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

DEBUG = False  # --preview : ajoute data-mw pour mesurer les débordements dans le navigateur
W = 330  # largeur de toutes les figures (lisible à 360 px)


# --------------------------------------------------------------------------- dessin
def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


_TOK = re.compile(r"(\*[^*]+\*|~[^~]+~|_\{[^}]*\}|\^\{[^}]*\})")


def rich(s):
    """Mini-balisage : *gras*, ~code~, _{indice}, ^{exposant}."""
    out, pend = [], 0
    for p in _TOK.split(s):
        if not p:
            continue
        dy = ' dy="%d"' % (-pend) if pend else ""
        if p[0] == "*" and p[-1] == "*" and len(p) > 2:
            out.append('<tspan class="k"%s>%s</tspan>' % (dy, esc(p[1:-1])))
            pend = 0
        elif p[0] == "~" and p[-1] == "~" and len(p) > 2:
            out.append('<tspan class="m"%s>%s</tspan>' % (dy, esc(p[1:-1])))
            pend = 0
        elif p.startswith("_{"):
            out.append('<tspan font-size="9" dy="%d">%s</tspan>' % (3 - pend, esc(p[2:-1])))
            pend = 3
        elif p.startswith("^{"):
            out.append('<tspan font-size="9" dy="%d">%s</tspan>' % (-4 - pend, esc(p[2:-1])))
            pend = -4
        else:
            out.append('<tspan%s>%s</tspan>' % (dy, esc(p)) if dy else esc(p))
            pend = 0
    return "".join(out)


def plain(s):
    return _TOK.sub(lambda m: m.group(0)[2:-1] if m.group(0)[0] in "_^" else m.group(0)[1:-1], s)


class Fig:
    def __init__(self, name, h, label, caption):
        self.name, self.w, self.h, self.label, self.caption = name, W, h, label, caption
        self.parts = []
        self.markers = set()
        self.warnings = []

    # --- primitives
    def mid(self, key):
        self.markers.add(key)
        return "url(#tm-%s-%s)" % (self.name, key)

    def rect(self, x, y, w, h, cls="bx", rx=6):
        self.parts.append('<rect class="%s" x="%g" y="%g" width="%g" height="%g" rx="%g"/>' % (cls, x, y, w, h, rx))

    def text(self, x, y, s, cls="", anchor="middle", maxw=None):
        a = ' text-anchor="%s"' % anchor
        if DEBUG and maxw is not None:
            a += ' data-mw="%d"' % maxw
        c = ' class="%s"' % cls if cls else ""
        self.parts.append('<text x="%g" y="%g"%s%s>%s</text>' % (x, y, c, a, rich(s)))

    def box(self, x, y, w, h, lines, cls="bx", lh=14, anchor="middle", pad=6):
        self.rect(x, y, w, h, cls)
        n = len(lines)
        y0 = y + h / 2.0 - (n - 1) * lh / 2.0 + 4
        for i, ln in enumerate(lines):
            t, c = (ln, "") if isinstance(ln, str) else ln
            tx = x + w / 2.0 if anchor == "middle" else x + pad
            self.text(tx, y0 + i * lh, t, c, anchor, maxw=w - 2 * pad + 2)

    def arrow(self, pts, cls="ln", mk="k"):
        d = "M" + " L".join("%g %g" % p for p in pts)
        self.parts.append('<path class="%s" d="%s" marker-end="%s"/>' % (cls, d, self.mid(mk)))

    def line(self, pts, cls="ln"):
        d = "M" + " L".join("%g %g" % p for p in pts)
        self.parts.append('<path class="%s" d="%s"/>' % (cls, d))

    def badge(self, x, y, n):
        self.parts.append('<circle class="nb" cx="%g" cy="%g" r="8"/>' % (x, y))
        self.parts.append('<text class="nt" x="%g" y="%g" text-anchor="middle">%s</text>' % (x, y + 4, n))

    def cross(self, x, y, r=6):
        self.parts.append('<path class="ln r" d="M%g %g L%g %g M%g %g L%g %g"/>' % (x - r, y - r, x + r, y + r, x - r, y + r, x + r, y - r))

    def life(self, x, y1, y2):
        self.parts.append('<path class="life" d="M%g %g L%g %g"/>' % (x, y1, x, y2))

    # --- sortie
    def defs(self):
        d = []
        for k in sorted(self.markers):
            if k == "tri":
                d.append('<marker id="tm-%s-tri" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse">'
                         '<path class="mk tri" d="M1 1 L9 5 L1 9 z"/></marker>' % self.name)
            else:
                d.append('<marker id="tm-%s-%s" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">'
                         '<path class="mk %s" d="M0 0.5 L8.5 4.5 L0 8.5 z"/></marker>' % (self.name, k, "" if k == "k" else k))
        return "<defs>%s</defs>" % "".join(d) if d else ""

    def html(self):
        svg = '<svg viewBox="0 0 %d %d" role="img" aria-label="%s">%s\n%s\n</svg>' % (
            self.w, self.h, esc(self.label).replace('"', "&quot;"), self.defs(), "\n".join(self.parts))
        return ('<figure class="ev-fig tfig">\n%s\n<figcaption>%s</figcaption>\n</figure>' % (svg, self.caption))


# --------------------------------------------------------------------------- figures Test 5
def fig_exc_hierarchie():
    f = Fig("exc-hierarchie", 312,
            "Hiérarchie des exceptions : Throwable se divise en Error et Exception ; RuntimeException n'est pas vérifiée, les autres sous-classes d'Exception le sont",
            "<b>À retenir :</b> seules les <code>RuntimeException</code> (et les <code>Error</code>) échappent à l'obligation de "
            "<code>try/catch</code> ou <code>throws</code>. Tout autre descendant de <code>Exception</code>, y compris les tiennes, est vérifié.")
    f.box(8, 6, 112, 26, [("Throwable", "m k")], "bx p")
    f.line([(22, 32), (22, 115)])
    f.box(36, 42, 286, 52, [("Error", "m k"), ("StackOverflowError, OutOfMemoryError", "s"),
                              ("erreurs graves de la JVM : on ne les traite pas", "s")], "bx p")
    f.line([(22, 67), (36, 67)])
    f.box(36, 102, 286, 26, [("Exception : à traiter", "m k")], "bx p")
    f.line([(22, 115), (36, 115)])
    f.line([(50, 128), (50, 266)])
    f.box(64, 138, 258, 80, [("RuntimeException : non vérifiée", "m k"),
                               ("NullPointerException, ArithmeticException,", "s"),
                               ("ArrayIndexOutOfBoundsException,", "s"),
                               ("ClassCastException, NumberFormatException", "s"),
                               ("aucune obligation : ni try ni throws", "s g k")], "bx g")
    f.line([(50, 178), (64, 178)])
    f.box(64, 226, 258, 80, [("Toutes les autres : vérifiées", "m k"),
                               ("IOException ⊃ FileNotFoundException,", "s"),
                               ("ClassNotFoundException,", "s"),
                               ("tes classes « extends Exception »", "s"),
                               ("try/catch ou throws OBLIGATOIRE", "s r k")], "bx r")
    f.line([(50, 266), (64, 266)])
    f.h = 314
    return f


def fig_exc_flux():
    f = Fig("exc-flux", 238,
            "Trois chemins d'exécution d'un try/catch/finally : sans exception, exception attrapée, exception non attrapée",
            "<b>À retenir :</b> le <code>finally</code> s'exécute dans les trois cas (sauf <code>System.exit</code>). Un seul <code>catch</code> "
            "s'exécute, le premier compatible. Si aucun ne convient, la suite de la méthode est sautée : l'exception remonte à l'appelant.")
    xs, cw = [54, 144, 234], 88
    heads = [["1 · Aucune", "exception"], ["2 · Exception", "attrapée"], ["3 · Exception", "non attrapée"]]
    for x, hd in zip(xs, heads):
        f.text(x + cw / 2, 16, hd[0], "k", maxw=cw)
        f.text(x + cw / 2, 30, hd[1], "k", maxw=cw)
    rows = [("try", 40, 38), ("catch", 88, 38), ("finally", 136, 30), ("suite", 176, 52)]
    cells = {
        "try": [(["bloc entier"], "bx g"), (["arrêt à la ligne", "qui lance"], "bx a"), (["arrêt à la ligne", "qui lance"], "bx a")],
        "catch": [(["sauté"], "bx s"), (["un seul", "exécuté"], "bx g"), (["aucun ne", "convient"], "bx r")],
        "finally": [(["exécuté"], "bx g")] * 3,
        "suite": [(["exécutée"], "bx g"), (["exécutée"], "bx g"), (["NON exécutée", "l'exception", "remonte"], "bx r")],
    }
    for name, y, h in rows:
        f.text(48, y + h / 2 + 4, name, "m k", "end")
        for i, x in enumerate(xs):
            lines, cls = cells[name][i]
            f.box(x, y, cw, h, [(l, "s" if cls == "bx s" else "") for l in lines], cls, lh=13, pad=3)
    for i, x in enumerate(xs):
        cx = x + cw / 2
        for (_, y, h), (_, y2, _h2) in zip(rows[:-1], rows[1:]):
            f.arrow([(cx, y + h), (cx, y2 - 1)], "ln m")
    return f


def fig_exc_catch():
    f = Fig("exc-catch-ordre", 280,
            "Ordre des blocs catch : du plus précis au plus général ; mère avant fille ne compile pas",
            "<b>À retenir :</b> les <code>catch</code> sont essayés de haut en bas, le premier compatible gagne. Du plus précis au plus général : "
            "mettre la mère avant sa fille est une erreur de <b>compilation</b>, pas d'exécution.")
    f.text(8, 14, "Bon ordre : fille avant mère", "h", "start")
    names = ["catch (FileNotFoundException e)", "catch (IOException e)", "catch (Exception e)"]
    tags = ["le plus précis", "", "le plus général"]
    for i, n in enumerate(names):
        y = 24 + i * 40
        f.badge(20, y + 13, i + 1)
        f.box(36, y, 286, 26, [(n, "m")], "bx g")
        if i < 2:
            f.arrow([(179, y + 26), (179, y + 39)], "ln m")
            f.text(186, y + 36, "sinon, on essaie le suivant", "s", "start")
    f.text(8, 156, "Mère avant fille : ne compile pas", "h r", "start")
    f.box(36, 164, 286, 26, [("catch (Exception e)", "m")], "bx p")
    f.box(36, 198, 286, 26, [("catch (IOException e)", "m")], "bx r")
    f.cross(20, 211, 6)
    f.text(179, 242, "« exception IOException has already been caught »", "s r")
    f.text(179, 262, "multi-catch : catch (A | B e) avec A et B sans lien de parenté", "s")
    return f


def fig_fic_texte():
    f = Fig("fic-chaine-texte", 270,
            "Chaîne de flux pour un fichier texte : PrintWriter enveloppe FileWriter pour écrire ; Scanner ou FileReader puis BufferedReader pour lire",
            "<b>À retenir :</b> un flux se construit <b>autour</b> d'un autre et on utilise le plus externe (<code>PrintWriter</code>, "
            "<code>BufferedReader</code>). Ouvrir un fichier peut échouer : <code>try/catch</code> obligatoire.")
    f.text(83, 14, "ÉCRIRE", "h")
    f.text(83, 28, "données vers le fichier", "s")
    f.text(247, 14, "LIRE", "h")
    f.text(247, 28, "fichier vers les données", "s")
    f.box(8, 38, 150, 40, [("PrintWriter", "m k"), ("println(\"Alice;20\")", "m s")], "bx t")
    f.arrow([(83, 78), (83, 94)])
    f.box(8, 94, 150, 54, [("FileWriter(nom)", "m k"), ("(nom) : écrase", "s"), ("(nom, true) : ajoute", "s")], "bx t")
    f.arrow([(83, 148), (83, 164)])
    f.box(8, 164, 150, 34, [("fichier notes.txt", "m k")], "bx a")
    f.box(8, 212, 150, 50, [("close() ou try-with-", "s"), ("resources : le tampon", "s"), ("est vidé vers le disque", "s")], "bx p")
    f.box(172, 38, 150, 34, [("fichier notes.txt", "m k")], "bx a")
    f.arrow([(247, 72), (247, 88)])
    f.box(172, 88, 150, 54, [("Scanner(new File(f))", "m k s"), ("ou FileReader(f)", "m s"), ("FileNotFoundException", "s r")], "bx t")
    f.arrow([(247, 142), (247, 158)])
    f.box(172, 158, 150, 46, [("BufferedReader", "m k"), ("readLine()", "m s"), ("null = fin du fichier", "s")], "bx t")
    f.arrow([(247, 204), (247, 220)])
    f.box(172, 220, 150, 42, [("String en main", "k"), ("split(\";\"), parseInt…", "m s")], "bx p")
    return f


def fig_fic_serial():
    f = Fig("fic-serial-chaine", 270,
            "Sérialisation : un ObjectOutputStream enveloppe un FileOutputStream pour sauver ; un ObjectInputStream enveloppe un FileInputStream pour charger, avec un cast",
            "<b>À retenir :</b> un flux d'<b>objets</b> enveloppe un flux d'<b>octets</b>. À la lecture, <code>readObject()</code> rend un "
            "<code>Object</code> : cast obligatoire, et on relit dans l'ordre d'écriture.")
    f.text(83, 14, "SAUVER", "h")
    f.text(83, 34, "out.writeObject(liste)", "m s")
    f.arrow([(83, 40), (83, 66)])
    f.rect(8, 66, 150, 140, "bx t")
    f.text(83, 84, "ObjectOutputStream", "m k s", maxw=140)
    f.rect(22, 94, 122, 100, "bx p")
    f.text(83, 110, "FileOutputStream", "m s", maxw=116)
    f.box(36, 124, 94, 56, [("etu.ser", "m k"), ("octets", "s")], "bx a")
    f.text(247, 14, "CHARGER", "h")
    f.box(177, 20, 140, 24, [("Object, puis cast", "m s")], "bx g")
    f.arrow([(247, 66), (247, 45)])
    f.text(241, 60, "in.readObject()", "m s lb", "end")
    f.rect(172, 66, 150, 140, "bx t")
    f.text(247, 84, "ObjectInputStream", "m k s", maxw=140)
    f.rect(186, 94, 122, 100, "bx p")
    f.text(247, 110, "FileInputStream", "m s", maxw=116)
    f.box(200, 124, 94, 56, [("etu.ser", "m k"), ("octets", "s")], "bx a")
    f.box(8, 216, 314, 44, [("relire dans le même ordre qu'écrit ; EOFException à la fin", "s"),
                              ("readObject() : IOException + ClassNotFoundException", "s")], "bx p")
    return f


def fig_fic_transient():
    f = Fig("fic-transient", 214,
            "Avant et après sérialisation : nom et moyenne reviennent identiques, le champ transient revient à null, le champ static n'est pas dans le fichier",
            "<b>À retenir :</b> seuls les attributs d'instance non <code>transient</code> sont écrits. Les autres reprennent leur valeur par défaut "
            "(<code>null</code>, <code>0</code>, <code>false</code>) et <b>aucun constructeur</b> n'est rappelé.")
    xs = [(8, 100), (112, 90), (204, 118)]
    for (x, w), t in zip(xs, ["champ", "écrit", "relu"]):
        f.box(x, 6, w, 24, [(t, "h")], "bx p")
    rows = [
        ("nom", None, '"Alice"', '"Alice"', "bx g", 28),
        ("moyenne", None, "15.5", "15.5", "bx g", 28),
        ("motDePasse", "transient", '"secret"', "null", "bx r", 40),
        ("compteur", "static", "hors fichier", "valeur de la classe", "bx r", 40),
    ]
    y = 36
    for nom, tag, av, ap, cls, h in rows:
        f.rect(xs[0][0], y, xs[0][1], h, "bx p")
        if tag:
            f.text(xs[0][0] + 8, y + h / 2 - 2, nom, "m k", "start", maxw=92)
            f.text(xs[0][0] + 8, y + h / 2 + 12, tag, "s", "start")
        else:
            f.text(xs[0][0] + 8, y + h / 2 + 4, nom, "m k", "start")
        f.box(xs[1][0], y, xs[1][1], h, [(av, "m s")], "bx p")
        f.box(xs[2][0], y, xs[2][1], h, [(ap, "m s" if ap.startswith('"') or ap in ("null", "15.5") else "s")], cls, pad=3)
        y += h + 6
    f.text(165, 206, "valeurs par défaut : 0, false, null", "s")
    return f


def fig_swing_arbre():
    f = Fig("swing-arbre", 242,
            "Arbre des composants de la fenêtre IHMTel et son dessin : JTextField au nord, JButton OK au centre, Cadran en GridLayout 4 par 3 au sud",
            "<b>À retenir :</b> un conteneur contient des composants et son layout les place ; un <code>JPanel</code> imbriqué peut avoir un autre "
            "layout (ici <code>GridLayout</code>). Même couleur = même composant dans l'arbre et dans la fenêtre.")
    f.box(8, 6, 192, 40, [("IHMTel extends JFrame", "m k"), ("contentPane : BorderLayout", "s")], "bx p")
    f.line([(22, 46), (22, 148)])
    f.box(36, 56, 164, 26, [("NORTH : JTextField", "m")], "bx t", pad=3)
    f.line([(22, 69), (36, 69)])
    f.box(36, 92, 164, 26, [("CENTER : JButton", "m")], "bx a", pad=3)
    f.line([(22, 105), (36, 105)])
    f.box(36, 128, 164, 42, [("SOUTH : Cadran", "m k"), ("JPanel, GridLayout(4, 3)", "s")], "bx p")
    f.line([(22, 148), (36, 148)])
    f.line([(50, 170), (50, 212)])
    f.box(64, 190, 136, 44, [("12 × JButton", "m k"), ("1 à 9, Bis, 0, Reset", "s")], "bx p")
    f.line([(50, 212), (64, 212)])
    # fenêtre dessinée
    f.rect(210, 6, 112, 228, "bx p")
    f.box(210, 6, 112, 16, [("IHMTel", "s")], "bx p", lh=12)
    f.box(216, 28, 100, 20, [("NORTH", "s")], "bx t", lh=12)
    f.box(216, 52, 100, 36, [("OK", "m k")], "bx a")
    f.rect(216, 94, 100, 134, "bx p")
    labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Bis", "0", "Reset"]
    for i, lab in enumerate(labels):
        cx, cy = 219 + (i % 3) * 32, 99 + (i // 3) * 32
        f.box(cx, cy, 30, 28, [(lab, "m xs")], "bx p", lh=12, pad=1)
    return f


def fig_swing_evt():
    f = Fig("swing-evenement", 250,
            "Cycle d'un événement Swing : l'écouteur s'abonne au bouton une fois, puis chaque clic de l'utilisateur appelle actionPerformed",
            "<b>À retenir :</b> sans <code>addActionListener</code>, le clic ne fait rien. La source crée l'événement puis appelle "
            "<code>actionPerformed</code> sur chaque écouteur abonné ; <code>e.getSource()</code> dit quel bouton a été cliqué.")
    U, B, L = 52, 165, 278
    for cx, lines, cls in [(U, [("Utilisateur", "k")], "bx p"), (B, [("JButton", "m k"), ("la source", "s")], "bx t"),
                           (L, [("Écouteur", "k"), ("ActionListener", "s")], "bx a")]:
        f.box(cx - 48, 4, 96, 34, lines, cls)
        f.life(cx, 38, 246)
    f.text(8, 54, "Au démarrage, une seule fois", "h lb", "start")
    f.arrow([(L, 84), (B + 2, 84)], "ln d a", "a")
    f.text(221, 78, "addActionListener(l)", "m s lb")
    f.line([(8, 100), (322, 100)], "ln m d")
    f.text(8, 116, "À chaque clic", "h lb", "start")
    f.arrow([(U, 138), (B - 2, 138)])
    f.text(108, 132, "clic", "k lb")
    f.box(113, 148, 104, 32, [("ActionEvent e", "m k s"), ("créé par la source", "s")], "bx a")
    f.arrow([(B, 196), (L - 2, 196)])
    f.text(221, 190, "actionPerformed(e)", "m s lb")
    f.box(230, 204, 96, 36, [("e.getSource()", "m k s"), ("= quel bouton ?", "s")], "bx g")
    f.badge(24, 84, "0")
    f.badge(24, 138, "1")
    f.badge(24, 196, "2")
    return f


def fig_mvc_qui():
    f = Fig("mvc-connaissances", 252,
            "Qui connaît qui en MVC : le contrôleur connaît la vue et le modèle ; le modèle ne connaît que l'interface CompteurListener que la vue implémente",
            "<b>À retenir :</b> trait plein = « connaît / appelle ». Le contrôleur connaît la vue et le modèle ; le modèle ne connaît que "
            "l'interface <code>CompteurListener</code>, jamais la vue, jamais Swing.")
    f.box(106, 6, 118, 40, [("CONTRÔLEUR", "k"), ("ActionListener", "m s")], "bx a")
    f.box(6, 112, 118, 46, [("VUE", "k"), ("JFrame, JLabel…", "m s")], "bx t")
    f.box(206, 112, 118, 46, [("MODÈLE", "k"), ("données + règles", "s")], "bx g")
    f.box(108, 200, 114, 44, [("«interface»", "s"), ("CompteurListener", "m k s")], "bx p")
    f.arrow([(132, 46), (70, 112)])
    f.text(76, 74, "connaît", "s lb")
    f.arrow([(198, 46), (262, 112)])
    f.text(256, 74, "connaît", "s lb")
    f.arrow([(70, 158), (128, 200)], "ln d", "tri")
    f.text(54, 188, "implements", "s", "start")
    f.arrow([(262, 158), (204, 200)])
    f.text(276, 188, "liste d'abonnés", "s", "end")
    f.line([(204, 135), (126, 135)], "ln r d")
    f.cross(165, 135, 6)
    f.text(165, 155, "jamais", "s r k")
    return f


def fig_mvc_exc():
    f = Fig("mvc-exception", 270,
            "Chemin d'une exception métier : la vue envoie le clic au contrôleur, le modèle lance l'exception, le contrôleur l'attrape et demande à la vue d'afficher l'erreur",
            "<b>À retenir :</b> l'exception métier naît dans le <b>modèle</b>, est attrapée par le <b>contrôleur</b>, affichée par la <b>vue</b>. "
            "Le <code>throw</code> arrive avant toute modification : le modèle ne prévient pas la vue.")
    V, C, M = 52, 165, 278
    for cx, t, cls in [(V, "VUE", "bx t"), (C, "CONTRÔLEUR", "bx a"), (M, "MODÈLE", "bx g")]:
        f.box(cx - 48, 4, 96, 28, [(t, "k")], cls)
        f.life(cx, 32, 258)
    f.arrow([(V, 62), (C - 2, 62)])
    f.text(108, 56, "actionPerformed", "m s lb")
    f.arrow([(C, 96), (M - 2, 96)])
    f.text(221, 90, "incrementer()", "m s lb")
    f.box(230, 104, 96, 50, [("valeur >= max", "m s"), ("→ throw", "m s k"), ("rien modifié", "s")], "bx r")
    f.arrow([(M - 4, 176), (C + 2, 176)], "ln d r", "r")
    f.text(221, 170, "IllegalStateException", "m s lb")
    f.box(113, 186, 104, 22, [("catch (…)", "m s")], "bx a")
    f.arrow([(C, 226), (V + 2, 226)])
    f.text(108, 220, "afficherErreur(msg)", "m s lb")
    f.box(4, 240, 96, 22, [("affiche l'erreur", "s")], "bx t")
    f.badge(24, 62, "1")
    f.badge(24, 96, "2")
    f.badge(24, 176, "3")
    f.badge(24, 226, "4")
    return f


# --------------------------------------------------------------------------- figures évaluation finale
def fig_fin_refs():
    f = Fig("fin-references", 262,
            "Références : a et b désignent le même objet, c un autre objet de même contenu ; == compare les adresses, equals le contenu",
            "<b>À retenir :</b> une variable objet contient une <b>adresse</b>. <code>b = a</code> copie l'adresse (un seul objet), "
            "<code>==</code> compare les adresses, <code>equals</code> compare le contenu.")
    f.text(165, 14, 'String a = "hi";   String b = a;', "m s")
    f.text(165, 30, 'String c = new String("hi");', "m s")
    f.text(50, 54, "variables", "s")
    f.text(250, 54, "objets", "s")
    for i, n in enumerate("abc"):
        f.box(14, 62 + i * 34, 72, 24, [(n, "m k")], "bx p")
    f.box(200, 66, 100, 40, [('"hi"', "m k"), ("objet n°1", "s")], "bx t")
    f.box(200, 124, 100, 40, [('"hi"', "m k"), ("objet n°2", "s")], "bx t")
    f.arrow([(86, 74), (200, 82)], "ln", "k")
    f.arrow([(86, 108), (200, 94)], "ln", "k")
    f.arrow([(86, 142), (200, 144)], "ln", "k")
    rows = [("a == b", "true : même objet", "bx g", "g"), ("a == c", "false : deux objets", "bx r", "r"),
            ("a.equals(c)", "true : même contenu", "bx g", "g")]
    for i, (e, r, cls, tc) in enumerate(rows):
        y = 180 + i * 28
        f.rect(8, y, 314, 24, cls)
        f.text(18, y + 16, e, "m k", "start")
        f.text(312, y + 16, r, "k " + tc, "end")
    return f


def fig_fin_valeur():
    f = Fig("fin-passage-valeur", 300,
            "Passage par valeur : la méthode reçoit une copie de la référence ; modifier l'objet est visible chez l'appelant, réaffecter le paramètre ne l'est pas",
            "<b>À retenir :</b> la méthode reçoit une <b>copie</b> de la référence. Elle peut modifier l'objet pointé, mais réaffecter son "
            "paramètre ne change pas la variable de l'appelant (et un <code>int</code> est copié : l'original ne bouge jamais).")
    f.text(165, 16, "void m(Point p) { p.x = 9;  p = new Point(); }", "m s")
    for k, (y0, title) in enumerate([(30, "1 · p.x = 9 : on modifie l'objet"), (146, "2 · p = new Point() : on change p seulement")]):
        h = 108 if k == 0 else 112
        f.rect(8, y0, 314, h, "bx p")
        f.text(18, y0 + 16, title, "h", "start")
    # panneau 1
    f.box(18, 62, 92, 24, [("pt (appelant)", "m s")], "bx t", pad=2)
    f.box(18, 94, 92, 24, [("p (copie)", "m s")], "bx t", pad=2)
    f.box(210, 68, 100, 44, [("Point", "m k"), ("x = 9", "m")], "bx a")
    f.arrow([(110, 74), (210, 82)])
    f.arrow([(110, 106), (210, 98)])
    f.text(165, 132, "même objet : visible chez l'appelant", "s g k")
    # panneau 2
    f.box(18, 180, 92, 24, [("pt (appelant)", "m s")], "bx t", pad=2)
    f.box(18, 214, 92, 24, [("p (copie)", "m s")], "bx t", pad=2)
    f.box(210, 168, 100, 34, [("Point", "m k s"), ("x = 9", "m s")], "bx a", lh=12)
    f.box(210, 212, 100, 34, [("nouveau Point", "m k s"), ("x = 0", "m s")], "bx p", lh=12)
    f.arrow([(110, 190), (210, 186)])
    f.arrow([(110, 226), (210, 229)], "ln a", "a")
    f.text(165, 266, "seul p est redirigé : pt ne bouge pas", "s r k")
    f.h = 284
    return f


def fig_fin_regards():
    f = Fig("fin-deux-regards", 282,
            "Type déclaré et type réel : Mere m = new Fille() ; le compilateur regarde le type déclaré, l'exécution regarde le type réel pour les méthodes redéfinies",
            "<b>À retenir :</b> le compilateur ne regarde que le type <b>déclaré</b> à gauche. À l'exécution, seule une méthode "
            "<b>redéfinie</b> (non <code>static</code>) suit le type <b>réel</b> de l'objet.")
    f.box(8, 8, 112, 42, [("Mere m", "m k"), ("type déclaré", "s")], "bx t")
    f.arrow([(120, 29), (200, 29)])
    f.box(200, 8, 122, 42, [("new Fille()", "m k"), ("type réel", "s")], "bx g")
    rows = [
        ("déclaré", "bx t", ["Ça compile ? Seules les méthodes", "de Mere sont permises sur m"]),
        ("réel", "bx g", ["Méthode redéfinie : on exécute", "la version de Fille"]),
        ("déclaré", "bx t", ["Surcharge m(Figure) / m(Cercle) :", "choisie à la compilation"]),
        ("déclaré", "bx t", ["Attribut m.x, méthode static :", "ceux de Mere, jamais polymorphes"]),
        ("réel", "bx g", ["instanceof, getClass(), cast :", "testés sur l'objet réel"]),
    ]
    for i, (chip, cls, ls) in enumerate(rows):
        y = 64 + i * 44
        f.box(8, y, 70, 38, [(chip, "k")], cls)
        f.box(84, y, 238, 38, [(l, "") for l in ls], "bx p", lh=14, anchor="start", pad=8)
    return f


def fig_fin_constr():
    f = Fig("fin-construction", 330,
            "Ordre d'exécution : new Fifille() appelle d'abord le constructeur de Maman, qui appelle getVal() de Fifille ; la sortie est FifilleMaman",
            "<b>À retenir :</b> le constructeur de la mère s'exécute avant celui de la fille, et un appel à une méthode redéfinie y atteint "
            "déjà la version de la fille (annale 2025, question 16). Les attributs de la fille valent encore 0 ou <code>null</code>.")
    f.text(165, 14, "new Fifille();   new Maman();", "m s")
    steps = [(8, 24, 200, 30, ["1 · new Fifille()"], "bx p"),
             (28, 62, 224, 30, ["2 · Fifille() débute par super()"], "bx p"),
             (48, 100, 250, 30, ["3 · Maman() : print(this.getVal())"], "bx p"),
             (48, 138, 274, 46, ["4 · this est un Fifille : c'est le", "getVal() de Fifille qui affiche « Fifille »"], "bx g"),
             (28, 192, 224, 30, ["5 · fin du constructeur Fifille()"], "bx p"),
             (8, 236, 314, 44, ["6 · new Maman() : getVal() de Maman", "affiche « Maman »"], "bx t")]
    for x, y, w, h, ls, cls in steps:
        f.box(x, y, w, h, [(l, "") for l in ls], cls, anchor="start", pad=8)
    for y1, y2, dash in [(54, 62, ""), (92, 100, ""), (130, 138, ""), (184, 192, " d")]:
        f.arrow([(60, y1), (60, y2 - 1)], "ln" + (" m d" if dash else ""))
    f.box(8, 290, 314, 30, [("Sortie : FifilleMaman", "m k")], "bx a")
    return f


def fig_fin_static():
    f = Fig("fin-static", 272,
            "static : un attribut static existe une seule fois dans la classe, chaque objet garde sa propre copie des attributs d'instance",
            "<b>À retenir :</b> un attribut <code>static</code> existe une fois pour toute la classe ; chaque objet a sa propre copie des attributs "
            "d'instance. Une méthode <code>static</code> n'a pas de <code>this</code> : elle ne voit pas <code>id</code>.")
    f.box(8, 8, 314, 54, [("class Compteur", "m k"), ("static int nb = 3 : une seule copie, dans la classe", "s")], "bx a")
    for i in range(3):
        x = 8 + i * 109
        f.box(x, 110, 96, 46, [("objet " + "abc"[i], "m k"), ("int id = %d" % (i + 1), "m s")], "bx t")
        f.arrow([(x + 48, 110), (x + 48, 63)], "ln m d", "k")
    f.text(165, 92, "tous lisent le même nb", "s lb")
    f.box(8, 172, 314, 38, [("Compteur() { nb++; id = nb; }", "m s"), ("Compteur.nb → 3 ;  a.id → 1 ;  c.id → 3", "m s")], "bx p")
    f.box(8, 222, 314, 40, [("static int f() { return id; }", "m s"), ("erreur : id est un attribut d'instance", "s r k")], "bx r")
    return f


def fig_fin_abstr():
    f = Fig("fin-abstrait-interface", 326,
            "Classe abstraite et interface : Forme abstraite héritée par Cercle et Carre, Cercle implémente aussi Dessinable ; new Forme() est interdit",
            "<b>À retenir :</b> on n'instancie ni une classe abstraite ni une interface, mais on peut s'en servir comme type de variable. "
            "Une seule mère avec <code>extends</code>, autant d'interfaces que l'on veut avec <code>implements</code>.")
    f.box(8, 8, 156, 68, [("abstract Forme", "m k"), ("abstract double aire();", "m s"), ("getNom() concret", "m s")], "bx a")
    f.box(206, 8, 116, 56, [("«interface»", "s"), ("Dessinable", "m k"), ("dessiner()", "m s")], "bx t")
    f.box(8, 130, 100, 34, [("Carre", "m k")], "bx p")
    f.box(190, 130, 132, 34, [("Cercle", "m k")], "bx p")
    f.arrow([(58, 130), (58, 77)], "ln", "tri")
    f.arrow([(200, 130), (140, 77)], "ln", "tri")
    f.arrow([(264, 130), (264, 65)], "ln d", "tri")
    f.text(70, 108, "extends", "s", "start")
    f.text(272, 100, "implements", "s", "start")
    rows = [("new Forme()", "interdit : classe abstraite", "bx r", "r"),
            ("Forme f = new Cercle();", "OK : f.aire() de Cercle", "bx g", "g"),
            ("class X extends A, B", "interdit : une seule mère", "bx r", "r"),
            ("class X implements I, J", "OK : plusieurs interfaces", "bx g", "g")]
    for i, (code, res, cls, tc) in enumerate(rows):
        y = 186 + i * 34
        f.rect(8, y, 314, 28, cls)
        f.text(16, y + 18, code, "m s", "start")
        f.text(314, y + 18, res, "s k " + tc, "end")
    return f


def fig_fin_visib():
    f = Fig("fin-visibilite", 206,
            "Visibilité : private visible dans la classe seulement ; sans mot-clé dans le package ; protected dans le package et les classes filles ; public partout",
            "<b>À retenir :</b> <code>protected</code> = package + classes filles (même hors package). Sans mot-clé, une fille d'un autre package "
            "ne voit rien. Une redéfinition ne peut jamais être moins visible que la méthode de la mère.")
    xs = [92, 152, 212, 272]
    heads = [("même", "classe"), ("même", "package"), ("fille hors", "package"), ("ailleurs", "")]
    for x, (a, b) in zip(xs, heads):
        f.box(x, 6, 56, 34, [(t, "xs k") for t in (a, b) if t], "bx p", lh=12, pad=2)
    rows = [("private", [1, 0, 0, 0]), ("(rien)", [1, 1, 0, 0]), ("protected", [1, 1, 1, 0]), ("public", [1, 1, 1, 1])]
    for i, (nom, v) in enumerate(rows):
        y = 46 + i * 36
        f.box(8, y, 80, 30, [(nom, "m k")], "bx p")
        for x, ok in zip(xs, v):
            f.box(x, y, 56, 30, [("oui" if ok else "non", "k " + ("g" if ok else "r"))], "bx g" if ok else "bx r")
    return f


# --------------------------------------------------------------------------- figures éval écrite
def fig_ev_java():
    f = Fig("ev-chaine-java", 258,
            "De Machine.java à l'exécution : javac produit du bytecode, la JVM l'exécute ; JDK contient le JRE qui contient la JVM",
            "<b>À retenir :</b> <code>javac</code> compile en bytecode, la <b>JVM</b> l'exécute (QCM : « l'interprétation est faite par la JVM »). "
            "<code>String</code>, <code>Math</code>, <code>System</code> sont dans <code>java.lang</code>, importé automatiquement.")
    f.box(8, 8, 140, 40, [("Machine.java", "m k"), ("ton code source", "s")], "bx p")
    f.arrow([(78, 48), (78, 78)])
    f.text(88, 68, "javac", "m s", "start")
    f.box(8, 78, 140, 40, [("Machine.class", "m k"), ("bytecode", "s")], "bx a")
    f.arrow([(78, 118), (78, 148)])
    f.text(88, 138, "java", "m s", "start")
    f.box(8, 148, 140, 40, [("exécution", "k"), ("la JVM interprète", "s")], "bx g")
    f.rect(162, 8, 160, 200, "bx p")
    f.text(242, 26, "JDK = JRE + javac", "k s", maxw=150)
    f.rect(172, 36, 140, 164, "bx t")
    f.text(242, 54, "JRE", "k")
    f.text(242, 68, "= JVM + bibliothèques", "s", maxw=130)
    f.box(182, 80, 120, 110, [("JVM", "k"), ("exécute le", "s"), ("bytecode", "s")], "bx g")
    f.box(8, 216, 314, 34, [("java.lang : String, Math, System… importé automatiquement", "s")], "bx p")
    return f


def fig_ev_heritage():
    f = Fig("ev-heritage-objet", 272,
            "Objet Orc : il contient la partie héritée de Villain puis sa propre partie ; le constructeur de la mère construit sa partie en premier",
            "<b>À retenir :</b> un objet <code>Orc</code> contient la partie <code>Villain</code> puis la partie <code>Orc</code> ; "
            "<code>super(...)</code> (1<sup>re</sup> ligne) construit la partie héritée en premier. <code>protected</code> se lit dans la fille, <code>private</code> non.")
    f.text(94, 14, "un seul objet en mémoire", "s")
    f.rect(8, 22, 172, 142, "bx p")
    f.box(18, 32, 152, 60, [("partie Villain", "k"), ("force = 5", "m s"), ("(protected)", "s")], "bx g")
    f.box(18, 100, 152, 54, [("partie Orc", "k"), ("rage = 3", "m s"), ("(private)", "s")], "bx a")
    steps = [(26, ["1 · new Orc(5, 3)"]), (64, ["2 · super(force) :", "Villain d'abord"]), (112, ["3 · puis", "this.rage = rage"])]
    for y, ls in steps:
        h = 30 if len(ls) == 1 else 38
        f.box(192, y, 130, h, [(l, "") for l in ls], "bx p", anchor="start", pad=6)
    f.arrow([(257, 56), (257, 63)])
    f.arrow([(257, 102), (257, 111)])
    rows = [("Orc lit force", "oui : protected", "bx g", "g"), ("Villain lit rage", "non : propre à Orc", "bx r", "r"),
            ("Orc lit un private de Villain", "non : getter", "bx r", "r")]
    for i, (a, b, cls, tc) in enumerate(rows):
        y = 176 + i * 30
        f.rect(8, y, 314, 26, cls)
        f.text(16, y + 17, a, "m s", "start")
        f.text(314, y + 17, b, "s k " + tc, "end")
    return f


def fig_ev_list():
    f = Fig("ev-arraylist", 262,
            "ArrayList pas à pas : add(12), add(0, 5), set(1, 20) puis remove(0) et l'état de la liste après chaque appel",
            "<b>À retenir :</b> les indices commencent à 0 ; <code>add(i, x)</code> décale vers la droite, <code>remove(i)</code> vers la gauche. "
            "Pour supprimer un <code>Integer</code> par valeur : <code>remove(Integer.valueOf(x))</code>.")
    f.text(8, 18, "appel", "h", "start")
    f.text(176, 18, "indice 0", "s")
    f.text(222, 18, "indice 1", "s")
    ops = [("new ArrayList<>()", [], []), ("v.add(12)", [12], [0]), ("v.add(0, 5)", [5, 12], [0]),
           ("v.set(1, 20)", [5, 20], [1]), ("v.remove(0)", [20], [])]
    for i, (op, vals, hot) in enumerate(ops):
        y = 28 + i * 42
        f.rect(8, y, 132, 34, "bx p")
        f.text(16, y + 21, op, "m s", "start", maxw=120)
        for j in range(2):
            x = 154 + j * 46
            if j < len(vals):
                f.box(x, y, 42, 34, [(str(vals[j]), "m k")], "bx a" if j in hot else "bx t")
            else:
                f.box(x, y, 42, 34, [("", "")], "bx s")
        f.text(318, y + 21, "vide" if not vals else "size() = %d" % len(vals), "s", "end")
    f.text(165, 250, "v.get(1) juste avant le set → 12", "m s")
    return f


FIGS = {
    # Test 5
    "exc-hierarchie": fig_exc_hierarchie, "exc-flux": fig_exc_flux, "exc-catch-ordre": fig_exc_catch,
    "fic-chaine-texte": fig_fic_texte, "fic-serial-chaine": fig_fic_serial, "fic-transient": fig_fic_transient,
    "swing-arbre": fig_swing_arbre, "swing-evenement": fig_swing_evt,
    "mvc-connaissances": fig_mvc_qui, "mvc-exception": fig_mvc_exc,
    # Évaluation finale
    "fin-references": fig_fin_refs, "fin-passage-valeur": fig_fin_valeur, "fin-deux-regards": fig_fin_regards,
    "fin-construction": fig_fin_constr, "fin-static": fig_fin_static, "fin-abstrait-interface": fig_fin_abstr,
    "fin-visibilite": fig_fin_visib,
    # Éval écrite
    "ev-chaine-java": fig_ev_java, "ev-heritage-objet": fig_ev_heritage, "ev-arraylist": fig_ev_list,
}

# (fichier, nom, position, ancre)  : l'ancre est une chaîne qui doit exister une seule fois dans le fichier.
H3 = '<h3 class="ev-h3">%s</h3>'
PLACEMENT = [
    ("test5.html", "exc-hierarchie", "after", '<p class="ev-small">Question type : « laquelle est non vérifiée ? »'),
    ("test5.html", "exc-flux", "before", H3 % "3. Suivre l'exécution : la pile d'appels"),
    ("test5.html", "exc-catch-ordre", "before", H3 % "5. Quand le compilateur refuse"),
    ("test5.html", "fic-chaine-texte", "after", H3 % "1. Fichier texte : écrire puis relire"),
    ("test5.html", "fic-serial-chaine", "after", H3 % "2. Sérialisation : sauver et recharger une liste"),
    ("test5.html", "fic-transient", "before", "</section>\n\n<!-- ================= SWING ================= -->"),
    ("test5.html", "swing-arbre", "before", H3 % "2. Les layouts en dessin"),
    ("test5.html", "swing-evenement", "before", H3 % "3. Un listener, trois écritures équivalentes"),
    ("test5.html", "mvc-connaissances", "before", H3 % "Le compteur MVC, en 4 classes, expliqué"),
    ("test5.html", "mvc-exception", "before", '  <div class="ev-grid">\n    <div class="ev-card"><h4>Qui connaît qui ?</h4>'),
    ("eval-s40.html", "ev-chaine-java", "after", "    <h2>Les bases : classe, objet, tableaux, String, Scanner</h2>\n  </div>"),
    ("eval-s40.html", "ev-heritage-objet", "before", "</section>\n\n<!-- ================= S3 ================= -->"),
    ("eval-s40.html", "ev-arraylist", "before", '  <div class="tbl-wrap ev-stack"><table class="tbl">\n    <thead><tr><th>Tri</th>'),
]
FINAL_GROUP = ["fin-references", "fin-passage-valeur", "fin-deux-regards", "fin-construction", "fin-static",
               "fin-abstrait-interface", "fin-visibilite"]
FINAL_ANCHOR = '  <div class="trap-list">'


# --------------------------------------------------------------------------- insertion idempotente
def read(path):
    with open(path, "rb") as fh:
        raw = fh.read().decode("utf-8")
    crlf = "\r\n" in raw
    return raw.replace("\r\n", "\n"), crlf


def write(path, text, crlf):
    data = (text.replace("\n", "\r\n") if crlf else text).encode("utf-8")
    tmp = path + ".tmp"
    try:
        with open(path, "wb") as fh:
            fh.write(data)
    except OSError:
        with open(tmp, "wb") as fh:
            fh.write(data)
        os.replace(tmp, path)


def put_block(text, name, block, where, anchor):
    start, end = "<!-- tfig:%s -->" % name, "<!-- /tfig:%s -->" % name
    full = "%s\n%s\n%s" % (start, block, end)
    if start in text:
        i = text.index(start)
        j = text.index(end, i) + len(end)
        return text[:i] + full + text[j:]
    n = text.count(anchor)
    if n != 1:
        raise SystemExit("ancre introuvable ou ambiguë (%d) pour %s : %r" % (n, name, anchor[:60]))
    k = text.index(anchor)
    if where == "before":
        ls = text.rfind(chr(10), 0, k) + 1
        if text[ls:k].strip() == "":
            k = ls  # le bloc commence avant l'indentation de la ligne d'ancre
        return text[:k] + full + "\n\n" + text[k:]
    k += len(anchor)
    nl = text.find("\n", k)
    nl = len(text) if nl < 0 else nl
    return text[:nl] + "\n" + full + text[nl:]


def build_all():
    figs = {}
    for name, fn in FIGS.items():
        fg = fn()
        for w in fg.warnings:
            print("ATTENTION", w)
        figs[name] = fg
    return figs


def inner(name, fg):
    return "<!-- tfig:%s -->\n%s\n<!-- /tfig:%s -->" % (name, fg.html(), name)


def run():
    from tfig_prose import PROSE, PROSE_PLACEMENT
    figs = build_all()
    pages = {}

    def page(p):
        if p not in pages:
            pages[p] = read(os.path.join(ROOT, p))
        return pages[p]

    for p, name, where, anchor in PLACEMENT:
        text, crlf = page(p)
        pages[p] = (put_block(text, name, figs[name].html(), where, anchor), crlf)
    # groupe de l'évaluation finale
    text, crlf = page("final.html")
    group = ('<h3 class="ev-h3">Sept schémas à savoir refaire</h3>\n<div class="tfig-grid">\n%s\n</div>\n'
             '<h3 class="ev-h3">Les pièges en une ligne</h3>' % "\n".join(inner(n, figs[n]) for n in FINAL_GROUP))
    pages["final.html"] = (put_block(text, "grp-final", group, "before", FINAL_ANCHOR), crlf)
    # blocs de texte (compléments)
    for p, name, where, anchor in PROSE_PLACEMENT:
        text, crlf = page(p)
        pages[p] = (put_block(text, name, PROSE[name], where, anchor), crlf)
    for p, (text, crlf) in pages.items():
        write(os.path.join(ROOT, p), text, crlf)
    css()
    print("OK :", len(figs), "figures,", len(PROSE_PLACEMENT), "blocs de texte")


def css():
    from tfig_css import CSS
    path = os.path.join(ROOT, "css", "style.css")
    text, crlf = read(path)  # relu juste avant l'écriture
    start, end = "/* tfig:debut */", "/* tfig:fin */"
    block = "%s\n%s\n%s" % (start, CSS.strip("\n"), end)
    if start in text:
        i = text.index(start)
        j = text.index(end, i) + len(end)
        text = text[:i] + block + text[j:]
    else:
        text = text.rstrip("\n") + "\n" + block + "\n"
    write(path, text, crlf)


def preview(out):
    global DEBUG
    DEBUG = True
    figs = build_all()
    body = "\n".join(f.html() for f in figs.values())
    page = ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>apercu</title><link rel="stylesheet" href="css/style.css">'
            '<script>if(location.search.indexOf("dark")>=0)document.documentElement.setAttribute("data-theme","dark")</script>'
            '</head><body><main class="wrap ev-page ev-wrap" style="padding:8px 12px">%s</main><pre id="rep"></pre>'
            '<script>window.addEventListener("load",function(){var o=[];document.querySelectorAll("text[data-mw]").forEach(function(t){'
            'var w=t.getComputedTextLength();if(w>+t.dataset.mw)o.push(t.closest("svg").getAttribute("aria-label").slice(0,24)+" | "+t.textContent+" | "+Math.round(w)+">"+t.dataset.mw)});'
            'document.getElementById("rep").textContent="REPORT|"+o.join(" ## ")})</script></body></html>' % body)
    with open(os.path.join(ROOT, out), "w", encoding="utf-8") as fh:
        fh.write(page)
    print("aperçu :", out)


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--preview":
        preview(sys.argv[2])
    else:
        run()
