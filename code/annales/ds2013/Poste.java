import java.util.Random;

public class Poste {
    public static void main(String args[]) {
        int nbUsagers, nbGuichets;
        try {
            if (args.length != 2) throw new IllegalArgumentException("il faut 2 arguments");
            nbUsagers = Integer.parseInt(args[0]);        // NumberFormatException si "abc"
            nbGuichets = Integer.parseInt(args[1]);
            if (nbUsagers < 200 || nbUsagers > 300 || nbGuichets < 1 || nbGuichets > 5)
                throw new IllegalArgumentException("valeurs hors bornes");
        } catch (NumberFormatException e) {
            System.out.println("Erreur de format : " + e.getMessage());
            return;
        } catch (IllegalArgumentException e) {
            System.out.println("Erreur d'arguments : " + e.getMessage());
            return;
        }

        Random r = new Random();
        BureauImplemente bureau = new BureauImplemente(nbGuichets);
        for (int i = 0; i < nbGuichets; i++) bureau.ouvrirNouveauGuichet(r.nextInt(16) + 15);   // 15..30

        for (int numero = 1; numero <= nbUsagers; numero++) {
            try {
                bureau.ajouterUsager(numero);
            } catch (FilePleineException e) {
                numero--;                                    // on retentera ce même usager
                for (int i = 0; i < nbGuichets; i++) {
                    try {
                        int servi = bureau.retirerPremierUsager(bureau.guichets[i]);
                        System.out.println("guichet " + (i + 1) + " sert l'usager " + servi);
                    } catch (GuichetVideException ex) {
                        System.out.println(ex.getMessage());
                    }
                }
            }
        }
    }
}
