package fastbite.persistance;

import fastbite.modele.Restaurant;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.List;

/** TP5 Q3 : sérialisation binaire (.ser) de toute la liste de restaurants (menus compris). */
public class Sauvegarde {

    public static void sauver(List<Restaurant> restaurants, String fichier) throws IOException {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(fichier))) {
            oos.writeObject(new ArrayList<>(restaurants));   // ArrayList est Serializable
        }
    }

    @SuppressWarnings("unchecked")
    public static List<Restaurant> charger(String fichier) throws IOException, ClassNotFoundException {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(fichier))) {
            return (List<Restaurant>) ois.readObject();      // cast obligatoire : readObject renvoie Object
        }
    }
}
