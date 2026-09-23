import java.awt.*;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JTextField;

public class IHMTel extends JFrame {
    private static final long serialVersionUID = 1L;

    public void affiche() {
        JTextField textField = new JTextField(" ", 25);
        textField.setEditable(false);
        JButton buttonOk = new JButton("OK");
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());
        add("North", textField);
        add("Center", buttonOk);
        Cadran cadran = new Cadran(textField, buttonOk);
        add("South", cadran);
        pack();
        setVisible(true);
    }
}
