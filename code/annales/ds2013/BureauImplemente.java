public class BureauImplemente implements Bureau {
    public int nbGuichets;
    public Guichet[] guichets;
    private int nbOuverts = 0;

    public BureauImplemente(int nbGuichets) {
        this.nbGuichets = nbGuichets;
        guichets = new Guichet[nbGuichets];
    }

    @Override
    public Guichet ouvrirNouveauGuichet(int taille) {
        Guichet g = new Guichet(taille);
        g.numero = nbOuverts + 1;
        guichets[nbOuverts++] = g;
        return g;
    }

    @Override
    public void ajouterUsager(int numero) throws FilePleineException {
        Guichet min = null;
        for (int i = 0; i < nbOuverts; i++) {
            Guichet g = guichets[i];
            if (!g.estPleine() && (min == null || g.longueur < min.longueur)) min = g;
        }
        if (min == null) throw new FilePleineException();
        min.file[min.longueur] = numero;     // ajout en FIN de file
        min.longueur++;
        System.out.println("usager " + numero + " -> guichet " + min.numero
                + " (longueur " + min.longueur + "/" + min.tailleLimite + ")");
    }

    @Override
    public int retirerPremierUsager(Guichet g) throws GuichetVideException {
        if (g.longueur == 0) throw new GuichetVideException(g.numero);
        int premier = g.file[0];
        for (int i = 1; i < g.longueur; i++) g.file[i - 1] = g.file[i];   // décaler vers la gauche
        g.longueur--;
        return premier;
    }
}
