public class Explorateur extends Mobile {
    public Explorateur(Cellule uneCel) { super(uneCel); }
    @Override public String toString() { return "O"; }
    public Cellule getCellule() { return cellule; }
}
