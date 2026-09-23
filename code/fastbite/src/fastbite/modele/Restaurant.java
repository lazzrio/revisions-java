package fastbite.modele;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/** TP4 Q3 : la classe qui CONTIENT une collection (le menu), avec ajout et tri. */
public class Restaurant implements Serializable, Comparable<Restaurant> {
    private static final long serialVersionUID = 1L;

    private final String nom;
    private final String adresse;
    private final double noteMoyenne;
    private final List<Plat> menu = new ArrayList<>();

    public Restaurant(String nom, String adresse, double noteMoyenne) {
        this.nom = nom;
        this.adresse = adresse;
        this.noteMoyenne = noteMoyenne;
    }

    public String getNom() { return nom; }
    public String getAdresse() { return adresse; }
    public double getNoteMoyenne() { return noteMoyenne; }
    public List<Plat> getMenu() { return menu; }

    public void ajouterPlat(Plat p) { menu.add(p); }

    public void trierMenuParPrix() { Collections.sort(menu); }             // utilise Plat.compareTo

    public void trierMenuParNom() {                                         // ordre « externe »
        menu.sort(Comparator.comparing(Plat::getNom));
    }

    /** Consigne prise au pied de la lettre : la classe-conteneur est elle aussi Comparable
        (restaurants rangés du mieux noté au moins bien noté). */
    @Override
    public int compareTo(Restaurant autre) {
        return Double.compare(autre.noteMoyenne, this.noteMoyenne);        // ordre décroissant
    }

    @Override
    public String toString() { return nom + " (" + noteMoyenne + "/5, " + menu.size() + " plats)"; }
}
