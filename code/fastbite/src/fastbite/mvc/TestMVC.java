package fastbite.mvc;

import fastbite.modele.*;

/** Test sans écran : on simule les clics et on vérifie ce que la vue affiche. */
public class TestMVC {
    public static void main(String[] args) {
        PlateformeFastBite p = new PlateformeFastBite();
        Restaurant mario = new Restaurant("Chez Mario", "12 rue de Paris", 4.6);
        mario.ajouterPlat(new Plat("Pizza Margherita", 12.50, "Tomate, mozzarella"));
        mario.ajouterPlat(new Plat("Pasta Carbonara", 10.00, "Lardons, oeuf"));
        p.ajouterRestaurant(mario);
        p.ajouterLivreur(new Livreur("Bob", "bob@mail.com", "abcd", "scooter"));
        Client alice = new Client("Alice", "alice@mail.com", "1234", "5 av. Foch", 30.0);

        PanierModele modele = new PanierModele(p, alice, mario);
        PanierVue vue = new PanierVue();
        modele.ajouterAbonne(vue);
        new PanierControleur(modele, vue);
        vue.panierModifie(modele);

        vue.getAjouter().doClick();                          // rien de sélectionné
        System.out.println("1) " + vue.getTexteStatut());
        vue.getListeMenu().setSelectedIndex(0);
        vue.getAjouter().doClick();
        vue.getAjouter().doClick();
        System.out.println("2) " + vue.getTexteTotal());
        vue.getValider().doClick();                          // 25 EUR <= 30 EUR : OK
        System.out.println("3) " + vue.getTexteStatut() + " | " + vue.getTexteTotal());
        vue.getListeMenu().setSelectedIndex(1);
        vue.getAjouter().doClick();
        vue.getValider().doClick();                          // solde 5 EUR < 10 EUR
        System.out.println("4) " + vue.getTexteStatut());
    }
}
