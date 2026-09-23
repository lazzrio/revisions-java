package fastbite.modele;

public class PlatIndisponibleException extends Exception {
    private static final long serialVersionUID = 1L;
    public PlatIndisponibleException(String plat, String restaurant) {
        super("Le plat « " + plat + " » n'est pas disponible chez " + restaurant);
    }
}
