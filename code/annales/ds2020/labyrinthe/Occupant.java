public abstract class Occupant {
    protected Cellule cellule;

    public Occupant(Cellule uneCel) {
        cellule = uneCel;
        if (uneCel != null) uneCel.prendreOccupant(this);   // la cellule connaît son occupant (lien réciproque)
    }

    public void setCellule(Cellule uneCel) { cellule = uneCel; }

    @Override
    public abstract String toString();            // redéclarée abstraite : chaque occupant DOIT la fournir
}
