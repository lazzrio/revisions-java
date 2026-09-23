package fastbite.swing;

import fastbite.modele.*;
import fastbite.persistance.MenuTexte;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.IOException;

/** TP6 : fenêtre principale. La classe écoute elle-même ses boutons (implements ActionListener). */
public class FenetreFastBite extends JFrame implements ActionListener {
    private final PlateformeFastBite plateforme;
    private final Client client;
    private Commande commande;

    private final JComboBox<Restaurant> choixResto;
    private final DefaultListModel<Plat> modeleMenu = new DefaultListModel<>();
    private final JList<Plat> listeMenu = new JList<>(modeleMenu);
    private final JTextArea zonePanier = new JTextArea(8, 26);
    private final JLabel etiquetteTotal = new JLabel("Total : 0.0 EUR");
    private final JButton boutonAjouter = new JButton("Ajouter au panier");
    private final JButton boutonCommander = new JButton("Commander");
    private final JButton boutonExporter = new JButton("Exporter le menu (.txt)");

    public FenetreFastBite(PlateformeFastBite plateforme, Client client) {
        super("FastBite — " + client.getNom());          // titre de la fenêtre
        this.plateforme = plateforme;
        this.client = client;

        choixResto = new JComboBox<>(plateforme.getRestaurants().toArray(new Restaurant[0]));
        zonePanier.setEditable(false);

        // ----- mise en page : BorderLayout pour la fenêtre, FlowLayout/GridLayout dedans -----
        JPanel nord = new JPanel(new FlowLayout(FlowLayout.LEFT));
        nord.add(new JLabel("Restaurant :"));
        nord.add(choixResto);

        JPanel boutons = new JPanel(new GridLayout(3, 1, 0, 6));
        boutons.add(boutonAjouter);
        boutons.add(boutonCommander);
        boutons.add(boutonExporter);

        JPanel est = new JPanel(new BorderLayout(0, 6));
        est.add(new JScrollPane(zonePanier), BorderLayout.CENTER);
        est.add(etiquetteTotal, BorderLayout.SOUTH);

        Container cp = getContentPane();
        cp.setLayout(new BorderLayout(8, 8));
        cp.add(nord, BorderLayout.NORTH);
        cp.add(new JScrollPane(listeMenu), BorderLayout.CENTER);
        cp.add(est, BorderLayout.EAST);
        cp.add(boutons, BorderLayout.SOUTH);

        // ----- abonnement des écouteurs -----
        choixResto.addActionListener(this);
        boutonAjouter.addActionListener(this);
        boutonCommander.addActionListener(this);
        boutonExporter.addActionListener(this);

        nouvelleCommande();
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        pack();
        setLocationRelativeTo(null);                       // centrer à l'écran
    }

    private Restaurant restoChoisi() { return (Restaurant) choixResto.getSelectedItem(); }

    private void nouvelleCommande() {
        commande = plateforme.passerCommande(client, restoChoisi());
        modeleMenu.clear();
        for (Plat p : restoChoisi().getMenu()) modeleMenu.addElement(p);
        rafraichirPanier();
    }

    private void rafraichirPanier() {
        StringBuilder sb = new StringBuilder();
        for (Plat p : commande.getPlats()) sb.append("• ").append(p).append('\n');
        zonePanier.setText(sb.toString());
        etiquetteTotal.setText("Total : " + commande.getMontantTotal() + " EUR");
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        Object source = e.getSource();                    // QUI a déclenché l'événement ?
        if (source == choixResto) {
            nouvelleCommande();
        } else if (source == boutonAjouter) {
            Plat p = listeMenu.getSelectedValue();
            if (p == null) { erreur("Sélectionne d'abord un plat."); return; }
            try {
                plateforme.ajouterPlat(commande, p);
                rafraichirPanier();
            } catch (PlatIndisponibleException ex) {
                erreur(ex.getMessage());
            }
        } else if (source == boutonCommander) {
            try {
                plateforme.payer(commande);
                Livraison l = plateforme.assignerLivreur(commande);
                new FenetreSuivi(this, commande, l).setVisible(true);   // 2e fenêtre
                nouvelleCommande();
            } catch (SoldeInsuffisantException | AucunLivreurException ex) {
                erreur(ex.getMessage());
            }
        } else if (source == boutonExporter) {
            JFileChooser chooser = new JFileChooser();
            chooser.setSelectedFile(new File("menu.txt"));
            if (chooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
                try {
                    MenuTexte.ecrire(restoChoisi(), chooser.getSelectedFile().getPath());
                } catch (IOException ex) {
                    erreur("Écriture impossible : " + ex.getMessage());
                }
            }
        }
    }

    private void erreur(String message) {
        JOptionPane.showMessageDialog(this, message, "FastBite", JOptionPane.ERROR_MESSAGE);
    }
}
