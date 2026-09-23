// ============================================================
// CLASSE Main : contient le PROGRAMME PRINCIPAL.
// La méthode "main" est le point d'entrée du programme,
// obligatoirement "public static void main(String[] args)".
//
// - "static" : appartient à la CLASSE (pas à un objet), on peut
//   l'appeler sans faire de "new Main()".
// - "void"   : ne retourne rien.
// - "args"   : arguments passés en ligne de commande.
// ============================================================
public class Main {
    public static void main(String[] args) {

        // --------------------------------------------------------
        // INSTANCIATION : on crée un OBJET Livre en mémoire.
        // L'opérateur "new" :
        //   1. réserve la mémoire pour le nouvel objet,
        //   2. appelle le CONSTRUCTEUR correspondant,
        //   3. retourne la référence vers l'objet.
        // --------------------------------------------------------

        // livre1 utilise le constructeur SANS paramètre :
        // ses attributs sont initialisés aux valeurs par défaut
        // définies dans le constructeur Livre().
        Livre livre1 = new Livre();

        // On appelle les méthodes de saisie sur livre1.
        // Syntaxe : nomObjet.nomMethode(arguments)
        livre1.saisirTitre();
        livre1.saisirAnnee();

        // saisirNbNotes RETOURNE un int : on le stocke dans nb
        // pour le passer à saisirNotes.
        int nb = livre1.saisirNbNotes();
        livre1.saisirNotes(nb);

        System.out.println();
        System.out.println("--- Livre 1 (saisi au clavier) ---");
        livre1.afficherInfos();


        // --------------------------------------------------------
        // livre2 utilise le constructeur AVEC PARAMÈTRES.
        // Les 3 chaînes/entiers sont passés directement au new.
        // C'est la SURCHARGE de constructeur qui rend cela possible.
        // --------------------------------------------------------
        Livre livre2 = new Livre("1984", "Orwell", 1949);

        System.out.println();
        System.out.println("--- Livre 2 (cree avec parametres) ---");
        livre2.afficherInfos();  // aucune note -> moyenne 0.0
    }
}
