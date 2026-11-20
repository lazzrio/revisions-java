# -*- coding: utf-8 -*-
"""Compléments de texte (pièges, méthodes, checklists) insérés par gen_test5_figs.py.

Tout le code Java montré ici a été compilé et exécuté avec le JDK 21 (voir le rapport de la mission) ;
les sorties indiquées sont les vraies.
"""
import re


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def pre_hl(code):
    """Bloc de code de test5.html / final.html (coloré par le JavaScript de la page)."""
    return '<pre class="code hl">%s</pre>' % esc(code.strip("\n"))


def pre_out(text):
    return '<pre class="code">%s</pre>' % esc(text.strip("\n"))


_KW = set("abstract boolean break case catch char class continue default do double else extends final finally float for if "
          "implements import instanceof int interface long new null package private protected public return static super "
          "switch this throw throws try void while true false".split())
_TOK = re.compile(r'(//[^\n]*)|("(?:\\.|[^"\\])*")|(\b\d+(?:\.\d+)?\b)|(@?[A-Za-z_]\w*)')


def pre_col(code):
    """Bloc de code de eval-s40.html : coloration par <span> comme les blocs existants de la page."""
    code = code.strip("\n")
    out, pos = [], 0
    for m in _TOK.finditer(code):
        out.append(esc(code[pos:m.start()]))
        pos = m.end()
        t = m.group(0)
        if m.group(1):
            out.append('<span class="cmt">%s</span>' % esc(t))
        elif m.group(2):
            out.append('<span class="str">%s</span>' % esc(t))
        elif m.group(3):
            out.append('<span class="num">%s</span>' % t)
        else:
            nxt = code[m.end():m.end() + 1]
            if t in _KW or t == "@Override":
                out.append('<span class="kw">%s</span>' % t)
            elif t[0].isupper():
                out.append('<span class="cls">%s</span>' % t)
            elif nxt == "(":
                out.append('<span class="fn">%s</span>' % t)
            else:
                out.append(t)
    out.append(esc(code[pos:]))
    return '<pre class="code">%s</pre>' % "".join(out)


def table(heads, rows, labels=None):
    labels = labels or heads
    h = "".join("<th>%s</th>" % x for x in heads)
    b = ""
    for r in rows:
        b += "<tr>%s</tr>\n" % "".join('<td data-l="%s">%s</td>' % (labels[i], c) for i, c in enumerate(r))
    return '<div class="tbl-wrap ev-stack"><table class="tbl">\n<thead><tr>%s</tr></thead>\n<tbody>\n%s</tbody></table></div>' % (h, b)


def must(rows, trois=True):
    """Liste numérotée compacte (lisible sur téléphone) : code, ce qu'on croit, ce qui se passe."""
    out = []
    for r in rows:
        if trois:
            out.append("<li>%s<br><span class=\"ev-small\">Tu crois : %s</span><br><b>En réalité :</b> %s</li>" % tuple(r))
        else:
            out.append("<li><span class=\"ev-small\">Tu crois ou tu écris :</span> %s<br><b>En réalité :</b> %s</li>" % tuple(r))
    return '<ol class="ev-must">%s</ol>' % "".join(out)


def card(title, inner):
    return '<div class="ev-card"><h4>%s</h4>%s</div>' % (title, inner)


def ul(items):
    return "<ul>%s</ul>" % "".join("<li>%s</li>" % i for i in items)


PROSE = {}

