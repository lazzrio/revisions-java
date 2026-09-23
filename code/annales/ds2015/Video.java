/** Le sujet écrit « Vidéo » et « Video » : les accents sont légaux en Java,
    mais il faut UN SEUL nom partout. On choisit Video (sans accent). */
public abstract class Video {
    protected String titre;
    protected int duree;

    public Video(String titre, int duree) {
        this.titre = titre;
        this.duree = duree;
    }

    public String getTitre() { return titre; }
    public int getDuree() { return duree; }
}
