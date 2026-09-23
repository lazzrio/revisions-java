package fastbite.modele;

/** TP4 Q1 a : l'INTERFACE = le contrat de ce que la plateforme sait faire. */
public interface ServiceCommande {
    Commande passerCommande(Client client, Restaurant restaurant);
    void ajouterPlat(Commande commande, Plat plat) throws PlatIndisponibleException;
    void payer(Commande commande) throws SoldeInsuffisantException;
    Livraison assignerLivreur(Commande commande) throws AucunLivreurException;
}
