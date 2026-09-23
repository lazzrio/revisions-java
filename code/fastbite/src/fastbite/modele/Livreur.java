package fastbite.modele;

public class Livreur extends Utilisateur {
    private static final long serialVersionUID = 1L;

    private String vehicule;
    private boolean disponible = true;
    private int nbLivraisons;

    public Livreur(String nom, String email, String motDePasse, String vehicule) {
        super(nom, email, motDePasse);
        this.vehicule = vehicule;
    }

    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean d) { disponible = d; }
    public void incrementerLivraisons() { nbLivraisons++; }

    @Override public String getRole() { return "Livreur"; }

    @Override public void afficherTableauDeBord() {
        System.out.println("[Livreur] " + nom + " (" + vehicule + ") | "
                + (disponible ? "disponible" : "en course") + " | " + nbLivraisons + " livraison(s)");
    }
}
