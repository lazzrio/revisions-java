import java.util.Random;

public class Magicien extends Personnage {
    private int point_magie;

    // « hérite du second constructeur » = appelle super(vie, defense)
    public Magicien(int vie, int defense) {
        super(vie, defense);
        point_magie = new Random().nextInt(5) + 1;       // 1..5
    }

    public void setPoint_magie(int magie) {             // le « setter »
        point_magie = magie;
    }

    @Override
    public void actions() {
        System.out.println("vie=" + point_vie + " défense=" + point_defense + " magie=" + point_magie);
    }
}
