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
? Lis le programme **dans l'ordre où Java l'exécute**, pas dans l'ordre où il est écrit.

**Étape 1.** ~new C()~ appelle le constructeur ~C()~. Avant d'exécuter la moindre ligne de son corps, Java exécute ~super()~ (écrit ou non). On saute donc dans ~B()~.

**Étape 2.** ~B()~ fait pareil : avant son corps, il appelle ~A()~.

**Étape 3.** ~A()~ n'a pas d'autre mère que ~Object~ : son corps s'exécute en premier et affiche ~A~.

**Étape 4.** On « remonte » : le corps de ~B()~ affiche ~B~, puis le corps de ~C()~ affiche ~C~.

Résultat : ~ABC~. **Règle : on construit toujours de la racine vers la classe la plus basse** (la mère avant la fille). Pour ~CBA~ il aurait fallu l'ordre inverse, ce qui n'existe pas en Java.

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
? **Ce que le compilateur fait.** Dans ~B()~, aucune ligne ne commence par ~super(...)~ ni ~this(...)~. Le compilateur ajoute donc tout seul ~super();~ en première ligne (appel au constructeur **sans paramètre** de ~A~).

**Où ça casse.** ~A~ a écrit un constructeur ~A(int x)~. Quand une classe écrit **au moins un** constructeur, Java ne fabrique plus le constructeur par défaut sans paramètre. Donc ~A()~ n'existe pas : le ~super()~ automatique de ~B~ ne trouve rien à appeler. D'où l'erreur de compilation.

**Les deux façons de corriger :** écrire dans ~B()~ la ligne ~super(5);~ (n'importe quelle valeur), ou ajouter dans ~A~ un constructeur ~A() { }~.

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
? Suis les appels :

**1.** ~new B().f()~ : l'objet est un ~B~, donc on exécute ~B.f()~.

**2.** La 1<sup>re</sup> ligne de ~B.f()~ est ~super.f()~ : le mot ~super~ force l'appel de la version de la **classe mère**. On exécute ~A.f()~ qui affiche ~A~.

**3.** ~A.f()~ se termine, on revient dans ~B.f()~ qui affiche ~B~.

Résultat ~AB~. Sans le mot ~super~, ~f()~ dans ~B.f()~ s'appellerait elle-même sans fin (récursion infinie).

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
? Il y a deux « moments » différents : la compilation et l'exécution.

**À la compilation.** ~a~ est déclaré ~Animal~. Le cast ~(Chat) a~ est **accepté**, car un ~Animal~ peut très bien être un ~Chat~ (~Chat~ hérite d'~Animal~). Le compilateur ne regarde pas ce que contient réellement ~a~.

**À l'exécution.** On regarde l'objet réel : ~new Chien()~, donc un ~Chien~. Un ~Chien~ n'est pas un ~Chat~ (frères, aucun lien d'héritage entre eux). Java refuse : **~ClassCastException~**. Le ~println("fin")~ n'est jamais atteint.

**Règle** : la montée (~Animal a = new Chien()~) est automatique et toujours sûre ; la descente (~(Chat) a~) demande un cast et peut échouer. Pour être prudent : ~if (a instanceof Chat) { Chat c = (Chat) a; }~.

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
? Chaque test pose la question : « l'objet **réel** est-il de ce type, ou d'un type qui en hérite ? »

L'objet réel est ~new Chien()~.

**~a instanceof Chien~** : oui, c'est un ~Chien~ → ~true~.

**~a instanceof Animal~** : oui, un ~Chien~ **est un** ~Animal~ (il en hérite) → ~true~.

**~a instanceof Chat~** : non, ~Chien~ et ~Chat~ sont deux classes sœurs → ~false~.

La variable ~a~ est déclarée ~Animal~, mais ~instanceof~ regarde l'objet, pas la variable.

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
? Il faut d'abord savoir **ce que ~B~ contient** :

| méthode | origine |
|---|---|
| ~f(int x)~ | héritée de ~A~ |
| ~f(double x)~ | écrite dans ~B~ |

~f(double)~ n'a pas la même liste de paramètres que ~f(int)~ : ce n'est **pas** une redéfinition (qui exige exactement la même signature), c'est une **surcharge** : ~B~ a maintenant deux méthodes ~f~.

**L'appel ~f(3)~.** ~3~ est un ~int~. Java choisit la méthode dont le paramètre correspond le mieux : ~f(int)~, donc celle de ~A~. Affichage : ~A.int~. (~f(double)~ ne serait appelée que pour ~f(3.5)~.)

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
? Retiens la règle : **une méthode ~static~ n'est pas polymorphe**.

**1.** La variable ~a~ est déclarée de type ~A~, l'objet réel est un ~B~.

**2.** ~a.s()~ appelle une méthode ~static~. Pour un appel statique, Java **ne regarde pas l'objet** : il regarde le **type déclaré de la variable** (~A~) et appelle ~A.s()~.

**3.** Affichage : ~A~.

Pour une méthode d'instance normale (~void f()~), c'est l'inverse : on regarde l'objet réel, donc la version de ~B~. C'est la différence entre **masquage** (static) et **redéfinition** (instance).

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
? **Le polymorphisme ne concerne que les méthodes d'instance.** Pour un attribut, Java regarde le **type déclaré** de la variable.

L'objet ~new B()~ contient en fait **deux** attributs ~x~ : celui de ~A~ (valeur 1) et celui de ~B~ (valeur 2, qui « masque » l'autre).

