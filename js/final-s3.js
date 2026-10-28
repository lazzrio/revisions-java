/* Évaluation finale : questions semaine 3 (concepts de base : références, constructeurs, equals, toString, package). */
const F_S3 = String.raw`
## s3 | Affectation d'objets
Qu'affiche ce programme ?
[[
class Point { int x; Point(int x) { this.x = x; } }
public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(1);
        Point p2 = p1;
        p2.x = 9;
        p2 = new Point(3);
        System.out.println(p1.x + " " + p2.x);
    }
}
]]
@out 9 3
= ~9 3~
- ~1 3~
- ~9 9~
- ~1 1~
? Dessine deux flèches : une variable objet est une **flèche** vers un objet, pas l'objet lui-même.

**~Point p1 = new Point(1);~** : un objet ~Point(x=1)~ ; ~p1~ pointe dessus.

**~Point p2 = p1;~** : ~p2~ reçoit la même flèche. **Un seul objet**, deux flèches.

**~p2.x = 9;~** : on suit la flèche et on modifie l'objet (partagé) : ~x = 9~, vu aussi par ~p1~.

**~p2 = new Point(3);~** : ~p2~ reçoit une **nouvelle flèche**, vers un nouvel objet ~Point(3)~. ~p1~ n'a pas bougé.

Donc ~p1.x = 9~ et ~p2.x = 3~. Affichage ~9 3~.

## s3 | equals non redéfinie
Qu'affiche ce code ?
[[
class Point { int x; Point(int x) { this.x = x; } }
public class Main {
    public static void main(String[] args) {
        System.out.println(new Point(1).equals(new Point(1)));
    }
}
]]
@out false
= ~false~
- ~true~
- Erreur de compilation
- ~NullPointerException~
? Sans redéfinition, ~equals~ d'~Object~ compare les **adresses** (comme ~==~) : deux objets distincts sont différents même avec les mêmes valeurs.

## s3 | equals redéfinie
Qu'affiche ce code ?
[[
class Point {
    int x;
    Point(int x) { this.x = x; }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return x == ((Point) o).x;
    }
}
public class Main {
    public static void main(String[] args) {
        Point a = new Point(1), b = new Point(1);
        System.out.println(a.equals(b) + " " + (a == b));
    }
}
]]
@out true false
= ~true false~
- ~true true~
- ~false false~
- ~false true~
? Ne mélange pas les deux comparaisons.

**~a.equals(b)~** appelle l'~equals~ redéfinie. Elle : (1) renvoie ~true~ si c'est le même objet ; (2) renvoie ~false~ si ~o~ est ~null~ ou d'une autre classe ; (3) compare les valeurs ~x~ : 1 et 1 → ~true~.

**~a == b~** compare les **adresses**. ~a~ et ~b~ ont été créés par deux ~new~ : deux objets, deux adresses → ~false~.

Affichage ~true false~. Redéfinir ~equals~ change la notion d'égalité des **valeurs**, jamais celle de ~==~.

## s3 | equals(Point) n'est pas une redéfinition
Qu'affiche ce programme ?
[[
class Point {
    int x;
    Point(int x) { this.x = x; }
    public boolean equals(Point p) { return x == p.x; }
}
public class Main {
    public static void main(String[] args) {
        Point a = new Point(1);
        Object o = new Point(1);
        System.out.println(a.equals(new Point(1)) + " " + a.equals(o));
    }
}
]]
@out true false
= ~true false~
- ~true true~
- ~false false~
- ~false true~
? **Le piège :** la méthode d'~Object~ s'appelle ~equals(Object o)~. Ici on a écrit ~equals(Point p)~ : le paramètre est de type ~Point~, pas ~Object~. Ce n'est **pas** une redéfinition mais une **surcharge**. ~Point~ possède donc **deux** méthodes ~equals~.

Java choisit la méthode d'après le **type déclaré** de l'argument.

**~a.equals(new Point(1))~** : l'argument est un ~Point~ → ~equals(Point)~, qui compare les ~x~ (1 et 1) → ~true~.

**~a.equals(o)~** : ~o~ est déclaré ~Object~ (même s'il contient un ~Point~) → c'est ~equals(Object)~ d'~Object~ qui est appelée, et elle compare les **adresses** → ~false~.

Affichage ~true false~. Correction : écrire ~equals(Object o)~ avec ~@Override~ (le compilateur signalerait la faute).

## s3 | toString et println
Qu'affiche ce programme ?
[[
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    @Override
    public String toString() { return "(" + x + "," + y + ")"; }
}
public class Main {
    public static void main(String[] args) {
        Point p = new Point(1, 2);
        System.out.println("p=" + p);
    }
}
]]
@out p=(1,2)
= ~p=(1,2)~
- ~p=Point@...~
- ~p=~
- ~(1,2)~
? La concaténation d'un objet avec une ~String~ (comme ~println(objet)~) appelle automatiquement sa méthode ~toString()~.

## s3 | Chaînage de constructeurs
Qu'affiche ce programme ?
[[
class E {
    int x;
    E() { x = 2; }
    E(int a) { this(); x *= a; }
    E(int a, int b) { this(a + b); x -= 1; }
}
public class Main {
    public static void main(String[] args) {
        System.out.println(new E(3, 4).x);
    }
}
]]
@out 13
= ~13~
- ~14~
- ~7~
- ~6~
? Appelle les constructeurs dans l'ordre : ~this(...)~ **saute** vers un autre constructeur avant de continuer.

**1.** ~new E(3, 4)~ → ~E(int a, int b)~ avec ~a = 3~, ~b = 4~. Première ligne : ~this(a + b)~ = ~this(7)~, on saute dans ~E(int)~.

**2.** ~E(int a)~ avec ~a = 7~. Première ligne : ~this()~, on saute dans ~E()~.

**3.** ~E()~ : ~x = 2~.

**4.** Retour dans ~E(int a)~ : ~x *= 7~ → ~x = 14~.

**5.** Retour dans ~E(int, int)~ : ~x -= 1~ → ~x = 13~.

Affichage ~13~. Les corps s'exécutent **dans l'ordre inverse des appels** : le plus « profond » d'abord.

## s3 | Constructeur par défaut supprimé
Que se passe-t-il à la compilation ?
[[
class A { A(int x) { } }
public class Main {
    public static void main(String[] args) { A a = new A(); }
}
]]
@fail
= Erreur : ~A~ n'a pas de constructeur sans paramètre
- Aucune erreur
- Aucune erreur, ~x~ vaut 0
- Erreur : ~A~ doit être ~abstract~
? Le constructeur par défaut n'existe que si **aucun** constructeur n'est écrit.

## s3 | Surcharge ambiguë
Que se passe-t-il à la compilation ?
[[
public class Main {
    static void f(Integer x) { System.out.println("I"); }
    static void f(String x) { System.out.println("S"); }
    public static void main(String[] args) { f(null); }
}
]]
@fail
= Erreur : appel ambigu, ~null~ convient aux deux méthodes
- Affiche ~I~
- Affiche ~S~
- ~NullPointerException~
? ~null~ est compatible avec n'importe quel type objet : le compilateur ne peut pas choisir.

## s3 | Surcharge par type de retour
Que se passe-t-il à la compilation ?
[[
class A {
    int f() { return 1; }
    double f() { return 2.0; }
}
]]
@fail
= Erreur : deux méthodes ~f()~ ne diffèrent que par le type de retour
- Aucune erreur : c'est une surcharge valide
- Aucune erreur : c'est une redéfinition valide
- Erreur : ~f~ doit être ~static~
? La signature (nom + paramètres) doit différer pour surcharger. Le type de retour ne compte pas.

## s3 | Paramètre qui masque l'attribut
Qu'affiche ce programme ?
[[
class P {
    int x;
    P(int x) { x = x; }
}
public class Main {
    public static void main(String[] args) {
        System.out.println(new P(5).x);
    }
}
]]
@out 0
= ~0~
- ~5~
- ~null~
- Erreur de compilation
? Dans le constructeur, il y a **deux** variables nommées ~x~ : l'attribut de l'objet et le paramètre. Quand on écrit simplement ~x~, Java prend **la plus proche** : le **paramètre**.

~x = x;~ signifie donc « mets le paramètre dans le paramètre » : ça ne fait rien. L'attribut ~x~ de l'objet n'est jamais modifié et garde sa valeur par défaut : **0**.

Pour viser l'attribut, on écrit ~this.x = x;~ (« le ~x~ de **cet objet** reçoit le paramètre ~x~ »). Ici affichage ~0~.

## s3 | getClass
Qu'affiche ce code ?
[[
class Animal { }
class Chien extends Animal { }
public class Main {
    public static void main(String[] args) {
        Animal a = new Chien();
        System.out.println(a.getClass().getSimpleName());
    }
}
]]
@out Chien
= ~Chien~
- ~Animal~
- ~Object~
- ~Class~
? ~getClass()~ renvoie la classe **réelle** de l'objet, pas le type déclaré de la variable.

## s3 | Tableau d'objets
Que se passe-t-il ?
[[
class Point { int x; }
public class Main {
    public static void main(String[] args) {
        Point[] t = new Point[3];
        t[0].x = 1;
    }
}
]]
@exc NullPointerException
= ~NullPointerException~ : ~t[0]~ vaut ~null~
- ~ArrayIndexOutOfBoundsException~
- Aucune erreur, ~t[0].x~ vaut 1
- Erreur de compilation
? ~new Point[3]~ crée trois références **vides**. Il faut créer chaque objet : ~t[0] = new Point();~.

## s3 | Agrégation et références partagées
Qu'affiche ce programme ?
[[
class Point { int x; Point(int x) { this.x = x; } }
class Segment {
    Point debut, fin;
    Segment(Point d, Point f) { debut = d; fin = f; }
}
public class Main {
    public static void main(String[] args) {
        Point a = new Point(0);
        Segment s = new Segment(a, new Point(1));
        a.x = 5;
        System.out.println(s.debut.x);
    }
}
]]
@out 5
= ~5~
- ~0~
- ~1~
- Erreur de compilation
? Un ~Segment~ ne fabrique pas de nouveaux points : son constructeur **range les deux flèches** qu'on lui donne.

**1.** ~a = new Point(0)~ : un objet ~Point(0)~.

**2.** ~new Segment(a, new Point(1))~ : ~s.debut~ reçoit la **même flèche** que ~a~ (même objet), ~s.fin~ un autre point.

**3.** ~a.x = 5~ modifie l'objet pointé par ~a~... qui est aussi celui de ~s.debut~.

**4.** ~s.debut.x~ vaut donc ~5~.

Si le segment devait être indépendant, son constructeur devrait **copier** le point : ~debut = new Point(d.x)~.

## s3 | Objet passé en paramètre
Qu'affiche ce programme ?
[[
class Point { int x; Point(int x) { this.x = x; } }
public class Main {
    static void f(Point p) {
        p.x = 7;
        p = new Point(0);
    }
    public static void main(String[] args) {
        Point a = new Point(1);
        f(a);
        System.out.println(a.x);
    }
}
]]
@out 7
= ~7~
- ~1~
- ~0~
- Erreur de compilation
? Dans ~f(a)~, le paramètre ~p~ reçoit **une copie de la flèche** de ~a~ : les deux flèches pointent vers le même objet.

**~p.x = 7;~** : on suit la flèche et on modifie l'objet. ~a~ voit le changement.

**~p = new Point(0);~** : on redirige la flèche **locale** ~p~ vers un nouvel objet. La flèche de ~a~ (dans ~main~) n'est pas modifiée.

À la sortie de ~f~, ~a~ pointe toujours sur l'ancien objet, qui vaut maintenant ~7~. Affichage ~7~.

## s3 | Attributs par défaut
Qu'affiche ce programme ?
[[
class A {
    int n;
    String s;
    boolean b;
    double d;
}
public class Main {
    public static void main(String[] args) {
        A a = new A();
        System.out.println(a.n + " " + a.s + " " + a.b + " " + a.d);
    }
}
]]
@out 0 null false 0.0
= ~0 null false 0.0~
- ~0 "" false 0~
- ~null null null null~
- Erreur : les attributs doivent être initialisés
? Les **attributs** (contrairement aux variables locales) reçoivent une valeur par défaut : ~0~, ~0.0~, ~false~, ~null~.

## s3 | Attribut final non initialisé
Que se passe-t-il à la compilation ?
[[
class A {
    final int x;
}
]]
@fail
= Erreur : l'attribut ~final~ ~x~ n'est jamais initialisé
- Aucune erreur, ~x~ vaut 0
- Aucune erreur, ~x~ vaut ~null~
- Erreur : ~final~ est interdit sur un attribut
? Un attribut ~final~ doit recevoir sa valeur à la déclaration ou dans **tous** les constructeurs.

## s3 | this dans une méthode statique
Que se passe-t-il à la compilation ?
[[
class A {
    int x;
    static int f() { return this.x; }
}
]]
@fail
= Erreur : ~this~ n'existe pas dans un contexte ~static~
- Aucune erreur
- Erreur : ~x~ doit être ~final~
- Aucune erreur, ~f()~ renvoie 0
? Une méthode ~static~ appartient à la classe, pas à un objet : pas de ~this~.

## s3 | Méthode sans return
Que se passe-t-il à la compilation ?
[[
class A {
    int f(int x) {
        if (x > 0) return 1;
    }
}
]]
@fail
= Erreur : « missing return statement »
- Aucune erreur, renvoie 0 si ~x <= 0~
- Aucune erreur, renvoie ~null~ si ~x <= 0~
- Erreur : ~if~ interdit dans une méthode
? Toutes les branches d'une méthode non ~void~ doivent se terminer par un ~return~ (ou un ~throw~).

## s3 | Chaînage de méthodes
Qu'affiche ce code ?
[[
System.out.println("a".concat("b").toUpperCase());
]]
@wrap
@out AB
= ~AB~
- ~ab~
- ~a~
- ~B~
? Chaque méthode de ~String~ renvoie une nouvelle chaîne sur laquelle on appelle la suivante : ~"ab"~ puis ~"AB"~.

## s3 | Package et import
Dans quel ordre écrit-on ces instructions en tête d'un fichier ?
= ~package~ en premier, puis les ~import~, puis la classe
- Les ~import~, puis ~package~, puis la classe
- La classe, puis ~package~ puis ~import~
- L'ordre n'a aucune importance
? Le ~package~ (s'il existe) est toujours la **première** instruction ; viennent ensuite les ~import~.

## s3 | import
Que permet ~import java.util.*;~ ?
= Utiliser les classes de ~java.util~ (~ArrayList~, ~Scanner~...) sans écrire leur nom complet
- Utiliser aussi les classes de ~java.io~
- Utiliser aussi les classes des sous-packages comme ~java.util.concurrent~
- Compiler plus vite
? ~*~ importe toutes les classes **du package**, pas celles de ses sous-packages. Un ~import~ n'est qu'un raccourci d'écriture : on peut toujours écrire ~java.util.ArrayList~.

## s3 | Package d'une classe
Quel bout de code convient à une classe du package ~tools~ qui utilise ~java.util~ (~java.lang~ est importé automatiquement) ?
= ~package tools; import java.util.*;~
- ~import java.util.*; package tools;~
- ~import java.util.*; import java.lang.*;~
- ~package tools; import java.lang.*;~
? ~package~ d'abord, puis ~import java.util.*;~. L'import de ~java.lang~ est inutile.

## s3 | Compteur d'instances
Combien d'instances de ~A~ sont créées ?
[[
A x, u, v;
x = new A();
A y = x;
A z = new A();
]]
= 2
- 0
- 3
- 5
? Seuls les deux ~new A()~ créent des objets. ~x, u, v, y, z~ sont des **références** (~u~ et ~v~ restent vides, ~y~ est une copie de ~x~).

## s3 | Variables locales
Quelle est la portée d'une variable locale déclarée dans une méthode ?
= Cette méthode, à partir de sa déclaration et jusqu'à la fin de son bloc
- Toute la classe
- Tout le package
- Toutes les méthodes de la classe qui l'appellent
? Une variable locale n'existe que dans son bloc ; un **attribut** existe tant que l'objet existe.

## s3 | Encapsulation
Pourquoi déclare-t-on les attributs ~private~ avec des accesseurs ~public~ ?
= Pour contrôler l'accès (vérifier les valeurs, cacher l'implémentation)
- Pour que le programme s'exécute plus vite
- Pour éviter d'écrire des constructeurs
- Parce que Java l'impose
? **Encapsulation** : l'objet protège son état. Un ~setAge(int a)~ peut refuser un âge négatif ; un attribut ~public~ ne le peut pas.

## s3 | Constructeur
Quelle affirmation sur un constructeur est vraie ?
= Il porte le nom de la classe et n'a pas de type de retour
- Il renvoie toujours ~void~
- Il peut être ~static~
- Il doit s'appeler ~init~
? Si on ajoute ~void~ devant, ce n'est **plus** un constructeur mais une méthode ordinaire (erreur fréquente).

## s3 | Faux constructeur
Que fait ce code ?
[[
class A {
    int x;
    void A() { x = 5; }
}
public class Main {
    public static void main(String[] args) {
        System.out.println(new A().x);
    }
}
]]
@out 0
= Affiche ~0~ : ~void A()~ est une méthode, pas un constructeur
- Affiche ~5~
- Erreur de compilation
- Erreur : le constructeur ne peut pas être ~void~ à l'exécution
? Avec ~void~, ~A()~ est une **méthode** ordinaire que personne n'appelle. Le constructeur par défaut s'exécute et ~x~ reste à 0.

## s3 | Garbage collector
Quand un objet peut-il être récupéré par le ramasse-miettes (garbage collector) ?
= Quand plus aucune référence active ne le désigne
- Quand on appelle ~delete~
- Quand on appelle ~free~
- Dès que la méthode qui l'a créé est terminée, toujours
? Java gère la mémoire automatiquement : on ne libère pas explicitement. Un objet inaccessible peut être collecté.

## s3 | hashCode et equals
Règle de cohérence à respecter si on redéfinit ~equals~ :
= Deux objets égaux selon ~equals~ doivent avoir le même ~hashCode~
- Deux objets de même ~hashCode~ sont toujours égaux
- ~hashCode~ doit renvoyer 0
- ~equals~ doit utiliser ~==~
? Sinon les collections à hachage (~HashSet~, ~HashMap~) se comportent mal. La réciproque est fausse : des objets distincts peuvent avoir le même code.

## s3 | Cache d'Integer
Qu'affiche ce code ?
[[
Integer a = 127, b = 127, c = 128, d = 128;
System.out.println((a == b) + " " + (c == d));
]]
@wrap
@out true false
= ~true false~
- ~true true~
- ~false false~
- ~false true~
? Les objets ~Integer~ entre -128 et 127 sont mis en cache : ~a == b~ est vrai. Au-delà, ~==~ compare des objets distincts. Pour les wrappers, toujours ~equals~.
`;
