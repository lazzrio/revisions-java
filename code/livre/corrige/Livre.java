import java.util.Scanner;

// ============================================================
// CLASSE : plan/moule décrivant un type d'objet (ici, un livre).
// Une classe regroupe des ATTRIBUTS (les données) et des
// MÉTHODES (les comportements).
// ============================================================
class Livre {

    // ============ ATTRIBUTS (champs / propriétés) ============
    // Ce sont les VARIABLES appartenant à chaque objet Livre.
    // "private" = accessibles UNIQUEMENT depuis l'intérieur de
    // cette classe. C'est le principe d'ENCAPSULATION : on
    // protège les données, on force l'accès via des méthodes.

    private String titre;      // ATTRIBUT de type String (chaîne)
    private String auteur;     // ATTRIBUT de type String
    private int annee;         // ATTRIBUT de type int (entier)
    private double[] notes;    // ATTRIBUT de type tableau de double
    private int nbNotes;       // ATTRIBUT compteur (nombre effectif de notes)

    // Scanner partagé pour lire l'entrée clavier (System.in)
    Scanner clavier = new Scanner(System.in);


    // ============ CONSTRUCTEURS ============
    // Un CONSTRUCTEUR est une méthode SPÉCIALE :
    //   - il porte EXACTEMENT le même nom que la classe (Livre)
    //   - il n'a PAS de type de retour, pas même void
    //   - il est appelé automatiquement par l'opérateur "new"
    // Son rôle : initialiser les attributs d'un nouvel objet.

    // -- Constructeur SANS PARAMÈTRE (dit "par défaut") --
    // Utilisé par : new Livre();
    public Livre() {
        this.titre = "Inconnu";
        this.auteur = "Anonyme";
        this.annee = 2000;
        this.nbNotes = 0;
    }

    // -- Constructeur AVEC PARAMÈTRES (dit "surchargé") --
    // Java autorise plusieurs constructeurs SI leurs listes de
    // paramètres diffèrent (nombre ou types) : c'est la SURCHARGE.
    // Utilisé par : new Livre("1984", "Orwell", 1949);
    public Livre(String titre, String auteur, int annee) {
        // "this.titre" désigne l'ATTRIBUT de l'objet.
        // "titre" tout court désigne le PARAMÈTRE de la méthode.
        // "this" est indispensable ici pour lever l'ambiguïté.
        this.titre = titre;
        this.auteur = auteur;
        this.annee = annee;
        this.nbNotes = 0;
    }


    // ============ MÉTHODES ============
    // Signature générale :
    //   [visibilité] [type_retour] nomMethode(paramètres) { ... }
    // - visibilité : public, private, protected...
    // - type_retour : void si ne retourne rien, sinon int, double, String, un objet...

    // MÉTHODE de saisie du titre (ne retourne rien -> void)
    public void saisirTitre() {
        System.out.println("Entrer le titre du livre : ");
        this.titre = clavier.nextLine();  // lit une ligne entière
    }

    // MÉTHODE de saisie de l'année avec VALIDATION dans une boucle while.
    // Rappel : while(cond) { ... } répète TANT QUE cond est vraie.
    public void saisirAnnee() {
        System.out.println("Entrer l'annee (1450-2026) : ");
        this.annee = clavier.nextInt();
        while (this.annee < 1450 || this.annee > 2026) {
            System.out.println("Annee invalide, reessayer :");
            this.annee = clavier.nextInt();
        }
    }

    // MÉTHODE qui saisit nbNotes et LE RETOURNE (type de retour : int)
    public int saisirNbNotes() {
        System.out.println("Combien de notes (1-10) ? ");
        this.nbNotes = clavier.nextInt();
        while (this.nbNotes < 1 || this.nbNotes > 10) {
            System.out.println("Doit etre entre 1 et 10, reessayer :");
            this.nbNotes = clavier.nextInt();
        }
        return this.nbNotes;  // renvoie la valeur à l'appelant
    }

    // MÉTHODE qui saisit un TABLEAU de notes.
    // "new double[nb]" : ALLOCATION du tableau, sa taille est fixée à nb.
    // Un tableau en Java a une longueur immuable après création.
    public void saisirNotes(int nb) {
        this.notes = new double[nb];
        // Boucle for : compteur i de 0 (inclus) à nb (exclus).
        for (int i = 0; i < nb; i++) {
            // Boucle do-while : exécute AU MOINS UNE FOIS le bloc,
            // puis vérifie la condition à la fin.
            do {
                System.out.println("Note " + (i + 1) + " (0-10) : ");
                this.notes[i] = clavier.nextDouble();
                if (this.notes[i] < 0 || this.notes[i] > 10) {
                    System.out.println("Note doit etre entre 0 et 10");
                }
            } while (this.notes[i] < 0 || this.notes[i] > 10);
        }
    }

    // MÉTHODE qui calcule et RETOURNE la moyenne (type de retour : double)
    public double calculerMoyenne() {
        // Cas particulier : éviter la division par zéro
        if (this.nbNotes == 0) return 0.0;

        double somme = 0.0;   // accumulateur (variable LOCALE, pas un attribut)
        for (int i = 0; i < this.nbNotes; i++) {
            somme += this.notes[i];   // équivalent à somme = somme + this.notes[i]
        }
        // somme est un double, donc division réelle (pas entière)
        return somme / this.nbNotes;
    }

    // MÉTHODE d'affichage : void (n'a rien à retourner)
    public void afficherInfos() {
        System.out.println("=== Livre ===");
        System.out.println("Titre  : " + this.titre);
        System.out.println("Auteur : " + this.auteur);
        System.out.println("Annee  : " + this.annee);
        System.out.println("Notes :");
        for (int i = 0; i < this.nbNotes; i++) {
            System.out.println("  - " + this.notes[i]);
        }
        // On peut appeler une AUTRE méthode du même objet avec this.
        System.out.println("Moyenne : " + this.calculerMoyenne());
    }
}