# ------------------------------------------------------------------ Test 5 : exceptions
PROSE["txt-exc-throwable"] = "\n".join([
    '<h3 class="ev-h3">7. Ce que sait faire toute exception, et la syntaxe de throws</h3>',
    pre_hl('''
try { Integer.parseInt("abc"); }
catch (NumberFormatException e) {
    System.out.println(e.getMessage());   // For input string: "abc"
    System.out.println(e);                // java.lang.NumberFormatException: For input string: "abc"
    e.printStackTrace();                  // la pile d'appels, sur System.err : le programme continue
    System.out.println("suite");          // affiché : on a attrapé l'exception
}'''),
    '<div class="ev-grid">',
    card("Les méthodes de Throwable", ul([
        "<code>getMessage()</code> : le texte passé au constructeur (<code>null</code> s'il n'y en a pas).",
        "<code>toString()</code> : nom complet de la classe, deux-points, message. C'est ce que <code>println(e)</code> affiche.",
        "<code>printStackTrace()</code> : écrit l'exception et la pile d'appels sur <code>System.err</code> ; n'arrête pas le programme.",
        "<code>getCause()</code> : l'exception d'origine quand on en a enveloppé une (<code>new Exception(\"wrap\", e)</code>).",
    ])),
    card("Écrire throws sans se tromper", ul([
        "<b>Oui</b> : <code>public void ioAppel() throws IOException { }</code>, avec <code>throws</code> après les parenthèses ; plusieurs exceptions : <code>throws IOException, ClassNotFoundException</code>.",
        "<b>Non</b> : <code>ioAppel() throw IOException</code> : <code>throw</code> est une instruction du corps, pas un mot de signature (« ; expected »).",
        "<b>Non</b> : <code>ioAppel throws IOException ()</code> : les parenthèses viennent avant <code>throws</code> (« ( expected »).",
        "<b>Non</b> : <code>catch (IOException e)</code> autour d'un appel à <code>void ioAppel() { }</code> qui ne déclare rien (« is never thrown in body of corresponding try statement »).",
    ])),
    '</div>',
    "<p class=\"ev-small\">Annale 2025, question 5 : « choisissez la définition la plus vraisemblable de <code>ioAppel</code> ». La seule bonne réponse déclare <code>throws IOException</code> après les parenthèses.</p>",
])

PROSE["txt-exc-divmul"] = "\n".join([
    "<h3 class=\"ev-h3\">8. L'exemple du cours : DivMul, déroulé complet</h3>",
    '<p>Exercice 3 du cours 5. Deux exceptions personnalisées vérifiées (<code>DivisionParZeroException</code>, <code>OperationInconnueException</code>), un <code>catch</code> général en dernier, un <code>finally</code>.</p>',
    pre_hl('''
private static int execOperation(int op1, String operation, int op2)
        throws DivisionParZeroException, OperationInconnueException {   // deux vérifiées déclarées
    if ("*".equals(operation)) return op1 * op2;
    if ("/".equals(operation)) {
        if (op2 == 0) throw new DivisionParZeroException();
        return op1 / op2;
    } else throw new OperationInconnueException(operation);
}

// main : opérandes {3, 56, 33, 25}, opérations {"*", "/", "+", "/"}, opérandes {5, 4, 5, 0}
for (int n = 0; n < operande1.length; n++) {
    try {
        System.out.println("Calcul de " + operande1[n] + operation[n] + operande2[n]);
        System.out.println("Resultat" + DivMul.execOperation(operande1[n], operation[n], operande2[n]));
    } catch (DivisionParZeroException e) {
        System.out.println("Division par zero.");
    } catch (OperationInconnueException e) {
        System.out.println("Operation inconnue " + e.getMessage());
    } catch (Exception e) {
        System.out.println("une autre exception est survenue.");
    } finally {
        System.out.println("clause finally appellee");
    }
}'''),
    pre_out('''
Calcul de 3*5
Resultat15
clause finally appellee
Calcul de 56/4
Resultat14
clause finally appellee
Calcul de 33+5
Operation inconnue +
clause finally appellee
Calcul de 25/0
Division par zero.
clause finally appellee'''),
    ul([
        "<b>3 × 5 et 56 / 4</b> : aucune exception, <code>Resultat…</code> est affiché, puis le <code>finally</code>.",
        "<b>33 + 5</b> : la ligne <code>Calcul de 33+5</code> est affichée, mais <b>pas</b> « Resultat » : l'exception est lancée pendant l'évaluation de l'argument du second <code>println</code>, avant qu'il ne s'exécute.",
        "<b>25 / 0</b> : <code>DivisionParZeroException</code> n'a ni message ni constructeur écrit : c'est le <code>catch</code> qui choisit le texte.",
        "Le <code>finally</code> s'affiche <b>4 fois</b> : à chaque tour, avec ou sans exception.",
        "<code>\"*\".equals(operation)</code> : constante d'abord, pour éviter une <code>NullPointerException</code> si <code>operation</code> valait <code>null</code>.",
        "Le <code>catch (Exception e)</code> général est en dernier : le placer avant les autres ne compilerait pas.",
    ]),
])

