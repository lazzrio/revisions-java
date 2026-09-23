import java.util.ArrayList;

public class Guichet {
    public ArrayList<Integer> usagers;       // public pour la dernière question (sinon : private + getter)
    public int capacite;

    public Guichet(int capacite) {
        this.capacite = capacite;
        usagers = new ArrayList<Integer>();   // ArrayList vide, SANS capacité
    }

    public void ajouterUsager(int numero) {
        usagers.add(numero);                  // autoboxing int -> Integer
    }

    public boolean estPlein() { return usagers.size() >= capacite; }
}
