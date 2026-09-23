package fastbite.mvc;

import fastbite.modele.*;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

/** CONTRÔLEUR : traduit un clic en appel au modèle, et une exception en message pour la vue. */
public class PanierControleur implements ActionListener {
    private final PanierModele modele;
    private final PanierVue vue;

    public PanierControleur(PanierModele modele, PanierVue vue) {
        this.modele = modele;
        this.vue = vue;
        vue.ecouterBoutons(this);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        Object s = e.getSource();
        try {
            if (s == vue.getAjouter()) {
                Plat p = vue.getPlatSelectionne();
                if (p == null) { vue.afficherErreur("Sélectionne un plat"); return; }
                modele.ajouter(p);
            } else if (s == vue.getVider()) {
                modele.vider();
            } else if (s == vue.getValider()) {
                modele.valider();
            }
        } catch (PlatIndisponibleException | SoldeInsuffisantException | AucunLivreurException ex) {
            vue.afficherErreur(ex.getMessage());
        }
    }
}
