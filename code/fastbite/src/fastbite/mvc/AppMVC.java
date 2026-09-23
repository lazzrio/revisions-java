package fastbite.mvc;

import fastbite.modele.*;

import javax.swing.*;

public class AppMVC {
    public static void main(String[] args) {
        PlateformeFastBite p = new PlateformeFastBite();
        Restaurant mario = new Restaurant("Chez Mario", "12 rue de Paris", 4.6);
        mario.ajouterPlat(new Plat("Pizza Margherita", 12.50, "Tomate, mozzarella"));
        mario.ajouterPlat(new Plat("Pasta Carbonara", 10.00, "Lardons, oeuf"));
        p.ajouterRestaurant(mario);
        p.ajouterLivreur(new Livreur("Bob", "bob@mail.com", "abcd", "scooter"));
        Client alice = new Client("Alice", "alice@mail.com", "1234", "5 av. Foch", 30.0);

        SwingUtilities.invokeLater(() -> {
            PanierModele modele = new PanierModele(p, alice, mario);   // M
            PanierVue vue = new PanierVue();                              // V
            modele.ajouterAbonne(vue);                                    // V observe M
            new PanierControleur(modele, vue);                            // C relie V -> M
            vue.panierModifie(modele);                                    // premier affichage

            JFrame f = new JFrame("FastBite — MVC");
            f.setContentPane(vue);
            f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            f.pack();
            f.setVisible(true);
        });
    }
}
