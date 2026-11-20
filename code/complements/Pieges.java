class A {
    static int f(int x) { return x + 5; }
    int g(int x) { return 3; }
    String nom = "A";
    String qui() { return "A"; }
    A() { System.out.println("A() voit : " + qui()); }
}

class B extends A {
    static int f(int x) { return x + 4; }        // MASQUE A.f : ce n'est pas une redéfinition
    @Override int g(int x) { return x + 8; }     // redéfinition : choisie à l'exécution
    String nom = "B";                            // nouvel attribut, qui masque celui d'A
    private String suffixe = "!";
    @Override String qui() { return "B" + suffixe; }
}

public class Pieges {
    static String t(Object o) { return "Object"; }
    static String t(String s) { return "String"; }

    public static void main(String[] args) {
        B b = new B();                            // A() voit : Bnull (suffixe pas encore initialisé)
        A a = b;
        System.out.println(A.f(2) * a.g(3));      // 77 = 7 * 11
        System.out.println(a.nom);                // A : un attribut suit le type de la variable
        System.out.println(((B) a).nom);          // B
        Object o = "texte";
        System.out.println(t(o));                 // Object : surcharge choisie à la compilation
        System.out.println(t("x"));               // String
    }
}
