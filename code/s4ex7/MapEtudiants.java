import java.util.HashMap;

public class MapEtudiants {
    // clé = identifiant unique (String), valeur = l'objet Etudiant
    public HashMap<String, Etudiant> etudiants = new HashMap<>();

    public void ajouter(String id, Etudiant e) {
        if (etudiants.containsKey(id)) {
            System.out.println("Attention : l'identifiant " + id + " existait déjà, il est remplacé.");
        }
        etudiants.put(id, e);    // put écrase l'ancienne valeur si la clé existe
    }
}
