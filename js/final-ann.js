/* Annale réelle : DS QCM Java ING3 (25 questions, +0,8 / -0,4), sans la question 22 dont le code est inexploitable.
   Clés d'après les « Réponses » officielles, sauf la question 18 (la clé officielle D est une erreur : la bonne réponse est B). */
const F_ANN = String.raw`
## ann | Annale 2025 · Q1
Soit la déclaration de 3 variables locales : ~String a = "aaa", b = "a", c;~ Sélectionnez l'expression qui compile et s'exécute sans erreur.
= ~c = a + b~
- ~c += a~
- ~c = a - b~
- ~c = 'a'~
? ~c += a~ lit ~c~ non initialisée (erreur). L'opérateur ~-~ n'existe pas pour les ~String~. ~'a'~ est un ~char~, pas une ~String~. Seule la concaténation ~a + b~ est valide.

## ann | Annale 2025 · Q2
Qu'affiche le programme suivant ?
[[
public class A {
    public void prn() { System.out.println(this.getVal()); }
    public int getVal() { return 10; }
}
public class B extends A {
    public int getVal() { return 20; }
}
public class C extends B {
    public static void main(String args[]) {
        new B().prn();
        new C().prn();
    }
}
]]
@main C
@out 20 20
= ~20~, ~20~
- ~10~, ~10~
- ~20~, ~10~
- Une erreur
? Retiens : dans ~prn()~, ~this.getVal()~ est choisie **d'après l'objet réel**, pas d'après la classe où ~prn()~ est écrite.

| appel | objet réel | ~getVal()~ exécutée | affichage |
|---|---|---|---|
| ~new B().prn()~ | ~B~ | celle de ~B~ | ~20~ |
| ~new C().prn()~ | ~C~ | ~C~ n'en a pas → celle héritée de ~B~ | ~20~ |

Résultat ~20~, ~20~. Jamais ~10~ : la version de ~A~ est redéfinie dans ~B~ et masquée pour tous les objets ~B~ ou ~C~.

## ann | Annale 2025 · Q3
L'interprétation des programmes Java est effectuée par :
= La JVM
- Le JDK
- L'API
- AWT
? La **JVM** exécute le bytecode. Le JDK contient le compilateur ; l'API est la bibliothèque de classes ; AWT est une bibliothèque graphique.

## ann | Annale 2025 · Q4
Comment compléter le code pour qu'il affiche « constructeur de base » ?
[[
public class Base {
    public Base(int i) { System.out.println("constructeur de base"); }
    public Base() {}
}
public class Sub extends Base {
    public static void main(String argv[]) { Sub s = new Sub(); /* Un */ }
    public Sub() { /* Deux */ }
    public void sub() { /* Trois */ }
}
]]
= Remplacer ~/* Deux */~ par ~super(10);~
- Remplacer ~/* Un */~ par ~Base(10);~
- Remplacer ~/* Trois */~ par ~super(10);~
- Remplacer ~/* Un */~ par ~super(10);~
? On veut que ~"constructeur de base"~ s'affiche : il faut appeler ~Base(int)~ (le seul qui affiche quelque chose).

**Où écrire ~super(10);~ ?** ~super(...)~ n'est autorisé que **dans un constructeur**, en première ligne. Dans ce code, le seul constructeur de ~Sub~ est ~Sub()~ : emplacement « Deux ».

**Pourquoi pas les autres :**

- « Un » est dans ~main~ : ~super~ n'y existe pas.
- « Trois » est dans une méthode ordinaire ~sub()~ : ~super(...)~ y est interdit.
- ~Base(10);~ n'est pas une instruction valide (on ne rappelle pas un constructeur comme ça).

Avec la bonne correction, ~new Sub()~ → ~Sub()~ → ~super(10)~ → ~Base(int)~ qui affiche le texte.

## ann | Annale 2025 · Q5
Choisissez la définition la plus vraisemblable de ~ioAppel~ :
[[
import java.io.*;
public class Test {
    public static void main(String args[]) {
        Test t = new Test();
        t.uneMethode();
    }
    public void uneMethode() {
        try { ioAppel(); }
        catch (IOException e) { }
    }
}
]]
= ~public void ioAppel() throws IOException { }~
- ~public void ioAppel() { }~
- ~public void ioAppel() throw IOException { }~
- ~public void ioAppel throws IOException () { }~
? Le ~try~ appelle ~ioAppel()~ et le ~catch~ attend une ~IOException~.

**Règle :** le compilateur n'accepte un ~catch~ d'une exception **vérifiée** que si le ~try~ peut réellement la lancer. Il faut donc que ~ioAppel()~ **déclare** ~throws IOException~ dans sa signature.

**Les autres propositions :**

- ~public void ioAppel() { }~ : ne déclare rien → le ~catch (IOException)~ est refusé (« exception never thrown »).
- ~throw IOException~ : faute, c'est ~throws~.
- ~ioAppel throws IOException ()~ : les mots sont dans le mauvais ordre.

Syntaxe correcte : ~public void ioAppel() throws IOException { }~.

## ann | Annale 2025 · Q6
Une classe :
= Peut implémenter plusieurs interfaces mais doit étendre une seule classe
- Peut implémenter plusieurs classes mais doit étendre une seule interface
- Peut implémenter plusieurs classes mais doit étendre plusieurs interfaces
- Doit implémenter une seule interface et étendre une seule classe
? Plusieurs ~implements~ (interfaces), un seul ~extends~ (classe).

## ann | Annale 2025 · Q7
Quelle classe n'a pas de classe mère ?
= ~Object~
- ~String~
- ~Orpheline~
- Une classe abstraite
? ~Object~ est la racine de toutes les classes.

## ann | Annale 2025 · Q8
Qu'est-ce qui est **faux** pour une interface ?
= Elle peut être instanciée
- Elle déclare des méthodes sans les implémenter
- Elle peut être le type d'une référence
- Elle peut être implémentée
? Une interface ne s'instancie pas directement.

## ann | Annale 2025 · Q9
Pour ces classes, qu'affiche ~D d = new D(); A a = d; System.out.println(A.f(2) * a.g(3));~ ?
[[
public class A {
    public static int f(int x) { return x + 5; }
    public int g(int x) { return 3; }
}
public class D extends A {
    public static int f(int x) { return x + 4; }
    public int g(int x) { return x + 8; }
}
]]
= ~77~
- ~66~
- ~18~
- ~21~
? **Étape 1 : ~A.f(2)~.** ~f~ est ~static~ et appelée avec ~A.~ : on exécute ~A.f~ → ~2 + 5 = 7~.

**Étape 2 : ~a.g(3)~.** ~g~ est une méthode d'**instance**. ~a~ est déclarée ~A~ mais pointe vers un objet ~D~ (~A a = d~). On exécute la version de l'**objet réel** : ~D.g(3)~ → ~3 + 8 = 11~.

**Étape 3 :** ~7 * 11 = 77~.

**À retenir :** méthode ~static~ = type déclaré ; méthode d'instance = objet réel.

## ann | Annale 2025 · Q10
Sachant que ~Triangle~ hérite de ~Figure~, quelle ligne est correcte ?
= ~Triangle x = new Triangle(); Figure y = x; Triangle z = (Triangle) y;~
- ~Figure y = new Figure(); Triangle x = (Triangle) y; Figure z = (Figure) x;~
- ~Figure y = new Figure(); Triangle x = (Triangle) y; Figure z = x;~
- ~Triangle x = new Triangle(); Object y = (Object) x; Triangle z = y;~
? Le 1<sup>er</sup> est correct : l'objet est réellement un ~Triangle~. Les 2<sup>e</sup> et 3<sup>e</sup> compilent mais lancent ~ClassCastException~ (l'objet est une ~Figure~). Le 4<sup>e</sup> ne compile pas : ~Triangle z = y~ sans cast.

## ann | Annale 2025 · Q11
Qu'affiche ~D a = new D(5, 6); System.out.println(a.x);~ ?
[[
public class D {
    public int x;
    public D() { x = 3; }
    public D(int a) { this(); x = x + a; }
    public D(int a, int b) { this(b); x = x - a; }
}
]]
= ~4~
- ~1~
- ~3~
- ~2~
? Suis les constructeurs appelés par ~new D(5, 6)~ :

**1.** ~D(5, 6)~ → première ligne ~this(6)~ (b = 6) : on saute dans ~D(int a)~ avec ~a = 6~.

**2.** ~D(6)~ → première ligne ~this()~ : on saute dans ~D()~.

**3.** ~D()~ : ~x = 3~.

**4.** Retour dans ~D(int a)~ : ~x = 3 + 6 = 9~.

**5.** Retour dans ~D(int a, int b)~ : ~x = 9 - 5 = 4~.

Le corps le plus profond s'exécute d'abord. ~a.x~ vaut ~4~.

## ann | Annale 2025 · Q12
Un attribut d'une classe avec la visibilité par défaut est visible par :
= Toutes les classes de son package
- Seulement la classe elle-même
- Seulement la classe elle-même et ses sous-classes
- Toutes les classes du programme
? Visibilité par défaut = visibilité de **package**.

## ann | Annale 2025 · Q13
Dans ~BorderLayout~, quelle est la position par défaut d'un composant ajouté ?
= ~CENTER~
- ~NORTH~
- ~SOUTH~
- ~WEST~
? Sans zone précisée, ~add(c)~ place le composant au centre.

## ann | Annale 2025 · Q14
Sélectionnez la seule phrase vraie :
= On ne peut pas instancier un objet d'une classe abstraite
- Une classe abstraite ne peut pas définir de constructeur
- Une classe abstraite ne peut pas définir de méthodes non abstraites
- Une classe abstraite ne peut pas définir d'attributs
? Une classe abstraite peut avoir constructeurs, attributs et méthodes concrètes ; seule l'instanciation directe est interdite.

## ann | Annale 2025 · Q15
Quel bout de code utilise-t-on pour une classe du package ~tools~ qui utilise ~java.lang~ et ~java.util~ ?
= ~package tools; import java.util.*;~
- ~import java.util.*; import java.lang.*; package tools;~
- ~import java.util.*; import java.lang.*;~
- ~package tools; import java.lang.*;~
? ~package~ d'abord ; ~java.lang~ est importé automatiquement ; il faut importer ~java.util~.

## ann | Annale 2025 · Q16
Qu'affiche le programme suivant ?
[[
public class Maman {
    public String getVal() { return "Maman"; }
    public Maman() { System.out.print(this.getVal()); }
}
public class Fifille extends Maman {
    public String getVal() { return "Fifille"; }
    public Fifille() { super(); }
}
public class Famille {
    public static void main(String args[]) {
        new Fifille();
        new Maman();
    }
}
]]
@main Famille
@out FifilleMaman
= ~FifilleMaman~
- ~MamanMaman~
- ~MamanFifille~
- ~FifilleFifille~
? ~new Fifille()~ appelle ~Fifille()~ qui commence par ~super()~, donc ~Maman()~. Dans ~Maman()~, le ~print~ appelle ~this.getVal()~.

**Premier objet : ~new Fifille()~.** ~this~ est une ~Fifille~ → version redéfinie de ~Fifille~ → affiche ~Fifille~.

**Second objet : ~new Maman()~.** ~this~ est une ~Maman~ → affiche ~Maman~.

Affichage ~FifilleMaman~. Même piège que la question de la page « constructeur » : l'appel d'une méthode redéfinie dans un constructeur utilise la version de la classe **réelle**.

## ann | Annale 2025 · Q17
Combien de références de type ~String~ sont créées par ~String[] strings = new String[10];~ ?
= 10
- 0
- 9
- 11
? 10 cases-références (toutes à ~null~), et aucun objet ~String~.

## ann | Annale 2025 · Q18
Quelle expression donne l'indice du dernier élément d'un tableau ~arr~ de ~String~ ?
= ~arr.length - 1~
- ~arr.length~
- ~arr.length()~
- ~arr.length() - 1~
? **Attention : la clé officielle indique D, mais c'est une erreur.** Pour un tableau, ~length~ est un attribut (sans parenthèses) ; ~length()~ est la méthode des ~String~. La bonne expression est ~arr.length - 1~.

## ann | Annale 2025 · Q19
Pour ~public class Bidon { int x; }~, lequel des programmes est faux (ne compile pas) ?
= ~Bidon a = new Bidon(3);~
- ~Bidon a = new Bidon(); String s = a.toString();~
- ~Bidon a = new Bidon(); boolean b = a.equals("bonjour");~
- ~Bidon a = new Bidon(); boolean b = a.equals(a);~
? Aucun constructeur ~Bidon(int)~ n'existe (seul le constructeur par défaut sans paramètre). ~toString~ et ~equals~ sont héritées d'~Object~.

## ann | Annale 2025 · Q20
Quel package est importé automatiquement ?
= ~java.lang~
- ~javax.swing~
- ~java.io~
- ~java.util~
? Seul ~java.lang~ (~String~, ~Math~...) est implicite.

## ann | Annale 2025 · Q21
Quel mot n'est **pas** un mot-clé Java ?
= ~String~
- ~void~
- ~int~
- ~class~
? ~String~ est une classe de ~java.lang~, pas un mot réservé.

## ann | Annale 2025 · Q23
Pour les mêmes classes ~A~ et ~D~ que la question 9 (~A.f(x)~ renvoie ~x+5~ et ~D.f(x)~ renvoie ~x+4~, statiques ; ~A.g~ renvoie 3 et ~D.g(x)~ renvoie ~x+8~), qu'affiche ~D d = new D(); A a = d; System.out.println(A.f(2) * a.g(3));~ ?
= ~77~
- ~18~
- ~21~
- ~66~
? Même calcul : 7 (statique, résolu sur ~A~) × 11 (dynamique, ~D.g~) = 77.

## ann | Annale 2025 · Q24
Combien d'instances de la classe ~A~ crée le code suivant ?
[[
A x, u, v;
x = new A();
A y = x;
A z = new A();
]]
= Deux
- Aucune
- Trois
- Cinq
? Une **instance** = un objet créé par ~new~. Les autres noms sont des **références**.

| ligne | objets créés | références |
|---|---|---|
| ~A x, u, v;~ | 0 | ~x~, ~u~, ~v~ vides |
| ~x = new A();~ | **1** | ~x~ → objet 1 |
| ~A y = x;~ | 0 | ~y~ → objet 1 (copie de la flèche) |
| ~A z = new A();~ | **1** | ~z~ → objet 2 |

Total : **2** instances.

## ann | Annale 2025 · Q25
Que sera le résultat si le fichier ~Hello.txt~ est présent ?
[[
import java.io.*;
public class Worker {
    public static void main(String argv[]) {
        Worker w = new Worker();
        System.out.println(w.work());
    }
    public int work() {
        try {
            FileInputStream dis = new FileInputStream("Hello.txt");
            System.out.print("File found.");
            return 0;
        } catch (FileNotFoundException fne) {
            System.out.print("No such file found.");
            return -1;
        } finally {
            System.out.print("Doing finally.");
        }
    }
}
]]
= ~File found.Doing finally.0~
- ~File found.0~
- ~No such file found.Doing finally.-1~
- ~No such file found.-1~
? Fichier présent. Suis le déroulé dans ~work()~ :

**1.** ~new FileInputStream("Hello.txt")~ réussit (le fichier existe), on n'entre pas dans le ~catch~.

**2.** ~print("File found.")~ s'affiche.

**3.** ~return 0~ prépare la valeur de retour (0).

**4.** Avant de quitter, le ~finally~ s'exécute : ~Doing finally.~

**5.** ~work()~ rend 0 à ~main~, qui l'affiche avec ~println~ : ~0~.

Affichage ~File found.Doing finally.0~. Si le fichier manquait : ~No such file found.Doing finally.-1~.
`;
