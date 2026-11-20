public class Memoire {
    static class Point {
        int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }

        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Point)) return false;
            Point p = (Point) o;
            return x == p.x && y == p.y;
        }
        @Override public int hashCode() { return 31 * x + y; }
        @Override public String toString() { return "(" + x + "," + y + ")"; }
    }

    static void modifier(Point q, int m) {
        q.x = 9;                  // agit sur l'OBJET partagé : visible par l'appelant
        q = new Point(7, 7);      // q désigne un autre objet : l'appelant n'est pas touché
        m = 0;                    // modifie la COPIE locale de l'entier
    }

    static void echanger(char[] t, int i, int j) {   // un tableau est un objet : ça marche
        char c = t[i]; t[i] = t[j]; t[j] = c;
    }

    static void echangerRate(int a, int b) {         // deux int copiés : l'appelant ne voit rien
        int c = a; a = b; b = c;
    }

    public static void main(String[] args) {
        Point a = new Point(1, 2);
        Point b = new Point(3, 4);
        Point c = a;                          // copie de la référence, pas de l'objet
        System.out.println(a == c);           // true
        a = b;                                // a désigne maintenant l'objet de b
        System.out.println(a == b);           // true
        System.out.println(c);                // (1,2) : l'ancien objet survit grâce à c

        Point d = new Point(3, 4);
        System.out.println(a == d);           // false : deux objets distincts
        System.out.println(a.equals(d));      // true : même contenu

        int n = 5;
        modifier(b, n);
        System.out.println(b + " " + n);      // (9,4) 5

        char[] t = {'a', 'b'};
        echanger(t, 0, 1);
        System.out.println(t[0] + "" + t[1]); // ba
        int u = 1, v = 2;
        echangerRate(u, v);
        System.out.println(u + " " + v);      // 1 2

        Point e = null;
        try { e.x = 1; } catch (NullPointerException ex) { System.out.println("NPE"); }

        String[] noms = new String[3];        // 3 références null, aucun String créé
        System.out.println(noms[0]);          // null
    }
}
