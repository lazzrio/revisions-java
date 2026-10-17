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
? ~abstract~ interdit ~new~. On instancie une **classe fille concrète** : ~Figure f = new Carre(2);~ (type déclaré abstrait, objet réel concret).

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
? Une méthode abstraite (sans corps) force la classe à être abstraite. L'inverse n'est pas vrai : une classe abstraite peut ne contenir aucune méthode abstraite.

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
? Une classe fille concrète doit **implémenter toutes** les méthodes abstraites de sa mère (sinon elle doit être abstraite elle aussi).

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
? Une classe abstraite **a** des constructeurs (appelés par ~super()~ des filles), mais on ne peut pas faire ~new Figure()~.

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
? Les méthodes d'interface sont implicitement ~public abstract~. L'implémentation doit être ~public~.

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
? Les attributs d'interface sont des **constantes** (~public static final~ implicites).

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
? ~B~ hérite de ~f()~ et ajoute ~g()~ : une classe qui implémente ~B~ doit définir **les deux**.

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
? À l'exécution, chaque appel ~f.aire()~ exécute la méthode de la classe **réelle** : 4 pour le carré, 6 pour le rectangle : total 10.0.

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
? Le compilateur ne regarde que le **type déclaré** (~Figure~). Il faudrait un cast : ~((Cercle) f).rayon()~.

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
? Le choix **entre surcharges** se fait à la compilation d'après le type **déclaré** : ~f~ est un ~Figure~ → ~m(Figure)~. Le polymorphisme (type réel) ne joue que pour la **redéfinition**.

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
? ~println(a)~ appelle ~a.toString()~ : liaison dynamique, version de la classe réelle (~Chien~).

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
? ~preparer()~ (concrète, ~final~) appelle ~eau()~ (concrète) et ~ajout()~ (abstraite, implémentée par ~Cafe~ : polymorphisme).

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
? ~Collections.sort(l)~ utilise l'**ordre naturel** défini par ~compareTo~. Résultat négatif : ~this~ avant l'autre.

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
? Le comparateur inverse l'ordre : ~y.compareTo(x)~ au lieu de ~x.compareTo(y)~. Ordre **décroissant**.

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
? ~Collections.sort(List<T>)~ exige ~T extends Comparable<T>~ : il faut implémenter ~Comparable~ ou passer un ~Comparator~.

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
? ~remove(1)~ avec un ~int~ supprime l'**élément d'indice 1** (20). ~remove(Integer.valueOf(10))~ supprime l'**objet** 10. Reste ~[30]~.

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
? ~[a,b]~ → ~add(1,"x")~ → ~[a,x,b]~ → ~set(0,"z")~ → ~[z,x,b]~. ~indexOf("b")~ = 2. ~"a"~ n'est plus dans la liste.

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
? La liste n'a qu'un élément (indice 0). ~get(1)~ lance ~IndexOutOfBoundsException~ (contrairement à ~HashMap.get~ qui renvoie ~null~).

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
? Modifier une liste pendant un ~for-each~ invalide l'itérateur. Pour supprimer en parcourant : utiliser un ~Iterator~ et ~it.remove()~, ou une boucle avec indice.

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
? ~it.remove()~ supprime **proprement** le dernier élément renvoyé par ~next()~, sans invalider l'itérateur.

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
? Une clé est **unique** : le second ~put~ remplace la valeur. ~get~ d'une clé absente renvoie ~null~ (pas d'exception).

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
? Un ensemble n'a pas de doublons : ~add~ renvoie ~false~ si l'élément est déjà présent, et la taille reste 1.

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
? Sans ~equals~ et ~hashCode~ redéfinies, deux objets distincts sont toujours différents : l'ensemble en contient deux. Avec ces deux méthodes redéfinies sur ~x~, le résultat serait 1.

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
? ~contains~, ~indexOf~, ~remove(Object)~ utilisent ~equals~. Redéfinie : un ~P(1)~ est trouvé. ~indexOf~ d'un élément absent vaut ~-1~.

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
? Les génériques servent à détecter ces erreurs **à la compilation**.

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
? Les collections contiennent des **objets** : ~Integer~, ~Double~, ~Boolean~... (l'autoboxing convertit ~int~ ↔ ~Integer~).

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
? Le déballage automatique (~i.intValue()~) sur ~null~ lance une ~NullPointerException~.

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
? On peut **ajouter** un ~Cercle~ dans une ~List<Figure>~ (polymorphisme sur l'élément), mais les génériques sont **invariants** : ~List<Cercle>~ n'est pas un sous-type de ~List<Figure>~.

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
? ~reverse~ inverse l'ordre ; ~max~ renvoie le plus grand élément (3), quel que soit l'ordre.

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
? ~Arrays.sort~ trie le tableau sur place ; ~Arrays.toString~ le formate. (~System.out.println(t)~ afficherait ~[I@hash~.)

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
? On peut instancier une interface en **fournissant tout de suite** son implémentation dans une classe anonyme.

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
? Une interface est un type valide pour une variable ; l'objet réel est un ~Carre~. ~aire()~ renvoie un ~double~ : ~4.0~.

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