# ------------------------------------------------------------------ Test 5 : fichiers
PROSE["txt-fic-file"] = "\n".join([
    '<h3 class="ev-h3">3. La classe File, et mélanger primitives et objets</h3>',
    '<p>Un objet <code>File</code> est un <b>nom de fichier ou de dossier</b>, indépendant du système. Il permet de créer, supprimer, tester et lister, mais pas de lire le contenu.</p>',
    pre_hl('''
File d = new File("demo");                       // un chemin : rien n'est créé sur le disque
File f = new File(d, "a.txt");                   // le chemin demo/a.txt
System.out.println(f.exists());                  // false
d.mkdir();                                       // crée le dossier
try (PrintWriter out = new PrintWriter(f)) {     // crée le fichier (FileNotFoundException à traiter)
    out.print("abc");
}
System.out.println(f.exists() + " " + f.isFile() + " " + f.length() + " " + f.getName());
System.out.println(d.isDirectory() + " " + d.isFile());
for (File x : d.listFiles())                     // File[] : l'ordre n'est pas garanti
    System.out.println(x.getName());
System.out.println(f.delete() + " " + f.exists());'''),
    pre_out('''
false
true true 3 a.txt
true false
a.txt
true false'''),
    '<div class="ev-grid">',
    card("Les méthodes de File du cours", ul([
        "<code>exists()</code>, <code>isFile()</code>, <code>isDirectory()</code> : <code>boolean</code>.",
        "<code>canRead()</code>, <code>canWrite()</code> : <code>boolean</code>, les droits.",
        "<code>length()</code> : <code>long</code>, taille en octets.",
        "<code>getName()</code> : <code>String</code>, le nom sans le chemin.",
        "<code>listFiles()</code> : <code>File[]</code> du contenu d'un dossier ; <code>list()</code> : <code>String[]</code>, seulement les noms.",
        "<code>mkdir()</code>, <code>delete()</code> : <code>boolean</code>, créer un dossier, supprimer.",
        "<code>deleteOnExit()</code> : supprime à la fin de la JVM ; <code>lastModified()</code> : <code>long</code>, date de modification.",
    ])),
    card("Primitives et objets dans un même flux", pre_hl('''
try (ObjectOutputStream out =
         new ObjectOutputStream(new FileOutputStream("t.tmp"))) {
    out.writeInt(10325);
    out.writeObject("Today");
}
try (ObjectInputStream in =
         new ObjectInputStream(new FileInputStream("t.tmp"))) {
    int i = in.readInt();                // même ordre
    String s = (String) in.readObject(); // cast
    System.out.println(i + " " + s);     // 10325 Today
}''') + '<p class="ev-small"><code>ObjectOutputStream</code> sait aussi écrire les primitives (<code>writeInt</code>, <code>writeDouble</code>…), comme <code>DataOutputStream</code>. '
          'Lire d\'abord avec <code>readObject()</code> alors qu\'un <code>int</code> a été écrit en premier lance une <code>OptionalDataException</code> (une <code>IOException</code>). Extension usuelle : <code>.ser</code>.</p>'),
    '</div>',
])

