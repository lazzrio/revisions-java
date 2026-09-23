package fastbite.modele;

import java.util.ArrayList;
import java.util.List;

/** TP4 Q1 b : la classe qui RÉALISE (implements) l'interface ServiceCommande. */
public class PlateformeFastBite implements ServiceCommande {
    private final List<Restaurant> restaurants = new ArrayList<>();
    private final List<Livreur> livreurs = new ArrayList<>();
    private int prochainNumero = 1001;

    public void ajouterRestaurant(Restaurant r) { restaurants.add(r); }
    public void ajouterLivreur(Livreur l) { livreurs.add(l); }
    public List<Restaurant> getRestaurants() { return restaurants; }

    @Override
    public Commande passerCommande(Client client, Restaurant restaurant) {
        Commande c = new Commande(prochainNumero++, client, restaurant);
        client.ajouterAHistorique(c);
        return c;
    }

    @Override
    public void ajouterPlat(Commande commande, Plat plat) throws PlatIndisponibleException {
        commande.ajouterPlat(plat);                   // pas de try : l'exception « remonte »
    }

    @Override
    public void payer(Commande commande) throws SoldeInsuffisantException {
        commande.getClient().payer(commande);
    }

    @Override
    public Livraison assignerLivreur(Commande commande) throws AucunLivreurException {
        for (Livreur l : livreurs) {
            if (l.isDisponible()) {
                l.setDisponible(false);
                l.incrementerLivraisons();
                commande.setStatut(StatutCommande.EN_LIVRAISON);
                return new Livraison(commande, l);
            }
        }
        throw new AucunLivreurException();
    }
}
