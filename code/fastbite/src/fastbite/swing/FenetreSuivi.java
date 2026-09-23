package fastbite.swing;

import fastbite.modele.Commande;
import fastbite.modele.Livraison;

import javax.swing.*;
import java.awt.*;

/** Deuxième fenêtre (boîte de dialogue modale) : navigation entre pages du storyboard. */
public class FenetreSuivi extends JDialog {
    public FenetreSuivi(JFrame parent, Commande c, Livraison l) {
        super(parent, "Suivi de la commande #" + c.getNumero(), true);   // true = modale
        JPanel p = new JPanel(new GridLayout(0, 1, 4, 4));
        p.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
        p.add(new JLabel("Commande : " + c.getPlats()));
        p.add(new JLabel("Montant : " + c.getMontantTotal() + " EUR"));
        p.add(new JLabel("Livreur : " + l.getLivreur().getNom()));
        JButton fermer = new JButton("Fermer");
        fermer.addActionListener(e -> dispose());                           // listener en lambda
        p.add(fermer);
        setContentPane(p);
        pack();
        setLocationRelativeTo(parent);
    }
}