**~a.x~** : ~a~ est déclaré ~A~ → on lit le ~x~ de ~A~ → **1**.

**~((B) a).x~** : le cast fait voir l'objet comme un ~B~ → on lit le ~x~ de ~B~ → **2**.

Résultat ~1 2~. Même objet, deux réponses : c'est le type de la variable qui décide, pas celui de l'objet.

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
? C'est l'ordre d'exécution qui compte ; déroule ~new B()~ :

**1.** Java réserve la mémoire de l'objet ~B~. Tous ses attributs valent déjà leur valeur par défaut : **~v = 0~**. Le ~= 5~ n'est pas encore exécuté.

**2.** Le constructeur ~B()~ commence par ~super()~ : on saute dans ~A()~.

**3.** ~A()~ appelle ~init()~. Quelle version ? L'objet en construction est un **~B~**, donc Java choisit ~B.init()~ (polymorphisme). ~A.init()~ n'est jamais appelée : elle est redéfinie.

**4.** ~B.init()~ affiche ~"B" + v~. Or ~v~ vaut encore **0** (voir l'étape 1) : affichage ~B0~.

**5.** ~A()~ est terminé. De retour dans ~B()~, **maintenant seulement** l'initialisation ~v = 5~ s'exécute.

**6.** La ligne suivante du constructeur affiche ~v~ : ~5~.

Total : ~B0~ puis ~5~ = **~B05~**. ~AB5~ et ~A5~ supposent que ~A.init()~ s'exécute : c'est faux dès qu'elle est redéfinie. **Piège à retenir :** ne jamais appeler une méthode redéfinissable depuis un constructeur, car elle peut s'exécuter avant l'initialisation des attributs de la fille.

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
? ~final~ devant une classe signifie « version définitive : personne ne peut en hériter ».

**~final class A { }~** : ~A~ est verrouillée.

**~class B extends A~** : ~B~ tente d'en hériter → erreur « cannot inherit from final A ».

C'est le cas de ~String~ : on ne peut pas écrire ~class MaString extends String~.

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
? ~final~ devant une **méthode** interdit aux classes filles de la redéfinir.

**~A.f()~** est ~final~ : sa version est définitive.

**~B~** écrit sa propre ~void f()~ : c'est une redéfinition → erreur « f() in B cannot override f() in A; overridden method is final ».

Intérêt : garantir qu'une étape clé d'un algorithme (comme ~preparer()~ du patron de méthode) ne sera pas modifiée.

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
? En Java, une classe a **au plus une classe mère** (~extends~ suivi d'**un seul** nom).

**~class C extends A, B~** : deux mères → erreur de syntaxe.

Pourquoi : si ~A~ et ~B~ avaient chacune une méthode ~f()~, laquelle ~C~ hériterait-elle ? Pour combiner plusieurs comportements, on utilise des **interfaces** : ~class C extends A implements I, J~.

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
? Les constructeurs **ne sont pas hérités** : chaque classe a seulement ceux qu'elle écrit elle-même.

**1.** ~A~ a ~A(int x)~.

**2.** ~B~ n'écrit que ~B()~ (sans paramètre). Elle n'a **pas** de ~B(int)~, même si sa mère en a un.

**3.** ~new B(5)~ cherche ~B(int)~ → introuvable → erreur de compilation.

Correction : écrire dans ~B~ un constructeur ~B(int x) { super(x); }~.

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
? Quand ~super(...)~ (ou ~this(...)~) est utilisé, il doit être **la toute première instruction** du constructeur : la mère doit être construite **avant** que la fille fasse quoi que ce soit.

**~System.out.println("avant");~** passe en premier, puis ~super(1);~ → erreur « call to super must be first statement in constructor ».

Correction : mettre ~super(1);~ en première ligne, le ~println~ après.

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
? ~private~ signifie « visible seulement **dans cette classe** » : les classes filles ne le voient pas.

**~x~ est ~private~ dans ~A~.**

**~B~ essaie de lire ~x~** : pour ~B~, ce nom n'existe pas → erreur « x has private access in A ».

L'objet ~B~ **contient** bien un ~x~, mais ~B~ ne peut pas l'atteindre directement. Solutions : un getter ~public~, ou rendre ~x~ ~protected~.

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
? Une classe fille doit pouvoir être utilisée **partout où** la mère l'est. Donc elle ne peut pas être plus fermée.

| mère | fille autorisée |
|---|---|
| ~public~ | ~public~ seulement |
| ~protected~ | ~protected~ ou ~public~ |
| (défaut) | défaut, ~protected~ ou ~public~ |

**~A.f()~ est ~public~** mais **~B.f()~ n'a aucun modificateur** (visibilité « package ») : plus faible → erreur « attempting to assign weaker access privileges; was public ».

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
? ~@Override~ est une **promesse** que le compilateur vérifie : « cette méthode redéfinit une méthode de la mère ».

**~A~** a ~f()~, **~B~** écrit ~g()~ avec ~@Override~.

~g()~ n'existe pas dans ~A~ : la promesse est fausse → erreur « method does not override or implement a method from a supertype ».

Utile pour détecter une faute de frappe (~tostring~ au lieu de ~toString~) ou un mauvais paramètre.

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
? Pour chaque ligne, pose deux questions : **(1) ça compile ? (2) à l'exécution, l'objet est-il du bon type ?**

**Ligne 1** ~Triangle x = new Triangle(); Figure y = x; Triangle z = (Triangle) y;~ : on crée un vrai ~Triangle~. Le monter en ~Figure~ est automatique ; le redescendre en ~Triangle~ avec un cast est valide, car l'objet **est réellement** un ~Triangle~. Correct.

**Ligne 2** ~Figure y = new Figure(); Triangle x = (Triangle) y;~ : compile, mais l'objet est une simple ~Figure~, pas un ~Triangle~ : ~ClassCastException~ à l'exécution.

**Ligne 3** ~Triangle x = new Triangle(); Object y = (Object) x; Triangle z = y;~ : ne compile pas, descendre de ~Object~ vers ~Triangle~ exige un cast explicite.

**Ligne 4** ~Figure y = new Figure(); Triangle z = y;~ : ne compile pas non plus (descente sans cast).

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
? ~protected~ ouvre l'accès à **la classe, au package et aux classes filles**.

**1.** ~x~ est ~protected~ dans ~A~, initialisé à 7.

**2.** ~B extends A~ : ~B~ peut lire ~x~ directement dans ~lire()~.

**3.** ~new B().lire()~ renvoie ~7~, ~println~ l'affiche.

Si ~x~ était ~private~, ~B~ n'aurait pas pu écrire ~return x;~.
`;
