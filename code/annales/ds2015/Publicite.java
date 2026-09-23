public class Publicite extends Video {
    private String marque;

    public Publicite(String titre, int duree, String marque) {
        super(titre, duree);
        this.marque = marque;
    }

    public String getMarque() { return marque; }  // lecture seule : pas de setMarque
}
