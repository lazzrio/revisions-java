package fastbite.mvc;

/** Le modèle prévient ses « abonnés » sans les connaître : c'est le patron Observateur. */
public interface PanierListener {
    void panierModifie(PanierModele modele);
}
