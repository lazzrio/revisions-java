package fastbite.modele;

import java.io.Serializable;
import java.time.LocalDateTime;

public class Livraison implements Serializable {
    private static final long serialVersionUID = 1L;

    private final Commande commande;
    private final Livreur livreur;
    private final LocalDateTime depart = LocalDateTime.now();

    public Livraison(Commande commande, Livreur livreur) {
        this.commande = commande;
        this.livreur = livreur;
    }

    public Commande getCommande() { return commande; }
    public Livreur getLivreur() { return livreur; }
    public LocalDateTime getDepart() { return depart; }
}
