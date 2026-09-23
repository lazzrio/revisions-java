import java.util.ArrayList;
import java.util.List;

public class Zoo {
    // Méthode polymorphe : reçoit n'importe quel Animal
    static void nourrir(Animal a) {
        a.manger();                               // appel polymorphe
        if (a instanceof Chien) {                 // 1) tester le type réel
            Chien c = (Chien) a;                  // 2) downcast (sûr grâce au test)
            c.enterrerOs();                       // 3) méthode propre à Chien
        } else if (a instanceof Oiseau) {
            ((Oiseau) a).voler();
        } else if (a instanceof Chat) {
            ((Chat) a).griffer();
        }
    }

    public static void main(String[] args) {
        List<Animal> animaux = new ArrayList<>();
        animaux.add(new Chien("Rex", "berger"));
        animaux.add(new Chat("Tom"));
        animaux.add(new Oiseau("Titi", 18.5));

        for (Animal a : animaux) {                // le type déclaré est Animal
            a.faireSon();
            a.dormir();
            nourrir(a);
            System.out.println("--");
        }
        // Animal x = new Animal();  // ERREUR : une interface ne s'instancie pas
    }
}
