package fastbite.persistance;

import fastbite.modele.Plat;
import fastbite.modele.Restaurant;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

/** TP5 Q2 : une ligne par plat, champs séparés par « ; » :  nom;prix;description */
public class MenuTexte {
    public static final String SEP = ";";

    public static void ecrire(Restaurant r, String fichier) throws IOException {
        try (PrintWriter out = new PrintWriter(new FileWriter(fichier))) {   // fermé automatiquement
            for (Plat p : r.getMenu()) {
                out.println(p.getNom() + SEP + p.getPrix() + SEP + p.getDescription());
            }
        }
    }

    /** Lit le fichier ; une ligne mal formée est signalée puis ignorée (on ne plante pas tout). */
    public static List<Plat> lire(String fichier) throws IOException {
        List<Plat> plats = new ArrayList<>();
        try (BufferedReader in = new BufferedReader(new FileReader(fichier))) {
            String ligne;
            int n = 0;
            while ((ligne = in.readLine()) != null) {
                n++;
                String[] champs = ligne.split(SEP);
                try {
                    plats.add(new Plat(champs[0], Double.parseDouble(champs[1]), champs[2]));
                } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                    System.out.println("Ligne " + n + " ignorée (" + e.getClass().getSimpleName() + ") : " + ligne);
                }
            }
        }
        return plats;
    }
}
