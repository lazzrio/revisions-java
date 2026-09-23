public class VideoInexistante extends Exception {
    public VideoInexistante(String titre) { super("Vidéo introuvable : " + titre); }
}
