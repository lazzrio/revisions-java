public class GuichetVideException extends Exception {
    public GuichetVideException(int numero) { super("Le guichet " + numero + " est vide"); }
}
