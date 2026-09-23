import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        String nom;
        int age;
        double[] notes;
        int nbnotes;

        Etudiant eleve = new Etudiant();                       // objet de la classe Etudiant
        nom = eleve.getNom();
        age = eleve.getAge();
        nbnotes = eleve.getNbnotes();
        notes = eleve.getNotes(nbnotes);
        eleve.afficherInfos();
        System.out.printf(Locale.FRANCE, "Moyenne : %.2f%n", eleve.calculerMoyenne());   // 11,87
    }
}
