import java.util.Iterator;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        MapEtudiants promo = new MapEtudiants();

        // 1) instancier et ajouter des étudiants avec un identifiant unique
        promo.ajouter("E001", new Etudiant("Alice", 20));
        promo.ajouter("E002", new Etudiant("Bilal", 21));
        promo.ajouter("E003", new Etudiant("Chloé", 19));

        // 2) saisir un identifiant, le chercher, afficher le nom s'il existe
        Scanner clavier = new Scanner(System.in);
        System.out.print("Identifiant à rechercher : ");
        String id = clavier.nextLine().trim();
        Etudiant trouve = promo.etudiants.get(id);        // null si la clé est absente
        if (trouve != null) {
            System.out.println("Étudiant trouvé : " + trouve.getNom());
        } else {
            System.out.println("Aucun étudiant avec l'identifiant " + id);
        }

        // 3a) afficher tous les identifiants et noms — boucle for-each sur entrySet()
        System.out.println("--- Liste complète ---");
        for (Map.Entry<String, Etudiant> e : promo.etudiants.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue().getNom());
        }

        // 3b) même chose avec keySet() + Iterator (la version du cours)
        Set<String> cles = promo.etudiants.keySet();
        Iterator<String> it = cles.iterator();
        while (it.hasNext()) {
            String cle = it.next();
            System.out.println(cle + " : " + promo.etudiants.get(cle).getNom());
        }
    }
}
