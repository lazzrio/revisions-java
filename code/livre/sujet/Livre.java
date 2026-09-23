import java.util.Scanner;

// Classe Livre
class Livre {
    // -------- ATTRIBUTS (tous privés) --------
    private String titre;
    private String auteur;
    private int annee;
    private double[] notes;
    private int nbNotes;

    Scanner clavier = new Scanner(System.in);

    /* A COMPLETER : constructeur SANS PARAMETRE.
       Doit initialiser titre="Inconnu", auteur="Anonyme", annee=2000, nbNotes=0. */
    public Livre() {
    }

    /* A COMPLETER : constructeur AVEC PARAMETRES (String titre, String auteur, int annee).
       Utiliser this. pour distinguer attribut et paramètre. */
    public Livre(String titre, String auteur, int annee) {
    }

    /* A COMPLETER : saisit le titre au clavier et l'affecte a l'attribut. */
    public void saisirTitre() {
    }

    /* A COMPLETER : saisit l'annee, tant qu'elle n'est pas entre 1450 et 2026. */
    public void saisirAnnee() {
    }

    /* A COMPLETER : saisit nbNotes entre 1 et 10 (boucle while), puis retourne cet entier. */
    public int saisirNbNotes() {
        return 0;
    }

    /* A COMPLETER : instancie le tableau notes avec la taille nb,
       puis saisit chaque note en verifiant qu'elle est entre 0 et 10 (do-while). */
    public void saisirNotes(int nb) {
    }

    /* A COMPLETER : calcule et retourne la moyenne des notes (0.0 si nbNotes == 0). */
    public double calculerMoyenne() {
        return 0.0;
    }

    /* A COMPLETER : affiche titre, auteur, annee, chaque note, et la moyenne. */
    public void afficherInfos() {
    }
}
