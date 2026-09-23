package fastbite.mvc;

import fastbite.modele.*;

import java.util.ArrayList;
import java.util.List;

/** MODÈLE : les données + les règles métier. Aucun import javax.swing ici ! */
public class PanierModele {
    private final PlateformeFastBite plateforme;
    private final Client client;
    private final Restaurant restaurant;
    private Commande commande;
    private String dernierMessage = "";
    private final List<PanierListener> abonnes = new ArrayList<>();

    public PanierModele(PlateformeFastBite plateforme, Client client, Restaurant restaurant) {
        this.plateforme = plateforme;
        this.client = client;
        this.restaurant = restaurant;
        this.commande = plateforme.passerCommande(client, restaurant);
    }

    public void ajouterAbonne(PanierListener l) { abonnes.add(l); }
    private void prevenir() { for (PanierListener l : abonnes) l.panierModifie(this); }

    public List<Plat> getMenu() { return restaurant.getMenu(); }
    public List<Plat> getPanier() { return commande.getPlats(); }
    public double getTotal() { return commande.getMontantTotal(); }
    public double getSolde() { return client.getSolde(); }
    public String getDernierMessage() { return dernierMessage; }

    public void ajouter(Plat p) throws PlatIndisponibleException {
        plateforme.ajouterPlat(commande, p);
        dernierMessage = p.getNom() + " ajouté";
        prevenir();
    }

    public void vider() {
        commande = plateforme.passerCommande(client, restaurant);
        dernierMessage = "Panier vidé";
        prevenir();
    }

    public void valider() throws SoldeInsuffisantException, AucunLivreurException {
        plateforme.payer(commande);
        Livraison l = plateforme.assignerLivreur(commande);
        dernierMessage = "Commande #" + commande.getNumero() + " confiée à " + l.getLivreur().getNom();
        commande = plateforme.passerCommande(client, restaurant);
        prevenir();
    }
}
