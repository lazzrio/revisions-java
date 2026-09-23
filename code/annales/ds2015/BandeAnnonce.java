public class BandeAnnonce extends Video {
    private float note;

    public BandeAnnonce(String titre, int duree, float note) {
        super(titre, duree);                    // les attributs hérités sont initialisés par Video
        this.note = note;
    }

    public float getNote() { return note; }

    /** Modifie la note ; si le titre n'est pas dans la playlist, on y ajoute cette bande annonce. */
    public void setNote(float note, String titre, PlayList liste) {
        this.note = note;
        try {
            PlayList.rechercher(titre);          // méthode STATIQUE : on l'appelle sur la classe
        } catch (VideoInexistante e) {
            PlayList.liste.add(this);
        }
    }
}
