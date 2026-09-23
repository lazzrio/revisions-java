import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class FormulaireReservation extends JFrame implements ActionListener {
    private JTextField depart, arrivee, dateAller;
    private JRadioButton allerSimple, allerRetour;
    private JCheckBox direct;
    private JButton reservez;

    public FormulaireReservation() {                     // instancie les composants avec leurs valeurs par défaut
        depart = new JTextField("Paris");
        arrivee = new JTextField("Lyon");
        dateAller = new JTextField("15-05-2015");
        allerSimple = new JRadioButton("Aller simple", true);
        allerRetour = new JRadioButton("Aller-retour", false);
        direct = new JCheckBox("Trajet direct", true);
        reservez = new JButton("Réservez");
        miseEnPage();
        dessiner();
    }

    public void dessiner() {
        setTitle("Réservation");
        setSize(360, 260);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public void miseEnPage() {
        ButtonGroup groupe = new ButtonGroup();          // un seul bouton radio coché à la fois
        groupe.add(allerSimple);
        groupe.add(allerRetour);
        Container c = getContentPane();
        c.setLayout(new GridLayout(0, 2, 6, 6));
        c.add(new JLabel("Départ"));   c.add(depart);
        c.add(new JLabel("Arrivée"));  c.add(arrivee);
        c.add(new JLabel("Date aller")); c.add(dateAller);
        c.add(allerSimple);            c.add(allerRetour);
        c.add(direct);                 c.add(reservez);
        reservez.addActionListener(this);                // seul « Réservez » est écouté
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == reservez) dispose();         // ferme la fenêtre
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(FormulaireReservation::new);
    }
}
