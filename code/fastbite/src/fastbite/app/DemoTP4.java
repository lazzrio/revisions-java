package fastbite.app;

import fastbite.modele.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DemoTP4 {
    public static void main(String[] args) throws Exception {
        // --- Q2 : polymorphisme sur la classe abstraite ---
        List<Utilisateur> comptes = new ArrayList<>();
        comptes.add(new Client("Alice", "alice@mail.com", "1234", "5 av. Foch", 30.0));
        comptes.add(new Livreur("Bob", "bob@mail.com", "abcd", "scooter"));
        for (Utilisateur u : comptes) {
            u.afficherTableauDeBord();                // la version appelée dépend de la classe RÉELLE
        }

        // --- Q3 : collection + Comparable / Comparator ---
        Restaurant mario = new Restaurant("Chez Mario", "12 rue de Paris", 4.6);
        mario.ajouterPlat(new Plat("Pizza Margherita", 12.50, "Tomate, mozzarella"));
        mario.ajouterPlat(new Plat("Tiramisu", 6.00, "Mascarpone, café"));
        mario.ajouterPlat(new Plat("Pasta Carbonara", 10.00, "Lardons, oeuf"));
        mario.trierMenuParPrix();
        System.out.println("Menu trié par prix : " + mario.getMenu());
        mario.trierMenuParNom();
        System.out.println("Menu trié par nom  : " + mario.getMenu());

        List<Restaurant> restos = new ArrayList<>();
        restos.add(new Restaurant("Sushi Go", "3 rue Oberkampf", 4.2));
        restos.add(mario);
        restos.add(new Restaurant("Burger Bro", "8 bd Voltaire", 4.8));
        Collections.sort(restos);                     // utilise Restaurant.compareTo (note décroissante)
        System.out.println("Restaurants du mieux noté au moins bien noté : " + restos);

        // --- Q1 : on manipule la plateforme à travers son INTERFACE ---
        ServiceCommande service = new PlateformeFastBite();
        Client alice = (Client) comptes.get(0);       // downcast : on sait que c'est un Client
        Commande c = service.passerCommande(alice, mario);
        service.ajouterPlat(c, mario.getMenu().get(0));
        System.out.println(c);
    }
}
