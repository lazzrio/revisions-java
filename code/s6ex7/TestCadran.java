import javax.swing.*;
// Test sans fenêtre : on simule les clics avec doClick()
public class TestCadran {
    public static void main(String[] args) {
        JTextField tf = new JTextField(" ", 25);
        JButton ok = new JButton("OK");
        Cadran c = new Cadran(tf, ok);
        for (int k = 0; k < 10; k++) c.buttons[k % 9].doClick();   // 10 clics : seuls 8 passent
        System.out.println("Après 10 chiffres : [" + tf.getText() + "]");
        ok.doClick();
        c.buttonReset.doClick();
        System.out.println("Après Reset : [" + tf.getText() + "]");
        c.buttonZero.doClick(); c.buttons[5].doClick();
        System.out.println("Nouvelle saisie : [" + tf.getText() + "]");
        c.buttonBis.doClick();
        System.out.println("Après Bis : [" + tf.getText() + "]");
    }
}
