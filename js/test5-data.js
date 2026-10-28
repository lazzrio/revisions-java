/* Banque de questions du Test 5 (semaines 5, 6, 7).
   Format : "## theme | sujet" puis l'énoncé ; "= " bonne réponse ; "- " mauvaises réponses ; "? " explication.
   ~code~ = code en ligne, **gras**, [[ ... ]] = bloc de code (ligne [[ puis ligne ]]).
   Thèmes : exc (exceptions), fic (fichiers et sérialisation), swing (interface graphique), mvc.
   Les sorties des programmes ont été vérifiées en les exécutant avec Java 21. */
const T5_RAW = String.raw`
## exc | Hiérarchie
Laquelle de ces exceptions est **non vérifiée** (le compilateur n'oblige pas à la traiter) ?
= ~NullPointerException~
- ~IOException~
- ~FileNotFoundException~
- ~ClassNotFoundException~
? ~NullPointerException~ hérite de ~RuntimeException~ : non vérifiée. Les trois autres héritent de ~Exception~ sans passer par ~RuntimeException~ : vérifiées, donc ~try/catch~ ou ~throws~ obligatoire.

## exc | Hiérarchie
~StackOverflowError~ (récursion infinie) est :
= Un ~Error~, sous-classe de ~Throwable~ mais pas de ~Exception~
- Une ~RuntimeException~
- Une exception vérifiée
- Une ~IOException~
? ~Throwable~ a deux branches : ~Error~ (problèmes graves de la JVM, qu'on ne traite pas) et ~Exception~.

## exc | throw / throws
Quelle est la différence entre ~throw~ et ~throws~ ?
= ~throw~ lance une exception dans le corps ; ~throws~ déclare dans la signature les exceptions vérifiées qu'une méthode peut laisser sortir
- ~throws~ lance l'exception, ~throw~ la déclare
- Les deux sont synonymes
- ~throw~ sert aux exceptions vérifiées, ~throws~ aux non vérifiées
? ~throw new X()~ = action de lancer (instruction). ~throws X~ = promesse dans l'en-tête de la méthode.

## exc | throw / throws
Où s'écrit le mot-clé ~throws~ ?
= Dans la signature de la méthode, après les parenthèses
- Dans le corps, devant ~new~
- Après le ~catch~
- Dans la déclaration de la classe
? Exemple : ~void lire() throws IOException { ... }~

## exc | Ordre des catch
Que donne ce code ?
[[
try {
    lire();
} catch (Exception e) {
    System.out.println("A");
} catch (IOException e) {
    System.out.println("B");
}
]]
= Erreur de compilation : ~IOException~ a déjà été attrapée par le ~catch (Exception e)~
- Affiche ~A~ si ~lire()~ lance une ~IOException~
- Affiche ~B~ si ~lire()~ lance une ~IOException~
- Compile avec un simple avertissement
? Java essaie les ~catch~ **dans l'ordre d'écriture** et prend le premier qui convient.

**~catch (Exception e)~** attrape **toutes** les exceptions, y compris les ~IOException~ (qui héritent d'~Exception~).

Donc le ~catch (IOException e)~ écrit **après** ne pourrait **jamais** s'exécuter : le compilateur le signale comme une erreur (« exception IOException has already been caught »).

Règle : du plus précis au plus général. Ici il fallait mettre ~IOException~ **d'abord**, ~Exception~ ensuite.

## exc | finally
Que se passe-t-il pour le bloc ~finally~ quand le ~try~ contient un ~return~ ?
= Le ~finally~ s'exécute quand même, juste avant que la méthode ne rende la main
- Il est ignoré
- Il provoque une erreur de compilation
- Il s'exécute seulement s'il y a eu une exception
? ~finally~ s'exécute dans tous les cas (succès, exception, ~return~, ~break~, ~continue~), sauf ~System.exit()~ ou arrêt brutal de la JVM.

## exc | finally
Dans quel cas le bloc ~finally~ ne s'exécute **pas** ?
= Quand le ~try~ appelle ~System.exit(0)~
- Quand le ~try~ lance une exception non attrapée
- Quand le ~try~ contient un ~return~
- Quand le ~catch~ lance une autre exception
? ~System.exit()~ arrête la JVM immédiatement. Dans les trois autres cas, ~finally~ s'exécute.

## exc | Lecture de code : finally et return
Que fait ce programme ?
[[
static int f() {
    try { return 1; }
    finally { System.out.println("F"); }
}
public static void main(String[] a) {
    System.out.println(f());
}
]]
= Affiche ~F~ puis ~1~
- Affiche ~1~ puis ~F~
- Affiche seulement ~1~
- Affiche seulement ~F~
? Suis les étapes dans l'ordre :

**1.** ~main~ appelle ~f()~ **à l'intérieur** de ~System.out.println(...)~. Java doit d'abord obtenir la valeur de ~f()~, ensuite seulement il affichera.

**2.** Dans ~f()~, on entre dans le ~try~ : ~return 1~ prépare la valeur de retour (1) mais la méthode n'est pas encore terminée.

**3.** Avant de sortir, Java exécute **obligatoirement** le bloc ~finally~ : il affiche ~F~.

**4.** ~f()~ rend alors la valeur 1 à ~main~.

**5.** ~println~ reçoit 1 et l'affiche.

Affichage : ~F~ **puis** ~1~. Le ~F~ sort avant le ~1~ parce que le ~finally~ a lieu pendant le calcul de ~f()~, avant le ~println~ du ~main~.

## exc | Lecture de code : return dans finally
Que vaut ~g()~ ?
[[
static int g() {
    try { return 1; }
    finally { return 2; }
}
]]
= ~2~
- ~1~
- ~3~
- Erreur de compilation
? Un ~return~ dans le ~finally~ **remplace** celui du ~try~.

**1.** ~return 1;~ dans le ~try~ : valeur 1 préparée.

**2.** Le ~finally~ s'exécute : ~return 2;~ **termine la méthode immédiatement avec 2**. L'ancienne valeur est jetée.

**3.** La méthode renvoie ~2~.

C'est considéré comme une très mauvaise pratique (le ~try~ devient inutile). Le compilateur affiche un avertissement mais compile.

## exc | Lecture de code : valeur évaluée avant finally
Que vaut ~h()~ ?
[[
static int h() {
    int x = 1;
    try { return x; }
    finally { x = 99; }
}
]]
= ~1~
- ~99~
- ~100~
- Erreur de compilation
? Le ~return~ ne renvoie pas « la variable », il renvoie **la valeur qu'elle a au moment du ~return~**.

**1.** ~x = 1~.

**2.** ~return x~ : Java **copie la valeur 1** pour la renvoyer.

**3.** Le ~finally~ s'exécute : ~x = 99~ modifie la variable locale ~x~, mais la valeur déjà copiée (1) ne change pas.

**4.** La méthode renvoie 1.

Contraste : si on renvoyait un **objet** (par exemple un ~StringBuilder~), la copie serait celle de la **référence** : le ~finally~ pourrait modifier l'objet, et l'appelant verrait le changement.

## exc | Lecture de code : flux normal
Quelle est la sortie ?
[[
try {
    System.out.println("A");
    int x = 5 / 0;
    System.out.println("B");
} catch (ArithmeticException e) {
    System.out.println("C");
} finally {
    System.out.println("D");
}
System.out.println("E");
]]
= ~A C D E~ (une ligne chacun)
- ~A B C D E~
- ~A D E~
- ~A C E~
? Suis les lignes **dans l'ordre d'exécution** :

| ligne exécutée | affichage |
|---|---|
| ~print("A")~ | ~A~ |
| ~5 / 0~ → ~ArithmeticException~ : on saute le reste du ~try~ (**~B~ n'est pas affiché**) | |
| ~catch (ArithmeticException)~ | ~C~ |
| ~finally~ | ~D~ |
| après le bloc ~try~ | ~E~ |

Affichage ~A C D E~ (une lettre par ligne). Le ~finally~ passe **avant** la suite du programme.

## exc | Lecture de code : propagation
Quelle est la sortie ?
[[
static void a() {
    System.out.println("a1");
    b();
    System.out.println("a2");
}
static void b() {
    System.out.println("b1");
    throw new IllegalStateException("boum");
}
public static void main(String[] args) {
    try { a(); }
    catch (RuntimeException e) { System.out.println("main:" + e.getMessage()); }
}
]]
= ~a1~, ~b1~, ~main:boum~
- ~a1~, ~b1~, ~a2~, ~main:boum~
- ~a1~, ~main:boum~
- ~b1~, ~main:boum~
? Une exception non attrapée **remonte** d'appel en appel.

| étape | pile des appels | affichage |
|---|---|---|
| ~main~ entre dans le ~try~ et appelle ~a()~ | main → a | |
| ~a~ affiche | main → a | ~a1~ |
| ~a~ appelle ~b()~, ~b~ affiche | main → a → b | ~b1~ |
| ~b~ lance l'exception (aucun ~catch~) | | |
| ~a~ est abandonnée (**~a2~ n'est jamais affiché**) | main | |
| le ~catch~ de ~main~ l'attrape | main | ~main:boum~ |

Résultat ~a1~, ~b1~, ~main:boum~.

## exc | Lecture de code : try imbriqués
Quelle est la sortie ?
[[
try {
    try {
        throw new Exception("X");
    } finally {
        System.out.println("1");
    }
} catch (Exception e) {
    System.out.println("2" + e.getMessage());
}
]]
= ~1~ puis ~2X~
- ~2X~ puis ~1~
- ~1~ seulement
- ~2X~ seulement
? Le ~try~ interne n'a **pas de ~catch~**, seulement un ~finally~.

**1.** ~throw new Exception("X")~ est lancée dans le ~try~ interne.

**2.** Pas de ~catch~ ici : mais avant de quitter, le ~finally~ s'exécute et affiche ~1~.

**3.** L'exception continue de remonter vers le ~try~ externe.

**4.** Le ~catch (Exception e)~ externe l'attrape et affiche ~"2" + e.getMessage()~ = ~2X~.

Ordre : ~1~ puis ~2X~.

## exc | Lecture de code : continue et finally
Quelle est la sortie ?
[[
for (int i = 0; i < 3; i++) {
    try {
        if (i == 1) continue;
        System.out.println("i=" + i);
    } finally {
        System.out.println("f" + i);
    }
}
]]
= ~i=0~, ~f0~, ~f1~, ~i=2~, ~f2~
- ~i=0~, ~i=2~, ~f0~, ~f1~, ~f2~
- ~i=0~, ~f0~, ~i=2~, ~f2~
- ~i=0~, ~f0~, ~f1~, ~f2~, ~i=2~
? Le ~finally~ s'exécute **à chaque tour**, même quand ~continue~ saute le reste du ~try~.

| ~i~ | dans le ~try~ | dans le ~finally~ |
|---|---|---|
| 0 | affiche ~i=0~ | ~f0~ |
| 1 | ~continue~ : on saute ~println~ | ~f1~ (quand même !) |
| 2 | affiche ~i=2~ | ~f2~ |

Affichage dans l'ordre : ~i=0~, ~f0~, ~f1~, ~i=2~, ~f2~.

## exc | Lecture de code : exception personnalisée
Quelle est la sortie ?
[[
class AgeException extends Exception {
    AgeException(String m) { super(m); }
}
static void verifier(int age) throws AgeException {
    if (age < 0) throw new AgeException("negatif: " + age);
    System.out.println("ok " + age);
}
public static void main(String[] args) {
    for (int a : new int[]{5, -2, 7}) {
        try { verifier(a); }
        catch (AgeException e) { System.out.println(e.getMessage()); }
    }
}
]]
= ~ok 5~, ~negatif: -2~, ~ok 7~
- ~ok 5~, ~negatif: -2~ puis arrêt du programme
- ~ok 5~, ~ok -2~, ~ok 7~
- Erreur de compilation : ~AgeException~ n'est pas déclarée
? Le ~try/catch~ est **dans** la boucle : chaque tour est traité séparément.

| ~a~ | ~verifier(a)~ | affichage |
|---|---|---|
| ~5~ | ~age < 0~ faux → affiche ~"ok " + age~ | ~ok 5~ |
| ~-2~ | ~age < 0~ vrai → ~throw~ → attrapé par le ~catch~ | ~negatif: -2~ |
| ~7~ | pas d'exception | ~ok 7~ |

Le ~catch~ affiche ~e.getMessage()~, qui est le texte passé à ~super(m)~. La boucle continue après l'erreur.

## exc | Lecture de code : parseInt
Quelle valeur affiche ce programme ?
[[
String[] t = {"12", "x", "7"};
int s = 0;
for (String m : t) {
    try { s += Integer.parseInt(m); }
    catch (NumberFormatException e) { s += 100; }
}
System.out.println(s);
]]
= ~119~
- ~19~
- ~112~
- Le programme s'arrête avec une exception
? Additionne les contributions de chaque texte :

| ~m~ | ~Integer.parseInt(m)~ | effet sur ~s~ |
|---|---|---|
| ~"12"~ | ~12~ | ~s = 0 + 12 = 12~ |
| ~"x"~ | ~NumberFormatException~ → ~catch~ | ~s = 12 + 100 = 112~ |
| ~"7"~ | ~7~ | ~s = 112 + 7 = 119~ |

Affichage ~119~. Une erreur dans le ~try~ n'arrête pas la boucle : on passe dans le ~catch~ puis on continue.

## exc | Lecture de code : ordre des catch valide
Que donne ce code ?
[[
int[] t = new int[3];
try { t[3] = 1; }
catch (ArrayIndexOutOfBoundsException e) { System.out.println("idx"); }
catch (Exception e) { System.out.println("autre"); }
]]
= ~idx~
- ~autre~
- ~idx~ puis ~autre~
- Erreur de compilation
? **1.** Les indices valides de ~new int[3]~ sont 0, 1, 2.

**2.** ~t[3] = 1~ lance ~ArrayIndexOutOfBoundsException~.

**3.** Java examine les ~catch~ dans l'ordre : le premier correspond exactement → affiche ~idx~.

**4.** Un seul ~catch~ s'exécute : le second (~Exception~) est ignoré.

Ordre précis → général : correct, donc ça compile.

## exc | Lecture de code : try-with-resources
Quelle est la sortie ?
[[
class R implements AutoCloseable {
    String n;
    R(String n) { this.n = n; System.out.println("open " + n); }
    public void close() { System.out.println("close " + n); }
}
try (R a = new R("A"); R b = new R("B")) {
    System.out.println("body");
}
]]
= ~open A~, ~open B~, ~body~, ~close B~, ~close A~
- ~open A~, ~open B~, ~body~, ~close A~, ~close B~
- ~open A~, ~body~, ~close A~, ~open B~, ~close B~
- ~body~, ~open A~, ~open B~, ~close B~, ~close A~
? Règle : les ressources sont **ouvertes dans l'ordre de déclaration** et **fermées dans l'ordre inverse**.

| temps | événement | affichage |
|---|---|---|
| 1 | création de ~A~ | ~open A~ |
| 2 | création de ~B~ | ~open B~ |
| 3 | corps du ~try~ | ~body~ |
| 4 | fermeture automatique de ~B~ (la dernière ouverte) | ~close B~ |
| 5 | fermeture de ~A~ | ~close A~ |

Comme une pile d'assiettes : la dernière posée est la première retirée.

## exc | Lecture de code : finally avec return dans catch
Que affiche ~System.out.println(calc(0));~ ?
[[
static int calc(int d) {
    try { return 10 / d; }
    catch (ArithmeticException e) { return -1; }
    finally { System.out.println("fin" + d); }
}
]]
= ~fin0~ puis ~-1~
- ~-1~ puis ~fin0~
- ~fin0~ puis une exception non attrapée
- ~-1~ seulement
? **1.** ~calc(0)~ : ~10 / 0~ lance ~ArithmeticException~.

**2.** Le ~catch~ l'attrape : ~return -1~ prépare la valeur -1.

**3.** Avant de quitter, le ~finally~ s'exécute : affiche ~fin0~.

**4.** ~calc~ renvoie ~-1~ à ~main~.

**5.** ~println~ affiche ~-1~.

Ordre à l'écran : ~fin0~ **puis** ~-1~ (le ~finally~ est dans ~calc~, avant le ~println~ du ~main~).

## exc | Vérifiée non traitée
Que se passe-t-il ?
[[
public static void main(String[] args) {
    FileReader fr = new FileReader("a.txt");
}
]]
= Erreur de compilation : exception ~FileNotFoundException~ non traitée (« must be caught or declared to be thrown »)
- Compile, et exception à l'exécution si le fichier est absent
- Compile sans aucun problème
- Le fichier est créé s'il n'existe pas
? **1.** ~new FileReader("a.txt")~ peut lancer ~FileNotFoundException~ (fichier absent).

**2.** Cette exception est **vérifiée** : elle n'hérite pas de ~RuntimeException~.

**3.** Le compilateur exige donc de la **traiter** (~try/catch~) ou de la **déclarer** (~throws~ sur ~main~).

**4.** Aucun des deux ici → « unreported exception FileNotFoundException; must be caught or declared to be thrown ».

Contraste : une ~NullPointerException~ n'oblige à rien.

## exc | Non vérifiée
Ce code compile-t-il ?
[[
static int div(int a, int b) {
    return a / b;
}
public static void main(String[] args) {
    System.out.println(div(4, 0));
}
]]
= Oui, il compile ; à l'exécution une ~ArithmeticException~ arrête le programme
- Non : il manque ~throws ArithmeticException~
- Non : il manque un ~try/catch~
- Oui, et il affiche ~Infinity~
? **~ArithmeticException~** hérite de ~RuntimeException~ : elle est **non vérifiée**. Le compilateur ne demande ni ~try~ ni ~throws~.

**1.** Compilation : OK.

**2.** Exécution : ~div(4, 0)~ divise des entiers par 0 → ~ArithmeticException~, non attrapée → le programme s'arrête avec la trace.

L'affichage ~Infinity~ n'arriverait qu'avec des ~double~ (~4.0 / 0~).

## exc | Division par zéro
Que donne ~System.out.println(5.0 / 0);~ ?
= ~Infinity~
- ~ArithmeticException~
- ~0~
- Erreur de compilation
? Pour les nombres à virgule flottante, la division par 0 ne lance pas d'exception : ~Infinity~ (ou ~NaN~ pour ~0.0/0~). Seuls les entiers lèvent ~ArithmeticException~.

## exc | catch jamais atteint
Ce code compile-t-il ?
[[
try {
    int x = 3;
} catch (IOException e) {
    System.out.println("io");
}
]]
= Non : ~IOException~ (vérifiée) n'est jamais lancée dans le ~try~
- Oui, le ~catch~ est simplement ignoré
- Oui, mais avec une exception à l'exécution
- Oui, et ~io~ est affiché
? Le compilateur raisonne : « que peut lancer ce ~try~ ? »

**1.** Le ~try~ ne contient que ~int x = 3;~ : aucune ~IOException~ possible.

**2.** ~IOException~ est **vérifiée** : un ~catch~ pour elle n'est accepté que si le ~try~ peut la lancer.

**3.** Erreur « exception IOException is never thrown in body of corresponding try statement ».

Pour ~Exception~ ou une ~RuntimeException~, ce contrôle n'existe pas.

## exc | Exception personnalisée
Pour créer une exception **vérifiée** perso ~MonErreur~ :
= ~class MonErreur extends Exception~
- ~class MonErreur extends RuntimeException~
- ~class MonErreur implements Exception~
- ~class MonErreur extends Error~
? Le type d'une exception personnalisée dépend de sa **classe mère** :

| déclaration | type | conséquence |
|---|---|---|
| ~extends Exception~ | **vérifiée** | ~try/catch~ ou ~throws~ **obligatoire** |
| ~extends RuntimeException~ | non vérifiée | aucune obligation |

Ici on demande une exception **vérifiée** : ~class MonErreur extends Exception~.

~Exception~ est une **classe** : on en hérite avec ~extends~. ~implements~ est réservé aux interfaces ; ~extends Error~ créerait une erreur grave de la JVM, pas une exception du programme.

## exc | Exception personnalisée
Que renvoie ~getMessage()~ ici ?
[[
class E extends Exception {
    E(String m) { }
}
...
throw new E("oups");
]]
= ~null~ : le constructeur ne transmet pas le message au parent
- ~"oups"~
- ~""~ (chaîne vide)
- Une erreur de compilation
? ~getMessage()~ est une méthode de la classe mère ~Throwable~, qui range le message dans un attribut.

**1.** ~new E("oups")~ → constructeur ~E(String m)~.

**2.** Ce constructeur n'écrit pas ~super(m)~ : Java appelle implicitement ~super()~ **sans** message.

**3.** Le message du parent reste ~null~, la chaîne ~"oups"~ est reçue puis jetée.

Correction : ~E(String m) { super(m); }~.

## exc | multi-catch
Quel ~catch~ est refusé par le compilateur ?
= ~catch (IOException | FileNotFoundException e)~
- ~catch (IOException | SQLException e)~
- ~catch (NumberFormatException | NullPointerException e)~
- ~catch (ArithmeticException | IOException e)~
? Dans un multi-catch, les types ne doivent pas être liés par héritage : ~FileNotFoundException~ est une sous-classe de ~IOException~.

## exc | try sans catch
Quelle écriture est valide ?
= ~try { ... } finally { ... }~
- ~try { ... }~ (seul)
- ~try { ... } catch { ... }~ (sans paramètre)
- ~finally { ... } try { ... }~
? Un ~try~ doit être suivi d'au moins un ~catch~ ou d'un ~finally~ (ou être un try-with-resources). Un ~catch~ a toujours un paramètre.

## exc | catch et exception dans catch
Quelle est la sortie, sachant que l'exception de la ligne 2 n'est pas attrapée plus haut ?
[[
try {
    throw new IllegalArgumentException("a");
} catch (IllegalArgumentException e) {
    throw new RuntimeException("b");
} finally {
    System.out.println("f");
}
]]
= ~f~ est affiché, puis l'exception ~RuntimeException~ remonte
- Rien n'est affiché, l'exception remonte directement
- ~f~ n'est affiché que s'il n'y a pas d'exception dans le ~catch~
- Erreur de compilation
? Suis le déroulé :

**1.** ~throw new IllegalArgumentException("a")~ dans le ~try~.

**2.** Le ~catch (IllegalArgumentException)~ l'attrape.

**3.** Dans le ~catch~, un nouveau ~throw~ lance ~RuntimeException("b")~.

**4.** Avant que cette nouvelle exception quitte le bloc, le ~finally~ s'exécute : affiche ~f~.

**5.** L'exception ~b~ remonte.

Le ~finally~ s'exécute **dans tous les cas**.

## exc | Redéfinition
Une méthode ~void m()~ de la classe mère est redéfinie dans la fille par ~void m() throws IOException~. Que se passe-t-il ?
= Erreur de compilation : la redéfinition ne peut pas déclarer une exception vérifiée que la méthode mère ne déclare pas
- Compile sans problème
- Compile avec un avertissement
- Erreur seulement à l'exécution
? Une méthode redéfinie peut lancer **moins** (ou des sous-types) d'exceptions vérifiées, jamais plus. Sinon le polymorphisme casserait le contrat de la mère.

## exc | Causes
Que fait ~new RuntimeException("outer", new IllegalArgumentException("inner")).getCause().getMessage()~ ?
= Renvoie ~"inner"~
- Renvoie ~"outer"~
- Renvoie ~null~
- Renvoie ~"outer inner"~
? Le 2e paramètre est la **cause** (l'exception d'origine), récupérée par ~getCause()~. ~getMessage()~ de la cause donne ~"inner"~.

## exc | Quelle exception
~int[] t = new int[3]; t[3] = 1;~ lance :
= ~ArrayIndexOutOfBoundsException~
- ~NullPointerException~
- ~ArithmeticException~
- ~NumberFormatException~
? Indices valides de 0 à ~length - 1~ = 0, 1, 2.

## exc | Quelle exception
~String s = null; s.length();~ lance :
= ~NullPointerException~
- ~ClassCastException~
- ~IllegalArgumentException~
- ~IOException~
? Appeler une méthode sur une référence ~null~ → ~NullPointerException~.

## exc | Quelle exception
~Object o = "texte"; Integer i = (Integer) o;~ lance :
= ~ClassCastException~
- ~NumberFormatException~
- ~NullPointerException~
- Erreur de compilation
? Le downcast est accepté par le compilateur (Object → Integer), mais l'objet réel est une ~String~ : ~ClassCastException~ à l'exécution. ~instanceof~ permet de vérifier avant.

## exc | Quelle exception
~Integer.parseInt("12.5")~ lance :
= ~NumberFormatException~
- ~ArithmeticException~
- ~ClassCastException~
- Rien : renvoie 12
? Une chaîne qui n'est pas un entier valide → ~NumberFormatException~ (sous-classe de ~IllegalArgumentException~). Message : ~For input string: "12.5"~.

## exc | Hiérarchie
Quelle affirmation est vraie ?
= ~FileNotFoundException~ est une sous-classe de ~IOException~
- ~IOException~ est une sous-classe de ~FileNotFoundException~
- ~IOException~ est une ~RuntimeException~
- ~FileNotFoundException~ est une ~RuntimeException~
? Plus précis = sous-classe : ~FileNotFoundException~ ⊂ ~IOException~ ⊂ ~Exception~. Donc ~catch (FileNotFoundException e)~ avant ~catch (IOException e)~.

## exc | Hiérarchie
Un ~catch (Exception e)~ attrape-t-il un ~StackOverflowError~ ?
= Non : c'est un ~Error~, pas une ~Exception~
- Oui, tout est une exception
- Oui, mais seulement si on ajoute ~throws~
- Non : il faut un ~finally~
? ~Error~ et ~Exception~ sont deux branches séparées de ~Throwable~. Pour tout attraper il faudrait ~catch (Throwable t)~ (déconseillé).

## exc | Instruction après throw
Ce code compile-t-il ?
[[
static int f() {
    throw new RuntimeException("x");
    System.out.println("après");
}
]]
= Non : « unreachable statement »
- Oui, ~après~ sera affiché
- Oui, mais avec un avertissement
- Non : ~throw~ est interdit dans une méthode qui renvoie ~int~
? ~throw~ interrompt immédiatement la méthode : rien de ce qui suit, dans le même bloc, ne peut s'exécuter.

**~throw new RuntimeException("x");~** : la méthode s'arrête ici.

**~System.out.println("après");~** : code **inatteignable**. Java refuse de compiler du code mort : « unreachable statement ».

Même règle après un ~return~, un ~break~ ou un ~continue~.

## exc | throw d'un non-Throwable
Ce code compile-t-il ? ~throw new String("erreur");~
= Non : on ne peut lancer qu'un objet de type ~Throwable~
- Oui, la chaîne devient l'exception
- Oui, mais il faut ~throws String~
- Oui, à condition d'être dans un ~try~
? Seules les classes qui héritent de ~Throwable~ peuvent être lancées avec ~throw~.

## exc | main et exception vérifiée
Dans ~main~, on appelle ~lire()~ qui déclare ~throws Exception~, sans ~try~. Que faut-il ?
= Déclarer ~throws Exception~ sur ~main~ (ou entourer l'appel d'un ~try/catch~)
- Rien, ~main~ est exemptée
- Ajouter ~finally~ après l'appel
- Ajouter ~static~ à ~lire()~
? Une exception vérifiée doit être soit traitée, soit déclarée, y compris dans ~main~.

## exc | printStackTrace
~e.printStackTrace()~ :
= Affiche la trace de l'exception (type, message, pile d'appels) sur la sortie d'erreur
- Arrête le programme
- Relance l'exception
- Supprime l'exception
? Elle ne fait qu'afficher (sur ~System.err~). Le programme continue après le ~catch~.

## exc | Quand vérifiée ou non
Une erreur **de programmation** (indice hors tableau, ~null~ utilisé) est plutôt :
= Une exception non vérifiée (~RuntimeException~)
- Une exception vérifiée
- Un ~Error~
- Une exception qu'il faut toujours déclarer avec ~throws~
? Les erreurs de programmation se corrigent dans le code. Les exceptions vérifiées sont réservées aux situations prévisibles hors du contrôle du programme (fichier absent, réseau).

## fic | Serializable
~Serializable~ est :
= Une interface **marqueur** : elle ne contient aucune méthode
- Une classe abstraite
- Une interface avec ~write()~ et ~read()~
- Une annotation
? On écrit juste ~implements Serializable~. C'est un « tampon » qui dit à Java que les objets de la classe peuvent être transformés en octets.

## fic | Flux d'objets
Quelle classe écrit un **objet** dans un fichier binaire ?
= ~ObjectOutputStream~
- ~ObjectInputStream~
- ~PrintWriter~
- ~Scanner~
? ~ObjectOutputStream~ → ~writeObject()~ (écrire). ~ObjectInputStream~ → ~readObject()~ (lire). Il enveloppe un ~FileOutputStream~.

## fic | Flux d'objets
Quelle est la bonne création du flux d'écriture ?
= ~new ObjectOutputStream(new FileOutputStream("data.ser"))~
- ~new ObjectOutputStream("data.ser")~
- ~new FileOutputStream(new ObjectOutputStream("data.ser"))~
- ~new ObjectWriter(new File("data.ser"))~
? Le flux d'objets se construit **autour d'un flux d'octets** (~FileOutputStream~) qui, lui, connaît le fichier.

## fic | readObject
Que renvoie ~readObject()~ et que faut-il faire ?
= Un ~Object~ : il faut le **caster** vers le bon type
- Directement le bon type, pas de cast
- Un ~String~
- ~void~
? Exemple : ~Etudiant e = (Etudiant) ois.readObject();~.

## fic | readObject
Quelles exceptions vérifiées ~readObject()~ peut-elle lancer ?
= ~IOException~ et ~ClassNotFoundException~
- Seulement ~IOException~
- Seulement ~ClassNotFoundException~
- Aucune, elles sont non vérifiées
? ~IOException~ (problème de lecture) et ~ClassNotFoundException~ (la classe de l'objet lu est introuvable). On peut mettre les deux dans un multi-catch ou les déclarer avec ~throws~.

## fic | transient
Que contient ~age~ après sérialisation puis désérialisation ?
[[
class P implements Serializable {
    String nom;
    transient int age;
    P(String nom, int age) { this.nom = nom; this.age = age; }
}
// on écrit new P("Bob", 30) puis on le relit dans q
System.out.println(q.nom + " " + q.age);
]]
= ~Bob 0~
- ~Bob 30~
- ~null 0~
- ~Bob null~
? **Écriture :** l'objet ~P("Bob", 30)~ est converti en octets. ~nom~ est écrit. ~age~ est ~transient~ : **ignoré**.

**Lecture :** Java reconstruit l'objet **sans appeler le constructeur**. ~nom~ est restauré (~"Bob"~). ~age~, qui n'a pas été sauvé, reçoit la **valeur par défaut** de son type (0 pour ~int~).

Affichage ~Bob 0~. Utile pour ne pas sauvegarder un mot de passe ou un cache.

## fic | static et sérialisation
Un attribut ~static~ est-il sauvegardé par la sérialisation ?
= Non : il appartient à la classe, pas à l'objet
- Oui, comme les autres
- Oui, seulement s'il est ~public~
- Oui, seulement s'il est ~final~
? La sérialisation sauve l'**état de l'objet**. Un ~static~ n'est pas dans l'objet : après relecture, il garde la valeur actuelle de la classe.

## fic | NotSerializableException
Quel est le problème ?
[[
class Moteur { }
class Voiture implements Serializable {
    Moteur m = new Moteur();
}
...
oos.writeObject(new Voiture());
]]
= ~NotSerializableException~ à l'exécution : ~Moteur~ n'implémente pas ~Serializable~
- Erreur de compilation
- Rien, ~m~ sera simplement ignoré
- ~m~ vaudra ~null~ après relecture
? Sérialiser un objet, c'est sérialiser **tout ce qu'il contient**.

**1.** ~Voiture~ implémente ~Serializable~ : OK.

**2.** Elle contient un attribut ~Moteur m~. Java doit donc aussi sérialiser le ~Moteur~.

**3.** ~Moteur~ n'implémente pas ~Serializable~ → ~NotSerializableException~ **à l'exécution** (la compilation passe).

Solutions : faire implémenter ~Serializable~ à ~Moteur~, ou marquer l'attribut ~transient~.

## fic | Graphe d'objets
On écrit une liste contenant **deux fois le même objet** ~c~. Après relecture dans ~l2~, que vaut ~l2.get(0) == l2.get(1)~ ?
= ~true~ : la sérialisation conserve le partage des références
- ~false~ : deux copies sont créées
- Exception ~InvalidClassException~
- ~null~
? Dans un même flux, un objet référencé plusieurs fois n'est écrit qu'une fois. À la relecture les deux références pointent vers **le même** objet (qui est une copie de ~c~, donc ~l2.get(0) == c~ est ~false~).

## fic | Constructeur
À la désérialisation d'un objet d'une classe ~Serializable~ :
= Le constructeur de cette classe n'est **pas** appelé
- Le constructeur sans paramètre est appelé
- Tous les constructeurs sont appelés
- Le constructeur à tous les paramètres est appelé
? L'objet est reconstruit directement depuis les octets. (Seul le constructeur sans argument de la première classe mère **non sérialisable** est appelé.)

## fic | serialVersionUID
À quoi sert ~serialVersionUID~ ?
= À identifier la version de la classe : à la relecture, s'il ne correspond pas, ~InvalidClassException~
- À compter les objets sauvegardés
- À crypter le fichier
- À nommer le fichier de sauvegarde
? Déclaré ~private static final long serialVersionUID = 1L;~. Si on modifie la classe après avoir sauvé un fichier, un ID différent protège contre une relecture incohérente.

## fic | serialVersionUID et JFrame
Pourquoi l'IDE signale-t-il l'absence de ~serialVersionUID~ dans ~class Fenetre extends JFrame~ ?
= Parce que ~JFrame~ (via ~Component~) implémente ~Serializable~, donc ~Fenetre~ l'est aussi
- Parce que toute classe doit en avoir un
- Parce que ~JFrame~ est abstraite
- Parce que ~Fenetre~ a un ~main~
? ~Serializable~ s'hérite : une fille d'une classe sérialisable est sérialisable. Lien entre la semaine 5 et la semaine 6.

## fic | Collection
Peut-on sérialiser un ~ArrayList<Etudiant>~ d'un seul coup ?
= Oui, si ~Etudiant~ est ~Serializable~ (~ArrayList~ l'est déjà)
- Non, il faut écrire chaque élément séparément
- Oui, sans aucune condition
- Non, les collections ne sont pas sérialisables
? ~writeObject(liste)~ écrit la liste et tous ses éléments. Chaque élément doit être sérialisable.

## fic | Ordre de lecture
On a écrit successivement un ~String~, puis un ~Integer~, puis un ~Etudiant~. Pour relire :
= Il faut relire dans le **même ordre** avec les bons casts
- Dans l'ordre inverse
- Dans n'importe quel ordre
- Un seul ~readObject()~ renvoie tout
? Le flux est séquentiel : chaque ~readObject()~ lit l'objet suivant.

## fic | Fin de fichier
En lisant des objets en boucle avec ~readObject()~, la fin du fichier est signalée par :
= Une ~EOFException~
- La valeur ~null~ systématiquement
- Une ~NullPointerException~
- Rien : la boucle est infinie
? On peut attraper ~EOFException~ pour sortir de la boucle, ou écrire d'abord le nombre d'objets, ou sauver toute une liste en un seul objet.

## fic | Texte ou binaire
Quel est l'avantage d'un fichier **texte** par rapport à la sérialisation ?
= Il est lisible et modifiable dans un éditeur, et indépendant de la classe Java
- Il sauvegarde automatiquement les références entre objets
- Il est plus rapide à écrire dans tous les cas
- Il n'exige aucune exception
? Texte = lisible, portable. Sérialisation = pratique (objets complets, graphes, un seul appel), mais binaire et lié aux classes Java.

## fic | File
~File f = new File("notes.txt");~ :
= Crée un objet qui représente un chemin ; ça ne crée pas le fichier sur le disque
- Crée le fichier ~notes.txt~ vide
- Ouvre le fichier en lecture
- Lit tout le contenu du fichier
? ~File~ = un chemin (fichier ou dossier). ~f.exists()~ teste l'existence, ~f.length()~ donne la taille en octets, ~f.delete()~ supprime.

## fic | Scanner et File
~new Scanner(new File("a.txt"))~ peut lancer :
= ~FileNotFoundException~ (vérifiée)
- ~IOException~ seulement à l'écriture
- Aucune exception
- ~NumberFormatException~
? Si le fichier est absent, le constructeur lance ~FileNotFoundException~ : il faut un ~try/catch~ ou ~throws~.

## fic | Lecture ligne à ligne
Quel est le schéma de lecture d'un fichier texte avec ~Scanner sc~ ?
= ~while (sc.hasNextLine()) { String l = sc.nextLine(); ... }~
- ~while (sc.nextLine() != null) { ... }~
- ~for (String l : sc) { ... }~ avec ~sc.read()~
- ~while (sc.isEmpty()) { ... }~
? ~hasNextLine()~ teste qu'il reste une ligne, ~nextLine()~ la lit. Sans test, ~nextLine()~ lance ~NoSuchElementException~ à la fin.

## fic | split
Que contient ~champs[1]~ ?
[[
String ligne = "Alice;20;15.5";
String[] champs = ligne.split(";");
]]
= ~"20"~ (une ~String~)
- ~20~ (un ~int~)
- ~"Alice"~
- ~"15.5"~
? ~"Alice;20;15.5".split(";")~ découpe à chaque ~;~ et renvoie un tableau de ~String~ :

| indice | 0 | 1 | 2 |
|---|---|---|---|
| contenu | ~"Alice"~ | ~"20"~ | ~"15.5"~ |

~champs[1]~ est ~"20"~, un **texte**. Pour faire un calcul, il faut le convertir : ~Integer.parseInt(champs[1])~.

## fic | split et champs vides
Que vaut ~"a;b;;".split(";").length~ ?
= ~2~
- ~4~
- ~3~
- ~1~
? ~split~ supprime les chaînes vides **à la fin** du tableau : le résultat est ~{"a","b"}~. Piège classique des fichiers dont les derniers champs sont vides.

## fic | Lecture de code : fichier texte
Que affiche ce programme si le fichier contient deux lignes, ~Alice;20;15.5~ et ~Bilal;21;12.0~ ?
[[
double tot = 0; int n = 0;
while (sc.hasNextLine()) {
    String[] ch = sc.nextLine().split(";");
    tot += Double.parseDouble(ch[2]);
    n++;
}
System.out.println(tot / n);
]]
= ~13.75~
- ~27.5~
- ~15.5~
- ~12.0~
? La boucle lit chaque ligne et ajoute la note (3<sup>e</sup> champ).

| ligne lue | ~ch[2]~ | ~tot~ | ~n~ |
|---|---|---|---|
| ~Alice;20;15.5~ | ~15.5~ | 15.5 | 1 |
| ~Bilal;21;12.0~ | ~12.0~ | 27.5 | 2 |

Après la boucle : ~tot / n = 27.5 / 2 = 13.75~.

## fic | Écriture de texte
Que fait ~new FileWriter("log.txt")~ si ~log.txt~ existe déjà ?
= Il l'**écrase** (le contenu précédent est perdu)
- Il ajoute à la fin
- Il lance une exception
- Il ouvre en lecture seule
? Pour **ajouter** à la fin : ~new FileWriter("log.txt", true)~ (mode append).

## fic | close
Pourquoi faut-il fermer (~close()~) un flux d'écriture ?
= Pour que les données en mémoire tampon soient réellement écrites et la ressource libérée
- Pour supprimer le fichier
- Pour vérifier qu'il existe
- Ce n'est jamais nécessaire en Java
? Sans ~close()~ (ou ~flush()~), des données peuvent rester dans le tampon et ne jamais arriver dans le fichier. Le try-with-resources ferme tout seul.

## fic | try-with-resources
Intérêt de ~try (PrintWriter out = new PrintWriter(...)) { ... }~ ?
= Le flux est fermé automatiquement à la sortie du bloc, même en cas d'exception
- Il évite d'avoir à gérer ~IOException~
- Il rend le flux plus rapide
- Il remplace ~finally~ pour tous les usages
? Il évite d'oublier le ~close()~. Mais l'ouverture peut toujours lancer une exception : il faut le ~catch~ (ou ~throws~).

## fic | Flux d'octets ou de caractères
Quelle paire est correcte ?
= ~FileInputStream~ : octets ; ~FileReader~ : caractères
- ~FileInputStream~ : caractères ; ~FileReader~ : octets
- Les deux lisent des caractères
- Les deux lisent des objets
? ~...Stream~ = octets (binaire, images, objets). ~...Reader/Writer~ = caractères (texte).

## fic | BufferedReader
~BufferedReader.readLine()~ renvoie quoi à la fin du fichier ?
= ~null~
- Une chaîne vide
- Une ~EOFException~
- ~-1~
? On lit ~while ((ligne = br.readLine()) != null)~. À ne pas confondre avec ~Scanner~ qui utilise ~hasNextLine()~.

## fic | Héritage de Serializable
~class Personne implements Serializable~ et ~class Etudiant extends Personne~. ~Etudiant~ est-elle sérialisable ?
= Oui : l'interface est héritée
- Non, il faut la réécrire
- Oui, mais seulement ses attributs ~public~
- Non, une fille ne peut pas être sérialisée
? ~Serializable~ s'hérite : toutes les filles sont sérialisables (leurs attributs devant l'être aussi).

## fic | FileNotFoundException vs IOException
Quel ordre de ~catch~ est valide ?
= ~catch (FileNotFoundException e)~ puis ~catch (IOException e)~
- ~catch (IOException e)~ puis ~catch (FileNotFoundException e)~
- Les deux ordres sont valides
- Impossible : ils ne peuvent pas être dans le même ~try~
? Du précis au général : ~FileNotFoundException~ (fille) avant ~IOException~ (mère).

## swing | Composants
Quelle classe est un conteneur de **haut niveau** (la fenêtre) ?
= ~JFrame~
- ~JButton~
- ~JPanel~
- ~JLabel~
? ~JFrame~ = fenêtre. ~JPanel~ = conteneur intermédiaire pour organiser les composants. ~JButton~, ~JLabel~, ~JTextField~ = composants.

## swing | Swing et AWT
Quelle différence entre AWT et Swing ?
= Les composants Swing (préfixe ~J~) sont « légers », écrits en Java, indépendants du système ; AWT s'appuie sur les composants du système
- Swing est l'ancien, AWT le nouveau
- AWT contient ~JButton~, Swing contient ~Button~
- Il n'y a aucune différence
? Swing est dans ~javax.swing~, ses classes commencent par ~J~. On utilise toujours ~java.awt~ pour les layouts, les couleurs, les événements (~java.awt.event~).

## swing | Fermeture
Que se passe-t-il si on oublie ~setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE)~ ?
= La fenêtre se ferme, mais le programme continue de tourner en arrière-plan
- Impossible de fermer la fenêtre
- Erreur de compilation
- Le programme plante au lancement
? Par défaut, la fermeture **cache** la fenêtre (~HIDE_ON_CLOSE~). ~EXIT_ON_CLOSE~ termine la JVM.

## swing | Affichage
On construit une ~JFrame~ avec tous ses composants, mais on oublie ~setVisible(true)~. Résultat ?
= La fenêtre n'apparaît pas
- Elle apparaît vide
- Elle apparaît mais figée
- Erreur de compilation
? Une fenêtre est invisible par défaut.

## swing | pack
~pack()~ sert à :
= Ajuster la taille de la fenêtre à la taille préférée de ses composants
- Compresser l'application
- Fermer la fenêtre
- Regrouper les ~JPanel~
? ~pack()~ calcule la taille d'après le contenu et les layouts. Alternative : ~setSize(largeur, hauteur)~.

## swing | Layout par défaut
Quel est le layout par défaut du contenu d'une ~JFrame~ ?
= ~BorderLayout~
- ~FlowLayout~
- ~GridLayout~
- Aucun
? ~JFrame~ → ~BorderLayout~. ~JPanel~ → ~FlowLayout~. À retenir absolument.

## swing | Layout par défaut
Quel est le layout par défaut d'un ~JPanel~ ?
= ~FlowLayout~
- ~BorderLayout~
- ~GridLayout~
- ~BoxLayout~
? ~FlowLayout~ aligne en ligne, et passe à la ligne suivante quand il manque de la place.

## swing | BorderLayout
Combien de zones propose ~BorderLayout~ ?
= 5 : ~NORTH~, ~SOUTH~, ~EAST~, ~WEST~, ~CENTER~
- 4
- 9
- Un nombre quelconque
? Le ~CENTER~ prend tout l'espace restant.

## swing | BorderLayout
On exécute ~add(b1, BorderLayout.CENTER); add(b2, BorderLayout.CENTER);~. Que voit-on ?
= Seul le dernier (~b2~) est visible
- Les deux côte à côte
- Les deux l'un sur l'autre, visibles
- Une exception
? Une zone de ~BorderLayout~ ne contient qu'**un** composant : le dernier ajouté remplace le précédent. Pour en mettre plusieurs, on les met dans un ~JPanel~.

## swing | BorderLayout
Dans une ~JFrame~, ~add(bouton);~ (sans zone) place le bouton :
= Au ~CENTER~
- Au ~NORTH~
- À gauche, comme un ~FlowLayout~
- Nulle part : erreur
? La zone par défaut de ~BorderLayout~ est ~CENTER~.

## swing | BorderLayout
Que fait ~add("North", textField)~ (écriture du cours) ?
= Place le composant en haut, comme ~add(textField, BorderLayout.NORTH)~
- Erreur : il faut une constante
- Place le composant au nord du ~JPanel~ voisin
- Il crée un composant nommé « North »
? ~BorderLayout.NORTH~ vaut la chaîne ~"North"~ (attention à la casse : ~"North"~, ~"South"~, ~"East"~, ~"West"~, ~"Center"~). Ancienne écriture, mais valide.

## swing | GridLayout
Dans quel ordre ~GridLayout~ remplit-il les cases ?
= Ligne par ligne, de gauche à droite, en commençant en haut
- Colonne par colonne
- Aléatoirement
- Du centre vers l'extérieur
? Toutes les cases ont la même taille.

## swing | Lecture de code : GridLayout
On ajoute **7** boutons à un ~JPanel~ de layout ~new GridLayout(2, 3)~. Combien de colonnes le panneau a-t-il ?
= 4 : le nombre de lignes (2) est prioritaire, le nombre de colonnes est recalculé
- 3
- 7
- Exception : trop de composants
? Quand le nombre de lignes est non nul, le nombre de colonnes est **ignoré** et vaut ~⌈7 / 2⌉ = 4~. (Vérifié en exécutant : chaque bouton fait 1/4 de la largeur.)

## swing | GridLayout
Pour un pavé téléphonique de 12 touches (4 lignes × 3 colonnes), on écrit :
= ~setLayout(new GridLayout(4, 3))~
- ~setLayout(new GridLayout(3, 4))~
- ~setLayout(new FlowLayout(4, 3))~
- ~setLayout(new BorderLayout(4, 3))~
? ~GridLayout(lignes, colonnes)~ : 4 lignes puis 3 colonnes. C'est ce que fait la classe ~Cadran~ du TP.

## swing | FlowLayout
Quand la fenêtre est rétrécie, ~FlowLayout~ :
= Passe à la ligne les composants qui ne tiennent plus
- Les superpose
- Les cache
- Les redimensionne tous à la même taille
? ~FlowLayout~ garde la taille préférée de chaque composant et fait un retour à la ligne.

## swing | Layout null
Avec ~setLayout(null)~ :
= On positionne soi-même chaque composant avec ~setBounds(x, y, l, h)~
- Java choisit une disposition au hasard
- Le composant n'est pas affiché
- C'est équivalent à ~FlowLayout~
? Le positionnement absolu est déconseillé : il ne s'adapte pas aux redimensionnements.

## swing | Un composant, un parent
On ajoute le même ~JButton b~ à deux ~JPanel~ différents. Résultat ?
= Le bouton n'apparaît que dans le dernier panneau
- Il apparaît dans les deux
- Exception à l'exécution
- Erreur de compilation
? Un composant ne peut avoir qu'un seul parent : l'ajouter ailleurs le retire du premier. Pour deux boutons, il faut créer deux objets.

## swing | ActionListener
Quelle interface faut-il implémenter pour réagir à un clic sur un ~JButton~ ?
= ~ActionListener~
- ~MouseListener~ uniquement
- ~ClickListener~
- ~ButtonListener~
? ~ActionListener~ a une seule méthode : ~void actionPerformed(ActionEvent e)~. Elle réagit aussi à Entrée dans un ~JTextField~ et aux ~JMenuItem~.

## swing | ActionListener
Un bouton est créé mais on n'appelle jamais ~addActionListener~. Que se passe-t-il au clic ?
= Rien
- Une exception
- Un message dans la console
- Le bouton se désactive
? Un composant ne réagit que si un listener lui est **enregistré**.

## swing | Implémenter l'interface
Une classe déclare ~implements ActionListener~ mais ne définit pas ~actionPerformed~. Résultat ?
= Erreur de compilation (la classe devrait être abstraite ou implémenter la méthode)
- Compile, rien ne se passe
- Exception à l'exécution
- La méthode est générée automatiquement
? Une classe qui implémente une interface doit définir **toutes** ses méthodes.

## swing | MouseListener
~MouseListener~ contient 5 méthodes. Comment éviter de toutes les écrire ?
= Étendre ~MouseAdapter~, qui les définit vides, et redéfinir seulement celle voulue
- Étendre ~MouseListener~
- Ce n'est pas possible
- Utiliser ~@Override~ sans rien écrire
? Les 5 : ~mouseClicked~, ~mousePressed~, ~mouseReleased~, ~mouseEntered~, ~mouseExited~. Les ~Adapter~ existent pour ~Mouse~, ~Key~, ~Window~.

## swing | KeyListener
Les 3 méthodes de ~KeyListener~ sont :
= ~keyTyped~, ~keyPressed~, ~keyReleased~
- ~keyDown~, ~keyUp~, ~keyHold~
- ~keyClicked~, ~keyEntered~, ~keyExited~
- ~keyPressed~ uniquement
? Souris : 5 méthodes (clicked, pressed, released, entered, exited). Clavier : 3.

## swing | Lambda et listener
Quel listener peut s'écrire avec une lambda ?
= ~ActionListener~ (une seule méthode abstraite)
- ~MouseListener~ (5 méthodes)
- ~KeyListener~ (3 méthodes)
- ~WindowListener~ (7 méthodes)
? Une lambda remplace une interface fonctionnelle, c'est-à-dire à **une seule** méthode abstraite. Exemple : ~b.addActionListener(e -> compteur.incrementer());~.

## swing | Lecture de code : lambda et variable locale
Que donne ce code ?
[[
int c = 0;
bouton.addActionListener(e -> c++);
]]
= Erreur de compilation : une variable locale utilisée dans une lambda doit être (effectivement) ~final~
- Compile ; ~c~ augmente à chaque clic
- Compile ; ~c~ reste à 0
- Exception à l'exécution
? Une lambda peut **lire** une variable locale de la méthode qui l'entoure, à condition qu'elle ne soit **jamais modifiée**.

**~int c = 0;~** est modifiée par ~c++~ dans la lambda → elle n'est plus « effectivement finale ». Erreur : « local variables referenced from a lambda expression must be final or effectively final ».

Pourquoi : la lambda peut s'exécuter plus tard, quand la méthode est finie et ~c~ n'existe plus.

Solutions : faire de ~c~ un **attribut** de la classe, ou un tableau ~int[] c = {0}~.

## swing | getSource
Dans ~actionPerformed(ActionEvent e)~, ~e.getSource()~ renvoie :
= L'objet (le composant) qui a déclenché l'événement
- Le texte du bouton
- Le nom de la classe
- Toujours le ~JFrame~
? On compare ensuite avec ~==~ : ~if (e.getSource() == bouton1)~. Pour récupérer le texte : ~((JButton) e.getSource()).getText()~ ou ~e.getActionCommand()~.

## swing | Plusieurs boutons
Un même listener est enregistré sur 10 boutons. Comment savoir lequel a été cliqué ?
= Avec ~e.getSource()~ (ou ~e.getActionCommand()~)
- Impossible : un listener par bouton obligatoire
- Avec ~e.getButton()~ qui renvoie le numéro
- Avec ~this~
? Un seul ~actionPerformed~ reçoit tous les événements ; la source permet de distinguer.

## swing | Lecture de code : Cadran
Dans la classe ~Cadran~ du TP (touches 1-9, 0, Bis, Reset, OK ; 8 chiffres maximum), on clique successivement sur ~1~, ~2~, ~OK~, ~Reset~, ~Bis~. Que contient la zone de texte à la fin ?
[[
if (source == buttonReset) {
    textfield.setText("");
} else if (source == buttonOk) {
    numeroValide = affiche;
} else if (source == buttonBis) {
    textfield.setText(numeroValide);
} else if (affiche.length() < 8) {
    textfield.setText(affiche + ((JButton) source).getText());
}
]]
= ~12~
- Vide
- ~1~
- ~21~
? Suis chaque clic dans ~actionPerformed~ (~affiche~ = texte courant du champ) :

| clic | branche | champ | ~numeroValide~ |
|---|---|---|---|
| ~1~ | dernier ~else if~ : ajoute ~"1"~ | ~1~ | vide |
| ~2~ | ajoute ~"2"~ | ~12~ | vide |
| ~OK~ | ~numeroValide = affiche~ | ~12~ | ~12~ |
| ~Reset~ | ~setText("")~ | vide | ~12~ |
| ~Bis~ | ~setText(numeroValide)~ | ~12~ | ~12~ |

À la fin le champ contient ~12~.

## swing | Lecture de code : Cadran
Dans le même code, le champ contient ~"12345678"~ et on clique sur ~9~. Que se passe-t-il ?
= Rien : la longueur (8) n'est pas strictement inférieure à 8
- Le champ devient ~"123456789"~
- Une exception est lancée
- Le champ est vidé
? Le champ contient déjà 8 chiffres (~"12345678"~) et on clique sur ~9~.

**1.** ~source~ n'est ni ~buttonReset~, ni ~buttonOk~, ni ~buttonBis~ : on arrive au dernier ~else if~.

**2.** Condition : ~affiche.length() < 8~ → ~8 < 8~ est **faux** (8 n'est pas strictement inférieur à 8).

**3.** Aucune branche ne s'exécute : le champ reste ~"12345678"~.

Le numéro est limité à 8 chiffres : un 9<sup>e</sup> clic est simplement ignoré.

## swing | JTextField
Pour lire et modifier le texte d'un ~JTextField~ :
= ~getText()~ et ~setText(String)~
- ~read()~ et ~write()~
- ~getValue()~ et ~setValue()~
- ~text~ et ~text = ...~
? ~getText()~ renvoie toujours une ~String~ : pour un nombre, ~Integer.parseInt(champ.getText())~ (et ~NumberFormatException~ à prévoir !). ~setEditable(false)~ rend le champ non modifiable.

## swing | Composants
Pour afficher un texte **non modifiable** par l'utilisateur :
= ~JLabel~
- ~JTextField~
- ~JButton~
- ~JTextArea~
? ~JLabel~ affiche un texte (ou une icône). ~JTextField~ = une ligne modifiable, ~JTextArea~ = plusieurs lignes.

## swing | Composants
Pour proposer plusieurs choix **exclusifs** (un seul sélectionné) :
= Des ~JRadioButton~ regroupés dans un ~ButtonGroup~
- Des ~JCheckBox~ seuls
- Des ~JLabel~
- Des ~JButton~ dans un ~GridLayout~
? Le ~ButtonGroup~ garantit l'exclusivité. ~JCheckBox~ : cases indépendantes (~isSelected()~).

## swing | JComboBox
Comment lire l'élément choisi dans un ~JComboBox~ ?
= ~getSelectedItem()~
- ~getText()~
- ~getValue()~
- ~getChoice()~
? ~getSelectedItem()~ renvoie un ~Object~ (cast ou ~toString()~), ~getSelectedIndex()~ l'indice.

## swing | JScrollPane
Pour qu'un ~JTextArea~ ait des barres de défilement :
= Le placer dans un ~JScrollPane~
- Appeler ~setScroll(true)~
- Utiliser ~JLabel~ à la place
- Le placer dans un ~JPanel~
? ~new JScrollPane(zoneTexte)~, puis on ajoute le ~JScrollPane~ à la fenêtre.

## swing | Dessin
Dans un ~JPanel~ personnalisé, quelle méthode redéfinit-on pour dessiner ?
= ~paintComponent(Graphics g)~
- ~draw(Graphics g)~
- ~paint()~ sans paramètre
- ~render()~
? On commence par ~super.paintComponent(g)~ (efface le fond), puis ~g.drawLine~, ~g.fillRect~, etc.

## swing | Dessin
Comment demander le redessin d'un composant après un changement ?
= ~repaint()~
- ~paintComponent(g)~ appelée directement
- ~update()~
- ~refresh()~
? On n'appelle jamais ~paintComponent~ soi-même : ~repaint()~ planifie l'appel par Swing.

## swing | invokeLater
À quoi sert ~SwingUtilities.invokeLater(() -> new Fenetre().affiche())~ ?
= À créer l'interface dans le thread dédié à Swing (l'EDT)
- À retarder l'affichage de 10 secondes
- À lancer l'interface dans un thread parallèle sans lien avec Swing
- À éviter d'écrire ~setVisible(true)~
? Swing n'est pas conçu pour être manipulé par plusieurs threads : on construit l'IHM dans l'**Event Dispatch Thread**.

## swing | Calcul long
Un ~actionPerformed~ lance un calcul de 10 secondes. Que voit l'utilisateur ?
= L'interface est figée pendant le calcul
- Rien de particulier, l'interface reste fluide
- Une exception
- Le calcul est annulé
? ~actionPerformed~ s'exécute dans l'EDT, qui gère aussi l'affichage. Les traitements longs se font dans un autre thread.

## swing | Menus
Dans quel ordre assemble-t-on un menu ?
= ~JMenuItem~ dans ~JMenu~, ~JMenu~ dans ~JMenuBar~, puis ~frame.setJMenuBar(barre)~
- ~JMenuBar~ dans ~JMenuItem~
- ~frame.add(menu)~ directement
- ~JMenu~ dans ~JPanel~ uniquement
? Les ~JMenuItem~ réagissent avec un ~ActionListener~.

## swing | Boîtes de dialogue
Pour afficher un message d'erreur dans une fenêtre pop-up :
= ~JOptionPane.showMessageDialog(...)~
- ~System.out.println(...)~
- ~new JMessage(...)~
- ~frame.alert(...)~
? ~JOptionPane~ propose aussi ~showInputDialog~ (saisie) et ~showConfirmDialog~ (Oui/Non).

## swing | Classe d'écoute
Quelle est l'avantage d'une **classe interne** comme listener ?
= Elle accède directement aux attributs de la classe englobante (ex. le ~JTextField~)
- Elle est plus rapide
- Elle n'a pas besoin d'implémenter l'interface
- Elle peut s'enregistrer sans ~addActionListener~
? Une classe interne (ou anonyme) voit les attributs de la classe externe. Une classe externe a besoin qu'on lui passe les références (comme ~Cadran~ qui reçoit le ~textfield~).

## swing | this comme listener
Que signifie ~bouton.addActionListener(this);~ dans ~class Cadran extends JPanel implements ActionListener~ ?
= Le ~Cadran~ lui-même écoute les clics du bouton
- Le bouton écoute le ~Cadran~
- Le ~JFrame~ écoute le bouton
- C'est une erreur : ~this~ ne peut pas être un listener
? ~this~ est de type ~Cadran~, qui est un ~ActionListener~. ~actionPerformed~ du ~Cadran~ sera appelée à chaque clic.

## swing | Modèle événementiel
Comment s'appelle le modèle utilisé par Swing pour les événements ?
= Source → événement → listener (patron Observateur)
- Interrogation régulière (polling) du clavier
- Programmation séquentielle
- Appel direct de ~main~
? La source (bouton) notifie ses listeners enregistrés en leur passant un événement. C'est le patron **Observateur**, aussi utilisé en MVC.

## swing | ItemListener
Quel listener pour réagir quand on coche une ~JCheckBox~ ?
= ~ItemListener~ (méthode ~itemStateChanged~), ou ~ActionListener~
- ~KeyListener~
- ~WindowListener~
- ~FocusListener~ uniquement
? ~JCheckBox~ déclenche un ~ActionEvent~ comme un bouton ; ~ItemListener~ donne en plus l'état de la case.

## swing | WindowListener
Quelle méthode de ~WindowListener~ est appelée quand l'utilisateur ferme la fenêtre ?
= ~windowClosing~
- ~windowEnded~
- ~windowStop~
- ~windowOff~
? On enregistre avec ~frame.addWindowListener(...)~, souvent via ~WindowAdapter~ pour ne redéfinir que ~windowClosing~.

## mvc | Rôles
Dans MVC, qui contient les **règles métier** (calculs, vérifications) ?
= Le modèle
- La vue
- Le contrôleur
- Le ~main~
? Modèle = données + règles. Vue = affichage. Contrôleur = chef d'orchestre.

## mvc | Rôles
Quelle classe ne doit **jamais** importer ~javax.swing~ ?
= Le modèle
- La vue
- Le contrôleur
- Aucune
? Si le modèle connaît Swing, on ne peut plus le tester sans fenêtre ni le réutiliser avec une autre vue. Test pratique : peut-on l'utiliser dans un ~main~ console ?

## mvc | Rôles
Quel rôle reçoit les actions de l'utilisateur (clics) ?
= Le contrôleur
- Le modèle
- La classe ~Main~
- La base de données
? Le contrôleur implémente ~ActionListener~ (et s'enregistre sur les boutons de la vue).

## mvc | Rôles
Quelle classe contient des ~JLabel~, ~JButton~ et des layouts ?
= La vue
- Le modèle
- Le contrôleur uniquement
- Les trois
? La vue s'occupe de la présentation. Elle expose en général des méthodes pour que le contrôleur s'abonne aux boutons.

## mvc | Rôles
Quelle responsabilité n'est PAS celle du contrôleur ?
= Dessiner les composants à l'écran
- Écouter les actions de l'utilisateur
- Appeler le modèle
- Transformer une exception du modèle en message pour la vue
? Dessiner/afficher = vue.

## mvc | Qui connaît qui
Quelle affirmation est conforme à MVC ?
= Le modèle ne connaît ni la vue ni le contrôleur (il connaît seulement une interface d'observateurs)
- Le modèle appelle directement ~label.setText(...)~
- La vue contient les règles métier
- Le contrôleur dessine la fenêtre
? Le modèle prévient ses observateurs via une interface ~...Listener~ sans savoir qui est à l'écoute.

## mvc | Observer
Quel patron permet au modèle de prévenir la vue qu'il a changé ?
= Observateur (Observer / listener)
- Singleton
- Fabrique (Factory)
- Décorateur
? Le modèle garde une liste d'abonnés et appelle leur méthode (ex. ~compteurModifie(this)~) à chaque changement.

## mvc | Flux
Quel est le cycle d'un clic en MVC ?
= Vue (clic) → Contrôleur → Modèle (modifié) → notification → Vue (mise à jour)
- Modèle → Vue → Contrôleur
- Contrôleur → Vue → Modèle
- Vue → Modèle → Contrôleur
? L'utilisateur agit sur la vue ; le contrôleur appelle le modèle ; le modèle change et notifie ; la vue se redessine.

## mvc | Intérêt
Quel est l'intérêt principal de MVC ?
= Séparer les responsabilités : on peut changer l'affichage sans toucher aux règles, et tester le modèle sans fenêtre
- Rendre le programme plus court
- Éviter d'utiliser des interfaces
- Rendre Swing inutile
? Maintenance, tests, réutilisation (même modèle pour console, Swing, web), travail en équipe.

## mvc | Plusieurs vues
Peut-on avoir plusieurs vues du même modèle ?
= Oui : chaque vue s'inscrit comme observateur du modèle
- Non, une seule vue par modèle
- Oui, mais seulement avec plusieurs contrôleurs
- Non, car le modèle connaît la vue
? Exemple : un graphique et un tableau qui affichent les mêmes données, tous deux mis à jour par la notification.

## mvc | Lecture de code : compteur
Dans l'exemple du cours, le compteur a ~max = 5~. On clique 6 fois sur ~+1~. Que voit-on ?
[[
public void incrementer() {
    if (valeur >= max)
        throw new IllegalStateException("Maximum " + max + " atteint");
    valeur++;
    prevenir();
}
]]
= Le compteur affiche ~5~ et la vue affiche l'erreur « Maximum 5 atteint »
- Le compteur affiche ~6~
- Le programme se termine avec une exception
- Le compteur revient à ~0~
? Compteur avec ~max = 5~ : suis la valeur.

| clic | ~valeur >= max~ ? | action | ~valeur~ |
|---|---|---|---|
| 1 à 5 | non | ~valeur++~, ~prevenir()~ | 1 à 5 |
| 6 | **oui** (5 >= 5) | ~throw IllegalStateException~ **avant** ~valeur++~ | 5 |

Le **contrôleur** attrape l'exception et demande à la vue d'afficher ~"Maximum 5 atteint"~. Le chiffre reste ~5~ car ~prevenir()~ n'a pas été appelé : rien ne l'a modifié.

## mvc | Lecture de code : compteur
Même compteur (max 5) : on clique 6 fois sur ~+1~ (erreur affichée) puis une fois sur ~RAZ~. Que voit-on ?
[[
public void remettreAZero() { valeur = 0; prevenir(); }
...
public void compteurModifie(CompteurModele m) {
    affichage.setText(String.valueOf(m.getValeur()));
    erreur.setText(" ");
}
]]
= Le compteur affiche ~0~ et le message d'erreur disparaît
- Le compteur affiche ~0~ mais l'erreur reste
- Le compteur reste à ~5~
- Une exception est lancée
? **1.** Après le 6<sup>e</sup> clic : la valeur est ~5~ et le message d'erreur est affiché.

**2.** Clic sur ~RAZ~ : le contrôleur appelle ~modele.remettreAZero()~ → ~valeur = 0~.

**3.** ~prevenir()~ est appelée : la vue exécute ~compteurModifie~.

**4.** Cette méthode met à jour le chiffre (~"0"~) **et** efface l'erreur (~erreur.setText(" ")~).

Résultat : ~0~, sans message d'erreur.

## mvc | Lecture de code : compteur
Dans le compteur MVC, que fait le contrôleur quand le modèle lance l'exception ?
[[
public void actionPerformed(ActionEvent e) {
    try {
        if (e.getSource() == vue.plus) modele.incrementer();
        else if (e.getSource() == vue.raz) modele.remettreAZero();
    } catch (IllegalStateException ex) {
        vue.afficherErreur(ex.getMessage());
    }
}
]]
= Il attrape l'exception et demande à la vue d'afficher le message
- Il laisse l'exception remonter
- Il affiche une boîte ~JOptionPane~ lui-même
- Il remet le modèle à zéro
? Le contrôleur est l'**intermédiaire** entre la vue et le modèle.

**1.** ~modele.incrementer()~ peut lancer ~IllegalStateException~ (règle métier du modèle).

**2.** Le contrôleur la met dans un ~try~ et l'attrape.

**3.** Il appelle ~vue.afficherErreur(ex.getMessage())~ : le message de l'exception devient un texte pour l'utilisateur.

Le **modèle** ne sait pas comment afficher une erreur, la **vue** ne connaît pas les règles : le **contrôleur** traduit de l'un à l'autre.

## mvc | Lecture de code : main MVC
Que fait chaque ligne ?
[[
CompteurModele m = new CompteurModele(5);
CompteurVue v = new CompteurVue();
m.ajouterAbonne(v);
new CompteurControleur(m, v);
v.setVisible(true);
]]
= La vue observe le modèle (~ajouterAbonne~) ; le contrôleur relie vue et modèle ; la fenêtre est affichée
- Le modèle observe la vue
- Le contrôleur est créé mais n'est relié à rien
- La vue écoute le contrôleur
? Chaque ligne crée un lien :

| ligne | rôle |
|---|---|
| ~new CompteurModele(5)~ | crée le modèle (max 5) |
| ~new CompteurVue()~ | crée la vue (la fenêtre) |
| ~m.ajouterAbonne(v)~ | la **vue** s'inscrit chez le modèle : elle sera prévenue à chaque changement |
| ~new CompteurControleur(m, v)~ | crée le contrôleur ; son constructeur appelle ~v.ecouter(this)~ : il s'inscrit sur les **boutons** |
| ~v.setVisible(true)~ | affiche la fenêtre |

Sens des flèches : le modèle prévient la vue ; la vue prévient le contrôleur ; le contrôleur appelle le modèle.

## mvc | Interface listener
Pourquoi le modèle déclare-t-il une interface ~CompteurListener~ ?
= Pour notifier n'importe quelle vue sans connaître sa classe concrète
- Pour que la vue hérite du modèle
- Pour remplacer le contrôleur
- Pour éviter les exceptions
? Le modèle dépend d'une **interface** (abstraction), pas de ~CompteurVue~ : couplage faible, plusieurs vues possibles.

## mvc | Le contrôleur écoute
Dans ~CompteurControleur~, que fait ~v.ecouter(this)~ ?
= Enregistre le contrôleur comme ~ActionListener~ des boutons de la vue
- Enregistre la vue comme observateur du modèle
- Affiche la fenêtre
- Crée un nouveau modèle
? Dans ~CompteurVue~ : ~ecouter(ActionListener l) { plus.addActionListener(l); raz.addActionListener(l); }~.

## mvc | Où mettre le code
Où placer la règle « le solde ne peut pas devenir négatif » ?
= Dans le modèle
- Dans la vue
- Dans le ~main~
- Dans le ~JButton~
? Une règle du métier appartient au modèle, pour qu'elle s'applique quelle que soit l'interface.

## mvc | Où mettre le code
Où convertit-on le texte d'un ~JTextField~ en ~int~ pour appeler le modèle ?
= Dans le contrôleur
- Dans le modèle
- Dans la classe ~Main~
- Dans l'interface ~Listener~
? Le contrôleur lit la saisie (vue), la convertit, appelle le modèle ; il attrape aussi le ~NumberFormatException~ pour signaler une saisie invalide.

## mvc | Packages
Comment organise-t-on classiquement un projet MVC ?
= Un package par couche : ~modele~, ~vue~, ~controleur~, plus un ~Main~
- Un seul package contenant tout
- Un package par classe
- Un package ~swing~ et un package ~java~
? Le TP7 attend cette organisation (visible dans l'arborescence).

## mvc | Test du modèle
Comment vérifier que le modèle est bien séparé de la vue ?
= En l'utilisant dans un ~main~ console, sans créer de fenêtre
- En changeant la couleur des boutons
- En le déplaçant dans la vue
- En lui ajoutant ~extends JFrame~
? Si ~new CompteurModele(5).incrementer()~ fonctionne sans Swing, la séparation est réussie.

## mvc | Swing et MVC
Swing applique lui-même l'idée de MVC dans certains composants, par exemple :
= ~JTable~ (avec un ~TableModel~) ou ~JList~ (avec un ~ListModel~)
- ~JLabel~
- ~JFrame~ seulement
- ~Scanner~
? Un ~JTable~ affiche (vue) des données fournies par un ~TableModel~ (modèle).

## mvc | Origine
MVC est :
= Un patron d'architecture (pattern) qui organise une application en trois couches
- Une classe de la bibliothèque Swing
- Une interface Java
- Un type d'exception
? Né avec Smalltalk dans les années 1970. On le retrouve dans Swing, Spring MVC, Android, etc.

## mvc | Anti-pattern
Quel code viole MVC ?
= Une méthode du modèle qui appelle ~monLabel.setText(...)~
- Un contrôleur qui appelle ~modele.incrementer()~
- Une vue qui lit ~modele.getValeur()~
- Un modèle qui prévient ses observateurs
? Le modèle ne doit pas manipuler directement des composants graphiques : il notifie et la vue se met à jour elle-même.

## mvc | Qui crée qui
Qui crée en général le modèle, la vue et le contrôleur, et les relie ?
= La classe ~Main~ (point d'entrée)
- Le modèle
- La vue
- Le ~JButton~
? ~Main~ : instancie M et V, inscrit V comme observateur de M, crée C avec M et V, puis affiche la fenêtre (dans ~invokeLater~).

## mvc | Qui connaît qui
Dans l'exemple du cours, quelle classe connaît **à la fois** le modèle et la vue ?
= Le contrôleur
- Le modèle
- Seulement la vue
- Aucune
? Le contrôleur a ~modele~ et ~vue~ en attributs. Le modèle ne connaît que l'interface des abonnés.
`;
