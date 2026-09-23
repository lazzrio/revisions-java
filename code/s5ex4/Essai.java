import java.io.File;                       // représente le fichier (chemin)
import java.io.FileNotFoundException;      // exception levée si le fichier n'existe pas
import java.io.FileWriter;                 // écriture de caractères dans un fichier
import java.io.IOException;
import java.io.PrintWriter;                // println() vers un fichier
import java.util.Scanner;                  // lecture « mot à mot » ou ligne à ligne

public class Essai {
    public static void main(String[] args) {
        // 1) ÉCRIRE un fichier texte : une donnée par champ, séparateur « ; »
        try (PrintWriter out = new PrintWriter(new FileWriter("notes.txt"))) {
            out.println("Alice;20;15.5");
            out.println("Bilal;21;12.0");
        } catch (IOException e) {
            System.out.println("Écriture impossible : " + e.getMessage());
        }

        // 2) LIRE le fichier avec Scanner + File
        try {
            Scanner sc = new Scanner(new File("notes.txt"));   // peut lever FileNotFoundException
            while (sc.hasNextLine()) {                          // tant qu'il reste une ligne
                String ligne = sc.nextLine();
                String[] champs = ligne.split(";");              // découpe selon le séparateur
                String nom = champs[0];
                int age = Integer.parseInt(champs[1]);
                double moyenne = Double.parseDouble(champs[2]);
                System.out.println(nom + " a " + age + " ans, moyenne " + moyenne);
            }
            sc.close();
        } catch (FileNotFoundException e) {                     // exécuté seulement si le fichier est absent
            System.out.println("Fichier introuvable : " + e.getMessage());
        }

        // 3) Cas d'erreur : fichier absent → on passe dans le catch
        try {
            Scanner sc2 = new Scanner(new File("absent.txt"));
            sc2.close();
        } catch (FileNotFoundException e) {
            System.out.println("Fichier introuvable : " + e.getMessage());
        }
    }
}
