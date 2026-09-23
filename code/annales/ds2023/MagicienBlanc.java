public class MagicienBlanc extends Magicien {

    // OBLIGATOIRE : Magicien n'a pas de constructeur sans paramètre,
    // donc le super() implicite ne compilerait pas.
    public MagicienBlanc(int vie, int defense) {
        super(vie, defense);
    }

    @Override
    public void actions() {
        super.actions();                                // d'abord la version de Magicien
        point_defense = 5;                              // protected : accessible dans la fille
        System.out.println("défense=" + point_defense);
    }
}
