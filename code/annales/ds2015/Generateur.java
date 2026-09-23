import java.util.*;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class Generateur extends JFrame implements ActionListener {
    JTextField nombreTire = new JTextField();
    JButton boutonAutre = new JButton("Autre nombre");
    JButton boutonQuitter = new JButton("Quitter");
    private final Random r = new Random();

    public int tirerNombreHasard() {
        return r.nextInt(301) + 500;                 // 301 valeurs : 500..800 inclus
    }

    public Generateur() {
        super("Generateur aleatoire");               // constructeur de JFrame(String title)
        nombreTire.setText(String.valueOf(tirerNombreHasard()));
        add(nombreTire, BorderLayout.NORTH);         // JFrame : BorderLayout par défaut
        add(boutonAutre, BorderLayout.CENTER);
        add(boutonQuitter, BorderLayout.SOUTH);
        boutonAutre.addActionListener(this);         // abonnements
        boutonQuitter.addActionListener(this);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(300, 150);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        Object source = e.getSource();
        if (source == boutonAutre) {
            nombreTire.setText(String.valueOf(tirerNombreHasard()));
        } else if (source == boutonQuitter) {
            dispose();                               // ferme la fenêtre
            System.exit(0);                          // termine le programme
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Generateur().setVisible(true));
    }
}
