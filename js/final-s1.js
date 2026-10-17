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
? Les ~String~ sont **immuables** : ~toUpperCase()~ renvoie une **nouvelle** chaîne qu'on n'a pas récupérée. ~s~ n'a pas changé. Il faut écrire ~s = s.toUpperCase();~.

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
? ~new String("hi")~ crée un **nouvel objet** : ~==~ compare les adresses (faux), ~equals~ compare le contenu (vrai).

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
? ~7 / 2~ est une division **entière** (3), ~7 % 2~ est le reste (1), ~7 / 2.0~ est une division réelle (3.5).

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
? ~x++~ vaut 5 (puis ~x = 6~), ~++x~ passe ~x~ à 7 et vaut 7. ~y = 5 + 7 = 12~ et ~x = 7~.

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
? ~'a' + 1~ est une addition **numérique** (le code de ~'a'~ est 97, donc 98) ; ensuite on concatène ~"b"~.

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
? L'évaluation va de gauche à droite : ~10 + 20~ = 30 (addition), puis ~"30" + "x"~ (concaténation), puis ~"30x" + 10~ = ~"30x10"~ puis ~"30x1020"~.

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
? Le transtypage ~(int)~ **tronque** vers zéro (il n'arrondit pas) : ~3 + (-3) = 0~.

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
? Les ~int~ « bouclent » en cas de dépassement, sans exception : le plus grand ~int~ plus 1 devient le plus petit.

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
? Les cases d'un tableau reçoivent la valeur par défaut du type : ~0~, ~false~, ~null~ pour les objets.

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
? ~b = a~ copie la **référence** : les deux variables désignent le même tableau.

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
? ~m.length~ = nombre de lignes (3), ~m[0].length~ = longueur de la première ligne (4 colonnes). ~length~ n'a pas de parenthèses pour un tableau.

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
? Java passe **toujours** par valeur : ~f~ modifie une copie de ~a~. Pour ~g~, la valeur copiée est la **référence** du tableau : on modifie le même tableau.

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
? ~n~ est partagé par toutes les instances (une seule copie) : après trois créations, ~n~ vaut 3. ~id~ est propre à chaque objet : le troisième a ~id = 3~.

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
? Une méthode ~static~ n'est liée à aucun objet : elle n'a pas de ~this~, donc pas accès aux attributs d'instance (« non-static variable x cannot be referenced from a static context »).

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
? ~final~ interdit de **changer la référence** ~t~, pas de modifier le **contenu** du tableau. ~t[0] = 5~ est permis.

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
? Ce sont des **nombres** : ~4~ + le code de ~'a'~ (97) + ~2~ (position de ~"v"~) = 103. Aucune concaténation de ~String~ n'intervient.

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
? ~substring(1, 3)~ prend les indices 1 et 2 (le 3 est exclu) : ~"el"~. ~charAt(4)~ est ~'o'~.

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
? ~"a" + "b"~ est une constante évaluée à la compilation : ~c~ désigne la même chaîne que ~a~. ~t + "b"~ est calculé à l'exécution : nouvel objet. Dans tous les cas, on compare le **contenu** avec ~equals~.

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
? On ne garde que les impairs : 1 + 3 + 5 + 7 = 16. Pour ~i = 9~, ~break~ sort de la boucle.

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
? Sans ~break~, l'exécution **continue** dans le ~case~ suivant : ~b~, puis ~c~, puis ~break~.

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
? ~a > b~ est faux ; ~a == b~ est faux ; on obtient la dernière valeur : ~"B"~.

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
? Java choisit la conversion **la plus proche** : ~char~ → ~int~ pour ~'a'~. Un ~long~ ne peut pas devenir ~int~ implicitement, mais peut devenir ~double~ : ~f(double)~.

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
? ~parseInt("4")~ vaut 4 (un ~int~) ; ~4 + "2"~ devient la chaîne ~"42"~ ; puis ~"42" + 1~ = ~"421"~.

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
? ~Math.round(x)~ renvoie ~floor(x + 0.5)~ : 3 pour 2.5, et ~floor(-2.0)~ = -2 pour -2.5.

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
? Avec ~&&~, si le premier opérande est faux, le second n'est **pas évalué** : pas de division par 0. Avec ~&~ on aurait une exception.

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
? Les variables **locales** n'ont pas de valeur par défaut (contrairement aux attributs et aux cases de tableau).

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
? Une variable déclarée dans l'en-tête du ~for~ n'existe que dans la boucle.

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
? Dans une concaténation, une référence ~null~ est convertie en la chaîne ~"null"~. C'est ~s.length()~ qui lancerait une ~NullPointerException~.

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
? ~b = true~ est une **affectation** qui vaut ~true~ : la condition est vraie. Piège classique (~=~ au lieu de ~==~).

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
? ~1 / 2~ est entier : 0. ~1 / 2.0~ vaut 0.5. Total 0.5, converti en ~double~ à l'affectation.

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
? Un littéral entier sans suffixe est un ~int~ : 3 milliards dépassent ~2147483647~. Avec le suffixe ~L~, c'est un ~long~.

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
? ~i++~ vaut l'ancienne valeur (5) et incrémente ~i~, **puis** l'affectation réécrit ~5~ dans ~i~ : l'incrémentation est perdue.

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
? ~compareTo~ renvoie la différence des premiers caractères qui diffèrent : ~'a' - 'b' = -1~. Négatif : ~"apple"~ est **avant** ~"banana"~.

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
