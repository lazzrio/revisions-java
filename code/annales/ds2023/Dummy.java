import java.util.ArrayList;
import java.util.InputMismatchException;
import java.util.Random;
import java.util.Scanner;

public class Dummy {
    private ArrayList<Integer> vecteur;                    // ArrayList d'objets Integer
    private static final Scanner CLAVIER = new Scanner(System.in);   // UN seul Scanner pour tout le programme

    // 1) constructeur : instancier le vecteur
    public Dummy() {
        vecteur = new ArrayList<Integer>();
    }

    // 2) saisir n > 0, sinon lever Exception ; remplir n valeurs aléatoires dans [0, 20]
    public void remplirAlea() throws Exception {
        System.out.print("Nombre d'éléments n (> 0) : ");
        int n;
        try {
            n = CLAVIER.nextInt();
        } catch (InputMismatchException e) {
            CLAVIER.nextLine();                            // jeter la saisie invalide, sinon boucle infinie
            throw new Exception("il faut un entier");
        }
        if (n <= 0) {
            throw new Exception("n doit être strictement positif (reçu " + n + ")");
        }
        Random r = new Random();
        vecteur.clear();                                   // au cas où la méthode est rappelée
        for (int i = 0; i < n; i++) {
            vecteur.add(r.nextInt(21));                    // 21 valeurs possibles : 0..20 (autoboxing int -> Integer)
        }
    }

    // 3) moyenne en float, sans affichage
    public float moyenne() {
        if (vecteur.isEmpty()) return 0f;                  // éviter 0/0 = NaN
        float somme = 0;
        for (int i = 0; i < vecteur.size(); i++) {
            somme += vecteur.get(i);                       // unboxing Integer -> int
        }
        return somme / vecteur.size();                     // float / int -> division RÉELLE
    }

    // 4) afficher les valeurs
    public void afficher() {
        for (int i = 0; i < vecteur.size(); i++) {
            System.out.print(vecteur.get(i) + " ");
        }
        System.out.println();
    }

    // 5) main
    public static void main(String argv[]) {
        Dummy d = new Dummy();
        boolean ok = false;
        while (!ok) {                                      // on recommence tant qu'une exception est attrapée
            try {
                d.remplirAlea();
                ok = true;                                 // atteint seulement si AUCUNE exception
            } catch (Exception e) {
                System.out.println("Erreur : " + e.getMessage() + ", recommence.");
            }
        }
        System.out.println("Moyenne = " + d.moyenne());
        d.afficher();
    }
}
