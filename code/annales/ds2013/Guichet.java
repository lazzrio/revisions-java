public class Guichet {
    public int[] file;           // numéros d'usagers en attente
    public int tailleLimite;
    public int longueur = 0;     // nombre d'usagers actuellement dans la file
    public int numero;           // numéro du guichet (pour l'affichage)

    public Guichet(int tailleLimite) {
        this.tailleLimite = tailleLimite;
        file = new int[tailleLimite];
    }
    public boolean estPleine() { return longueur == tailleLimite; }
}
