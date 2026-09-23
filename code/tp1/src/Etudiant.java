import java.util.Locale;
import java.util.Scanner;

// Classe Etudiant : tous les attributs sont private (encapsulation)
class Etudiant {
    private String nom;
    private int age;
    private double[] notes;
    private int nbnotes;

    // UN seul Scanner pour tout l'objet ; Locale.FRANCE : on tape 4,5 (virgule) comme sur la capture
    private final Scanner clavier = new Scanner(System.in).useLocale(Locale.FRANCE);

    public String getNom() {
        System.out.println("Entrez le nom :");
        nom = clavier.nextLine();
        return nom;
    }

    public int getAge() {
        System.out.println("Entrez l'age :");
        age = clavier.nextInt();
        while (age < 18 || age > 25) {                         // bornes de la capture d'écran
            System.out.println("Age n'est pas entre 18 et 25 !");
            age = clavier.nextInt();
        }
        return age;
    }

    public int getNbnotes() {
        System.out.println("Entrez le nombre de notes :");
        nbnotes = clavier.nextInt();
        while (nbnotes < 2 || nbnotes > 5) {
            System.out.println("Nombre de notes n'est pas entre 2 et 5 !");
            nbnotes = clavier.nextInt();                      // on relit nbnotes (et pas age !)
        }
        return nbnotes;
    }

    public double[] getNotes(int nbnotes) {
        notes = new double[nbnotes];                          // instancier AVANT de remplir
        System.out.println("Entrez les notes :");
        for (int i = 0; i < nbnotes; i++) {
            notes[i] = clavier.nextDouble();                  // nextDouble : une note peut être 12,5
            while (notes[i] < 0 || notes[i] > 20) {
                System.out.println("Note n'est pas entre 0 et 20 !");
                notes[i] = clavier.nextDouble();
            }
        }
        return notes;
    }

    public void afficherInfos() {
        System.out.println("--- Informations de l'etudiant ---");
        System.out.println("Nom : " + nom);
        System.out.println("Age : " + age);
        System.out.println("Notes :");
        for (int i = 0; i < nbnotes; i++) {
            System.out.println(notes[i]);                     // println d'un double : 4.5 (point)
        }
        System.out.println();                                 // la ligne vide de la capture
    }

    public double calculerMoyenne() {
        double somme = 0;                                      // double, surtout pas int
        for (int i = 0; i < nbnotes; i++) {
            somme += notes[i];
        }
        return somme / nbnotes;                                // double / int : division réelle
    }
}
