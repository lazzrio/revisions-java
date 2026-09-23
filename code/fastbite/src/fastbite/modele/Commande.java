package fastbite.modele;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Commande implements Serializable {
    private static final long serialVersionUID = 1L;

    private final int numero;
    private final Client client;
    private final Restaurant restaurant;
    private final List<Plat> plats = new ArrayList<>();
    private StatutCommande statut = StatutCommande.NOUVELLE;

    public Commande(int numero, Client client, Restaurant restaurant) {
        this.numero = numero;
        this.client = client;
        this.restaurant = restaurant;
    }

    public int getNumero() { return numero; }
    public Client getClient() { return client; }
    public Restaurant getRestaurant() { return restaurant; }
    public List<Plat> getPlats() { return plats; }
    public StatutCommande getStatut() { return statut; }
    void setStatut(StatutCommande s) { statut = s; }

    /** TP5 Q1 : on refuse un plat absent du menu ou en rupture de stock. */
    public void ajouterPlat(Plat p) throws PlatIndisponibleException {
        if (!restaurant.getMenu().contains(p) || !p.isDisponible()) {
            throw new PlatIndisponibleException(p.getNom(), restaurant.getNom());
        }
        plats.add(p);
    }

    public double getMontantTotal() {
        double total = 0;
        for (Plat p : plats) total += p.getPrix();
        return total;
    }

    @Override
    public String toString() {
        return "Commande #" + numero + " " + statut + " : " + plats + " = " + getMontantTotal() + " EUR";
    }
}
