public abstract class Personnage {
    protected int point_vie;
    protected int point_defense;

    public Personnage() {                    // constructeur par défaut
        point_vie = 1;
        point_defense = 0;
    }

    public Personnage(int vie, int defense) {
        point_vie = vie;
        point_defense = defense;
    }

    public abstract void actions();          // pas de corps : chaque personnage agit à sa façon
}
