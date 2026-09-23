package fastbite.modele;

import java.io.Serializable;

/** TP4 Q3 : ordre NATUREL des plats = prix croissant (Comparable). */
public class Plat implements Comparable<Plat>, Serializable {
    private static final long serialVersionUID = 1L;

    private final String nom;
    private final double prix;
    private final String description;
    private boolean disponible = true;

    public Plat(String nom, double prix, String description) {
        if (prix < 0) throw new IllegalArgumentException("Prix négatif : " + prix);
        this.nom = nom;
        this.prix = prix;
        this.description = description;
    }

    public String getNom() { return nom; }
    public double getPrix() { return prix; }
    public String getDescription() { return description; }
    public boolean isDisponible() { return disponible; }
    public void setDisponible(boolean d) { disponible = d; }

    @Override
    public int compareTo(Plat autre) {
        return Double.compare(this.prix, autre.prix);   // négatif, 0 ou positif
    }

    @Override
    public String toString() { return nom + " (" + prix + " EUR)"; }
}
