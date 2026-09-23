import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Scanner;

public class Reservation {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        SimpleDateFormat format = new SimpleDateFormat("dd-MM-yyyy");
        format.setLenient(false);                          // refuse 32-13-2015
        try {
            System.out.print("Retour (true/false) ? ");  boolean retour = sc.nextBoolean();
            System.out.print("Direct (true/false) ? ");  boolean direct = sc.nextBoolean();
            System.out.print("Gare de départ ? ");       String gDep = sc.next();
            System.out.print("Gare d'arrivée ? ");       String gArr = sc.next();
            System.out.print("Date aller (dd-MM-yyyy) ? "); Date dAller = format.parse(sc.next());
            System.out.print("Heure aller ? ");          int hAller = sc.nextInt();
            System.out.print("Nombre de passagers ? ");  int nb = sc.nextInt();
            System.out.print("Classe (1 ou 2) ? ");      int confort = sc.nextInt();
            Date dRetour = null; int hRetour = 0;
            if (retour) {
                System.out.print("Date retour ? ");      dRetour = format.parse(sc.next());
                System.out.print("Heure retour ? ");     hRetour = sc.nextInt();
            }

            Personne client = new Personne();
            Gare depart = new Gare(gDep), arrivee = new Gare(gArr);
            Voyage v = new Voyage(retour, direct, nb, confort);
            v.aller(depart, arrivee, dAller, hAller);
            if (retour) v.revenir(dRetour, hRetour);
            v.reserver(client, nb);
            System.out.println("\nRéservé : " + v);
        } catch (Exception e) {                           // InputMismatchException ou ParseException
            System.out.println("\nErreur de saisie : " + e);
        }
    }
}