# ------------------------------------------------------------------ Test 5 : Swing
PROSE["txt-swing-conteneurs"] = "\n".join([
    '<h3 class="ev-h3">6. Conteneurs, AWT ou Swing, positionnement absolu, boîtes de dialogue</h3>',
    '<div class="ev-grid">',
    card("Conteneurs", ul([
        "<b>Racine (top-level)</b> : <code>JFrame</code> (fenêtre principale), <code>JDialog</code>, <code>JWindow</code>. Une interface en a au moins un.",
        "<b>Intermédiaires</b> : <code>JPanel</code>, <code>JScrollPane</code>… On les place dans un conteneur racine.",
        "Chaque conteneur racine a un <b>content pane</b> : <code>frame.getContentPane().add(c)</code> ; <code>frame.add(c)</code> fait la même chose.",
        "Taille : <code>pack()</code> (taille préférée du contenu), <code>setSize(l, h)</code>, <code>setBounds(x, y, l, h)</code>.",
        "<code>setDefaultCloseOperation</code> : par défaut <code>HIDE_ON_CLOSE</code> (la fenêtre se cache, la JVM continue) ; <code>EXIT_ON_CLOSE</code> appelle <code>System.exit()</code>.",
    ])),
    card("AWT ou Swing ?", ul([
        "<b>AWT</b> : <code>java.awt</code> (composants natifs, plus limités, déconseillé) et <code>java.awt.event</code> (événements).",
        "<b>Swing</b> : <code>javax.swing</code>, noms en <code>J…</code>, composants « légers » écrits en Java, portables, look and feel modifiable.",
        "Les <b>layouts</b>, <code>Color</code> et les <b>événements</b> restent dans <code>java.awt</code> : sans <code>import java.awt.*;</code>, <code>BorderLayout</code> est introuvable.",
        "Autres composants : <code>JList</code> (<code>getSelectedValue()</code>, <code>getSelectedIndex()</code>), <code>JPopupMenu</code>, <code>JFileChooser</code>.",
    ])),
    '</div>',
    '<p><b>Sans layout, c\'est à toi de placer chaque composant</b> : on met le layout à <code>null</code>, puis on appelle <code>setBounds</code> sur chaque composant. Sans cet appel sa taille reste 0 × 0 et il est invisible.</p>',
    pre_hl('''
JPanel p = new JPanel(null);              // ou p.setLayout(null) : plus de layout manager
JButton ok = new JButton("OK");
p.add(ok);                                // ok.getWidth() × ok.getHeight() vaut 0 × 0 : invisible
ok.setBounds(20, 30, 100, 25);            // x, y, largeur, hauteur → 100 × 25 en (20, 30)'''),
    ul([
        "<code>BoxLayout</code> : une colonne ou une ligne, avec contrôle des espaces ; l'essentiel de <code>GridBagLayout</code> sans sa complexité.",
        "<code>GridBagLayout</code> : contrôle très fin, très compliqué ; pensé pour les générateurs d'interfaces (GUI builders).",
        "<code>null</code> + <code>setBounds</code> : positionnement absolu en pixels, qui ne s'adapte pas quand on redimensionne la fenêtre.",
        "Deux composants dans <code>CENTER</code> : le cours dit « ils se superposent » ; en pratique les deux restent dans le conteneur mais seul le dernier est placé (le premier garde une largeur de 0).",
    ]),
    '<h3 class="ev-h3">Deux extraits du cours à savoir lire</h3>',
    '<div class="ev-grid">',
    card("Choisir un fichier (JFileChooser)", pre_hl('''
JFileChooser choix = new JFileChooser();        // boîte « Ouvrir »
int reponse = choix.showOpenDialog(null);       // bloque jusqu'à la réponse
if (reponse == JFileChooser.APPROVE_OPTION) {   // OK, et non « Annuler »
    File f = choix.getSelectedFile();           // un File : à lire avec Scanner
}''') + '<p class="ev-small"><code>showOpenDialog</code> renvoie un <code>int</code> ; <code>getSelectedFile()</code> un <code>File</code>.</p>'),
    card("Un listener qui lit un champ (FactorielleGUI)", pre_hl('''
public void actionPerformed(ActionEvent e) {
    try {
        int n = Integer.parseInt(champ.getText());
        resultat.setText(String.valueOf(factorielle(n)));
    } catch (NumberFormatException ex) {
        resultat.setText("Entier attendu");   // champ = "abc"
    }
}''') + '<p class="ev-small"><code>getText()</code> renvoie toujours une <code>String</code> : <code>parseInt</code> puis <code>String.valueOf</code> pour réafficher. '
          'Avec <code>5</code> le label affiche <code>120</code> ; la méthode <code>factorielle</code> est <code>static</code> (appelée sans objet).</p>'),
    '</div>',
])

