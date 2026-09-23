public class Cellule {
    public int posX, posY;                          // coordonnées (posX = ligne, posY = colonne)
    public Cellule sud, est, nord, ouest;           // 4 voisines (null au bord)
    public Occupant occupant;                       // null = cellule libre

    // Ajout nécessaire : getCellule(x, y) doit pouvoir retrouver n'importe quelle cellule.
    // La matrice est donc partagée (static) ; Labyrinthe la renseigne au démarrage.
    public static Cellule[][] matrice;

    public Cellule(int posX, int posY) {
        this.posX = posX;
        this.posY = posY;
    }

    /** Retourne la cellule (x, y) ou null si elle est hors du labyrinthe. */
    public Cellule getCellule(int posX, int posY) {
        if (posX < 0 || posY < 0 || posX >= matrice.length || posY >= matrice[0].length) return null;
        return matrice[posX][posY];
    }

    public void affecterVoisines() {
        nord  = getCellule(posX - 1, posY);
        sud   = getCellule(posX + 1, posY);
        ouest = getCellule(posX, posY - 1);
        est   = getCellule(posX, posY + 1);
    }

    public boolean estLibre() {
        return occupant == null;
    }

    public void prendreOccupant(Occupant occupant) {
        this.occupant = occupant;
        if (occupant != null) occupant.setCellule(this);
    }

    public void perdreOccupant() {
        if (!estLibre()) occupant.setCellule(null);
        occupant = null;
    }

    @Override                                        // et non @override : le compilateur refuse la minuscule
    public String toString() {
        return estLibre() ? "-" : occupant.toString();
    }
}
