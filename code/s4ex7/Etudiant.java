public class Etudiant {
    private String nom;
    private int age;

    public Etudiant(String nom, int age) {   // constructeur ajouté pour l'exercice
        this.nom = nom;
        this.age = age;
    }
    public String getNom() { return nom; }   // VRAI getter : il ne saisit rien
    public int getAge()    { return age; }
}
