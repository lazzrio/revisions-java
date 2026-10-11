/* 50 questions de lecture de code en plus (même format que test5-data.js).
   Toutes les sorties et erreurs de compilation ont été obtenues en compilant et en exécutant le code avec Java 21. */
const T5_RAW2 = String.raw`
## exc | Code : chaînage d'exceptions
Quelle est la sortie ?
[[
static void m() throws Exception {
    try { throw new IOException("io"); }
    catch (IOException e) { throw new Exception("wrap", e); }
}
public static void main(String[] args) {
    try { m(); }
    catch (Exception e) {
        System.out.println(e.getMessage() + " " + e.getCause().getMessage());
    }
}
]]
= ~wrap io~
- ~io wrap~
- ~wrap null~
- ~io io~
? Le ~catch~ de ~m~ attrape l'~IOException~ et en lance une **nouvelle** ~Exception~ qui garde l'ancienne comme cause. ~getMessage()~ donne ~wrap~, ~getCause().getMessage()~ donne ~io~.

## exc | Code : exception dans finally
Quel message affiche ce programme ?
[[
try {
    try { throw new RuntimeException("A"); }
    finally { throw new RuntimeException("B"); }
} catch (RuntimeException e) {
    System.out.println(e.getMessage());
}
]]
= ~B~
- ~A~
- ~A~ puis ~B~
- Rien : le programme plante
? Une exception lancée dans le ~finally~ **remplace** celle qui était en cours : l'exception ~A~ est perdue, le ~catch~ reçoit ~B~.

## exc | Code : break et finally
Que vaut ~n~ à la fin ?
[[
int n = 0;
for (int i = 0; i < 5; i++) {
    try {
        if (i == 3) break;
        n += i;
    } finally {
        n += 10;
    }
}
System.out.println(n);
]]
= ~43~
- ~33~
- ~3~
- ~13~
? Tours i=0, 1, 2 : on ajoute ~i~ puis 10, soit 10, 21, 33. Au tour i=3 : ~break~ sort du ~try~ mais le ~finally~ s'exécute quand même (+10) : 43. Total 0+1+2 + 4×10 = 43.

## exc | Code : récursion et finally
Quelle est la sortie ?
[[
static int f(int n) {
    if (n == 0) throw new ArithmeticException("fond");
    try { return f(n - 1); }
    finally { System.out.print(n); }
}
public static void main(String[] args) {
    try { f(3); }
    catch (ArithmeticException e) { System.out.println(" " + e.getMessage()); }
}
]]
= ~123 fond~
- ~321 fond~
- ~fond~
- ~ fond~ puis ~123~
? ~f(3)~ appelle ~f(2)~ puis ~f(1)~ puis ~f(0)~ qui lance. L'exception remonte : le ~finally~ de ~f(1)~ s'exécute d'abord (affiche ~1~), puis celui de ~f(2)~ (~2~), puis ~f(3)~ (~3~). Le ~catch~ du ~main~ affiche ~ fond~.

## exc | Code : cast et null
Quelle est la sortie ?
[[
Object[] t = { 1, "a", null };
for (Object o : t) {
    try {
        String s = (String) o;
        System.out.println(s.length());
    } catch (ClassCastException e) { System.out.println("CCE"); }
    catch (NullPointerException e) { System.out.println("NPE"); }
}
]]
= ~CCE~, ~1~, ~NPE~
- ~CCE~, ~1~, ~CCE~
- ~1~, ~1~, ~NPE~
- ~CCE~, ~1~, ~0~
? ~1~ est un ~Integer~ : le cast échoue (~CCE~). ~"a"~ : longueur 1. ~null~ : le cast d'un ~null~ réussit, mais ~s.length()~ sur ~null~ lance ~NullPointerException~.

## exc | Code : try-with-resources et exception
Quelle est la sortie ?
[[
try (R r = new R("X")) {          // R affiche "open X" à la création, "close X" à la fermeture
    System.out.println("body");
    throw new RuntimeException("err");
} catch (RuntimeException e) {
    System.out.println("catch " + e.getMessage());
} finally {
    System.out.println("finally");
}
]]
= ~open X~, ~body~, ~close X~, ~catch err~, ~finally~
- ~open X~, ~body~, ~catch err~, ~close X~, ~finally~
- ~open X~, ~body~, ~catch err~, ~finally~, ~close X~
- ~body~, ~catch err~, ~finally~
? Avec try-with-resources, la ressource est fermée **avant** l'exécution du ~catch~ et du ~finally~ du même ~try~.

## exc | Code : parseInt et espace
Que affiche ce code ?
[[
try {
    Integer.parseInt(" 12");
    System.out.println("ok");
} catch (NumberFormatException e) {
    System.out.println("erreur");
}
]]
= ~erreur~
- ~ok~
- Rien
- Une erreur de compilation
? ~parseInt~ n'accepte pas d'espace : ~" 12"~ lance ~NumberFormatException~ (message : ~For input string: " 12"~). D'où l'intérêt de ~trim()~ avant de convertir une saisie.

## exc | Code : toString d'une exception
Que affiche ~System.out.println(new IllegalArgumentException("x"));~ ?
= ~java.lang.IllegalArgumentException: x~
- ~x~
- ~IllegalArgumentException~
- ~Exception: x~
? ~toString()~ d'une exception = nom complet de la classe, deux-points, message. ~getMessage()~ ne donnerait que ~x~.

## exc | Code : catch de classe fille après la mère
Ce code compile-t-il ?
[[
static void b() {
    try { Integer.parseInt("a"); }
    catch (IllegalArgumentException e) { }
    catch (NumberFormatException e) { }
}
]]
= Non : ~NumberFormatException~ (fille) a déjà été attrapée par ~IllegalArgumentException~ (mère)
- Oui, le second ~catch~ est simplement ignoré
- Oui, mais avec un avertissement
- Non : ~NumberFormatException~ n'existe pas
? ~NumberFormatException~ hérite de ~IllegalArgumentException~. Message du compilateur : « exception NumberFormatException has already been caught ».

## exc | Code : throw dans main
Que se passe-t-il à la compilation ?
[[
public static void main(String[] args) {
    throw new Exception("x");
}
]]
= Erreur : « unreported exception Exception; must be caught or declared to be thrown »
- Aucune erreur ; le programme plante à l'exécution
- Aucune erreur ; il ne se passe rien
- Erreur : on ne peut pas utiliser ~throw~ dans ~main~
? ~Exception~ est vérifiée : ~main~ doit déclarer ~throws Exception~ ou entourer le ~throw~ d'un ~try/catch~. Avec ~new RuntimeException("x")~ ça compilerait.

## exc | Code : catch qui ne correspond pas
Que se passe-t-il à la compilation ?
[[
static void a() {
    try { throw new Exception("x"); }
    catch (RuntimeException e) { }
}
]]
= Erreur : l'~Exception~ lancée n'est pas attrapée (elle est vérifiée) et ~a()~ ne la déclare pas
- Aucune erreur : ~RuntimeException~ attrape toutes les exceptions
- Erreur : ~catch~ ne peut pas attraper ~RuntimeException~
- Aucune erreur, l'exception est simplement ignorée
? ~Exception~ n'est pas une ~RuntimeException~ : le ~catch~ ne la couvre pas. Il faut un ~catch (Exception e)~ ou un ~throws Exception~.

## exc | Code : sortie standard et exception
Que s'affiche-t-il sur la **sortie standard** (hors trace d'erreur) ?
[[
System.out.println("A");
int[] t = new int[1];
t[1] = 0;
System.out.println("B");
]]
= ~A~ seulement
- ~A~ puis ~B~
- ~B~ seulement
- Rien
? ~t[1]~ est hors du tableau (seul l'indice 0 existe) : ~ArrayIndexOutOfBoundsException~, non attrapée. Le programme s'arrête, la trace va sur la sortie d'erreur, ~B~ n'est jamais affiché.

## exc | Code : return d'une référence
Que affiche ~System.out.println(g());~ ?
[[
static StringBuilder g() {
    StringBuilder sb = new StringBuilder("a");
    try { return sb; }
    finally { sb.append("b"); }
}
]]
= ~ab~
- ~a~
- ~b~
- ~null~
? Le ~return~ renvoie la **référence** à l'objet. Le ~finally~ modifie cet objet : l'appelant voit ~ab~. Contraste avec un ~int~ (copié avant le ~finally~).

## exc | Code : calcul avec catch
Que vaut ~x~ à la fin ?
[[
int x = 5;
try { x = 10 / (x - 5); }
catch (ArithmeticException e) { x = -1; }
System.out.println(x);
]]
= ~-1~
- ~5~
- ~10~
- Le programme s'arrête avec une exception
? ~x - 5~ vaut 0, la division entière par 0 lance ~ArithmeticException~ avant que ~x~ soit modifiée, puis le ~catch~ affecte ~-1~.

## exc | Code : catch hors de portée
Quel message est affiché ?
[[
try {
    throw new IllegalStateException("s");
} catch (IOException e) {
    System.out.println("io");
} catch (Exception e) {
    System.out.println("ex");
}
]]
= Erreur de compilation : ~IOException~ (vérifiée) ne peut jamais être lancée dans ce ~try~
- ~ex~
- ~io~
- ~io~ puis ~ex~
? Un ~catch~ d'une exception vérifiée que le ~try~ ne peut pas lancer est refusé par le compilateur (« exception IOException is never thrown in body of corresponding try statement »), même si un ~catch (Exception e)~ suit.

## fic | Code : classe mère non sérialisable
Quelles valeurs affiche ce programme après écriture puis relecture d'un ~Fils~ ?
[[
class Base { int b = 5; Base() { b = 7; } }          // PAS Serializable
class Fils extends Base implements Serializable { int f; }

Fils x = new Fils();
x.b = 100;  x.f = 3;
// on sérialise x puis on relit y
System.out.println(y.b + " " + y.f);
]]
= ~7 3~
- ~100 3~
- ~5 3~
- ~0 0~
? Les attributs de ~Fils~ sont restaurés (~f = 3~). Pour la partie **non sérialisable** (~Base~), Java appelle son constructeur sans argument : ~b~ prend ~5~ puis ~7~, la valeur ~100~ est perdue.

## fic | Code : ordre de lecture
Que se passe-t-il ?
[[
oos.writeObject("a");
oos.writeObject(42);
...
Integer n = (Integer) ois.readObject();   // première lecture
]]
= ~ClassCastException~ : le premier objet écrit est la ~String "a"~
- ~n~ vaut ~42~
- ~n~ vaut ~0~
- ~EOFException~
? On relit dans le **même ordre** qu'à l'écriture. Le premier ~readObject()~ rend ~"a"~ ; le caster en ~Integer~ échoue.

## fic | Code : static et constructeur
Que affiche ce code ?
[[
class Etu implements Serializable {
    static int nb = 0;
    String nom;
    Etu(String n) { nom = n; nb++; }
}
Etu e1 = new Etu("a"), e2 = new Etu("b");
List<Etu> le = new ArrayList<>(List.of(e1, e2));
// sérialisation de le, puis relecture dans lr
System.out.println(Etu.nb + " " + lr.size());
]]
= ~2 2~
- ~4 2~
- ~2 0~
- ~0 2~
? À la relecture, le constructeur de ~Etu~ n'est **pas** rappelé : ~nb~ reste à 2. La liste relue contient 2 élèves.

## fic | Code : même objet écrit deux fois
Que affiche ce programme ?
[[
P p = new P("a");
oos.writeObject(p);
p.nom = "b";
oos.writeObject(p);
...
System.out.println(((P) ois.readObject()).nom + " " + ((P) ois.readObject()).nom);
]]
= ~a a~
- ~a b~
- ~b b~
- ~b a~
? Dans un même flux, un objet déjà écrit n'est pas réécrit : la 2<sup>e</sup> écriture n'est qu'une **référence** vers la première. La modification ~p.nom = "b"~ est ignorée. (Remède : ~oos.reset()~ ou un nouvel objet.)

## fic | Code : split et champ vide
Que se passe-t-il ?
[[
String[] ch = "Bob;;12".split(";");
System.out.println(ch.length);
int age = Integer.parseInt(ch[1]);
]]
= Affiche ~3~, puis ~NumberFormatException~ (~ch[1]~ est la chaîne vide)
- Affiche ~2~, puis ~age = 12~
- Affiche ~3~, puis ~age = 12~
- Affiche ~3~, puis ~age = 0~
? ~split~ garde les champs vides **au milieu** : ~{"Bob", "", "12"}~ (3 éléments). ~Integer.parseInt("")~ lance ~NumberFormatException~ (~For input string: ""~).

## fic | Code : nextInt puis nextLine
Que affiche ce code, sachant que le texte lu est ~12~, retour à la ligne, ~abc~ ?
[[
Scanner sc = new Scanner("12\nabc\n");
int a = sc.nextInt();
String l1 = sc.nextLine();
String l2 = sc.nextLine();
System.out.println(a + "[" + l1 + "][" + l2 + "]");
]]
= ~12[][abc]~
- ~12[abc][]~
- ~12[12][abc]~
- ~12[abc][abc]~
? Piège classique : ~nextInt()~ lit ~12~ mais laisse le retour à la ligne. Le premier ~nextLine()~ renvoie donc le reste de la ligne (chaîne **vide**), le second lit ~abc~.

## fic | Code : lignes vides
Combien de lignes compte cette boucle sur le texte ~a~, ligne vide, ~b~ (soit ~"a\n\nb"~) ?
[[
BufferedReader br = new BufferedReader(new StringReader("a\n\nb"));
int c = 0;
while (br.readLine() != null) c++;
System.out.println(c);
]]
= ~3~
- ~2~
- ~1~
- ~0~
? ~readLine()~ renvoie ~"a"~, puis ~""~ (la ligne vide existe, elle est non ~null~), puis ~"b"~, puis ~null~.

## fic | Code : FileWriter écrase ou ajoute
Quel est le contenu du fichier après chaque étape ?
[[
try (FileWriter w = new FileWriter(f))       { w.write("A"); }   // étape 1
try (FileWriter w = new FileWriter(f, true)) { w.write("B"); }   // étape 2
try (FileWriter w = new FileWriter(f))       { w.write("C"); }   // étape 3
]]
= ~A~, puis ~AB~, puis ~C~
- ~A~, puis ~AB~, puis ~ABC~
- ~A~, puis ~B~, puis ~C~
- ~A~, puis ~AB~, puis ~CAB~
? ~FileWriter(f)~ **écrase** le fichier. ~FileWriter(f, true)~ **ajoute** à la fin. L'étape 3 efface tout et écrit ~C~.

## fic | Code : copie par sérialisation
Que affiche ce code ?
[[
List<String> l = new ArrayList<>(List.of("a", "b"));
byte[] octets = serialiser(l);          // écriture dans un flux d'octets
l.add("c");                              // modification APRÈS la sauvegarde
List<String> r = deserialiser(octets);
System.out.println(r.size() + " " + l.size());
]]
= ~2 3~
- ~3 3~
- ~2 2~
- ~3 2~
? La sérialisation a figé l'état de la liste au moment de l'écriture. ~r~ est une **copie indépendante** : elle ne voit pas le ~add~ ultérieur.

## fic | Code : flux sans gestion d'exception
Que se passe-t-il à la compilation ?
[[
static void c() {
    ObjectOutputStream o = new ObjectOutputStream(new FileOutputStream("f"));
}
]]
= Erreurs : exceptions vérifiées non traitées (~FileNotFoundException~ et ~IOException~)
- Aucune erreur
- Erreur : ~ObjectOutputStream~ est abstraite
- Erreur : il manque ~implements Serializable~
? ~new FileOutputStream("f")~ peut lancer ~FileNotFoundException~, le constructeur d'~ObjectOutputStream~ une ~IOException~. Il faut un ~try/catch~ (ou ~throws IOException~).

## fic | Code : attribut non sérialisable
Que se passe-t-il à l'écriture ?
[[
class Menu implements Serializable {
    Scanner sc = new Scanner(System.in);
    String nom = "carte";
}
...
oos.writeObject(new Menu());
]]
= ~NotSerializableException~ (le message cite ~java.util.Scanner~)
- Rien : ~sc~ est ignoré
- Erreur de compilation
- ~sc~ vaut ~null~ après relecture
? ~Scanner~ n'est pas ~Serializable~. Solution : déclarer ~sc~ en ~transient~ (ou ne pas en faire un attribut).

## fic | Code : transient et initialisation
Que affiche ce code après écriture puis relecture de ~H~ ?
[[
class H implements Serializable {
    transient List<String> hist = new ArrayList<>();
    String nom = "n";
}
...
System.out.println(h.hist + " " + h.nom);
]]
= ~null n~
- ~[] n~
- ~[] null~
- ~null null~
? L'initialisation ~new ArrayList<>()~ ne se rejoue pas (aucun constructeur appelé) : l'attribut ~transient~ vaut ~null~. Un ~h.hist.add(...)~ provoquerait une ~NullPointerException~.

## swing | Code : compteur de clics
Que vaut ~c[0]~ après trois clics sur le bouton ?
[[
int[] c = { 0 };
bouton.addActionListener(e -> c[0]++);
]]
= ~3~
- ~0~
- ~1~
- Erreur de compilation
? Contrairement à ~int c~, la **référence** du tableau ~c~ est finale : on peut en modifier le contenu depuis la lambda. Chaque clic déclenche ~actionPerformed~, donc +1.

## swing | Code : lire un champ au clic
Quel texte contient le champ après deux clics sur le bouton ?
[[
JTextField t = new JTextField("5");
JButton b = new JButton("x2");
b.addActionListener(e -> t.setText("" + (Integer.parseInt(t.getText()) * 2)));
]]
= ~20~
- ~10~
- ~55~
- ~5~
? 1<sup>er</sup> clic : 5 × 2 = 10. 2<sup>e</sup> clic : le champ contient ~"10"~, 10 × 2 = 20. ~getText()~ renvoie une ~String~ qu'on convertit avec ~parseInt~.

## swing | Code : GridLayout avec 0 ligne
Où se trouve le 7<sup>e</sup> bouton (indice 6) ?
[[
JPanel p = new JPanel(new GridLayout(0, 3));
for (int i = 0; i < 7; i++) p.add(new JButton("b" + i));
]]
= Première colonne de la 3<sup>e</sup> ligne (le panneau a 3 colonnes et 3 lignes)
- Première colonne de la 4<sup>e</sup> ligne
- Troisième colonne de la 2<sup>e</sup> ligne
- Il n'est pas affiché
? ~GridLayout(0, 3)~ : 3 colonnes, nombre de lignes libre = ⌈7/3⌉ = 3. Remplissage ligne par ligne : b0 b1 b2 / b3 b4 b5 / b6. (Vérifié : sur un panneau 300×300, ~b6~ est en x = 0, y = 200.)

## swing | Code : un listener, deux boutons
Que affiche ce programme quand on clique d'abord sur ~b2~ puis sur ~b1~ ?
[[
ActionListener al = e ->
    System.out.println(e.getSource() == b1 ? "b1" : e.getSource() == b2 ? "b2" : "?");
b1.addActionListener(al);
b2.addActionListener(al);
]]
= ~b2~ puis ~b1~
- ~b1~ puis ~b2~
- ~?~ deux fois
- ~b1~ deux fois
? Le même listener reçoit les deux événements ; ~getSource()~ renvoie le bouton cliqué.

## swing | Code : getActionCommand
Que affiche ~e.getActionCommand()~ au 1<sup>er</sup> puis au 2<sup>e</sup> clic ?
[[
JButton b = new JButton("Go");
b.addActionListener(e -> System.out.println(e.getActionCommand()));
// 1er clic
b.setActionCommand("x");
// 2e clic
]]
= ~Go~ puis ~x~
- ~x~ puis ~x~
- ~Go~ puis ~Go~
- ~null~ puis ~x~
? Par défaut, la commande d'action est le **texte** du bouton ; ~setActionCommand~ la remplace.

## swing | Code : case à cocher
Que valent successivement ~isSelected()~ après un clic, puis un second clic sur une ~JCheckBox~ initialement décochée ?
= ~true~ puis ~false~
- ~false~ puis ~true~
- ~true~ puis ~true~
- ~false~ puis ~false~
? Chaque clic **inverse** l'état de la case.

## swing | Code : boutons radio
Que valent ~r1.isSelected()~ et ~r2.isSelected()~ ?
[[
ButtonGroup g = new ButtonGroup();
g.add(r1);  g.add(r2);
r1.setSelected(true);
r2.doClick();                 // clic sur r2
]]
= ~false~ et ~true~
- ~true~ et ~true~
- ~true~ et ~false~
- ~false~ et ~false~
? Dans un ~ButtonGroup~, un seul bouton peut être sélectionné : choisir ~r2~ désélectionne ~r1~. Sans le groupe, les deux resteraient cochés.

## swing | Code : JComboBox
Que affichent ces deux lignes ?
[[
JComboBox<String> cb = new JComboBox<>(new String[] { "A", "B" });
System.out.println(cb.getSelectedItem() + "" + cb.getSelectedIndex());
cb.setSelectedIndex(1);
System.out.println(cb.getSelectedItem());
]]
= ~A0~ puis ~B~
- ~A1~ puis ~B~
- ~null~ puis ~B~
- ~B0~ puis ~A~
? Par défaut, le **premier** élément (indice 0) est sélectionné. ~setSelectedIndex(1)~ choisit ~"B"~.

## swing | Code : setText et listener
Quelles valeurs de ~c[0]~ sont affichées ?
[[
JTextField t = new JTextField();
int[] c = { 0 };
t.addActionListener(e -> c[0]++);
t.setText("abc");
System.out.print(c[0]);
t.postActionEvent();            // simule la touche Entrée
System.out.print(c[0]);
]]
= ~0~ puis ~1~ (affiché ~01~)
- ~1~ puis ~1~
- ~0~ puis ~0~
- ~1~ puis ~2~
? ~setText~ ne déclenche **pas** l'~ActionListener~ d'un ~JTextField~ : seulement la touche Entrée (ici simulée).

## swing | Code : méthode mal orthographiée
Que se passe-t-il à la compilation ?
[[
b.addActionListener(new ActionListener() {
    public void actionPerform(ActionEvent e) { }
});
]]
= Erreur : la classe anonyme n'est pas abstraite et ne redéfinit pas ~actionPerformed~
- Aucune erreur, mais rien ne se passe au clic
- Erreur à l'exécution seulement
- Aucune erreur, et ~actionPerform~ est appelée au clic
? ~actionPerform~ (sans ~ed~) est une **autre** méthode. ~@Override~ aurait aussi signalé l'erreur.

## swing | Code : lambda sans paramètre
Que se passe-t-il à la compilation ?
[[
b.addActionListener(() -> System.out.println("x"));
]]
= Erreur : la lambda doit avoir un paramètre (~e -> ...~), car ~actionPerformed~ prend un ~ActionEvent~
- Aucune erreur
- Erreur : les lambdas sont interdites avec ~addActionListener~
- Aucune erreur, mais ~x~ n'est jamais affiché
? La signature de la lambda doit correspondre à celle de l'unique méthode de l'interface : ~(ActionEvent e)~, donc ~e -> ...~ ou ~(e) -> ...~.

## swing | Code : interface incomplète
Que se passe-t-il à la compilation ?
[[
public class C3 implements MouseListener {
    public void mouseClicked(MouseEvent e) { }
}
]]
= Erreur : la classe n'implémente pas les 4 autres méthodes de ~MouseListener~
- Aucune erreur
- Erreur : ~mouseClicked~ doit être ~static~
- Aucune erreur, les autres méthodes sont facultatives
? Une classe qui implémente une interface doit définir **toutes** ses méthodes (5 pour ~MouseListener~), ou être abstraite. Avec ~extends MouseAdapter~, une seule suffit.

## swing | Code : import manquant
Que se passe-t-il à la compilation (seul ~import javax.swing.*;~ est présent) ?
[[
public class C4 extends JFrame {
    C4() { add(new JButton("a"), BorderLayout.CENTER); }
}
]]
= Erreur : ~BorderLayout~ est introuvable (il est dans ~java.awt~, pas dans ~javax.swing~)
- Aucune erreur
- Erreur : ~JFrame~ ne peut pas utiliser ~add~
- Erreur : il manque ~setVisible(true)~
? Les composants sont dans ~javax.swing~, mais les **layouts** et les événements sont dans ~java.awt~ et ~java.awt.event~ : ~import java.awt.*;~ et ~import java.awt.event.*;~.

## swing | Code : composant jamais créé
Que se passe-t-il à l'exécution ?
[[
JPanel p = new JPanel();
JLabel l = null;            // déclaré mais pas créé avec new
p.add(l);
]]
= ~NullPointerException~
- Rien : le panneau ignore le ~null~
- Un label vide est ajouté
- Erreur de compilation
? Ajouter une référence ~null~ à un conteneur lance une ~NullPointerException~. Oubli classique : déclarer le composant sans ~new JLabel(...)~.

## swing | Code : zone de BorderLayout mal écrite
Que se passe-t-il à l'exécution ?
[[
JPanel p = new JPanel(new BorderLayout());
p.add(new JButton("a"), "North");
p.add(new JButton("b"), "north");
]]
= ~IllegalArgumentException~ : « unknown constraint: north »
- Les deux boutons sont placés en haut
- ~b~ est placé au centre
- Erreur de compilation
? Les constantes sont sensibles à la casse : ~"North"~, ~"South"~, ~"East"~, ~"West"~, ~"Center"~. Mieux : ~BorderLayout.NORTH~, qui évite la faute de frappe. L'erreur n'apparaît qu'à l'exécution car la zone est une simple ~String~.

## mvc | Code : notifications du modèle
Le modèle (max 3) a un seul abonné qui compte les notifications. On fait quatre ~inc()~ (les erreurs sont attrapées et affichent ~E~), puis ~raz()~, puis ~inc()~. Que affiche le programme (valeur finale, nombre de notifications) ?
[[
void inc() { if (v >= max) throw new IllegalStateException("max"); v++; pre(); }
void raz() { v = 0; pre(); }
void pre() { for (L l : ab) l.modif(this); }
]]
= ~E 1 5~
- ~E 1 6~
- ~E 0 5~
- ~E 1 4~
? ~inc()~ ×3 réussis : 3 notifications. Le 4<sup>e</sup> lance l'exception (affiche ~E~) **avant** ~pre()~ : pas de notification. ~raz()~ : 4. ~inc()~ : 5. Valeur finale 1.

## mvc | Code : deux vues
Deux vues sont abonnées au même modèle, dans l'ordre V1 puis V2. Que contient le journal après un ~inc()~ (valeur 0 → 1) ?
[[
m.add(mm -> sb.append("V1:" + mm.v + " "));
m.add(mm -> sb.append("V2:" + mm.v + " "));
m.inc();
]]
= ~V1:1 V2:1~
- ~V2:1 V1:1~
- ~V1:0 V2:0~
- ~V1:1~ seulement
? Le modèle parcourt sa liste d'abonnés dans l'ordre d'ajout et chacun est prévenu après le changement. Plusieurs vues d'un même modèle = l'intérêt de l'Observateur.

## mvc | Code : notification trop tôt
Quelles valeurs de la vue (~aff~) et du modèle (~v~) après chaque appel ?
[[
void incBug() { pre(); v++; }      // on prévient AVANT de modifier
...
m.add(mm -> aff = "" + mm.v);
m.incBug();     // appel 1  → aff, v
m.incBug();     // appel 2  → aff, v
]]
= Appel 1 : ~aff = "0"~, ~v = 1~ ; appel 2 : ~aff = "1"~, ~v = 2~ (la vue a toujours un coup de retard)
- Appel 1 : ~aff = "1"~, ~v = 1~ ; appel 2 : ~aff = "2"~, ~v = 2~
- Appel 1 : ~aff = "0"~, ~v = 0~ ; appel 2 : ~aff = "0"~, ~v = 0~
- ~aff~ est toujours à ~"0"~
? La notification doit venir **après** la modification de l'état. Ici, la vue lit l'ancienne valeur.

## mvc | Code : oubli de l'abonnement
Quelles valeurs de ~aff~ et ~v~ après ~m.inc()~ ?
[[
CompteurModele m = new CompteurModele(5);
String[] aff = { "0" };
// oubli : m.ajouterAbonne(...) n'a jamais été appelé
m.inc();
System.out.println(aff[0] + " " + m.v);
]]
= ~0 1~ : le modèle change mais personne n'est prévenu, l'affichage reste ancien
- ~1 1~
- ~0 0~
- Exception : aucun abonné
? Sans ~ajouterAbonne~, la liste d'abonnés est vide : ~prevenir()~ ne fait rien. C'est un des bugs MVC les plus fréquents au TP : « le modèle est bon mais la fenêtre ne bouge pas ».

## mvc | Code : exceptions métier
Que affiche ce programme (solde initial 100) ?
[[
class Compte {
    int solde = 100;
    void retirer(int m) {
        if (m > solde) throw new IllegalArgumentException("solde insuffisant");
        solde -= m;
    }
}
int[] mt = { 70, 50, 30 };
for (int q : mt) {
    try { c.retirer(q); System.out.print("ok "); }
    catch (IllegalArgumentException e) { System.out.print("KO "); }
}
System.out.println(c.solde);
]]
= ~ok KO ok 0~
- ~ok ok ok 0~
- ~ok KO KO 30~
- ~ok KO ok 30~
? 70 : solde 30. 50 > 30 : exception, solde **inchangé** (30). 30 ≤ 30 : solde 0. L'exception est lancée avant ~solde -= m~, donc le modèle reste cohérent.

## mvc | Code : contrôleur et saisie invalide
Que affiche la vue si l'utilisateur saisit ~abc~ ?
[[
public void actionPerformed(ActionEvent e) {
    try {
        int m = Integer.parseInt(vue.getSaisie());
        modele.retirer(m);
    } catch (NumberFormatException ex) {
        vue.afficherErreur("Nombre invalide");
    } catch (IllegalArgumentException ex) {
        vue.afficherErreur(ex.getMessage());
    }
}
]]
= ~Nombre invalide~
- ~solde insuffisant~
- ~For input string: "abc"~
- Rien, l'exception remonte
? ~parseInt("abc")~ lance ~NumberFormatException~, attrapée par le **premier** ~catch~. Le modèle n'est même pas appelé. La conversion de la saisie est bien une tâche du **contrôleur**.

## mvc | Code : ordre des catch dans le contrôleur
Que se passe-t-il si on **inverse** les deux ~catch~ du contrôleur précédent (~IllegalArgumentException~ d'abord) ?
= Erreur de compilation : ~NumberFormatException~ a déjà été attrapée (elle hérite d'~IllegalArgumentException~)
- Rien ne change
- Le premier ~catch~ ne s'exécute plus jamais, mais ça compile
- Erreur à l'exécution seulement
? Mère avant fille = erreur de compilation. Ici ~NumberFormatException~ ⊂ ~IllegalArgumentException~ : il faut garder le plus précis en premier.
## exc | Code : multi-catch inutile
Que se passe-t-il à la compilation ?
[[
try {
    throw new IllegalStateException("s");
} catch (IOException | RuntimeException e) {
    System.out.println("multi");
}
]]
= Erreur : ~IOException~ (vérifiée) ne peut pas être lancée dans ce ~try~
- Aucune erreur : ~multi~ est affiché
- Erreur : un multi-catch doit contenir exactement deux types
- Aucune erreur, mais ~multi~ n'est jamais affiché
? Chaque type d'un multi-catch est contrôlé séparément : une exception **vérifiée** qui ne peut pas être lancée dans le ~try~ est refusée, même associée à ~RuntimeException~.

`;
