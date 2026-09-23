public class Chien implements Animal {
    private String nom;
    private String race;
    private int nbOs;               // os enterrés dans le jardin

    public Chien(String nom, String race) {
        this.nom = nom;
        this.race = race;
        this.nbOs = 0;
    }

    @Override public void manger()   { System.out.println(nom + " (" + race + ") ronge un os"); }
    @Override public void dormir()   { System.out.println(nom + " dort dans sa niche"); }
    @Override public void faireSon() { System.out.println(nom + " : Wouf !"); }

    // méthode propre au chien : elle n'existe PAS dans Animal
    public void enterrerOs() { nbOs++; System.out.println(nom + " a enterré " + nbOs + " os"); }
}
