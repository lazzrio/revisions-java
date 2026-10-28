/* Évaluation finale : questions semaine 1 (bases). Format du site (voir test5-data.js) ;
   les lignes @... sont des consignes de vérification (non affichées) : @wrap, @main X, @out, @fail, @exc. */
const F_S1 = String.raw`
## s1 | String immuable
Qu'affiche ce code ?
[[
String s = "abc";
s.toUpperCase();
System.out.println(s);
]]
@wrap
@out abc
= ~abc~
- ~ABC~
- ~abcABC~
- Une erreur de compilation
? Une ~String~ ne change jamais une fois créée : on dit qu'elle est **immuable**.

**1.** ~String s = "abc";~ : ~s~ désigne le texte ~"abc"~.

**2.** ~s.toUpperCase();~ : la méthode **fabrique un nouveau texte** ~"ABC"~ et le renvoie. Ici on ne récupère pas ce résultat : il est perdu tout de suite.

**3.** ~s~ désigne toujours ~"abc"~. Affichage ~abc~.

Pour garder le résultat, il faut l'affecter : ~s = s.toUpperCase();~.

## s1 | == et equals sur String
Qu'affiche ce code ?
[[
String a = "hi";
String b = new String("hi");
System.out.println((a == b) + " " + a.equals(b));
]]
@wrap
@out false true
= ~false true~
- ~true true~
- ~true false~
- ~false false~
? Une variable ~String~ ne contient pas le texte : elle contient l'**adresse** d'un objet.

**~a = "hi"~** : Java place ~"hi"~ dans une zone commune (le « pool »).

**~b = new String("hi")~** : le mot ~new~ **force la création d'un second objet**, à une autre adresse, même si le texte est identique.

**~a == b~** compare les **adresses** : elles sont différentes → ~false~.

**~a.equals(b)~** compare les **textes** : ~"hi"~ et ~"hi"~ → ~true~.

D'où la règle : pour comparer des chaînes, toujours ~equals~, jamais ~==~.

## s1 | Opérateurs entiers
Qu'affiche ce code ?
[[
System.out.println(7 / 2 + " " + 7 % 2 + " " + 7 / 2.0);
]]
@wrap
@out 3 1 3.5
= ~3 1 3.5~
- ~3.5 1 3.5~
- ~3 3 3.5~
- ~4 1 3.5~
? Trois calculs, chacun avec ses règles de type :

**~7 / 2~** : deux entiers → division **entière**, on jette la virgule → ~3~.

**~7 % 2~** : le **reste** de la division : 7 = 2 × 3 + 1 → ~1~.

**~7 / 2.0~** : un opérande est un réel → division **réelle** → ~3.5~.

Les ~+ " " +~ concatènent les trois résultats : ~3 1 3.5~.

## s1 | Post et pré-incrémentation
Quelles valeurs de ~x~ et ~y~ ?
[[
int x = 5;
int y = x++ + ++x;
System.out.println(x + " " + y);
]]
@wrap
@out 7 12
= ~7 12~
- ~6 11~
- ~7 11~
- ~6 12~
? Évalue l'expression de gauche à droite, en suivant la valeur de ~x~ à chaque étape.

**Départ :** ~x = 5~.

**1.** ~x++~ (post-incrémentation) : la valeur utilisée est **l'ancienne** (5), puis ~x~ devient 6.

**2.** ~++x~ (pré-incrémentation) : ~x~ devient d'abord 7, **puis** la valeur utilisée est 7.

**3.** ~y = 5 + 7 = 12~.

**4.** À la fin, ~x~ vaut 7.

Affichage : ~7 12~. Moyen mnémotechnique : ~x++~ « donne puis augmente », ~++x~ « augmente puis donne ».

## s1 | Caractères et entiers
Qu'affiche ce code ?
[[
System.out.println('a' + 1 + "b");
]]
@wrap
@out 98b
= ~98b~
- ~a1b~
- ~bb~
- ~ab~
? Java évalue **de gauche à droite** et le type de chaque résultat décide de la suite.

**1.** ~'a' + 1~ : un ~char~ plus un ~int~ → addition **numérique**. ~'a'~ a pour code 97, donc 98 (un ~int~).

**2.** ~98 + "b"~ : un nombre plus une ~String~ → **concaténation** : ~"98b"~.

Affichage ~98b~. Pour obtenir ~a1b~ il aurait fallu commencer par une chaîne : ~"" + 'a' + 1 + "b"~.

## s1 | Concaténation et addition
Qu'affiche ce code ?
[[
System.out.println(10 + 20 + "x" + 10 + 20);
]]
@wrap
@out 30x1020
= ~30x1020~
- ~30x30~
- ~10x30~
- ~102010x20~
? Lis de gauche à droite, un ~+~ à la fois. Tant que les deux côtés sont des nombres, c'est une addition ; dès qu'une ~String~ apparaît, c'est une concaténation.

| étape | calcul | résultat |
|---|---|---|
| 1 | ~10 + 20~ | ~30~ (addition) |
| 2 | ~30 + "x"~ | ~"30x"~ (concaténation) |
| 3 | ~"30x" + 10~ | ~"30x10"~ |
| 4 | ~"30x10" + 20~ | ~"30x1020"~ |

Après le ~"x"~, tout est du texte : ~10~ puis ~20~ sont collés, pas additionnés.

## s1 | Conversion réel vers entier
Qu'affiche ce code ?
[[
System.out.println((int) 3.99 + (int) -3.99);
]]
@wrap
@out 0
= ~0~
- ~-1~
- ~1~
- ~-7.98~
? Le cast ~(int)~ **tronque** : il supprime la partie décimale, il n'arrondit pas.

**~(int) 3.99~** : on garde 3.

**~(int) -3.99~** : on garde -3 (on tronque vers zéro, pas vers le bas).

**Somme :** ~3 + (-3) = 0~.

Piège fréquent : croire que ~(int) -3.99~ donne -4.

## s1 | Dépassement d'entier
Qu'affiche ce code ?
[[
System.out.println(Integer.MAX_VALUE + 1);
]]
@wrap
@out -2147483648
= ~-2147483648~
- ~2147483648~
- Une exception ~ArithmeticException~
- Une erreur de compilation
? Un ~int~ occupe 32 bits : il va de -2 147 483 648 à 2 147 483 647. Quand on dépasse, Java **ne lance pas d'exception** : le nombre « fait le tour » comme un compteur kilométrique.

**1.** ~Integer.MAX_VALUE~ vaut 2 147 483 647.

**2.** ~+ 1~ dépasse : on retombe tout en bas de l'échelle.

**3.** Résultat : ~-2147483648~.

Pour des calculs plus grands, il faut un ~long~.

## s1 | Conversions implicites
Quelle déclaration compile ?
= ~long l = 5;~
- ~int a = 3.5;~
- ~float f = 2.5;~
- ~int i = 5L;~
? Une conversion qui **élargit** (int → long) est implicite. Les autres perdent de l'information : « possible lossy conversion » (~3.5~ est un ~double~, ~2.5~ aussi : il faudrait ~2.5f~).

## s1 | Valeurs par défaut des tableaux
Qu'affiche ce code ?
[[
int[] t = new int[3];
boolean[] b = new boolean[2];
String[] s = new String[2];
System.out.println(t[1] + " " + b[0] + " " + s[1]);
]]
@wrap
@out 0 false null
= ~0 false null~
- ~0 true ""~
- ~null null null~
- ~0 false ""~
? ~new int[3]~, ~new boolean[2]~ et ~new String[2]~ créent des tableaux dont les cases reçoivent **la valeur par défaut de leur type** :

| type des cases | valeur par défaut |
|---|---|
| ~int~ | ~0~ |
| ~boolean~ | ~false~ |
| objets (~String~...) | ~null~ |

~t[1]~ → ~0~, ~b[0]~ → ~false~, ~s[1]~ → ~null~. Affichage ~0 false null~. Une case ~String~ n'est pas une chaîne vide : elle ne contient **aucun objet**.

## s1 | Tableaux et références
Qu'affiche ce code ?
[[
int[] a = { 1, 2, 3 };
int[] b = a;
b[0] = 9;
System.out.println(a[0]);
]]
@wrap
@out 9
= ~9~
- ~1~
- ~0~
- Une erreur de compilation
? Un tableau est un **objet** : la variable ne contient que sa « flèche » (son adresse).

**1.** ~a~ pointe vers le tableau ~{1, 2, 3}~.

**2.** ~int[] b = a;~ copie la **flèche**, pas le tableau : ~a~ et ~b~ pointent vers **le même** tableau.

**3.** ~b[0] = 9;~ modifie ce tableau partagé : il devient ~{9, 2, 3}~.

**4.** ~a[0]~ lit le même tableau : ~9~.

Pour avoir une vraie copie, il faut ~a.clone()~ ou ~Arrays.copyOf(a, a.length)~.

## s1 | Taille d'un tableau 2D
Qu'affiche ce code ?
[[
int[][] m = new int[3][4];
System.out.println(m.length + " " + m[0].length);
]]
@wrap
@out 3 4
= ~3 4~
- ~4 3~
- ~12 4~
- ~3 12~
? Un tableau à deux dimensions est un **tableau de tableaux**.

**~new int[3][4]~** : 3 lignes, chacune étant un tableau de 4 cases.

**~m.length~** : nombre de lignes → ~3~.

**~m[0].length~** : longueur de la première ligne → ~4~.

Affichage ~3 4~. Dans les deux cas ~length~ est un attribut : **pas de parenthèses**.

## s1 | Déclaration valide
Quelle déclaration de tableau est valide ?
= ~int[] t = { 1, 2, 3 };~
- ~int t[3];~
- ~int[] t = new int[3]{ 1, 2, 3 };~
- ~int[] t = new int();~
? On donne soit la **taille** (~new int[3]~), soit les **valeurs** (~{1, 2, 3}~), jamais les deux, et jamais la taille dans le type de la variable.

## s1 | Passage par valeur
Qu'affiche ce code ?
[[
public class T {
    static void f(int x) { x = 10; }
    static void g(int[] t) { t[0] = 10; }
    public static void main(String[] args) {
        int a = 1;
        int[] b = { 1 };
        f(a);
        g(b);
        System.out.println(a + " " + b[0]);
    }
}
]]
@main T
@out 1 10
= ~1 10~
- ~10 10~
- ~1 1~
- ~10 1~
? **Java copie toujours ce qu'on lui passe.**

**~f(a)~** : ~a~ est un ~int~. La méthode reçoit une **copie** du nombre 1. Elle met sa copie à 10, mais ~a~ n'est pas touché → ~a~ reste ~1~.

**~g(b)~** : ~b~ est un tableau (un objet). Ce qui est copié, c'est la **référence** (l'adresse). La copie et l'original pointent vers **le même tableau**. ~t[0] = 10~ modifie ce tableau partagé → ~b[0]~ vaut ~10~.

Affichage ~1 10~. Résumé : on peut modifier **le contenu** d'un objet reçu en paramètre ; on ne peut pas remplacer la variable de l'appelant.

## s1 | Attribut static
Qu'affiche ce code ?
[[
public class C {
    static int n = 0;
    int id;
    C() { n++; id = n; }
    public static void main(String[] args) {
        new C();
        new C();
        C c = new C();
        System.out.println(c.id + " " + C.n);
    }
}
]]
@main C
@out 3 3
= ~3 3~
- ~1 3~
- ~3 1~
- ~1 1~
? **~n~ est ~static~** : il n'existe qu'**une seule** copie, partagée par tous les objets ~C~ (elle appartient à la classe). **~id~ est un attribut ordinaire** : chaque objet a le sien.

Déroule les trois ~new C()~ :

| objet créé | ~n++~ donne | ~id = n~ |
|---|---|---|
| 1<sup>er</sup> | ~n = 1~ | ~id = 1~ |
| 2<sup>e</sup> | ~n = 2~ | ~id = 2~ |
| 3<sup>e</sup> (variable ~c~) | ~n = 3~ | ~id = 3~ |

~c.id~ vaut ~3~ (son propre ~id~), ~C.n~ vaut ~3~ (compteur partagé). Affichage ~3 3~.

## s1 | Static et instance
Que se passe-t-il à la compilation ?
[[
public class A {
    int x = 5;
    static void f() {
        System.out.println(x);
    }
}
]]
@fail
= Erreur : un attribut d'instance ne peut pas être utilisé dans une méthode ~static~
- Aucune erreur, affiche ~5~
- Aucune erreur, affiche ~0~
- Erreur : ~x~ doit être ~final~
? **~f()~ est ~static~** : elle appartient à la classe, elle peut être appelée **sans aucun objet**. Dans ce cas, il n'existe pas d'objet ~A~ et donc pas de ~x~ à lire.

**~x~ est un attribut d'instance** : il n'existe que dans un objet ~A~ précis.

Le compilateur refuse donc ~System.out.println(x)~ dans ~f()~ : « non-static variable x cannot be referenced from a static context ».

Deux corrections : rendre ~x~ ~static~, ou rendre ~f()~ non statique (et l'appeler sur un objet).

## s1 | final et tableau
Que se passe-t-il à la compilation ?
[[
final int[] t = { 1, 2 };
t[0] = 5;
t = new int[3];
]]
@wrap
@fail
= Erreur sur la dernière ligne seulement : on ne peut pas réaffecter ~t~
- Erreur sur les deux dernières lignes
- Erreur sur la ligne ~t[0] = 5;~ seulement
- Aucune erreur
? Ligne par ligne :

**~final int[] t = {1, 2};~** : ~t~ est une référence qu'on ne pourra **plus changer**.

**~t[0] = 5;~** : on ne change pas ~t~, on change **le contenu** du tableau pointé. C'est autorisé.

**~t = new int[3];~** : on essaie de faire pointer ~t~ ailleurs. Interdit : « cannot assign a value to final variable t ».

~final~ protège la variable, pas l'objet qu'elle désigne.

## s1 | Méthodes de String
Qu'affiche ce code ?
[[
String s = "Java";
System.out.println(s.length() + s.charAt(1) + s.indexOf("v"));
]]
@wrap
@out 103
= ~103~
- ~4a2~
- ~42~
- ~Une erreur de compilation~
? Attention : ce sont des **nombres**, pas du texte, donc ils s'additionnent.

**~s.length()~** : ~"Java"~ a 4 lettres → ~4~.

**~s.charAt(1)~** : la lettre d'indice 1 (la 2<sup>e</sup>) est ~'a'~. Un ~char~ dans une addition devient son code : ~97~.

**~s.indexOf("v")~** : ~"v"~ est à l'indice 2 → ~2~.

**Somme :** ~4 + 97 + 2 = 103~. Aucun ~String~ n'apparaît dans l'expression, donc aucune concaténation.

## s1 | substring
Qu'affiche ce code ?
[[
System.out.println("Hello".substring(1, 3) + "Hello".charAt(4));
]]
@wrap
@out elo
= ~elo~
- ~ell~
- ~ello~
- ~el4~
? Les indices d'une chaîne commencent à 0. Pour ~"Hello"~ :

| indice | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| lettre | H | e | l | l | o |

**~substring(1, 3)~** : du caractère d'indice 1 **inclus** à l'indice 3 **exclu** → ~"el"~.

**~charAt(4)~** : ~'o'~.

La concaténation donne ~"el" + 'o'~ = ~elo~.

## s1 | Constantes de chaînes
Que valent les deux comparaisons ?
[[
String a = "ab";
String t = "a";
String b = t + "b";
String c = "a" + "b";
System.out.println((a == b) + " " + (a == c));
]]
@wrap
@out false true
= ~false true~
- ~true true~
- ~false false~
- ~true false~
? Question : ~a~, ~b~ et ~c~ désignent-ils le même objet ?

**~a = "ab"~** : littéral, placé dans le pool.

**~c = "a" + "b"~** : les deux morceaux sont des constantes connues dès la compilation. Le compilateur les assemble en ~"ab"~ avant l'exécution : c'est **le même littéral que ~a~**, donc le même objet → ~a == c~ vaut ~true~.

**~b = t + "b"~** : ~t~ est une variable. La concaténation se fait **à l'exécution** et fabrique un **nouvel** objet → ~a == b~ vaut ~false~.

Affichage ~false true~. À retenir surtout : ne comptez jamais sur ~==~ pour des chaînes, utilisez ~equals~.

## s1 | Boucle avec continue et break
Que vaut ~s~ ?
[[
int s = 0;
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue;
    if (i > 7) break;
    s += i;
}
System.out.println(s);
]]
@wrap
@out 16
= ~16~
- ~25~
- ~28~
- ~12~
? Suis ~i~ de 1 à 10 :

| ~i~ | pair ? (~continue~) | ~i > 7~ ? (~break~) | ~s~ |
|---|---|---|---|
| 1 | non | non | 1 |
| 2 | oui, on passe | | 1 |
| 3 | non | non | 4 |
| 4 | oui | | 4 |
| 5 | non | non | 9 |
| 6 | oui | | 9 |
| 7 | non | non | 16 |
| 8 | oui | | 16 |
| 9 | non | **oui : on sort** | 16 |

~continue~ saute le reste du tour, ~break~ sort de la boucle. Résultat ~16~.

## s1 | switch sans break
Qu'affiche ce code ?
[[
int x = 2;
switch (x) {
    case 1: System.out.print("a");
    case 2: System.out.print("b");
    case 3: System.out.print("c"); break;
    default: System.out.print("d");
}
]]
@wrap
@out bc
= ~bc~
- ~b~
- ~bcd~
- ~abc~
? Un ~switch~ saute au bon ~case~ puis **continue vers le bas** tant qu'il ne rencontre pas ~break~.

**1.** ~x = 2~ : on saute directement à ~case 2~ (on ignore ~case 1~).

**2.** ~case 2~ affiche ~b~, pas de ~break~ : on **tombe** dans le ~case 3~.

**3.** ~case 3~ affiche ~c~, puis ~break~ : on sort.

~default~ n'est jamais atteint. Affichage ~bc~.

## s1 | Opérateur ternaire
Qu'affiche ce code ?
[[
int a = 5, b = 8;
System.out.println((a > b) ? "A" : (a == b) ? "E" : "B");
]]
@wrap
@out B
= ~B~
- ~A~
- ~E~
- ~8~
? ~condition ? valeurSiVrai : valeurSiFaux~ se lit comme un ~if/else~ qui renvoie une valeur. Ici deux ternaires sont imbriqués :

**1.** ~a > b~ : ~5 > 8~ est faux → on prend la partie après le ~:~, c'est-à-dire le 2<sup>e</sup> ternaire.

**2.** ~a == b~ : ~5 == 8~ est faux → on prend la partie après le ~:~, c'est-à-dire ~"B"~.

Affichage ~B~.

## s1 | Surcharge et conversion
Quelle méthode est appelée par ~f('a')~, puis par ~f(5L)~ ?
[[
public class S {
    static void f(int x)    { System.out.print("int "); }
    static void f(double x) { System.out.print("double "); }
    public static void main(String[] args) {
        f('a');
        f(5L);
    }
}
]]
@main S
@out int double
= ~int~ puis ~double~
- ~double~ puis ~double~
- ~int~ puis ~int~
- ~int~ puis une erreur de compilation
? Java choisit, parmi les méthodes ~f~, celle qui exige **la plus petite conversion** sur l'argument.

**~f('a')~.** ~'a'~ est un ~char~. Conversions possibles : ~char → int~ (proche) ou ~char → double~ (plus loin). On prend ~f(int)~ → ~int~.

**~f(5L)~.** ~5L~ est un ~long~. ~long → int~ est **interdit** sans cast (on perdrait de l'information). ~long → double~ est autorisé. Seule ~f(double)~ convient → ~double~.

Affichage ~int double~.

## s1 | Point d'entrée
Quelle signature est celle du point d'entrée d'un programme Java ?
= ~public static void main(String[] args)~
- ~public void main(String[] args)~
- ~static void main(String args)~
- ~public static int main(String[] args)~
? ~main~ doit être ~public static void~ avec un paramètre ~String[]~. Les autres compilent peut-être, mais la JVM ne les lance pas.

## s1 | Arguments du programme
On lance ~java Prog a b c~. Que valent ~args.length~ et ~args[0]~ ?
= ~3~ et ~"a"~
- ~4~ et ~"Prog"~
- ~3~ et ~"Prog"~
- ~4~ et ~"a"~
? Le nom de la classe n'est pas un argument : ~args = {"a", "b", "c"}~ (contrairement à ~argv[0]~ du langage C).

## s1 | parseInt
Qu'affiche ce code ?
[[
System.out.println(Integer.parseInt("4") + "2" + 1);
]]
@wrap
@out 421
= ~421~
- ~7~
- ~43~
- ~61~
? Suis les types :

**1.** ~Integer.parseInt("4")~ transforme le texte ~"4"~ en **nombre** 4 (un ~int~).

**2.** ~4 + "2"~ : nombre + ~String~ → concaténation : ~"42"~.

**3.** ~"42" + 1~ : encore une concaténation : ~"421"~.

Affichage ~421~. Le résultat n'est pas 7 : on n'additionne jamais un nombre à du texte.

## s1 | Math.round
Qu'affiche ce code ?
[[
System.out.println(Math.round(2.5) + " " + Math.round(-2.5));
]]
@wrap
@out 3 -2
= ~3 -2~
- ~3 -3~
- ~2 -2~
- ~2 -3~
? ~Math.round(x)~ calcule ~floor(x + 0.5)~, c'est-à-dire « le plus grand entier ≤ x + 0,5 ».

**~Math.round(2.5)~** : ~2.5 + 0.5 = 3.0~ → ~3~.

**~Math.round(-2.5)~** : ~-2.5 + 0.5 = -2.0~ → ~-2~ (on arrondit « vers le haut », pas « loin de zéro »).

Affichage ~3 -2~. Les demi-valeurs sont donc arrondies vers +∞.

## s1 | Court-circuit
Qu'affiche ce code ?
[[
int x = 0;
if (x != 0 && 10 / x > 1) System.out.print("a");
else System.out.print("b");
]]
@wrap
@out b
= ~b~
- ~a~
- Une ~ArithmeticException~
- Rien
? Avec ~&&~ (ET), si le **premier** côté est faux, le résultat est forcément faux : Java **n'évalue pas** le second côté.

**1.** ~x != 0~ : ~0 != 0~ est faux.

**2.** Le second côté ~10 / x > 1~ (qui diviserait par 0) n'est **jamais exécuté**.

**3.** La condition est fausse → on va dans le ~else~ : ~b~.

Avec ~&~ (un seul symbole), les deux côtés seraient évalués : ~ArithmeticException~.

## s1 | Variable locale non initialisée
Que se passe-t-il à la compilation ?
[[
int x;
System.out.println(x);
]]
@wrap
@fail
= Erreur : ~x~ n'a pas été initialisée
- Aucune erreur, affiche ~0~
- Aucune erreur, affiche ~null~
- Aucune erreur, mais exception à l'exécution
? Les **attributs** reçoivent une valeur par défaut, mais les **variables locales** (déclarées dans une méthode) **non**. Le compilateur vérifie que chaque variable a reçu une valeur avant d'être lue.

**~int x;~** : déclarée, sans valeur.

**~System.out.println(x);~** : lecture → « variable x might not have been initialized ».

Correction : ~int x = 0;~.

## s1 | Portée d'une variable de boucle
Que se passe-t-il à la compilation ?
[[
for (int i = 0; i < 3; i++) { }
System.out.println(i);
]]
@wrap
@fail
= Erreur : ~i~ n'existe plus après la boucle
- Affiche ~3~
- Affiche ~0~
- Affiche ~2~
? Une variable déclarée **dans l'en-tête du ~for~** n'existe que pendant la boucle : sa **portée** se termine avec l'accolade.

**1.** ~int i~ est créée au début du ~for~.

**2.** À la fin de la boucle, ~i~ est détruite.

**3.** ~System.out.println(i)~ après la boucle cite un ~i~ qui n'existe plus : « cannot find symbol ».

Pour utiliser ~i~ après, il faut le déclarer **avant** le ~for~ : ~int i; for (i = 0; ...)~.

## s1 | Concaténation avec null
Qu'affiche ce code ?
[[
String s = null;
System.out.println(s + "a");
]]
@wrap
@out nulla
= ~nulla~
- ~a~
- Une ~NullPointerException~
- Une erreur de compilation
? Dans une concaténation, Java convertit chaque morceau en texte. Pour une référence ~null~, le texte est ~"null"~. Aucune exception ici.

**~s = null;~** : ~s~ ne pointe sur aucun objet.

**~s + "a"~** : ~null~ devient ~"null"~, d'où ~"nulla"~.

Une ~NullPointerException~ n'apparaîtrait que si on **appelait une méthode** sur ~s~ (par exemple ~s.length()~).

## s1 | Affectation dans un if
Qu'affiche ce code ?
[[
boolean b = false;
if (b = true) System.out.print("yes");
else System.out.print("no");
]]
@wrap
@out yes
= ~yes~
- ~no~
- Une erreur de compilation
- Rien
? Dans ~if (b = true)~ il n'y a qu'**un seul** ~=~ : c'est une **affectation**, pas une comparaison.

**1.** ~b = true~ range ~true~ dans ~b~.

**2.** Une affectation **vaut la valeur affectée** : l'expression vaut ~true~.

**3.** La condition est vraie → on exécute la partie ~if~ : ~yes~.

Pour comparer, il aurait fallu ~b == true~ (ou plus simplement ~if (b)~).

## s1 | Division entière dans un double
Que vaut ~d~ ?
[[
double d = 1 / 2 + 1 / 2.0;
System.out.println(d);
]]
@wrap
@out 0.5
= ~0.5~
- ~1.0~
- ~0.0~
- ~1~
? Chaque division est calculée **d'après le type de ses opérandes**, avant d'être rangée dans ~d~.

**~1 / 2~** : deux entiers → division entière → ~0~.

**~1 / 2.0~** : un réel → division réelle → ~0.5~.

**~0 + 0.5 = 0.5~**, rangé dans le ~double~ ~d~.

Le type ~double~ de la variable n'y change rien : la première division est déjà faite en entiers.

## s1 | Littéral trop grand
Que se passe-t-il à la compilation ?
[[
long big = 3000000000;
]]
@wrap
@fail
= Erreur : « integer number too large » (il faut écrire ~3000000000L~)
- Aucune erreur
- Aucune erreur, ~big~ est négatif
- Erreur : ~long~ n'existe pas
? Un nombre écrit sans suffixe est un **~int~**. Or ~3000000000~ dépasse la limite des ~int~ (2 147 483 647) : le compilateur refuse avant même de regarder ~long~.

**~long big = 3000000000;~** : « integer number too large ».

**~long big = 3000000000L;~** : avec le suffixe ~L~, le littéral est un ~long~ : correct.

Le type de la variable (~long~) ne change pas le type du littéral.

## s1 | i = i++
Qu'affiche ce code ?
[[
int i = 5;
i = i++;
System.out.println(i);
]]
@wrap
@out 5
= ~5~
- ~6~
- ~7~
- ~4~
? Décompose ~i = i++~ en trois temps (avec ~i = 5~) :

**1.** Java lit la valeur actuelle de ~i~ : **5**. C'est la valeur de l'expression ~i++~.

**2.** Il incrémente ~i~ : ~i~ devient 6.

**3.** **Ensuite** il exécute l'affectation ~i = ...~ avec la valeur de l'étape 1 (5) : ~i~ redevient **5**.

L'incrémentation de l'étape 2 est écrasée. Affichage ~5~. (Avec ~i = ++i~ on obtiendrait 6.)

## s1 | compareTo
Qu'affiche ce code ?
[[
System.out.println("apple".compareTo("banana"));
]]
@wrap
@out -1
= ~-1~
- ~1~
- ~0~
- ~true~
? ~a.compareTo(b)~ compare deux chaînes **lettre par lettre** (ordre du dictionnaire).

**1.** On compare les premières lettres : ~'a'~ (97) et ~'b'~ (98). Elles sont différentes, on s'arrête.

**2.** Le résultat est la différence : ~97 - 98 = -1~.

**Sens :** négatif → ~"apple"~ vient **avant** ~"banana"~ ; positif → après ; ~0~ → égales.

## s1 | Scanner
Avec ~Scanner sc = new Scanner(System.in);~, quelle méthode lit un mot (jusqu'au prochain espace) ?
= ~sc.next()~
- ~sc.nextLine()~
- ~sc.nextWord()~
- ~sc.readString()~
? ~next()~ s'arrête au premier blanc ; ~nextLine()~ lit toute la ligne ; ~nextInt()~, ~nextDouble()~ lisent des nombres.

## s1 | Types primitifs
Lequel de ces types **n'est pas** un type primitif ?
= ~String~
- ~boolean~
- ~char~
- ~double~
? ~String~ est une **classe** (d'où ~equals~, ~length()~, ~null~...). Les types primitifs commencent par une minuscule.

## s1 | Mot-clé ou non
Quel mot n'est **pas** un mot-clé de Java ?
= ~String~
- ~void~
- ~class~
- ~int~
? ~String~ est le nom d'une classe de ~java.lang~, pas un mot réservé du langage.

## s1 | Variables et objets
Combien de références ~String~ et d'objets ~String~ sont créés par ~String[] strings = new String[10];~ ?
= Une référence de tableau, 10 cases ~null~, **aucun** objet ~String~
- 10 objets ~String~ vides
- 1 objet ~String~
- 11 objets ~String~
? ~new String[10]~ crée un tableau de 10 **références**, toutes à ~null~. Aucune chaîne n'existe tant qu'on n'en affecte pas.

## s1 | Indice du dernier élément
Quelle expression donne l'indice du dernier élément du tableau ~arr~ de ~String~ ?
= ~arr.length - 1~
- ~arr.length~
- ~arr.length()~
- ~arr.length() - 1~
? Pour un **tableau**, ~length~ est un attribut (sans parenthèses). Les indices vont de 0 à ~length - 1~. (~length()~ est la méthode des ~String~.)

## s1 | Compilation et exécution
Quel élément **interprète** (exécute) le bytecode Java ?
= La JVM
- Le JDK
- L'API
- AWT
? ~javac~ (dans le JDK) compile ~.java~ en ~.class~ (bytecode) ; la **JVM** (Java Virtual Machine) l'exécute.

## s1 | Package importé automatiquement
Quel package est importé automatiquement ?
= ~java.lang~ (~String~, ~Math~, ~Integer~...)
- ~java.util~
- ~java.io~
- ~javax.swing~
? Seul ~java.lang~ est implicite. Pour ~Scanner~ ou ~ArrayList~ il faut ~import java.util.*;~.
`;
