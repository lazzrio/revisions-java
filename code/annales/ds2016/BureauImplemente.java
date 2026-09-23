import java.util.ArrayList;

public class BureauImplemente implements Bureau {
    private ArrayList<Guichet> guichets;
    private int nombre;

    public BureauImplemente(int nombre) {
        this.nombre = nombre;
        guichets = new ArrayList<Guichet>(nombre);      // capacité INITIALE (taille = 0 au départ !)
    }

    public ArrayList<Guichet> getGuichets() { return guichets; }

    @Override
    public Guichet ouvrirNouveauGuichet(int capacite) {
        Guichet g = new Guichet(capacite);
        guichets.add(g);
        return g;
    }

    /** Ajoute l'usager au guichet NON PLEIN qui a le moins d'usagers. */
    @Override
    public void ajouterUsager(int numero) throws BureauSature {
        Guichet meilleur = null;
        for (Guichet g : guichets) {
            if (!g.estPlein() && (meilleur == null || g.usagers.size() < meilleur.usagers.size())) {
                meilleur = g;
            }
        }
        if (meilleur == null) throw new BureauSature();  // aucun guichet disponible (ou aucun ouvert)
        meilleur.ajouterUsager(numero);
    }

    public static void main(String[] args) {
        BureauImplemente b = new BureauImplemente(2);
        b.ouvrirNouveauGuichet(2);
        b.ouvrirNouveauGuichet(1);
        for (int n = 1; n <= 4; n++) {
            try {
                b.ajouterUsager(n);
                System.out.println("usager " + n + " placé");
            } catch (BureauSature e) {
                System.out.println("usager " + n + " refusé : " + e.getMessage());
            }
        }
        // dernière question : capacité du premier guichet
        Guichet premier = b.getGuichets().get(0);
        System.out.println("capacité du 1er guichet = " + premier.capacite + ", usagers = " + premier.usagers);
    }
}
