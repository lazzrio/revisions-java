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
? **1.** ~m()~ lance ~new IOException("io")~ dans son ~try~.

**2.** Le ~catch (IOException e)~ l'attrape et lance **une nouvelle exception** : ~new Exception("wrap", e)~. Le 2<sup>e</sup> paramètre ~e~ est la **cause** (l'exception d'origine).

**3.** Dans ~main~, ~e.getMessage()~ est le message de la nouvelle exception : ~wrap~.

**4.** ~e.getCause().getMessage()~ est le message de l'ancienne : ~io~.

Affichage ~wrap io~.

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
? **1.** ~throw new RuntimeException("A")~ dans le ~try~ interne : une exception ~A~ est en cours.

**2.** Avant qu'elle ne sorte, le ~finally~ s'exécute.

**3.** Le ~finally~ lance lui-même ~RuntimeException("B")~. Une seule exception peut remonter : **la plus récente remplace l'ancienne**.

**4.** Le ~catch~ externe reçoit ~B~ (~A~ est perdue).

Affichage ~B~.

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
? Suis ~n~ tour par tour. À chaque tour, le ~finally~ ajoute 10 **quoi qu'il arrive** (même sur ~break~).

| ~i~ | dans le ~try~ | ~n~ après le ~try~ | ~n~ après le ~finally~ (+10) |
|---|---|---|---|
| 0 | ~n += 0~ | 0 | 10 |
| 1 | ~n += 1~ | 11 | 21 |
| 2 | ~n += 2~ | 23 | 33 |
| 3 | ~break~ (pas d'ajout) | 33 | **43** |

Au tour ~i = 3~, ~break~ sort de la boucle, mais le ~finally~ passe **avant** la sortie : c'est le dernier +10. ~n~ vaut ~43~.

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
? Il y a deux « phases » : la descente (les appels) puis la remontée (les retours), pendant laquelle les ~finally~ s'exécutent.

**Descente.** ~f(3)~ → ~f(2)~ → ~f(1)~ → ~f(0)~. Chaque appel (sauf le dernier) est dans un ~try~, en attente du retour de l'appel suivant.

**Le fond.** ~f(0)~ lance ~ArithmeticException~ : elle n'a pas de ~try~, elle remonte.

**Remontée.** L'exception traverse les appels en sens inverse. Chaque appel a un ~finally~ qui s'exécute **avant** de laisser passer l'exception :

| appel | ~finally~ affiche |
|---|---|
| ~f(1)~ | ~1~ |
| ~f(2)~ | ~2~ |
| ~f(3)~ | ~3~ |

**Arrivée.** Le ~catch~ de ~main~ affiche ~ fond~.

Résultat ~123 fond~ : on remonte de 1 vers 3, car le plus profond termine en premier.

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
? Pour chaque élément du tableau :

| ~o~ | ~(String) o~ | ~s.length()~ | affichage |
|---|---|---|---|
| ~1~ (un ~Integer~) | **échec** | | ~CCE~ |
| ~"a"~ | OK | ~1~ | ~1~ |
| ~null~ | OK (on peut caster ~null~ vers tout) | **~NullPointerException~** | ~NPE~ |

Affichage dans l'ordre : ~CCE~, ~1~, ~NPE~. Les deux ~catch~ correspondent à deux erreurs de nature différente.

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
? Règle : une ressource d'un try-with-resources est **toujours fermée avant** les ~catch~ et ~finally~ du même ~try~.

**1.** ~new R("X")~ s'exécute : affiche ~open X~.

**2.** Le corps du ~try~ : affiche ~body~, puis ~throw~ lance l'exception.

**3.** Avant de chercher un ~catch~, Java ferme la ressource : ~close X~.

**4.** Le ~catch (RuntimeException e)~ attrape et affiche ~catch err~.

**5.** Le ~finally~ affiche ~finally~.

Ordre : ~open X~, ~body~, ~close X~, ~catch err~, ~finally~.

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
? ~Integer.parseInt~ est **strict** : le texte doit contenir uniquement des chiffres (avec éventuellement un signe).

**~" 12"~** commence par un espace : le caractère ~' '~ n'est pas un chiffre → ~NumberFormatException~.

Le ~System.out.println("ok")~ est donc sauté, le ~catch~ affiche ~erreur~.

Astuce : ~Integer.parseInt(saisie.trim())~ enlève les espaces avant et après.

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
? Hiérarchie : ~NumberFormatException~ **hérite de** ~IllegalArgumentException~.

**1.** Le 1<sup>er</sup> ~catch (IllegalArgumentException)~ attrape déjà tout ce qui hérite d'~IllegalArgumentException~, donc aussi ~NumberFormatException~.

**2.** Le 2<sup>e</sup> ~catch (NumberFormatException)~ ne pourrait **jamais** s'exécuter.

**3.** Le compilateur le refuse : « exception NumberFormatException has already been caught ».

Il faut mettre la **fille** (plus précise) **avant** la mère.

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
? ~Exception~ est une exception **vérifiée** : le compilateur impose de la traiter ou de la déclarer.

**~throw new Exception("x");~** dans ~main~ : ni ~try/catch~, ni ~throws Exception~ → erreur de compilation.

Deux corrections :

- ~public static void main(String[] args) throws Exception~
- entourer le ~throw~ d'un ~try { ... } catch (Exception e) { ... }~

(Avec ~RuntimeException~, il n'y aurait aucune erreur de compilation.)

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
? Le ~try~ lance une ~Exception~ ; le ~catch~ attend une ~RuntimeException~.

**Relation :** ~RuntimeException~ est une **fille** d'~Exception~. Un ~catch~ pour la fille n'attrape pas les objets de la mère.

L'~Exception~ lancée n'est donc pas attrapée. Comme elle est vérifiée et que ~a()~ ne la déclare pas → erreur « unreported exception Exception ».

Correction : ~catch (Exception e)~, ou ~void a() throws Exception~.

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
? **1.** ~println("A")~ s'exécute : ~A~ sort sur la **sortie standard**.

**2.** ~new int[1]~ n'a que l'indice 0. ~t[1] = 0~ lance ~ArrayIndexOutOfBoundsException~, non attrapée.

**3.** Le programme s'arrête **immédiatement**. La trace d'erreur sort sur la **sortie d'erreur**, pas la sortie standard.

**4.** ~println("B")~ n'est jamais atteint.

Sortie standard : ~A~ seulement.

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
? Retour d'un **objet** : on renvoie la **référence** (la flèche), pas une copie de l'objet.

**1.** ~sb~ pointe vers un ~StringBuilder~ qui contient ~"a"~.

**2.** ~return sb;~ prépare la référence.

**3.** Le ~finally~ exécute ~sb.append("b")~ : l'objet **pointé** devient ~"ab"~.

**4.** L'appelant reçoit la référence vers l'objet maintenant modifié : ~ab~.

Contraste avec un ~int~ (copié avant le ~finally~) : pour un objet, le ~finally~ peut changer ce que voit l'appelant.

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
? **1.** ~x = 5~.

**2.** ~x - 5~ vaut 0, donc ~10 / 0~ : division entière par 0 → ~ArithmeticException~. L'affectation ~x = ...~ n'a pas lieu.

**3.** Le ~catch~ exécute ~x = -1~.

**4.** ~println(x)~ affiche ~-1~.

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
? Le ~try~ ne contient qu'un ~throw~ d'~IllegalStateException~ (non vérifiée).

**~catch (IOException e)~** : le compilateur vérifie que le ~try~ **peut** lancer une ~IOException~ (car elle est vérifiée). Ce n'est pas le cas → erreur « exception IOException is never thrown in body of corresponding try statement ».

Le ~catch (Exception e)~ qui suit n'y change rien : l'erreur est sur le premier ~catch~, qui doit être supprimé.

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
? Pour reconstruire un objet, Java traite deux parties différentes :

| partie | traitement à la lecture |
|---|---|
| ~Fils~ (sérialisable) | attributs **restaurés** depuis les octets : ~f = 3~ |
| ~Base~ (non sérialisable) | pas d'octets pour elle : Java appelle son **constructeur sans paramètre** |

**Base()** : l'attribut vaut d'abord ~5~ (initialisation), puis ~b = 7~ dans le constructeur. La valeur ~100~ de ~x.b~ n'a pas été sauvegardée.

Affichage ~7 3~.

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
? Un flux d'objets est une **file** : on relit dans l'ordre exact de l'écriture.

| ordre d'écriture | contenu |
|---|---|
| 1<sup>er</sup> ~writeObject~ | ~"a"~ (une ~String~) |
| 2<sup>e</sup> ~writeObject~ | ~42~ (un ~Integer~) |

Le 1<sup>er</sup> ~readObject()~ renvoie donc ~"a"~. Le cast ~(Integer)~ d'une ~String~ → ~ClassCastException~.

Il fallait caster en ~String~ pour le premier, puis en ~Integer~ pour le second.

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
? **Avant la sauvegarde :** deux ~new Etu~ → le constructeur est exécuté deux fois → ~nb = 2~.

**À la lecture :** les objets sont reconstruits depuis les octets, **sans appeler le constructeur**. ~nb~ n'est donc pas augmenté. De toute façon, ~nb~ est ~static~ : il n'a jamais été sauvegardé avec les objets.

**Résultat :** ~Etu.nb~ vaut ~2~, et la liste relue contient ~2~ éléments (~lr.size()~).

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
? Un flux de sérialisation retient les objets déjà écrits pour ne pas les répéter.

**1.** ~writeObject(p)~ : ~p~ (~nom = "a"~) est écrit en entier.

**2.** ~p.nom = "b"~ modifie l'objet en mémoire.

**3.** ~writeObject(p)~ : Java reconnaît **le même objet** et n'écrit qu'un petit « renvoi vers l'objet n°1 ». La modification n'est pas enregistrée.

**4.** À la lecture, les deux ~readObject~ renvoient l'objet n°1, avec ~nom = "a"~.

Affichage ~a a~. Remède : ~oos.reset()~ entre les deux écritures.

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
? ~"Bob;;12".split(";")~ coupe aux deux ~;~. Entre eux, il n'y a **rien** : ça donne une chaîne vide.

| indice | 0 | 1 | 2 |
|---|---|---|---|
| contenu | ~"Bob"~ | ~""~ | ~"12"~ |

**1.** ~ch.length~ vaut 3 → affiche ~3~.

**2.** ~Integer.parseInt(ch[1])~ : on convertit ~""~ → ~NumberFormatException~ (aucun chiffre).

Les champs vides **au milieu** sont conservés ; seuls ceux **à la fin** sont supprimés.

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
? Le texte contient : ~12~, un saut de ligne, ~abc~, un saut de ligne.

| appel | ce qui est lu | reste à lire |
|---|---|---|
| ~nextInt()~ | ~12~ | ~\nabc\n~ (le saut de ligne n'est **pas** consommé) |
| ~nextLine()~ #1 | la fin de la 1<sup>re</sup> ligne : **chaîne vide** | ~abc\n~ |
| ~nextLine()~ #2 | ~abc~ | |

Affichage ~12[][abc]~. Piège classique : après un ~nextInt()~, appeler un ~nextLine()~ « à vide » pour avaler le saut de ligne.

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
? ~readLine()~ lit une ligne à la fois, et renvoie ~null~ **seulement** à la fin du fichier. Une ligne vide est une ligne comme une autre.

| appel | valeur | compte |
|---|---|---|
| 1 | ~"a"~ | 1 |
| 2 | ~""~ (ligne vide, mais ce n'est pas ~null~) | 2 |
| 3 | ~"b"~ | 3 |
| 4 | ~null~ : fin → la boucle s'arrête | |

~c~ vaut ~3~.

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
? Le 2<sup>e</sup> argument de ~FileWriter~ décide si on **ajoute** (~true~) ou si on **écrase** (absent ou ~false~).

| étape | ouverture | contenu du fichier |
|---|---|---|
| 1 | ~new FileWriter(f)~ : écrase, écrit ~A~ | ~A~ |
| 2 | ~new FileWriter(f, true)~ : **ajoute** ~B~ à la fin | ~AB~ |
| 3 | ~new FileWriter(f)~ : **écrase** tout, écrit ~C~ | ~C~ |

L'ouverture sans ~true~ efface le contenu précédent dès l'ouverture.

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
? Sérialiser puis désérialiser fabrique une **copie** indépendante.

**1.** ~l = [a, b]~ ; ~serialiser(l)~ convertit la liste en octets : le contenu **à cet instant** est figé.

**2.** ~l.add("c")~ modifie la liste d'origine : ~l~ a 3 éléments. Les octets déjà fabriqués ne changent pas.

**3.** ~deserialiser(octets)~ reconstruit une **nouvelle** liste ~[a, b]~ : ~r.size() = 2~.

Affichage ~2 3~.

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
? Examine ce que peut lancer chaque appel :

**~new FileOutputStream("f")~** : ouvre le fichier → peut lancer ~FileNotFoundException~ (vérifiée).

**~new ObjectOutputStream(...)~** : écrit un en-tête → peut lancer ~IOException~ (vérifiée).

Ni ~try/catch~ ni ~throws~ dans ~c()~ → le compilateur affiche **deux** erreurs « unreported exception ».

Correction : ~static void c() throws IOException { ... }~ (~FileNotFoundException~ est une ~IOException~).

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
? **1.** ~Menu~ implémente ~Serializable~ : OK.

**2.** Elle contient ~Scanner sc~. Pour sérialiser ~Menu~, Java doit sérialiser ~sc~ aussi.

**3.** ~Scanner~ n'implémente pas ~Serializable~ → ~NotSerializableException: java.util.Scanner~ à l'exécution.

Normal : un ~Scanner~ lit le clavier, il n'a pas de sens une fois sauvegardé. On le marque ~transient~ ou on le crée localement.

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
? **1.** À l'écriture, ~hist~ (~transient~) est ignoré ; ~nom~ est sauvé.

**2.** À la lecture, **aucun constructeur n'est appelé** : l'initialisation ~new ArrayList<>()~ (qui fait partie de la construction) n'est **pas** rejouée.

**3.** ~hist~ garde donc sa valeur par défaut : ~null~. ~nom~ est restauré : ~"n"~.

Affichage ~null n~. Un ~h.hist.add(...)~ juste après la lecture lancerait une ~NullPointerException~.

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
? **~c[0]++~** est exécuté à chaque clic, car la lambda est enregistrée comme listener.

**1.** ~int[] c = {0}~ : ~c[0]~ vaut 0.

**2.** 1<sup>er</sup> clic : ~c[0] = 1~. 2<sup>e</sup> : 2. 3<sup>e</sup> : 3.

Pourquoi ça compile alors que ~int c; c++~ ne compilerait pas : la **variable** ~c~ (la référence du tableau) n'est jamais réaffectée ; on modifie seulement le **contenu** du tableau.

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
? Le listener lit ~getText()~ (un texte), le convertit, multiplie par 2, et remet le résultat dans le champ.

| clic | texte lu | calcul | nouveau texte |
|---|---|---|---|
| 1 | ~"5"~ | 5 × 2 | ~"10"~ |
| 2 | ~"10"~ | 10 × 2 | ~"20"~ |

Le champ contient ~20~. Remarque : ~getText()~ renvoie toujours une ~String~, d'où le ~Integer.parseInt~.

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
? ~GridLayout(0, 3)~ : le nombre de colonnes est **fixé à 3**, le nombre de lignes **s'adapte**.

**1.** 7 composants, 3 par ligne → ⌈7 / 3⌉ = **3 lignes**.

**2.** Remplissage ligne par ligne :

| | colonne 1 | colonne 2 | colonne 3 |
|---|---|---|---|
| ligne 1 | b0 | b1 | b2 |
| ligne 2 | b3 | b4 | b5 |
| ligne 3 | **b6** | | |

~b6~ est en 1<sup>re</sup> colonne de la 3<sup>e</sup> ligne.

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
? Un même listener peut servir à plusieurs boutons : ~e.getSource()~ dit **lequel** a été cliqué.

**1.** Clic sur ~b2~ : ~e.getSource() == b1~ ? non. ~e.getSource() == b2~ ? oui → ~"b2"~.

**2.** Clic sur ~b1~ : ~e.getSource() == b1~ ? oui → ~"b1"~.

Affichage ~b2~ puis ~b1~ (l'ordre des clics).

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
? Le **texte de la commande** d'un bouton est, par défaut, son libellé.

**1.** ~new JButton("Go")~ : commande par défaut ~"Go"~. 1<sup>er</sup> clic → ~Go~.

**2.** ~b.setActionCommand("x")~ remplace la commande.

**3.** 2<sup>e</sup> clic → ~x~. Le libellé affiché du bouton ne change pas ; seule la commande interne change.

Utile pour distinguer plusieurs boutons de même texte.

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
? Un ~ButtonGroup~ garantit qu'**un seul** bouton du groupe est sélectionné.

**1.** ~g.add(r1); g.add(r2);~ : les deux boutons sont dans le même groupe.

**2.** ~r1.setSelected(true)~ : ~r1~ est sélectionné.

**3.** ~r2.doClick()~ sélectionne ~r2~ ; le groupe **désélectionne automatiquement** ~r1~.

Résultat : ~r1.isSelected()~ = ~false~, ~r2.isSelected()~ = ~true~. Sans le groupe, les deux seraient cochés.

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
? Une liste déroulante sélectionne par défaut **le premier élément**.

**1.** ~new JComboBox<>({"A", "B"})~ : élément sélectionné ~"A"~, indice 0.

**2.** Première ligne : ~getSelectedItem()~ = ~"A"~ et ~getSelectedIndex()~ = ~0~ → ~A0~.

**3.** ~setSelectedIndex(1)~ choisit ~"B"~.

**4.** ~getSelectedItem()~ = ~B~.

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
? Un ~ActionListener~ sur un ~JTextField~ réagit à **l'action de l'utilisateur** (touche Entrée), pas aux modifications faites par le programme.

**1.** ~t.setText("abc")~ : change le texte, mais **ne déclenche pas** le listener → ~c[0]~ reste ~0~ (affiche ~0~).

**2.** ~t.postActionEvent()~ simule la touche Entrée → le listener s'exécute → ~c[0] = 1~ (affiche ~1~).

Les deux affichages se suivent : ~01~.

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
? L'interface ~ActionListener~ **impose** une méthode : ~actionPerformed(ActionEvent e)~.

La classe anonyme définit ~actionPerform(...)~ (sans ~ed~) : c'est une **autre** méthode, que l'interface n'utilise pas.

Résultat : la classe anonyme n'implémente pas ~actionPerformed~ → erreur « is not abstract and does not override abstract method actionPerformed(ActionEvent) ».

Avec ~@Override~ devant la méthode, l'erreur serait signalée plus clairement.

## swing | Code : lambda sans paramètre
Que se passe-t-il à la compilation ?
[[
b.addActionListener(() -> System.out.println("x"));
]]
= Erreur : la lambda doit avoir un paramètre (~e -> ...~), car ~actionPerformed~ prend un ~ActionEvent~
- Aucune erreur
- Erreur : les lambdas sont interdites avec ~addActionListener~
- Aucune erreur, mais ~x~ n'est jamais affiché
? Une lambda remplace **la seule méthode abstraite** de l'interface : elle doit avoir la **même liste de paramètres**.

**~actionPerformed(ActionEvent e)~** : un paramètre.

**~() -> ...~** : zéro paramètre → incompatible → erreur « incompatible parameter types in lambda expression ».

Écritures correctes : ~e -> System.out.println("x")~ ou ~(e) -> ...~ (le nom ~e~ n'a pas besoin d'être utilisé).

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
? **~implements MouseListener~** est un engagement : la classe doit fournir **les 5 méthodes** de l'interface :

~mouseClicked~, ~mousePressed~, ~mouseReleased~, ~mouseEntered~, ~mouseExited~.

Ici, seule ~mouseClicked~ est écrite → erreur « is not abstract and does not override abstract method mouseExited(MouseEvent) ».

Trois solutions : écrire les 5 méthodes, déclarer la classe ~abstract~, ou **étendre ~MouseAdapter~** (qui les définit toutes vides) et redéfinir seulement celle qui nous intéresse.

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
? Où se trouvent les classes ?

| classe | package |
|---|---|
| ~JFrame~, ~JButton~ | ~javax.swing~ |
| ~BorderLayout~, ~FlowLayout~, ~Color~ | ~java.awt~ |
| ~ActionEvent~, ~ActionListener~ | ~java.awt.event~ |

Le fichier n'importe que ~javax.swing.*~ : ~JFrame~ et ~JButton~ sont connus, mais ~BorderLayout~ non → « cannot find symbol: variable BorderLayout ».

Correction : ajouter ~import java.awt.*;~.

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
? **1.** ~JLabel l = null;~ : ~l~ est une variable qui ne désigne aucun objet.

**2.** ~p.add(l)~ : on demande au panneau d'ajouter un composant qui n'existe pas.

**3.** ~add~ accède à ce composant → ~NullPointerException~.

Il manquait ~new JLabel("texte")~. Oubli très fréquent : déclarer le composant sans le créer.

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
? Les zones de ~BorderLayout~ sont des **textes** : ~"North"~, ~"South"~, ~"East"~, ~"West"~, ~"Center"~. La casse compte.

**1.** ~p.add(b1, "North")~ : zone valide.

**2.** ~p.add(b2, "north")~ (minuscule) : zone inconnue → ~IllegalArgumentException: cannot add to layout: unknown constraint: north~.

Comme la zone est une simple ~String~, le compilateur ne voit pas la faute : l'erreur apparaît à l'exécution. Avec ~BorderLayout.NORTH~, la faute serait détectée à la compilation.

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
? Ce qui compte : **la notification est envoyée uniquement quand le changement a réussi**.

| appel | que se passe-t-il | ~v~ | notifications |
|---|---|---|---|
| ~inc()~ n°1 | 0 < 3, ~v++~, ~pre()~ | 1 | 1 |
| ~inc()~ n°2 | idem | 2 | 2 |
| ~inc()~ n°3 | idem | 3 | 3 |
| ~inc()~ n°4 | ~v >= max~ : **exception avant ~v++~ et ~pre()~** (affiche ~E~) | 3 | 3 |
| ~raz()~ | ~v = 0~, ~pre()~ | 0 | 4 |
| ~inc()~ | ~v++~, ~pre()~ | 1 | 5 |

Affichage : ~E~, puis la valeur finale ~1~ et ~5~ notifications : ~E 1 5~.

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
? Le modèle garde la liste de **tous** ses abonnés et les prévient un par un.

**1.** ~m.inc()~ : ~v = 1~, puis ~pre()~.

**2.** ~pre()~ parcourt la liste dans l'ordre d'inscription : d'abord V1 → écrit ~V1:1~, puis V2 → écrit ~V2:1~.

Les deux vues voient la **nouvelle** valeur (1) car la notification est envoyée après le changement.

Journal : ~V1:1 V2:1~.

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
? Le modèle prévient la vue **avant** de changer ~v~ : la vue lit donc l'**ancienne** valeur.

**Appel 1.** ~v = 0~. ~pre()~ : la vue lit ~mm.v~ = 0 → ~aff = "0"~. Puis ~v++~ → ~v = 1~.

**Appel 2.** ~v = 1~. ~pre()~ : la vue lit 1 → ~aff = "1"~. Puis ~v = 2~.

À chaque appel, l'affichage a **un coup de retard** sur le modèle. Correction : mettre ~pre()~ **après** ~v++~.

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
? La vue est mise à jour **uniquement** si elle est inscrite chez le modèle.

**1.** ~m.inc()~ : ~v = 1~, puis ~pre()~ qui parcourt la liste des abonnés.

**2.** Personne n'a appelé ~ajouterAbonne~ : la liste est **vide**, ~pre()~ ne fait rien.

**3.** ~aff[0]~ n'est pas modifié : ~"0"~. Le modèle, lui, a bien changé : ~m.v = 1~.

Affichage ~0 1~. Symptôme classique : « le modèle est bon mais la fenêtre ne se met pas à jour ».

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
? Le solde initial est ~100~. Suis chaque retrait :

| montant | ~m > solde~ ? | résultat | ~solde~ |
|---|---|---|---|
| ~70~ | 70 > 100 : non | ~solde -= 70~ → affiche ~ok~ | 30 |
| ~50~ | 50 > 30 : **oui** | exception **avant** ~solde -= m~ → affiche ~KO~ | 30 (inchangé) |
| ~30~ | 30 > 30 : non | ~solde -= 30~ → affiche ~ok~ | 0 |

Affichage ~ok KO ok 0~. L'exception protège le modèle : un retrait refusé ne modifie rien.

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
? Le contrôleur fait deux choses : **convertir** la saisie, puis **appeler** le modèle.

**1.** ~Integer.parseInt("abc")~ lance ~NumberFormatException~ **avant** d'atteindre ~modele.retirer~.

**2.** Le 1<sup>er</sup> ~catch~ (~NumberFormatException~) correspond → ~vue.afficherErreur("Nombre invalide")~.

**3.** Le modèle n'a même pas été appelé.

Le 2<sup>e</sup> ~catch~ (~IllegalArgumentException~) sert aux erreurs du modèle, comme « solde insuffisant ».

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
? Un multi-catch ~catch (A | B e)~ traite chaque type séparément. Pour chaque type **vérifié**, le compilateur vérifie que le ~try~ peut le lancer.

**~IOException~** est vérifiée et le ~try~ ne contient qu'un ~throw~ d'~IllegalStateException~ : aucune ~IOException~ n'est possible → erreur « exception IOException is never thrown in body of corresponding try statement ».

**~RuntimeException~** (non vérifiée) n'aurait posé aucun problème. Correction : retirer ~IOException~ du multi-catch.
`;