# ------------------------------------------------------------------ Test 5 : MVC
PROSE["txt-mvc-cadran"] = "\n".join([
    '<h3 class="ev-h3">Le Cadran du TP6 en MVC (le sujet du TP7)</h3>',
    '<p>Le TP7 demande de reprendre le cadran de téléphone et de le répartir en trois rôles. Le <code>Cadran</code> du TP6 mélange tout : il affiche, écoute <b>et</b> garde les règles. On le découpe ainsi :</p>',
    table(["Élément du TP6", "Rôle MVC", "Pourquoi"], [
        ["le numéro affiché, <code>numeroValide</code>, la règle « 8 chiffres maximum », les actions Reset, OK, Bis", "<b>Modèle</b> <code>CadranModele</code>", "ce sont des données et des règles ; testables sans fenêtre, sans <code>import javax.swing</code>"],
        ["<code>JTextField</code>, 12 <code>JButton</code>, <code>GridLayout</code>, <code>pack()</code>", "<b>Vue</b> <code>CadranVue</code>", "affichage seulement ; une méthode <code>afficher(String)</code> et une méthode pour s'abonner aux boutons"],
        ["<code>actionPerformed</code> : <code>e.getSource()</code> puis appel d'une méthode du modèle", "<b>Contrôleur</b> <code>CadranControleur</code>", "traduit un clic en appel du modèle, puis demande à la vue de se rafraîchir"],
    ]),
    pre_hl('''
public class CadranModele {                                   // aucun import Swing
    private String saisie = "";
    private String numeroValide = "";
    public String getSaisie() { return saisie; }
    public void ajouterChiffre(String c) { if (saisie.length() < 8) saisie += c; }   // la règle est ICI
    public void reset()  { saisie = ""; }
    public void valider() { numeroValide = saisie; }
    public void bis()    { saisie = numeroValide; }
}

public class CadranControleur implements ActionListener {
    private final CadranModele modele;
    private final CadranVue vue;
    public CadranControleur(CadranModele m, CadranVue v) { modele = m; vue = v; v.ecouter(this); }
    @Override public void actionPerformed(ActionEvent e) {
        Object source = e.getSource();
        if (source == vue.reset)      modele.reset();
        else if (source == vue.ok)    modele.valider();
        else if (source == vue.bis)   modele.bis();
        else modele.ajouterChiffre(((JButton) source).getText());   // un chiffre
        vue.afficher(modele.getSaisie());                           // la vue relit le modèle
    }
}'''),
    '<p>Le modèle se teste dans un <code>main</code> console, sans aucune fenêtre :</p>',
    pre_hl('''
CadranModele m = new CadranModele();
m.ajouterChiffre("1"); m.ajouterChiffre("2");
m.valider(); m.reset();
System.out.println("[" + m.getSaisie() + "]");     // []
m.bis();
System.out.println("[" + m.getSaisie() + "]");     // [12]
for (int i = 0; i < 9; i++) m.ajouterChiffre("7");
System.out.println(m.getSaisie());                  // 12777777  (8 chiffres : le 9e est refusé)'''),
    '<p class="ev-small">Ici le contrôleur appelle <code>vue.afficher(...)</code> lui-même ; avec le compteur ci-dessus c\'est le modèle qui prévient la vue (observateur). Les deux versions sont acceptables, à condition que le <b>modèle</b> garde les règles.</p>',
])

