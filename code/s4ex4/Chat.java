public class Chat implements Animal {
    private String nom;
    private int nbVies;

    public Chat(String nom) {
        this.nom = nom;
        this.nbVies = 9;
    }

    @Override public void manger()   { System.out.println(nom + " mange des croquettes"); }
    @Override public void dormir()   { System.out.println(nom + " dort 16 h par jour sur le canapé"); }
    @Override public void faireSon() { System.out.println(nom + " : Miaou !"); }

    public void griffer() { System.out.println(nom + " fait ses griffes (" + nbVies + " vies)"); }
}
