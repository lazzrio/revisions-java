# Code des corrigés

Tous ces fichiers ont été compilés avec **javac 21** et exécutés (sauf les fenêtres Swing, compilées et testées
sans affichage par des clics simulés).

| Dossier | Contenu |
|---|---|
| `tp1/` | TP1 Etudiant2026 — reproduit exactement la capture d'écran du sujet |
| `fastbite/` | Corrigé type des TP 4 à 7 (thème FastBite) : `modele`, `persistance` (texte + sérialisation), `swing` (TP6), `mvc` (TP7), `app` (démos TP4/TP5) |
| `annales/` | DS 2013, 2014, 2015, 2016, 2020, 2023 et vérifications du QCM 2025 |
| `livre/` | Exercice Livre : `sujet/` (squelette) et `corrige/` |
| `s4ex4/`, `s4ex7/` | Semaine 4 : interface Animal, HashMap d'étudiants |
| `s5ex4/` | Semaine 5 : écriture puis lecture d'un fichier texte |
| `s6ex7/` | Semaine 6 : écouteur du cadran de téléphone (+ test avec `doClick()`) |

Compiler un dossier : `javac -encoding UTF-8 -d out $(find . -name "*.java")` puis `java -cp out NomDeLaClasse`
(pour FastBite : `java -cp out fastbite.app.DemoTP5`, `java -cp out fastbite.mvc.AppMVC`).