# ------------------------------------------------------------------ Test 5 : détails et checklists
PROSE["txt-pieges-plus"] = "\n".join([
    '<h3 class="ev-h3">Après les 20 pièges : détails du cours qui tombent aussi</h3>',
    must([
        ["<code>new File(\"a.txt\")</code> crée le fichier", "non : c'est un chemin ; <code>exists()</code> reste <code>false</code> tant que rien n'est écrit"],
        ["<code>e.printStackTrace()</code> arrête le programme", "non : il écrit la pile sur <code>System.err</code> et l'exécution continue après le <code>catch</code>"],
        ["<code>public void m() throw IOException</code>", "ne compile pas : <code>throws</code>, après les parenthèses (<code>throw</code> lance, dans le corps)"],
        ["<code>readObject()</code> avant le <code>readInt()</code> écrit en premier", "<code>OptionalDataException</code> : on relit dans l'ordre d'écriture"],
        ["<code>listFiles()</code> renvoie des noms", "il renvoie un <code>File[]</code> ; <code>list()</code> renvoie un <code>String[]</code>"],
        ["un bouton ajouté à un panneau sans layout est visible", "taille 0 × 0 tant qu'on n'appelle pas <code>setBounds(x, y, l, h)</code>"],
        ["<code>showOpenDialog</code> renvoie le fichier", "il renvoie un <code>int</code> à comparer à <code>JFileChooser.APPROVE_OPTION</code> ; le fichier : <code>getSelectedFile()</code>"],
        ["<code>e.getSource()</code> renvoie un <code>JButton</code>", "il renvoie un <code>Object</code> : <code>((JButton) source).getText()</code>"],
        ["la règle « 8 chiffres » du cadran va dans <code>actionPerformed</code>", "elle va dans le <b>modèle</b> ; le contrôleur appelle seulement <code>ajouterChiffre</code>"],
    ], trois=False),
    '<h3 class="ev-h3">Checklists de relecture</h3>',
    '<div class="ev-grid">',
    card("Question d'exception", ul([
        "Une vérifiée est-elle lancée sans <code>try</code> ni <code>throws</code> ?",
        "Les <code>catch</code> vont-ils de la fille à la mère ?",
        "Quelle ligne lance ? Tout ce qui suit dans le <code>try</code> est sauté.",
        "Le <code>finally</code> s'exécute-t-il ? Oui, sauf <code>System.exit</code> ; un <code>return</code> dedans écrase l'autre.",
        "Le message vient-il de <code>super(message)</code> ?",
    ])),
    card("Question de fichier", ul([
        "Texte (<code>Scanner</code>, <code>PrintWriter</code>) ou objets (<code>Object…Stream</code>) ?",
        "<code>FileWriter</code> : écrase ou ajoute (<code>true</code>) ?",
        "Le flux est-il fermé (<code>close()</code> ou try-with-resources) ?",
        "Sérialisation : <code>Serializable</code>, <code>transient</code>, <code>static</code>, cast, même ordre.",
        "Exceptions : <code>FileNotFoundException</code> avant <code>IOException</code>.",
    ])),
    card("Question Swing", ul([
        "Quel layout (JFrame : Border, JPanel : Flow) et quelle zone ?",
        "Un <code>addActionListener</code> est-il branché sur chaque bouton ?",
        "Lambda : variable locale effectivement finale, une seule méthode abstraite.",
        "<code>setVisible(true)</code>, <code>pack()</code> et <code>EXIT_ON_CLOSE</code> sont-ils présents ?",
        "<code>getText()</code> donne une <code>String</code> : conversion nécessaire.",
    ])),
    card("Question MVC", ul([
        "Le modèle importe-t-il Swing ? Il ne doit pas.",
        "Qui connaît qui : contrôleur → vue et modèle ; modèle → seulement une interface.",
        "Où est la règle métier ? Dans le modèle (exception lancée ici).",
        "Qui attrape l'exception ? Le contrôleur. Qui affiche ? La vue.",
        "Peut-on tester le modèle sans fenêtre ? Oui, c'est le but.",
    ])),
    '</div>',
])

# ------------------------------------------------------------------ Évaluation finale
FINAL_TRAPS = [
    ("Packages et imports", "<code>package</code> en 1<sup>re</sup> ligne, puis les <code>import</code>. <code>java.lang</code> (<code>String</code>, <code>Math</code>, <code>System</code>, <code>Object</code>) est importé tout seul ; <code>java.util</code>, <code>java.io</code>, <code>javax.swing</code> non."),
    ("Mots-clés", "<code>void</code>, <code>int</code>, <code>class</code> sont des mots-clés ; <code>String</code> n'en est pas un : c'est une classe."),
    ("throws", "<code>public void m() throws IOException { }</code> : après les parenthèses. <code>throw</code> est l'instruction qui lance. Un <code>catch (IOException e)</code> sans méthode qui la déclare ne compile pas."),
    ("Tableau d'objets", "<code>new String[10]</code> crée 10 cases valant <code>null</code> et <b>aucun</b> objet <code>String</code> : <code>t[0].length()</code> lance <code>NullPointerException</code>."),
    ("Object", "Toute classe hérite d'<code>Object</code>, la seule sans mère. <code>toString()</code> par défaut : <code>Bidon@1b6d3586</code> ; <code>equals</code> par défaut compare les adresses. <code>new Bidon(3)</code> ne compile pas si la classe n'a que le constructeur par défaut."),
    ("Compter les objets", "Seul <code>new</code> crée un objet. <code>A y = x;</code> copie une référence ; <code>A u;</code> ne crée rien."),
    ("Constructeurs chaînés", "Suivre les <code>this(...)</code> jusqu'au bout avant de calculer. <code>D(5, 6)</code> → <code>this(6)</code> → <code>this()</code> : <code>x = 3</code>, puis <code>+ 6</code> = 9, puis <code>− 5</code> = 4."),
    ("Interface", "Une interface ne s'instancie pas, mais peut être le <b>type</b> d'une référence : <code>Payable p = new Facture();</code> est correct."),
]
PROSE["txt-final-pieges"] = "\n".join(
    '<div class="trap"><b>%s</b>%s</div>' % (t, d) for t, d in FINAL_TRAPS)

