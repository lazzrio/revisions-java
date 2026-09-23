package fastbite.swing;

import fastbite.modele.*;

import javax.swing.SwingUtilities;

public class AppTP6 {
    public static void main(String[] args) {
        PlateformeFastBite p = new PlateformeFastBite();
        Restaurant mario = new Restaurant("Chez Mario", "12 rue de Paris", 4.6);
        mario.ajouterPlat(new Plat("Pizza Margherita", 12.50, "Tomate, mozzarella"));
        mario.ajouterPlat(new Plat("Pasta Carbonara", 10.00, "Lardons, oeuf"));
        Restaurant sushi = new Restaurant("Sushi Go", "3 rue Oberkampf", 4.2);
        sushi.ajouterPlat(new Plat("Maki saumon", 6.50, "x6"));
        p.ajouterRestaurant(mario);
        p.ajouterRestaurant(sushi);
        p.ajouterLivreur(new Livreur("Bob", "bob@mail.com", "abcd", "scooter"));
        Client alice = new Client("Alice", "alice@mail.com", "1234", "5 av. Foch", 40.0);

        // Swing n'est pas thread-safe : on crée la fenêtre dans le thread graphique (EDT)
        SwingUtilities.invokeLater(() -> new FenetreFastBite(p, alice).setVisible(true));
    }
}
