package fastbite.mvc;

import fastbite.modele.Plat;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionListener;

/** VUE : uniquement de l'affichage. Elle ne calcule rien et ne connaît pas la plateforme. */
public class PanierVue extends JPanel implements PanierListener {
    private final DefaultListModel<Plat> menu = new DefaultListModel<>();
    private final JList<Plat> listeMenu = new JList<>(menu);
    private final DefaultListModel<Plat> panier = new DefaultListModel<>();
    private final JLabel total = new JLabel();
    private final JLabel statut = new JLabel(" ");
    private final JButton ajouter = new JButton("Ajouter");
    private final JButton vider = new JButton("Vider");
    private final JButton valider = new JButton("Valider la commande");

    public PanierVue() {
        setLayout(new BorderLayout(8, 8));
        JPanel centre = new JPanel(new GridLayout(1, 2, 8, 0));
        centre.add(new JScrollPane(listeMenu));
        centre.add(new JScrollPane(new JList<>(panier)));
        JPanel boutons = new JPanel(new FlowLayout());
        boutons.add(ajouter);
        boutons.add(vider);
        boutons.add(valider);
        JPanel sud = new JPanel(new GridLayout(3, 1));
        sud.add(total);
        sud.add(statut);
        sud.add(boutons);
        add(new JLabel("Menu  |  Panier"), BorderLayout.NORTH);
        add(centre, BorderLayout.CENTER);
        add(sud, BorderLayout.SOUTH);
    }

    /** Le contrôleur s'abonne aux boutons : la vue ne sait pas ce qu'ils font. */
    public void ecouterBoutons(ActionListener l) {
        ajouter.addActionListener(l);
        vider.addActionListener(l);
        valider.addActionListener(l);
    }
    public JButton getAjouter() { return ajouter; }
    public JButton getVider() { return vider; }
    public JButton getValider() { return valider; }
    public JList<Plat> getListeMenu() { return listeMenu; }
    public Plat getPlatSelectionne() { return listeMenu.getSelectedValue(); }
    public String getTexteTotal() { return total.getText(); }
    public String getTexteStatut() { return statut.getText(); }

    public void afficherErreur(String message) {
        statut.setText("⚠ " + message);
        if (!GraphicsEnvironment.isHeadless()) {
            JOptionPane.showMessageDialog(this, message, "Erreur", JOptionPane.ERROR_MESSAGE);
        }
    }

    @Override
    public void panierModifie(PanierModele m) {          // appelé par le modèle à chaque changement
        if (menu.isEmpty()) for (Plat p : m.getMenu()) menu.addElement(p);
        panier.clear();
        for (Plat p : m.getPanier()) panier.addElement(p);
        total.setText("Total : " + m.getTotal() + " EUR   (solde " + m.getSolde() + " EUR)");
        statut.setText(m.getDernierMessage());
    }
}