PROSE["txt-final-table"] = "\n".join([
    '<h3 class="ev-h3">Ce que tu crois, ce qui se passe</h3>',
    '<p>Dix résultats à connaître par cœur. Chaque ligne a été exécutée avec Java 21.</p>',
    must([
        ["<code>String s = \"abc\"; s.toUpperCase(); System.out.println(s);</code>", "<code>ABC</code>", "<code>abc</code> : la méthode renvoie une nouvelle chaîne, perdue ici"],
        ["<code>10 + 20 + \"x\"</code> et <code>\"x\" + 10 + 20</code>", "<code>1020x</code> et <code>x30</code>", "<code>30x</code> et <code>x1020</code> : on lit de gauche à droite"],
        ["<code>(double) (7 / 2)</code>", "<code>3.5</code>", "<code>3.0</code> : la division entière a lieu avant le cast"],
        ["<code>1 / 2 + 1 / 2.0</code>", "<code>1.0</code>", "<code>0.5</code> : <code>0</code> + <code>0.5</code>"],
        ["<code>char c = 'a'; System.out.println(c + 1);</code>", "<code>b</code>", "<code>98</code> ; <code>(char) (c + 1)</code> donne <code>b</code>"],
        ["<code>l.remove(1)</code> avec <code>l = [10, 20, 30, 1]</code>", "retire la valeur 1", "retire l'<b>indice</b> 1 : <code>[10, 30, 1]</code> ; <code>l.remove(Integer.valueOf(1))</code> donne <code>[10, 20, 30]</code>"],
        ["<code>int[] u = t; u[0] = 9;</code> puis <code>t[0]</code>", "inchangé", "<code>9</code> : <code>u</code> et <code>t</code> désignent le même tableau"],
        ["<code>Mere m = new Fille();</code> puis <code>m.x</code>", "l'attribut de <code>Fille</code>", "celui de <code>Mere</code> (<code>1</code> ici, <code>((Fille) m).x</code> donne <code>2</code>)"],
        ["<code>A.f(2) * a.g(3)</code> avec <code>f</code> statique (+5 dans <code>A</code>, +4 dans <code>D</code>), <code>g</code> redéfinie (3 / <code>x + 8</code>), <code>A a = new D()</code>", "<code>6 × 11 = 66</code>", "<code>77</code> : <code>A.f(2) = 7</code> (statique, type déclaré) et <code>g</code> de <code>D</code> = 11 (annale 2025, questions 9 et 23)"],
        ["<code>new Fifille();</code> avec <code>getVal()</code> redéfinie, appelée dans <code>Maman()</code>", "<code>Maman</code>", "<code>Fifille</code> : le constructeur de la mère appelle la version de la fille (figure ci-dessus)"],
    ]),
])

