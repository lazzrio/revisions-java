interface Bureau {
    public Guichet ouvrirNouveauGuichet(int taille);
    public void ajouterUsager(int numero) throws FilePleineException;
    public int retirerPremierUsager(Guichet g) throws GuichetVideException;
}
