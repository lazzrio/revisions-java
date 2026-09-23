package fastbite.app;

import fastbite.modele.*;
import fastbite.persistance.MenuTexte;
import fastbite.persistance.Sauvegarde;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class DemoTP5 {
    public static void main(String[] args) {
        PlateformeFastBite plateforme = new PlateformeFastBite();
        Restaurant mario = new Restaurant("Chez Mario", "12 rue de Paris", 4.6);
        Plat pizza = new Plat("Pizza Margherita", 12.50, "Tomate, mozzarella");
        Plat pasta = new Plat("Pasta Carbonara", 10.00, "Lardons, oeuf");
        mario.ajouterPlat(pizza);
        mario.ajouterPlat(pasta);
        plateforme.ajouterRestaurant(mario);
        plateforme.ajouterLivreur(new Livreur("Bob", "bob@mail.com", "abcd", "scooter"));
        Client alice = new Client("Alice", "alice@mail.com", "1234", "5 av. Foch", 20.0);

        // ===== Q1 : lever, propager, attraper =====
        Commande c = plateforme.passerCommande(alice, mario);
        try {
            plateforme.ajouterPlat(c, pizza);
            plateforme.ajouterPlat(c, pasta);
            plateforme.payer(c);                                   // 22,50 € > 20 € : exception
            System.out.println("Payé !");
        } catch (PlatIndisponibleException e) {
            System.out.println("Plat refusé : " + e.getMessage());
        } catch (SoldeInsuffisantException e) {
            System.out.println("Paiement refusé : " + e.getMessage());
        }

        Plat sushi = new Plat("Sushi", 8.0, "Saumon");            // n'est pas au menu de Mario
        try {
            plateforme.ajouterPlat(c, sushi);
        } catch (PlatIndisponibleException e) {
            System.out.println("Plat refusé : " + e.getMessage());
        }

        try {
            plateforme.assignerLivreur(c);                         // Bob est libre : OK
            plateforme.assignerLivreur(c);                         // plus personne : exception
        } catch (AucunLivreurException e) {
            System.out.println("Livraison impossible : " + e.getMessage());
        }

        // ===== Q2 : fichier texte =====
        try {
            MenuTexte.ecrire(mario, "menu_mario.txt");
            try (FileWriter fw = new FileWriter("menu_mario.txt", true)) {   // true = ajout en fin
                fw.write("Ligne cassée sans prix\n");
            }
            List<Plat> relus = MenuTexte.lire("menu_mario.txt");
            System.out.println("Relu depuis menu_mario.txt : " + relus);
            MenuTexte.lire("fichier_absent.txt");
        } catch (IOException e) {
            System.out.println("Erreur fichier : " + e.getMessage());
        }

        // ===== Q3 : sérialisation / désérialisation =====
        try {
            Sauvegarde.sauver(plateforme.getRestaurants(), "restaurants.ser");
            List<Restaurant> recharges = Sauvegarde.charger("restaurants.ser");
            for (Restaurant r : recharges) {
                System.out.println("Désérialisé : " + r + " -> " + r.getMenu());
            }
            System.out.println("Même objet que l'original ? " + (recharges.get(0) == mario));
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("Erreur de sérialisation : " + e);
        }

        // transient : le mot de passe n'est PAS sauvegardé
        try {
            List<Client> clients = new ArrayList<>();
            clients.add(alice);
            java.io.ObjectOutputStream oos = new java.io.ObjectOutputStream(new java.io.FileOutputStream("clients.ser"));
            oos.writeObject(clients);
            oos.close();
            java.io.ObjectInputStream ois = new java.io.ObjectInputStream(new java.io.FileInputStream("clients.ser"));
            @SuppressWarnings("unchecked")
            List<Client> relusClients = (List<Client>) ois.readObject();
            ois.close();
            Client a2 = relusClients.get(0);
            System.out.println(a2 + " se connecte avec 1234 ? " + a2.seConnecter("alice@mail.com", "1234"));
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("Erreur : " + e);
        }
    }
}
