public abstract class Mobile extends Occupant {

    public Mobile(Cellule uneCel) { super(uneCel); }  // indispensable : Occupant n'a pas de constructeur vide

    public void deplacerVers(Cellule cell_dest) {
        cellule.perdreOccupant();              // quitte la case actuelle (met cellule à null)
        cell_dest.prendreOccupant(this);       // occupe la nouvelle case (remet cellule à jour)
    }

    // « goto » est un MOT RÉSERVÉ en Java (inutilisé mais interdit) : on renomme la méthode.
    public void allerVers(Cellule cell_dest) throws ObstacleException {
        if (cell_dest != null && cell_dest.estLibre()) {
            deplacerVers(cell_dest);
        } else {
            throw new ObstacleException(cell_dest == null ? "bord du labyrinthe" : "case occupée");
        }
    }
}
