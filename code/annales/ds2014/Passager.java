/** Un passager EST une personne (héritage) ; la personne qui réserve peut aussi en être un. */
public class Passager extends Personne {
    private String trancheAge;
    private String carteAbonnement;
    private String programmeFidelite;
    public Passager(String trancheAge, String carte, String fidelite) {
        super();
        this.trancheAge = trancheAge;
        this.carteAbonnement = carte;
        this.programmeFidelite = fidelite;
    }
}
