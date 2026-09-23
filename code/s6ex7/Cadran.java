import javax.swing.*;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

// Cadran écoute lui-même ses boutons : il connaît la zone de texte et le bouton OK
public class Cadran extends JPanel implements ActionListener {
    private static final long serialVersionUID = 1L;
    private static final int MAX_CHIFFRES = 8;

    JTextField textfield;
    JButton buttonOk;
    JButton buttons[] = new JButton[9];
    JButton buttonBis = new JButton("Bis");
    JButton buttonZero = new JButton("0");
    JButton buttonReset = new JButton("Reset");

    private String numeroValide = "";          // dernier numéro validé par OK (pour « Bis »)

    Cadran(JTextField textfieldParam, JButton buttonOkParam) {
        this.textfield = textfieldParam;
        this.buttonOk = buttonOkParam;
        setLayout(new GridLayout(4, 3));

        for (int i = 0; i < buttons.length; i++) {
            add(buttons[i] = new JButton("" + (i + 1)));
            buttons[i].addActionListener(this);      // 1) abonner chaque chiffre
        }
        add(buttonBis);
        add(buttonZero);
        add(buttonReset);

        buttonZero.addActionListener(this);
        buttonBis.addActionListener(this);
        buttonReset.addActionListener(this);
        buttonOk.addActionListener(this);            // OK est créé dans IHMTel mais écouté ici
        textfield.setText("");
    }

    @Override
    public void actionPerformed(ActionEvent e) {     // 2) UNE méthode pour tous les boutons
        Object source = e.getSource();               // quel bouton a été cliqué ?
        String affiche = textfield.getText();

        if (source == buttonReset) {                 // 3) Reset : on vide la zone
            textfield.setText("");
        } else if (source == buttonOk) {             // 4) OK : on mémorise le numéro saisi
            numeroValide = affiche;
            System.out.println("Numéro validé : " + numeroValide);
        } else if (source == buttonBis) {            // 5) Bis : on recopie le dernier numéro validé
            textfield.setText(numeroValide);
        } else {                                     // 1) + 2) un chiffre : on l'ajoute (max 8)
            if (affiche.length() < MAX_CHIFFRES) {
                String chiffre = ((JButton) source).getText();
                textfield.setText(affiche + chiffre);
            }
        }
    }
}