# ------------------------------------------------------------------ Éval écrite
PROSE["txt-ev-compil"] = "\n".join([
    '<div class="ev-grid">',
    card("Compiler et exécuter", ul([
        "<code>javac Machine.java</code> produit <code>Machine.class</code> : du <b>bytecode</b>, le même sur toutes les machines.",
        "<code>java Machine</code> démarre la <b>JVM</b>, qui exécute le <code>main</code> de la classe.",
        "<b>JVM</b> = exécute le bytecode ; <b>JRE</b> = JVM + bibliothèques ; <b>JDK</b> = JRE + outils de développement (<code>javac</code>).",
        "Le fichier porte le nom de la classe publique : <code>public class Machine</code> dans <code>Machine.java</code>.",
    ])),
    card("Mots-clés ou classes ?", ul([
        "Mots-clés : <code>class</code>, <code>void</code>, <code>int</code>, <code>new</code>, <code>static</code>, <code>this</code>, <code>super</code>…",
        "<code>String</code>, <code>Integer</code>, <code>Math</code>, <code>System</code>, <code>Scanner</code> sont des <b>classes</b>, pas des mots-clés.",
        "<code>java.lang</code> est importé automatiquement ; <code>java.util</code> (<code>Scanner</code>, <code>ArrayList</code>, <code>HashMap</code>) et <code>java.io</code> non.",
        "Dans un fichier : <code>package</code> d'abord, puis les <code>import</code>, puis la classe.",
    ])),
    '</div>',
])

PROSE["txt-ev-object"] = "\n".join([
    '<div class="ev-grid">',
    card("Object : la mère de toutes les classes", ul([
        "Toute classe hérite d'<code>Object</code>, la seule qui n'a pas de mère.",
        "Sans redéfinition : <code>toString()</code> donne <code>NomClasse@code-hexadécimal</code> (par exemple <code>Bidon@1b6d3586</code>) et <code>equals</code> se comporte comme <code>==</code>.",
        "<code>equals(Object o)</code> accepte n'importe quoi : <code>a.equals(\"bonjour\")</code> compile et vaut <code>false</code>.",
        "Si on redéfinit <code>equals</code>, on redéfinit aussi <code>hashCode</code> pour que <code>HashSet</code> et <code>HashMap</code> fonctionnent.",
        "Une classe sans constructeur n'a que celui par défaut : <code>new Bidon(3)</code> ne compile pas.",
    ])),
    '</div>',
])

EVAL_TRAPS = [
    ("Constructeurs chaînés", "<code>D(int a) { this(); x = x + a; }</code> : suivre la chaîne jusqu'au constructeur sans paramètre, puis remonter en exécutant les lignes qui suivent chaque <code>this(...)</code>."),
    ("<code>static</code> redéfinie ?", "Une méthode <code>static</code> n'est jamais redéfinie, seulement masquée : <code>A.f(2)</code> utilise <code>A</code>, quelle que soit la classe de l'objet. Une méthode d'instance redéfinie suit l'objet réel."),
    ("Tableau d'objets", "<code>new String[10]</code> : 10 références à <code>null</code>, aucun <code>String</code>. Appeler une méthode sur une case vide : <code>NullPointerException</code>."),
]
PROSE["txt-ev-pieges"] = "\n".join('<div class="trap"><b>%s</b>%s</div>' % (t, d) for t, d in EVAL_TRAPS)

PROSE_PLACEMENT = [
    ("test5.html", "txt-exc-throwable", "before", "</section>\n\n<!-- ================= FICHIERS ================= -->"),
    ("test5.html", "txt-exc-divmul", "before", "</section>\n\n<!-- ================= FICHIERS ================= -->"),
    ("test5.html", "txt-fic-file", "before", "</section>\n\n<!-- ================= SWING ================= -->"),
    ("test5.html", "txt-swing-conteneurs", "before", "</section>\n\n<!-- ================= MVC ================= -->"),
    ("test5.html", "txt-mvc-cadran", "before", "</section>\n\n<!-- ================= PIÈGES ================= -->"),
    ("test5.html", "txt-pieges-plus", "before", "</section>\n\n<!-- ================= QCM ================= -->"),
    ("final.html", "txt-final-pieges", "before", '  </div>\n</section>\n\n<section id="qcmfin">'),
    ("final.html", "txt-final-table", "before", '</section>\n\n<section id="qcmfin">'),
    ("eval-s40.html", "txt-ev-compil", "before", "</section>\n\n<!-- ================= S2 ================= -->"),
    ("eval-s40.html", "txt-ev-object", "before", "</section>\n\n<!-- ================= S4 ================= -->"),
    ("eval-s40.html", "txt-ev-pieges", "before", "  </div>\n</section>\n\n<!-- ================= ENTRAINEMENT ================= -->"),
]
