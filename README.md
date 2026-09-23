# ☕ POO Java — Ing2 (ECE, S3 automne 2026)

Site de révision de **Programmation orientée objet en Java** (cours de J.-P. Segado, TD/TP C. Christou),
statique et sans dépendance : il fonctionne tel quel sur GitHub Pages, sur ordinateur, tablette et téléphone.

🔗 En ligne : <https://lazzrio.github.io/revisions-java/>

> 📅 Évaluation écrite semaine 5 (28/09) · Test 5 semaine 7 (12/10) · **évaluation finale samedi 7 novembre, 11 h – 12 h 30**

## Contenu

| Section | Description |
|---|---|
| **S1 → S7** | Une page par semaine : notions clés, vocabulaire, code annoté, **réponses détaillées aux exercices du PDF**, pièges, checklist |
| **✅ Corrigés** (`corriges.html`) | Index des 50 exercices des PDF de cours (+ 4 d'entraînement MVC), **TP 1 à 7** (corrigé type FastBite) et **annales** 2013 → 2025 (QCM 2025, DS 2023, 2020, 2016, 2015, 2014, 2013), avec méthode, code compilé et erreurs des corrigés officiels signalées |
| **Méthodes** | Table de décision, 6 exos types déroulés, débogage, kit Java « à côté », rédaction sur papier |
| **QCM** | 116 questions (S1 à S7 + méthodes), filtre par semaine, mélange, **mode test** 20 questions / 15 min |
| **Exo Livre** | Écrire une classe complète : énoncé, squelette, corrigé commenté |

Fonctionnalités : thème clair/sombre, adresses partageables (`index.html#s5-ex3`), suivi « fait » par exercice
(mémorisé dans le navigateur), recherche dans les corrigés, impression propre, **installable sur téléphone et
utilisable hors ligne** après une première visite (service worker).

## Structure

```
revisions-java-site/
├── index.html            # cours S1→S7, méthodes, QCM, exo Livre (une seule page, vues #s1…#s7)
├── corriges.html         # TP et annales corrigés + index des exercices de cours
├── css/style.css
├── js/app.js             # navigation, thème, jalons, moteur de QCM
├── js/qcm-data.js        # banque de questions
├── js/corriges.js        # « fait », recherche, filtres
├── code/                 # sources Java des corrigés (compilées avec javac 21)
├── assets/               # favicon + icônes
├── manifest.webmanifest, sw.js, 404.html, .nojekyll
```

## Tester en local

```bash
python -m http.server 8000
```

puis ouvrir <http://localhost:8000/>.

## Publier

Le dépôt est relié à `origin` (GitHub). Après modification :

```bash
git add -A && git commit -m "Mise à jour" && git push
```

GitHub Pages (branche `main`, dossier racine) republie le site en une à deux minutes.
