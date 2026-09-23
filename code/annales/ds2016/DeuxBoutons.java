import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class DeuxBoutons extends JFrame implements ActionListener {
    UnBouton b1, b2;

    public DeuxBoutons() {
        b1 = new UnBouton("bouton1");
        b2 = new UnBouton("bouton2");
        Container boite = getContentPane();
        boite.setLayout(new FlowLayout());   // sans ça (BorderLayout par défaut), b2 recouvre b1 au CENTER
        boite.add(b1);
        boite.add(b2);
        b1.addActionListener(this);
        b2.addActionListener(this);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        pack();
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        Object o = e.getSource();
        if (o == b1) b2.setText("bouton1");
        else if (o == b2) b1.setText("bouton2");
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(DeuxBoutons::new);
    }
}
