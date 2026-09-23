package fastbite.modele;

import java.util.ArrayList;
import java.util.List;

public class Client extends Utilisateur {
    private static final long serialVersionUID = 1L;

    private String adresseLivraison;
    private double solde;
    private final List<Commande> historique = new ArrayList<>();

    public Client(String nom, String email, String motDePasse, String adresse, double solde) {
        super(nom, email, motDePasse);          // 1re ligne : construit la partie Utilisateur
        this.adresseLivraison = adresse;
        this.solde = solde;
    }

    public double getSolde() { return solde; }
    public String getAdresseLivraison() { return adresseLivraison; }
    public List<Commande> getHistorique() { return historique; }
    void ajouterAHistorique(Commande c) { historique.add(c); }

    /** TP5 Q1 : on LÈVE une exception au lieu de renvoyer false. */
    public void payer(Commande c) throws SoldeInsuffisantException {
        if (c.getMontantTotal() > solde) {
            throw new SoldeInsuffisantException(nom, c.getMontantTotal(), solde);
        }
        solde -= c.getMontantTotal();
        c.setStatut(StatutCommande.PAYEE);
    }

    @Override public String getRole() { return "Client"; }

    @Override public void afficherTableauDeBord() {
        System.out.println("[Client] " + nom + " | solde " + solde + " EUR | "
                + historique.size() + " commande(s)");
    }
}
