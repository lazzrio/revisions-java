package fastbite.modele;

public class AucunLivreurException extends Exception {
    private static final long serialVersionUID = 1L;
    public AucunLivreurException() { super("Aucun livreur disponible pour le moment"); }
}
