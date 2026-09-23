package fastbite.modele;

/** Exception CONTRÔLÉE (extends Exception) : l'appelant est OBLIGÉ de la traiter ou de la propager. */
public class SoldeInsuffisantException extends Exception {
    private static final long serialVersionUID = 1L;
    public SoldeInsuffisantException(String client, double montant, double solde) {
        super(client + " doit payer " + montant + " EUR mais n'a que " + solde + " EUR");
    }
}
