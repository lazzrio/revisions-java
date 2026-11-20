import java.util.*;

public class Ensembles {
    static class Plat {
        final String nom;
        Plat(String nom) { this.nom = nom; }
        @Override public boolean equals(Object o) {
            if (!(o instanceof Plat)) return false;
            return nom.equals(((Plat) o).nom);
        }
        @Override public int hashCode() { return nom.hashCode(); }   // cohérent avec equals
        @Override public String toString() { return nom; }
    }

    static class Mauvais {
        final String nom;
        Mauvais(String nom) { this.nom = nom; }
        public boolean equals(Mauvais m) { return nom.equals(m.nom); }   // SURCHARGE, pas redéfinition !
    }

    public static void main(String[] args) {
        Set<String> s = new HashSet<>();
        System.out.println(s.add("a"));                 // true
        System.out.println(s.add("a"));                 // false : déjà présent

        Set<Plat> menu = new HashSet<>();
        menu.add(new Plat("pizza"));
        menu.add(new Plat("pizza"));
        System.out.println(menu.size());                // 1

        Map<Plat, Integer> prix = new HashMap<>();
        prix.put(new Plat("pizza"), 12);
        System.out.println(prix.get(new Plat("pizza")));   // 12 : même clé au sens de equals/hashCode

        TreeSet<String> tries = new TreeSet<>(Arrays.asList("wrap", "pizza", "sushi", "pizza"));
        System.out.println(tries);                      // [pizza, sushi, wrap]

        List<Mauvais> l = new ArrayList<>();
        l.add(new Mauvais("x"));
        System.out.println(l.contains(new Mauvais("x")));              // false : contains appelle equals(Object)
        System.out.println(new Mauvais("x").equals(new Mauvais("x"))); // true : ici c'est la surcharge qui est choisie

        try {
            new TreeSet<Plat>().add(new Plat("a"));     // Plat n'est pas Comparable
        } catch (ClassCastException e) {
            System.out.println("ClassCastException");
        }
    }
}
