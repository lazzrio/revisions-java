public interface Bureau {
    public Guichet ouvrirNouveauGuichet(int capacite);
    public void ajouterUsager(int numero) throws BureauSature;
}
