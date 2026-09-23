import java.util.Date;

public class Voyage {
    private boolean retour, direct;
    private int nb_passagers, confort;
    private Date dateAller, dateRetour;
    private int heureAller, heureRetour;
    private Personne reservePar;
    private Passager[] passagers;
    private Gare depart, arrivee;

    public Voyage() {                                    // pas de retour, direct, 1 passager, 2e classe
        this(false, true, 1, 2);
    }

    public Voyage(boolean retour, boolean direct, int nb_passagers, int confort) {
        this.retour = retour;
        this.direct = direct;
        this.nb_passagers = nb_passagers;
        this.confort = confort;
    }

    public void aller(Gare depart, Gare arrivee, Date date, int heure) {
        this.depart = depart;
        this.arrivee = arrivee;
        this.dateAller = date;
        this.heureAller = heure;
    }

    public void revenir(Date date, int heure) {
        this.dateRetour = date;
        this.heureRetour = heure;
    }

    public void reserver(Personne p, int nb_passagers) {
        this.reservePar = p;
        this.nb_passagers = nb_passagers;
        this.passagers = new Passager[nb_passagers];     // cases à null : les passagers seront créés ensuite
    }

    @Override
    public String toString() {
        return depart.getNom() + " -> " + arrivee.getNom() + " le " + dateAller + " à " + heureAller + "h, "
                + nb_passagers + " passager(s), classe " + confort + (retour ? ", retour le " + dateRetour : "");
    }
}
