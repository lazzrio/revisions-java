public class Oiseau implements Animal {
    private String nom;
    private double envergure;       // en cm

    public Oiseau(String nom, double envergure) {
        this.nom = nom;
        this.envergure = envergure;
    }

    @Override public void manger()   { System.out.println(nom + " picore un ver de terre"); }
    @Override public void dormir()   { System.out.println(nom + " dort perché sur une branche"); }
    @Override public void faireSon() { System.out.println(nom + " : Cui-cui !"); }

    public void voler() { System.out.println(nom + " s'envole (" + envergure + " cm d'envergure)"); }
}
