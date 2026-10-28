/* Évaluation finale : questions semaine 4 (classes abstraites, interfaces, polymorphisme, collections). */
const F_S4 = String.raw`
## s4 | Instancier une classe abstraite
Que se passe-t-il à la compilation ?
[[
abstract class Figure { abstract double aire(); }
public class Main {
    public static void main(String[] args) {
        Figure f = new Figure();
    }
}
]]
@fail
= Erreur : on ne peut pas instancier une classe abstraite
- Aucune erreur
- Erreur : ~aire()~ doit avoir un corps
- Aucune erreur, mais ~NullPointerException~ à l'exécution
? ~abstract~ signifie « incomplète » : la classe peut contenir des méthodes sans corps (comme ~aire()~). On ne peut pas fabriquer un objet à partir d'un plan incomplet.

**~new Figure()~** : refusé par le compilateur (« Figure is abstract; cannot be instantiated »).

Ce qui est permis : ~Figure f = new Carre(2);~, où ~Carre~ est une classe **concrète** qui complète toutes les méthodes abstraites.

## s4 | Méthode abstraite dans une classe concrète
Que se passe-t-il à la compilation ?
[[
class Figure {
    abstract double aire();
}
]]
@fail
= Erreur : une classe qui contient une méthode abstraite doit être déclarée ~abstract~
- Aucune erreur
- Erreur : ~abstract~ interdit sur une méthode
- Aucune erreur, ~aire()~ renvoie 0
? Une méthode abstraite n'a pas de corps : elle **oblige** les classes filles à l'écrire.

Une classe qui en contient une est donc **incomplète** et doit se déclarer ~abstract~.

**Ici** : ~Figure~ n'est pas déclarée ~abstract~ mais contient ~abstract double aire();~ → erreur de compilation.

Correction : ~abstract class Figure { abstract double aire(); }~.

## s4 | Méthode abstraite non implémentée
Que se passe-t-il à la compilation ?
[[
abstract class Figure { abstract double aire(); }
class Carre extends Figure { }
]]
@fail
= Erreur : ~Carre~ n'est pas abstraite et ne redéfinit pas ~aire()~
- Aucune erreur
- Erreur : ~Carre~ doit être ~final~
- Aucune erreur, ~aire()~ est héritée
? Une classe fille d'une classe abstraite a **deux choix** :

**1.** Redéfinir **toutes** les méthodes abstraites de sa mère → elle est concrète et on peut l'instancier.

**2.** Ne pas toutes les redéfinir → elle doit alors être déclarée ~abstract~.

~Carre~ ne redéfinit pas ~aire()~ et n'est pas abstraite → erreur.

Correction : ajouter ~double aire() { ... }~ dans ~Carre~.

## s4 | Constructeur d'une classe abstraite
Qu'affiche ce programme ?
[[
abstract class Figure {
    Figure() { System.out.print("F"); }
    abstract double aire();
}
class Carre extends Figure {
    Carre() { System.out.print("C"); }
    double aire() { return 1; }
}
public class Main {
    public static void main(String[] args) { new Carre(); }
}
]]
@out FC
= ~FC~
- ~CF~
- ~C~
- Erreur : une classe abstraite n'a pas de constructeur
? Une classe abstraite **a** des constructeurs : ils servent aux classes filles. On ne peut simplement pas écrire ~new Figure()~.

**1.** ~new Carre()~ → ~Carre()~ commence par ~super()~ → on saute dans ~Figure()~.

**2.** ~Figure()~ affiche ~F~.

**3.** On revient dans ~Carre()~, qui affiche ~C~.

Affichage ~FC~ (la mère d'abord).

## s4 | Classe abstraite : vrai ou faux
Quelle phrase est **vraie** ?
= On ne peut pas instancier directement une classe abstraite
- Une classe abstraite ne peut pas avoir de constructeur
- Une classe abstraite ne peut pas avoir de méthode non abstraite
- Une classe abstraite ne peut pas avoir d'attribut
? Une classe abstraite peut avoir attributs, constructeurs, méthodes concrètes et abstraites. Seule l'instanciation directe est interdite.

## s4 | Interface : vrai ou faux
Qu'est-ce qui est **faux** pour une interface ?
= Elle peut être instanciée avec ~new~
- Elle déclare des méthodes sans les implémenter
- Elle peut servir de type pour une référence
- Elle peut être implémentée par une classe
? On ne peut pas faire ~new Interface()~ (sauf classe anonyme qui l'implémente). Mais ~Interface x = new ClasseQuiImplemente();~ est très courant.

## s4 | Implémenter une interface
Que se passe-t-il à la compilation ?
[[
interface Volant { void voler(); }
class Oiseau implements Volant {
    void voler() { }
}
]]
@fail
= Erreur : la méthode d'une interface est ~public~, on ne peut pas la redéfinir avec une visibilité réduite
- Aucune erreur
- Erreur : ~implements~ doit être ~extends~
- Aucune erreur, mais ~voler()~ n'est jamais appelée
? Les méthodes d'une interface sont **automatiquement ~public~**, même sans le mot-clé. Une classe qui les implémente doit les déclarer ~public~ aussi.

**~void voler()~** (sans modificateur) a la visibilité « package », plus **faible** que ~public~.

Une redéfinition ne peut pas réduire la visibilité : erreur « attempting to assign weaker access privileges; was public ».

Correction : ~public void voler() { }~.

## s4 | Constante d'interface
Que se passe-t-il à la compilation ?
[[
interface I { int N = 5; }
public class Main {
    public static void main(String[] args) {
        I.N++;
    }
}
]]
@fail
= Erreur : les attributs d'une interface sont ~public static final~
- Aucune erreur, ~N~ vaut 6
- Erreur : une interface ne peut pas avoir d'attribut
- Aucune erreur, ~N~ reste 5
? Tout attribut d'une interface est automatiquement ~public static final~ : c'est une **constante**.

**~int N = 5;~** équivaut à ~public static final int N = 5;~.

**~I.N++~** essaie de modifier ~N~ : interdit, ~N~ est ~final~ : « cannot assign a value to final variable N ».

Les constantes servent à regrouper des valeurs partagées (par exemple ~int MAX = 10~).

## s4 | Interface qui étend une interface
Que se passe-t-il à la compilation ?
[[
interface A { void f(); }
interface B extends A { void g(); }
class C implements B {
    public void f() { }
}
]]
@fail
= Erreur : ~C~ doit aussi implémenter ~g()~
- Aucune erreur
- Erreur : une interface ne peut pas étendre une autre interface
- Aucune erreur, ~g()~ est facultative
? Une interface peut **hériter** d'une autre (avec ~extends~). Elle obtient alors ses méthodes en plus des siennes.

**~B extends A~** : ~B~ exige donc ~f()~ (héritée de ~A~) **et** ~g()~ (la sienne).

**~class C implements B~** doit donc définir les **deux**. Ici ~g()~ manque → « C is not abstract and does not override abstract method g() ».

## s4 | Polymorphisme
Qu'affiche ce programme ?
[[
abstract class Figure { abstract double aire(); }
class Carre extends Figure {
    double c;
    Carre(double c) { this.c = c; }
    double aire() { return c * c; }
}
class Rect extends Figure {
    double l, h;
    Rect(double l, double h) { this.l = l; this.h = h; }
    double aire() { return l * h; }
}
public class Main {
    public static void main(String[] args) {
        Figure[] t = { new Carre(2), new Rect(2, 3) };
        double s = 0;
        for (Figure f : t) s += f.aire();
        System.out.println(s);
    }
}
]]
@out 10.0
= ~10.0~
- ~0.0~
- ~4.0~
- Erreur de compilation
? Le tableau est déclaré ~Figure[]~ mais contient des objets de classes différentes. La boucle appelle ~f.aire()~ ; à **chaque tour**, Java regarde l'objet **réel**.

| tour | objet réel | méthode exécutée | calcul | ~s~ |
|---|---|---|---|---|
| 1 | ~Carre(2)~ | ~Carre.aire()~ | 2 × 2 = 4 | 4.0 |
| 2 | ~Rect(2,3)~ | ~Rect.aire()~ | 2 × 3 = 6 | 10.0 |

~s~ est un ~double~, donc l'affichage est ~10.0~ et non ~10~. C'est l'intérêt du polymorphisme : un seul code (~f.aire()~) pour toutes les formes.

## s4 | Méthode absente du type déclaré
Que se passe-t-il à la compilation ?
[[
class Figure { }
class Cercle extends Figure { double rayon() { return 1; } }
public class Main {
    public static void main(String[] args) {
        Figure f = new Cercle();
        System.out.println(f.rayon());
    }
}
]]
@fail
= Erreur : ~rayon()~ n'existe pas dans ~Figure~
- Affiche ~1.0~
- Affiche ~0.0~
- ~ClassCastException~ à l'exécution
? Le compilateur vérifie les appels d'après le **type déclaré** de la variable, pas d'après l'objet réel.

**~Figure f = new Cercle();~** : le compilateur ne connaît ~f~ que comme une ~Figure~.

**~f.rayon()~** : ~rayon()~ n'existe pas dans ~Figure~ → erreur « cannot find symbol », même si l'objet réel est un ~Cercle~.

Pour l'appeler, il faut descendre : ~((Cercle) f).rayon()~.

## s4 | Surcharge et type déclaré
Qu'affiche ce programme ?
[[
class Figure { }
class Cercle extends Figure { }
public class Main {
    static void m(Figure f) { System.out.print("F"); }
    static void m(Cercle c) { System.out.print("C"); }
    public static void main(String[] args) {
        Figure f = new Cercle();
        m(f);
        m(new Cercle());
    }
}
]]
@out FC
= ~FC~
- ~CC~
- ~FF~
- ~CF~
? Il y a deux mécanismes différents :

**Redéfinition (une méthode dans la mère ET la fille, même signature)** : choisie à **l'exécution**, d'après l'objet réel.

**Surcharge (plusieurs méthodes ~m~ de signatures différentes)** : choisie à la **compilation**, d'après le **type déclaré** des arguments.

Ici :

**~m(f)~** : ~f~ est déclaré ~Figure~ (même s'il contient un ~Cercle~). À la compilation, le compilateur ne voit qu'un ~Figure~ → ~m(Figure)~ → ~F~.

**~m(new Cercle())~** : l'argument est évidemment un ~Cercle~ → ~m(Cercle)~ → ~C~.

Affichage ~FC~.

## s4 | Polymorphisme et toString
Qu'affiche ce programme ?
[[
class Animal {
    public String toString() { return "animal"; }
}
class Chien extends Animal {
    public String toString() { return "chien"; }
}
public class Main {
    public static void main(String[] args) {
        Animal a = new Chien();
        System.out.println(a);
    }
}
]]
@out chien
= ~chien~
- ~animal~
- ~Animal@...~
- Erreur de compilation
? ~println(a)~ transforme ~a~ en texte avec ~a.toString()~. Quelle version ? Celle de l'objet **réel**.

**1.** ~a~ est déclaré ~Animal~, mais l'objet est un ~Chien~.

**2.** ~toString()~ est redéfinie dans ~Chien~ : liaison dynamique, c'est la version de ~Chien~ qui s'exécute.

**3.** Affichage ~chien~.

C'est le cœur du polymorphisme : le type de la variable ne décide pas de la méthode exécutée.

## s4 | Méthode de patron (template)
Qu'affiche ce programme ?
[[
abstract class Boisson {
    final void preparer() { System.out.print(eau() + "-" + ajout()); }
    String eau() { return "eau"; }
    abstract String ajout();
}
class Cafe extends Boisson {
    String ajout() { return "cafe"; }
}
public class Main {
    public static void main(String[] args) { new Cafe().preparer(); }
}
]]
@out eau-cafe
= ~eau-cafe~
- ~eau-~
- ~-cafe~
- Erreur de compilation
? ~preparer()~ fixe les étapes ; deux d'entre elles sont complétées par les filles. Suis l'appel ~new Cafe().preparer()~ :

**1.** ~preparer()~ est héritée de ~Boisson~ et s'exécute pour l'objet ~Cafe~.

**2.** ~eau()~ : définie dans ~Boisson~, non redéfinie → ~"eau"~.

**3.** ~ajout()~ : abstraite dans ~Boisson~, implémentée dans ~Cafe~ → ~"cafe"~.

**4.** On affiche ~"eau" + "-" + "cafe"~ = ~eau-cafe~.

## s4 | Comparable
Qu'affiche ce programme ?
[[
class P implements Comparable<P> {
    int age;
    P(int age) { this.age = age; }
    public int compareTo(P o) { return age - o.age; }
}
public class Main {
    public static void main(String[] args) {
        List<P> l = new ArrayList<>();
        l.add(new P(30)); l.add(new P(10)); l.add(new P(20));
        Collections.sort(l);
        for (P p : l) System.out.print(p.age + " ");
    }
}
]]
@out 10 20 30
= ~10 20 30~
- ~30 10 20~
- ~30 20 10~
- Erreur : ~sort~ nécessite un ~Comparator~
? **~compareTo~ dit à ~sort~ qui passe avant qui.** ~age - o.age~ est négatif quand ~this~ est plus jeune que ~o~ : donc ~this~ passe **avant**. Ordre croissant des âges.

Tri de ~[30, 10, 20]~ :

- 10 est le plus petit → en premier ;
- puis 20 ;
- puis 30.

Résultat affiché ~10 20 30~.

Si ~P~ n'implémentait pas ~Comparable~, ~Collections.sort(l)~ ne compilerait pas : il ne saurait pas comparer deux ~P~.

## s4 | Comparator
Qu'affiche ce programme ?
[[
public class Main {
    public static void main(String[] args) {
        List<String> l = new ArrayList<>(List.of("b", "c", "a"));
        Collections.sort(l, (x, y) -> y.compareTo(x));
        System.out.println(l);
    }
}
]]
@out [c, b, a]
= ~[c, b, a]~
- ~[a, b, c]~
- ~[b, c, a]~
- ~[a, c, b]~
? Un ~Comparator~ dit à ~sort~ **comment** comparer deux éléments ~x~ et ~y~ : négatif → ~x~ avant ~y~, positif → ~x~ après ~y~.

**~(x, y) -> y.compareTo(x)~** : on compare **à l'envers** (~y~ par rapport à ~x~).

Pour ~"c"~ et ~"a"~ : ~"a".compareTo("c")~ est négatif, donc ~"c"~ passe **avant** ~"a"~. Les grands passent en premier.

Tri de ~[b, c, a]~ : ~[c, b, a]~ (ordre décroissant).

## s4 | sort sans Comparable
Que se passe-t-il à la compilation ?
[[
class Chose { }
public class Main {
    public static void main(String[] args) {
        List<Chose> l = new ArrayList<>();
        Collections.sort(l);
    }
}
]]
@fail
= Erreur : ~Chose~ n'est pas ~Comparable~ (pas d'ordre naturel)
- Aucune erreur
- Aucune erreur, mais ~ClassCastException~ à l'exécution
- Aucune erreur, l'ordre est celui de la création
? Pour trier une liste, Java doit savoir **comparer deux éléments**. Il y a deux possibilités :

**1.** La classe implémente ~Comparable~ (ordre naturel), avec ~compareTo~.

**2.** On fournit un ~Comparator~ à ~sort~.

~Chose~ n'a ni l'un ni l'autre : ~Collections.sort(l)~ est refusé à la compilation (« no suitable method found for sort »).

## s4 | remove(int) ou remove(Object)
Qu'affiche ce programme ?
[[
public class Main {
    public static void main(String[] args) {
        List<Integer> l = new ArrayList<>(List.of(10, 20, 30));
        l.remove(1);
        l.remove(Integer.valueOf(10));
        System.out.println(l);
    }
}
]]
@out [30]
= ~[30]~
- ~[10, 30]~
- ~[20, 30]~
- ~[]~
? ~remove~ existe en **deux versions** pour une ~List<Integer>~ :

- ~remove(int index)~ : supprime l'élément **à cet indice** ;
- ~remove(Object o)~ : supprime **cet objet**.

Départ : ~[10, 20, 30]~ (indices 0, 1, 2).

**~l.remove(1)~** : l'argument est un ~int~ → c'est un **indice** → on retire l'élément d'indice 1, qui est 20 → ~[10, 30]~.

**~l.remove(Integer.valueOf(10))~** : l'argument est un objet ~Integer~ → on retire **l'objet 10** → ~[30]~.

Affichage ~[30]~. Piège : ~l.remove(10)~ chercherait l'indice 10 et lancerait une exception.

## s4 | Méthodes d'ArrayList
Qu'affiche ce programme ?
[[
public class Main {
    public static void main(String[] args) {
        List<String> l = new ArrayList<>();
        l.add("a"); l.add("b");
        l.add(1, "x");
        l.set(0, "z");
        System.out.println(l + " " + l.indexOf("b") + " " + l.contains("a"));
    }
}
]]
@out [z, x, b] 2 false
= ~[z, x, b] 2 false~
- ~[a, x, b] 2 true~
- ~[z, x, b] 1 false~
- ~[z, b] 1 false~
? Suis la liste après chaque instruction :

| instruction | liste |
|---|---|
| ~l.add("a"); l.add("b");~ | ~[a, b]~ |
| ~l.add(1, "x");~ | ~[a, x, b]~ (on insère à l'indice 1, ~b~ est décalé) |
| ~l.set(0, "z");~ | ~[z, x, b]~ (remplace l'indice 0) |

**~l.indexOf("b")~** : ~b~ est à l'indice 2 → ~2~.

**~l.contains("a")~** : ~a~ a été remplacé par ~z~ → ~false~.

Affichage ~[z, x, b] 2 false~.

## s4 | Indice hors liste
Que se passe-t-il ?
[[
public class Main {
    public static void main(String[] args) {
        List<String> l = new ArrayList<>();
        l.add("a");
        System.out.println(l.get(1));
    }
}
]]
@exc IndexOutOfBoundsException
= ~IndexOutOfBoundsException~
- Affiche ~null~
- Affiche ~a~
- Erreur de compilation
? La liste contient un seul élément : **seul l'indice 0 existe**.

**~l.get(1)~** demande un élément qui n'existe pas → ~IndexOutOfBoundsException~ (« Index 1 out of bounds for length 1 »).

À ne pas confondre : ~HashMap.get("absent")~ ne lance rien, il renvoie ~null~.

## s4 | Suppression pendant un parcours
Que se passe-t-il ?
[[
public class Main {
    public static void main(String[] args) {
        List<String> l = new ArrayList<>(List.of("a", "b", "c", "d"));
        for (String s : l) {
            if (s.equals("b")) l.remove(s);
        }
        System.out.println(l);
    }
}
]]
@exc ConcurrentModificationException
= ~ConcurrentModificationException~
- Affiche ~[a, c, d]~
- Affiche ~[a, b, c, d]~
- Erreur de compilation
? Le ~for-each~ utilise en coulisse un **itérateur** qui compte les modifications de la liste. Si la liste est modifiée **sans passer par lui**, au prochain tour il s'en aperçoit et lance ~ConcurrentModificationException~.

**1.** La liste est ~[a, b, c, d]~. Tour 1 : ~s = "a"~, rien.

**2.** Tour 2 : ~s = "b"~, ~l.remove(s)~ modifie la liste directement.

**3.** Au tour 3, l'itérateur constate que la liste a changé → exception.

Pour supprimer en parcourant : ~it.remove()~ avec un ~Iterator~, ou une boucle ~for (int i...)~ en gérant les indices.

## s4 | Iterator.remove
Qu'affiche ce programme ?
[[
public class Main {
    public static void main(String[] args) {
        List<String> l = new ArrayList<>(List.of("a", "b", "c", "d"));
        Iterator<String> it = l.iterator();
        while (it.hasNext()) {
            if (it.next().equals("b")) it.remove();
        }
        System.out.println(l);
    }
}
]]
@out [a, c, d]
= ~[a, c, d]~
- ~[a, b, c, d]~
- ~[a, d]~
- Une ~ConcurrentModificationException~
? Un ~Iterator~ parcourt la liste et sait **la modifier proprement**.

**1.** ~it.next()~ avance et renvoie l'élément courant.

**2.** Quand l'élément est ~"b"~, ~it.remove()~ **supprime cet élément** de la liste, et l'itérateur ajuste sa position.

**3.** Le parcours continue avec ~c~ puis ~d~, sans erreur.

Résultat ~[a, c, d]~. Contrairement au ~for-each~ avec ~l.remove~, aucune ~ConcurrentModificationException~.

## s4 | HashMap
Qu'affiche ce programme ?
[[
public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        m.put("a", 1);
        m.put("a", 2);
        System.out.println(m.size() + " " + m.get("a") + " " + m.get("z"));
    }
}
]]
@out 1 2 null
= ~1 2 null~
- ~2 1 0~
- ~2 2 null~
- ~1 2~ suivi d'une exception
? Une ~Map~ associe une **clé unique** à une valeur.

| instruction | contenu de la map |
|---|---|
| ~m.put("a", 1)~ | ~{a=1}~ |
| ~m.put("a", 2)~ | ~{a=2}~ (même clé : la valeur est **remplacée**) |

**~m.size()~** : 1 clé → ~1~.

**~m.get("a")~** : ~2~.

**~m.get("z")~** : clé absente → ~null~ (pas d'exception).

Affichage ~1 2 null~.

## s4 | HashMap : ordre
Que garantit ~HashMap~ sur l'ordre de parcours de ses éléments ?
= Aucun ordre particulier n'est garanti
- L'ordre d'insertion
- L'ordre alphabétique des clés
- L'ordre inverse d'insertion
? ~HashMap~ n'a pas d'ordre garanti. ~LinkedHashMap~ garde l'ordre d'insertion, ~TreeMap~ trie par clé.

## s4 | HashSet
Qu'affiche ce programme ?
[[
public class Main {
    public static void main(String[] args) {
        Set<String> s = new HashSet<>();
        s.add("a");
        System.out.println(s.add("a") + " " + s.size());
    }
}
]]
@out false 1
= ~false 1~
- ~true 2~
- ~true 1~
- ~false 2~
? Un ~Set~ ne contient **jamais deux fois** le même élément.

**1.** ~s.add("a")~ : l'ensemble est vide, ~"a"~ est ajouté. (On ignore le résultat de ce premier ~add~.)

**2.** ~s.add("a")~ dans le ~println~ : ~"a"~ est déjà là → rien n'est ajouté, la méthode renvoie ~false~.

**3.** ~s.size()~ : toujours ~1~.

Affichage ~false 1~.

## s4 | HashSet et equals/hashCode
Qu'affiche ce programme ?
[[
class P { int x; P(int x) { this.x = x; } }
public class Main {
    public static void main(String[] args) {
        Set<P> s = new HashSet<>();
        s.add(new P(1));
        s.add(new P(1));
        System.out.println(s.size());
    }
}
]]
@out 2
= ~2~
- ~1~
- ~0~
- Erreur de compilation
? Un ~HashSet~ garde un seul exemplaire de deux éléments « égaux ». Il décide de l'égalité avec ~hashCode()~ puis ~equals()~.

La classe ~P~ ne redéfinit ni l'un ni l'autre : elle utilise ceux d'~Object~, qui comparent les **adresses**.

~new P(1)~ et ~new P(1)~ sont deux objets, donc deux adresses différentes → l'ensemble les considère comme **différents** → il en contient **2**.

Pour que ce soit 1, il faudrait redéfinir ~equals~ **et** ~hashCode~ pour comparer ~x~.

## s4 | contains et equals
Qu'affiche ce programme ?
[[
class P {
    int x;
    P(int x) { this.x = x; }
    public boolean equals(Object o) { return o instanceof P && ((P) o).x == x; }
}
public class Main {
    public static void main(String[] args) {
        List<P> l = new ArrayList<>();
        l.add(new P(1));
        System.out.println(l.contains(new P(1)) + " " + l.indexOf(new P(2)));
    }
}
]]
@out true -1
= ~true -1~
- ~false -1~
- ~true 0~
- ~false 0~
? ~contains~ et ~indexOf~ cherchent dans la liste en appelant ~equals~ sur les éléments.

**1.** La liste contient un ~P(1)~.

**2.** ~l.contains(new P(1))~ : ~equals~ compare avec le ~P(1)~ de la liste : ~x~ vaut 1 des deux côtés → ~true~.

**3.** ~l.indexOf(new P(2))~ : ~equals~ compare ~2~ avec ~1~ → aucun élément ne correspond → ~-1~ (convention « non trouvé »).

Sans la redéfinition de ~equals~, ~contains~ renverrait ~false~ (comparaison d'adresses).

## s4 | Types génériques
Que se passe-t-il à la compilation ?
[[
List<String> l = new ArrayList<>();
l.add(5);
]]
@wrap
@fail
= Erreur : on ne peut ajouter qu'une ~String~ dans une ~List<String>~
- Aucune erreur : ~5~ est converti en ~"5"~
- Aucune erreur, mais exception à l'exécution
- Aucune erreur, l'élément est ignoré
? ~List<String>~ est une liste **réservée aux ~String~**. Le compilateur vérifie chaque ajout.

**~l.add(5);~** : ~5~ est un ~int~ (donc un ~Integer~ après autoboxing), pas une ~String~ → erreur « incompatible types ».

C'est tout l'intérêt des génériques : l'erreur est trouvée **à la compilation** et non plus à l'exécution (par un ~ClassCastException~).

## s4 | Types primitifs et génériques
Que se passe-t-il à la compilation ?
[[
List<int> l = new ArrayList<>();
]]
@wrap
@fail
= Erreur : un type générique doit être un objet (on écrit ~List<Integer>~)
- Aucune erreur
- Aucune erreur, mais ~l~ est vide
- Erreur : ~ArrayList~ n'a pas de constructeur sans paramètre
? Les génériques fonctionnent uniquement avec des **objets**. Les types primitifs (~int~, ~double~, ~boolean~...) ne sont pas des objets.

**~List<int>~** : refusé (« unexpected type; required: reference, found: int »).

On utilise les **classes enveloppes** (~wrappers~) : ~List<Integer>~, ~List<Double>~, ~List<Boolean>~. L'autoboxing convertit tout seul entre ~int~ et ~Integer~.

## s4 | Autoboxing et null
Que se passe-t-il ?
[[
Integer i = null;
int j = i;
]]
@wrap
@exc NullPointerException
= ~NullPointerException~
- ~j~ vaut 0
- Erreur de compilation
- ~j~ vaut ~null~
? **~Integer i = null;~** : ~i~ ne désigne aucun objet.

**~int j = i;~** : Java convertit automatiquement l'~Integer~ en ~int~ en appelant en coulisse ~i.intValue()~.

Appeler une méthode sur ~null~ → ~NullPointerException~.

Piège classique avec les collections : ~int x = map.get("absent");~ lance l'exception, car ~get~ renvoie ~null~.

## s4 | Liste de la classe mère
Que se passe-t-il à la compilation ?
[[
class Figure { }
class Cercle extends Figure { }
public class Main {
    public static void main(String[] args) {
        List<Figure> a = new ArrayList<Figure>();
        a.add(new Cercle());
        List<Figure> b = new ArrayList<Cercle>();
    }
}
]]
@fail
= Erreur sur ~List<Figure> b = new ArrayList<Cercle>()~ : ~List<Cercle>~ n'est pas une ~List<Figure>~
- Erreur sur ~a.add(new Cercle())~
- Aucune erreur
- Erreur sur la ligne de ~a~
? Examine chaque ligne :

**~List<Figure> a = new ArrayList<Figure>();~** : correct.

**~a.add(new Cercle());~** : correct, un ~Cercle~ **est une** ~Figure~.

**~List<Figure> b = new ArrayList<Cercle>();~** : refusé. Si c'était permis, on pourrait ensuite faire ~b.add(new Carre())~ sur une liste qui ne doit contenir que des ~Cercle~. Les génériques sont **invariants** : ~List<Cercle>~ n'est pas une ~List<Figure>~, même si ~Cercle~ hérite de ~Figure~.

## s4 | Collections.reverse
Qu'affiche ce programme ?
[[
public class Main {
    public static void main(String[] args) {
        List<Integer> l = new ArrayList<>(List.of(1, 2, 3));
        Collections.reverse(l);
        System.out.println(l + " " + Collections.max(l));
    }
}
]]
@out [3, 2, 1] 3
= ~[3, 2, 1] 3~
- ~[1, 2, 3] 3~
- ~[3, 2, 1] 1~
- ~[1, 2, 3] 1~
? Deux méthodes de la classe utilitaire ~Collections~ :

**~Collections.reverse(l)~** : **inverse l'ordre** de la liste sur place : ~[1, 2, 3]~ devient ~[3, 2, 1]~.

**~Collections.max(l)~** : renvoie le **plus grand élément**, quel que soit l'ordre des éléments : ~3~.

Affichage ~[3, 2, 1] 3~.

## s4 | Arrays.toString
Qu'affiche ce programme ?
[[
public class Main {
    public static void main(String[] args) {
        int[] t = { 3, 1, 2 };
        Arrays.sort(t);
        System.out.println(Arrays.toString(t));
    }
}
]]
@out [1, 2, 3]
= ~[1, 2, 3]~
- ~[3, 1, 2]~
- ~[I@...~ (adresse du tableau)
- ~1 2 3~
? **1.** ~int[] t = {3, 1, 2};~

**2.** ~Arrays.sort(t);~ trie le tableau **sur place** : ~{1, 2, 3}~.

**3.** ~Arrays.toString(t)~ fabrique un texte lisible : ~"[1, 2, 3]"~.

Sans ~Arrays.toString~, ~System.out.println(t)~ afficherait le type et l'adresse du tableau (~[I@6d06d69c~).

## s4 | Classe anonyme
Qu'affiche ce programme ?
[[
interface Salut { String dire(); }
public class Main {
    public static void main(String[] args) {
        Salut s = new Salut() {
            public String dire() { return "coucou"; }
        };
        System.out.println(s.dire());
    }
}
]]
@out coucou
= ~coucou~
- Erreur : on ne peut pas faire ~new~ sur une interface
- ~null~
- Erreur : il manque ~implements~
? On ne peut pas faire ~new Salut()~ tout court (interface), mais on peut écrire **à la volée** une classe sans nom qui l'implémente :

**~new Salut() { public String dire() { return "coucou"; } }~**

Cette classe anonyme implémente la seule méthode abstraite de l'interface. L'objet obtenu est rangé dans ~s~ (de type ~Salut~).

**~s.dire()~** exécute cette méthode : ~coucou~.

## s4 | Interface comme type
Qu'affiche ce programme ?
[[
interface Forme { double aire(); }
class Carre implements Forme {
    public double aire() { return 4; }
}
public class Main {
    public static void main(String[] args) {
        Forme f = new Carre();
        System.out.println(f.aire() + " " + (f instanceof Carre));
    }
}
]]
@out 4.0 true
= ~4.0 true~
- ~4 true~
- ~4.0 false~
- Erreur de compilation
? **~Forme f = new Carre();~** est permis : ~Carre~ implémente ~Forme~, donc un ~Carre~ **est une** ~Forme~. ~f~ est déclaré ~Forme~ mais l'objet réel est un ~Carre~.

**~f.aire()~** : ~aire()~ existe dans ~Forme~ → compile. À l'exécution, c'est ~Carre.aire()~ qui renvoie ~4~. Le type de retour est ~double~, donc l'affichage est ~4.0~.

**~f instanceof Carre~** : l'objet réel est un ~Carre~ → ~true~.

Affichage ~4.0 true~.

## s4 | Classe et interface
Quelle déclaration est correcte ?
= ~class A extends B implements I, J~
- ~class A implements B extends I~
- ~class A extends B, C implements I~
- ~class A implements B, I extends J~
? Une classe étend **une seule** classe (~extends~ en premier) et implémente **plusieurs** interfaces (~implements~, séparées par des virgules).

## s4 | Choisir entre abstract et interface
Quand préférer une **interface** à une classe abstraite ?
= Quand on veut définir un contrat que des classes sans lien d'héritage peuvent respecter
- Quand on veut partager des attributs et du code
- Quand on veut un constructeur
- Quand on veut une seule implémentation
? Interface : contrat pur, plusieurs par classe. Classe abstraite : base commune (attributs, code partagé, constructeur) pour une famille de classes.

## s4 | Vector et ArrayList
Quelle est la principale différence entre ~Vector~ et ~ArrayList~ ?
= ~Vector~ est synchronisé (sûr entre threads) donc plus lent ; ~ArrayList~ ne l'est pas
- ~Vector~ n'accepte que des ~int~
- ~ArrayList~ n'a pas de méthode ~get~
- ~Vector~ est plus récent
? Les deux sont des listes à tableau dynamique ; ~Vector~ (ancien) est synchronisé. On préfère ~ArrayList~ sauf besoin de synchronisation.

## s4 | List ou ArrayList
Quelle déclaration est la plus souple pour changer d'implémentation plus tard ?
= ~List<String> l = new ArrayList<>();~
- ~ArrayList<String> l = new ArrayList<>();~
- ~Object l = new ArrayList<String>();~
- ~Vector l = new ArrayList<String>();~
? **Programmer vers l'interface** : le type déclaré est ~List~, on pourra remplacer ~new ArrayList~ par ~new LinkedList~ sans rien changer d'autre.
`;
