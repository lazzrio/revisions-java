import java.util.Random;

public class Magie {
    public static void main(String argv[]) {
        Random r = new Random();
        int vie = r.nextInt(3) + 1;                    // 1..3
        int defense = r.nextInt(3) + 1;
        MagicienBlanc mb = new MagicienBlanc(vie, defense);
        MagicienNoir mn = new MagicienNoir(mb);         // un MagicienBlanc EST un Magicien : upcast implicite
        mb.actions();
        mn.actions();
    }
}
