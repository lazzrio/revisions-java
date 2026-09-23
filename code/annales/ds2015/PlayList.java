import java.util.ArrayList;

public class PlayList {
    public static ArrayList<Video> liste = new ArrayList<>();

    public static Video rechercher(String titre) throws VideoInexistante {
        for (Video v : liste) {
            if (v.getTitre().equals(titre)) {       // equals, JAMAIS == pour comparer des String
                return v;
            }
        }
        throw new VideoInexistante(titre);
    }

    public float moyenne() throws NotesNulles {
        float somme = 0;
        int nb = 0;
        for (Video v : liste) {
            if (v instanceof BandeAnnonce) {         // seules les bandes annonces ont une note
                float n = ((BandeAnnonce) v).getNote();
                if (n != 0) { somme += n; nb++; }
            }
        }
        if (nb == 0) throw new NotesNulles();
        return somme / nb;
    }

    /** Trie les bandes annonces par note décroissante (sans toucher à la playlist) et les affiche. */
    public void trierEtAfficher() {
        ArrayList<BandeAnnonce> ba = new ArrayList<>();
        for (Video v : liste) if (v instanceof BandeAnnonce) ba.add((BandeAnnonce) v);

        for (int i = 0; i < ba.size() - 1; i++) {           // tri par sélection, ordre décroissant
            int iMax = i;
            for (int j = i + 1; j < ba.size(); j++) {
                if (ba.get(j).getNote() > ba.get(iMax).getNote()) iMax = j;
            }
            BandeAnnonce tmp = ba.get(i);
            ba.set(i, ba.get(iMax));
            ba.set(iMax, tmp);
        }
        for (BandeAnnonce b : ba) {
            System.out.println(b.getTitre() + " ; " + b.getDuree() + " s ; note " + b.getNote());
        }
        try {
            System.out.println("Moyenne des notes non nulles = " + moyenne());
        } catch (NotesNulles e) {
            System.out.println(e.getMessage());
        }
    }

    public static void main(String[] args) throws Exception {
        PlayList p = new PlayList();
        liste.add(new BandeAnnonce("Dune 3", 150, 4.5f));
        liste.add(new Publicite("Pub café", 30, "Nespresso"));
        liste.add(new BandeAnnonce("Toy Story 5", 120, 0f));
        liste.add(new BandeAnnonce("Mission 9", 140, 3.5f));
        System.out.println("Trouvé : " + rechercher("Pub café").getTitre());
        p.trierEtAfficher();
        new BandeAnnonce("Nouveau", 90, 0f).setNote(5f, "Nouveau", p);   // absente -> ajoutée
        System.out.println("Taille de la playlist après setNote : " + liste.size());
        try { rechercher("Inconnu"); } catch (VideoInexistante e) { System.out.println(e.getMessage()); }
    }
}
