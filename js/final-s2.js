/* Évaluation finale : questions semaine 2 (UML, héritage, visibilité). */
const F_S2 = String.raw`
## s2 | Ordre des constructeurs
Qu'affiche ce programme ?
[[
class A { A() { System.out.print("A"); } }
class B extends A { B() { System.out.print("B"); } }
class C extends B { C() { System.out.print("C"); } }
public class Main {
    public static void main(String[] args) { new C(); }
}
]]
@out ABC
= ~ABC~
- ~CBA~
- ~C~
- ~ACB~
? Un constructeur commence par appeler celui de la mère (~super()~ implicite) : on remonte jusqu'à ~A~, puis on exécute les corps en descendant : ~A~, ~B~, ~C~.

## s2 | super() implicite impossible
Que se passe-t-il à la compilation ?
[[
class A { A(int x) { } }
class B extends A { B() { } }
]]
@fail
= Erreur : ~A~ n'a pas de constructeur sans paramètre pour le ~super()~ implicite de ~B~
- Aucune erreur
- Erreur : ~B~ ne peut pas avoir de constructeur
- Aucune erreur, ~x~ vaut 0
? Dès qu'une classe définit un constructeur, le constructeur par défaut disparaît. ~B()~ appelle implicitement ~super()~ qui n'existe pas : il faut écrire ~super(5);~ par exemple.

## s2 | super.methode()
Qu'affiche ce programme ?
[[
class A { void f() { System.out.print("A"); } }
class B extends A {
    void f() { super.f(); System.out.print("B"); }
}
public class Main {
    public static void main(String[] args) { new B().f(); }
}
]]
@out AB
= ~AB~
- ~B~
- ~BA~
- ~A~
? ~B.f()~ commence par ~super.f()~ (affiche ~A~) puis affiche ~B~.

## s2 | Transtypage descendant
Que se passe-t-il ?
[[
class Animal { }
class Chien extends Animal { }
class Chat extends Animal { }
public class Main {
    public static void main(String[] args) {
        Animal a = new Chien();
        Chat c = (Chat) a;
        System.out.println("fin");
    }
}
]]
@exc ClassCastException
= Ça compile, mais ~ClassCastException~ à l'exécution
- Erreur de compilation
- Affiche ~fin~
- ~NullPointerException~
? Le compilateur accepte ~(Chat) a~ (un ~Animal~ peut être un ~Chat~), mais l'objet réel est un ~Chien~ : refus à l'exécution. ~instanceof~ permet de tester avant.

## s2 | instanceof
Qu'affiche ce code ?
[[
class Animal { }
class Chien extends Animal { }
class Chat extends Animal { }
public class Main {
    public static void main(String[] args) {
        Animal a = new Chien();
        System.out.println((a instanceof Chien) + " " + (a instanceof Animal) + " " + (a instanceof Chat));
    }
}
]]
@out true true false
= ~true true false~
- ~true false false~
- ~true true true~
- ~false true false~
? L'objet est un ~Chien~, donc aussi un ~Animal~ (héritage), mais pas un ~Chat~.

## s2 | Surcharge, pas redéfinition
Qu'affiche ce programme ?
[[
class A { void f(int x) { System.out.print("A.int "); } }
class B extends A { void f(double x) { System.out.print("B.double "); } }
public class Main {
    public static void main(String[] args) { new B().f(3); }
}
]]
@out A.int
= ~A.int~
- ~B.double~
- ~A.int B.double~
- Erreur de compilation
? ~B.f(double)~ a une signature **différente** : c'est une surcharge, pas une redéfinition. ~B~ possède donc ~f(int)~ (héritée) et ~f(double)~ ; l'appel avec un ~int~ choisit ~f(int)~.

## s2 | Méthodes statiques
Qu'affiche ce programme ?
[[
class A { static void s() { System.out.print("A"); } }
class B extends A { static void s() { System.out.print("B"); } }
public class Main {
    public static void main(String[] args) {
        A a = new B();
        a.s();
    }
}
]]
@out A
= ~A~
- ~B~
- ~AB~
- Erreur de compilation
? Les méthodes ~static~ ne sont **pas redéfinies** (elles sont « masquées ») : l'appel est résolu avec le type **déclaré** de la variable (~A~), sans polymorphisme.

## s2 | Attributs et polymorphisme
Qu'affiche ce programme ?
[[
class A { int x = 1; }
class B extends A { int x = 2; }
public class Main {
    public static void main(String[] args) {
        A a = new B();
        System.out.println(a.x + " " + ((B) a).x);
    }
}
]]
@out 1 2
= ~1 2~
- ~2 2~
- ~1 1~
- ~2 1~
? Le polymorphisme ne concerne que les **méthodes**. Un attribut est résolu avec le type **déclaré** : ~a.x~ (type ~A~) vaut 1 ; après le cast en ~B~, on lit l'attribut de ~B~ : 2.

## s2 | Appel d'une méthode redéfinie dans un constructeur
Qu'affiche ce programme ?
[[
class A {
    A() { init(); }
    void init() { System.out.print("A"); }
}
class B extends A {
    int v = 5;
    B() { super(); System.out.print(v); }
    void init() { System.out.print("B" + v); }
}
public class Main {
    public static void main(String[] args) { new B(); }
}
]]
@out B05
= ~B05~
- ~A5~
- ~B55~
- ~AB5~
? ~new B()~ → ~A()~ → ~init()~ est celle de ~B~ (polymorphisme) mais les attributs de ~B~ ne sont pas encore initialisés : ~v~ vaut 0, d'où ~B0~. Ensuite ~v = 5~ puis le constructeur de ~B~ affiche ~5~. Piège : ne jamais appeler une méthode redéfinissable dans un constructeur.

## s2 | Classe finale
Que se passe-t-il à la compilation ?
[[
final class A { }
class B extends A { }
]]
@fail
= Erreur : on ne peut pas hériter d'une classe ~final~
- Aucune erreur
- Erreur : ~final~ est interdit devant ~class~
- Aucune erreur, mais ~B~ ne peut pas être instanciée
? ~final class~ ne peut pas être étendue (comme ~String~). ~final~ sur une méthode interdit sa redéfinition.

## s2 | Méthode finale
Que se passe-t-il à la compilation ?
[[
class A { final void f() { } }
class B extends A { void f() { } }
]]
@fail
= Erreur : ~f()~ est ~final~ dans ~A~, elle ne peut pas être redéfinie
- Aucune erreur
- Erreur : ~final~ est interdit sur une méthode
- Aucune erreur, mais ~B.f()~ n'est jamais appelée
? Une méthode ~final~ ne peut pas être redéfinie.

## s2 | Héritage multiple
Que se passe-t-il à la compilation ?
[[
class A { }
class B { }
class C extends A, B { }
]]
@fail
= Erreur : une classe ne peut étendre qu'une seule classe
- Aucune erreur
- Erreur : il faut écrire ~extends A and B~
- Aucune erreur, mais ~C~ ne peut pas être instanciée
? Java n'a pas d'héritage multiple de classes. On peut en revanche **implémenter** plusieurs interfaces.

## s2 | Constructeurs non hérités
Que se passe-t-il à la compilation ?
[[
class A { A(int x) { } }
class B extends A { B() { super(1); } }
public class Main {
    public static void main(String[] args) { new B(5); }
}
]]
@fail
= Erreur : ~B~ n'a pas de constructeur à un paramètre (les constructeurs ne sont pas hérités)
- Aucune erreur : ~B~ hérite du constructeur de ~A~
- Erreur : ~super(1)~ est interdit
- Aucune erreur, ~5~ est ignoré
? Les constructeurs ne s'héritent pas : ~new B(5)~ exige un constructeur ~B(int)~.

## s2 | super en première ligne
Que se passe-t-il à la compilation ?
[[
class A { A(int x) { } }
class B extends A {
    B() {
        System.out.println("avant");
        super(1);
    }
}
]]
@fail
= Erreur : l'appel à ~super(...)~ doit être la première instruction du constructeur
- Aucune erreur
- Erreur : ~println~ est interdit dans un constructeur
- Aucune erreur, mais ~avant~ est affiché deux fois
? ~super(...)~ et ~this(...)~ doivent être la **première** instruction du constructeur (et on ne peut pas mettre les deux).

## s2 | Membre privé et héritage
Que se passe-t-il à la compilation ?
[[
class A { private int x = 3; }
class B extends A {
    int g() { return x; }
}
]]
@fail
= Erreur : ~x~ est ~private~ dans ~A~, donc inaccessible dans ~B~
- Aucune erreur
- Aucune erreur, ~g()~ renvoie 0
- Erreur : ~g()~ doit être ~static~
? Un membre ~private~ n'est visible que dans sa classe, même par les classes filles. Il faudrait un getter ~public~ ou le rendre ~protected~.

## s2 | Accès affaibli à la redéfinition
Que se passe-t-il à la compilation ?
[[
class A { public void f() { } }
class B extends A { void f() { } }
]]
@fail
= Erreur : on ne peut pas redéfinir en réduisant la visibilité (~public~ → par défaut)
- Aucune erreur
- Erreur : il manque ~@Override~
- Aucune erreur, ~f()~ devient privée
? Une redéfinition peut **élargir** la visibilité (~protected~ → ~public~) mais jamais la réduire (« attempting to assign weaker access privileges »).

## s2 | @Override
Que se passe-t-il à la compilation ?
[[
class A { void f() { } }
class B extends A {
    @Override
    void g() { }
}
]]
@fail
= Erreur : ~g()~ ne redéfinit aucune méthode de la classe mère
- Aucune erreur
- Un simple avertissement
- Erreur : ~@Override~ n'existe pas
? ~@Override~ fait vérifier au compilateur qu'on redéfinit réellement une méthode : utile pour détecter une faute de frappe dans le nom ou les paramètres.

## s2 | Visibilité par défaut
Un attribut sans modificateur de visibilité (visibilité « par défaut ») est visible par :
= Toutes les classes de son package
- Seulement sa classe
- Sa classe et ses sous-classes uniquement
- Toutes les classes du programme
? De la plus fermée à la plus ouverte : ~private~ (la classe) < par défaut (le package) < ~protected~ (le package + les sous-classes) < ~public~ (tout le monde).

## s2 | protected
Un attribut ~protected~ est visible par :
= Les classes du même package et les sous-classes (même dans un autre package)
- Seulement les sous-classes du même package
- Seulement sa classe
- Toutes les classes du programme
? ~protected~ = visibilité de package **plus** les classes filles où qu'elles soient.

## s2 | private
Quelle affirmation est vraie pour un attribut ~private~ ?
= Il n'est accessible que dans sa propre classe
- Il est accessible dans le même package
- Il est accessible dans les sous-classes
- Il est accessible par toutes les classes du programme
? ~private~ : uniquement le code de la classe elle-même (c'est la base de l'**encapsulation**).

## s2 | Classe racine
Quelle classe n'a **pas** de classe mère ?
= ~Object~
- ~String~
- Une classe abstraite
- Une classe sans ~extends~
? Toute classe qui ne déclare pas ~extends~ hérite implicitement de ~Object~. Seule ~Object~ n'a pas de mère.

## s2 | Méthodes d'Object
Parmi ces méthodes, lesquelles existent dans **toutes** les classes ?
= ~equals~, ~toString~, ~hashCode~ et ~getClass~
- ~equals~ et ~toString~ seulement
- ~compareTo~ et ~equals~
- ~clone~ et ~run~
? Elles sont définies dans ~Object~ et donc héritées par toute classe. ~compareTo~ vient de l'interface ~Comparable~, qu'il faut implémenter.

## s2 | Héritage ou agrégation
Quel lien UML relie ~Chien~ à ~Animal~ si « un chien est un animal » ?
= Héritage (généralisation) : trait plein terminé par un triangle vide
- Agrégation : losange vide
- Composition : losange plein
- Dépendance : flèche pointillée
? « **est un** » → héritage (~extends~). « **a un** » → association/agrégation/composition (attribut).

## s2 | Réalisation
Quelle relation UML correspond à ~implements~ ?
= Réalisation : trait **pointillé** terminé par un triangle vide
- Héritage : trait plein et triangle vide
- Agrégation : losange vide
- Dépendance : flèche pointillée simple
? Classe → interface : pointillés + triangle vide (réalisation). Classe → classe mère : trait plein + triangle vide (héritage).

## s2 | Agrégation
Une ~Equipe~ a des ~Joueur~, qui continuent d'exister si l'équipe disparaît. Quelle relation ?
= Agrégation (losange vide du côté ~Equipe~)
- Composition (losange plein)
- Héritage
- Dépendance
? Agrégation : relation « tout / partie » où la partie **vit indépendamment** du tout. En Java : un attribut (ou une liste) de références passées au tout.

## s2 | Composition
Une ~Maison~ contient des ~Piece~ qui n'ont pas de sens sans elle (créées dans son constructeur, détruites avec elle). Quelle relation ?
= Composition (losange plein du côté ~Maison~)
- Agrégation (losange vide)
- Héritage
- Dépendance
? Composition : la partie ne survit pas au tout. En code : les objets ~Piece~ sont **créés** dans le constructeur de ~Maison~ (~new Piece()~).

## s2 | Dépendance
~Chauffeur~ utilise ~Voiture~ uniquement en **paramètre** d'une de ses méthodes (~conduire(Voiture v)~). Quelle relation UML ?
= Dépendance (flèche pointillée)
- Agrégation
- Composition
- Héritage
? Pas d'attribut : simple **usage ponctuel** (paramètre, variable locale, retour). C'est la relation la plus faible.

## s2 | Cardinalité
Un ~Client~ peut avoir de 0 à plusieurs ~Commande~ (cardinalité ~0..*~). Comment le traduire en Java ?
= Un attribut ~ArrayList<Commande>~ dans ~Client~
- Un attribut ~Commande~ unique
- Une classe ~Commande~ qui hérite de ~Client~
- Un paramètre ~Commande~ de chaque méthode
? Une cardinalité supérieure à 1 se code avec un **tableau** ou une collection (~ArrayList~).

## s2 | Classe d'association
~Etudiant~ et ~Cours~ sont reliés par une association portant une note. Comment la coder ?
= Une classe supplémentaire ~Inscription~ avec la note, qui référence l'~Etudiant~ et le ~Cours~
- Un attribut ~note~ dans ~Etudiant~ seulement
- Un attribut ~note~ dans ~Cours~ seulement
- Une classe ~Note~ qui hérite d'~Etudiant~
? La note dépend du **couple** étudiant-cours : on la place dans une **classe d'association**.

## s2 | Affectation polymorphe
Parmi ces lignes, laquelle compile (~Chien~ hérite d'~Animal~) ?
= ~Animal a = new Chien();~
- ~Chien c = new Animal();~
- ~Chien c = (Animal) new Chien();~
- ~Animal a = new Animal(); Chien c = a;~
? Un ~Chien~ **est un** ~Animal~ : la conversion vers la classe mère est implicite (upcasting). L'inverse exige un cast explicite.

## s2 | Cast vers la mère
Lequel de ces codes est correct (~Triangle~ hérite de ~Figure~) ?
= ~Triangle x = new Triangle(); Figure y = x; Triangle z = (Triangle) y;~
- ~Figure y = new Figure(); Triangle x = (Triangle) y; Figure z = x;~ (sans erreur à l'exécution)
- ~Triangle x = new Triangle(); Object y = (Object) x; Triangle z = y;~
- ~Figure y = new Figure(); Triangle z = y;~
? Le 1<sup>er</sup> est correct : l'objet est réellement un ~Triangle~. Le 2<sup>e</sup> compile mais lance ~ClassCastException~ (l'objet est une ~Figure~). Les deux derniers ne compilent pas (descente sans cast).

## s2 | toString par défaut
Qu'affiche ~System.out.println(new Object());~ ?
= Un texte de la forme ~java.lang.Object@1b6d3586~ (nom de classe, ~@~, code de hachage)
- ~null~
- ~Object~
- Une erreur de compilation
? ~toString()~ par défaut renvoie ~nomClasse@hashCode~. On la **redéfinit** pour afficher un texte utile.

## s2 | Mot-clé protected et accès
Que se passe-t-il ?
[[
class A { protected int x = 7; }
class B extends A {
    int lire() { return x; }
}
public class Main {
    public static void main(String[] args) {
        System.out.println(new B().lire());
    }
}
]]
@out 7
= Affiche ~7~
- Erreur : ~x~ est inaccessible
- Affiche ~0~
- ~NullPointerException~
? ~protected~ rend ~x~ accessible aux classes filles : ~B~ lit directement ~x~.
`;
