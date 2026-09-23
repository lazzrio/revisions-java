import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.*;

public class Labyrinthe extends JFrame implements ActionListener {
    private Cellule matrice[][];
    private JButton grille[][];
    private int nLig, nCol;
    private Explorateur jps;
    private int posX, posY;
    private JButton directions[] = new JButton[4];

    public Labyrinthe() {
        super("Labyrinthe");
        Random r = new Random();
        nLig = r.nextInt(6) + 5;                       // 5..10
        nCol = r.nextInt(6) + 5;
        matrice = new Cellule[nLig][nCol];
        grille = new JButton[nLig][nCol];
        Cellule.matrice = matrice;                     // partage pour getCellule

        // 1) créer TOUTES les cellules avant de chercher les voisines
        for (int i = 0; i < nLig; i++)
            for (int j = 0; j < nCol; j++)
                matrice[i][j] = new Cellule(i, j);

        // 2) voisines + occupant aléatoire (1 chance sur 4 d'être un mur)
        for (int i = 0; i < nLig; i++)
            for (int j = 0; j < nCol; j++) {
                matrice[i][j].affecterVoisines();
                if (r.nextInt(4) == 0) new Mur(matrice[i][j]);   // le constructeur appelle prendreOccupant
                else matrice[i][j].prendreOccupant(null);        // occupant vide
            }

        // 3) position aléatoire de l'explorateur, hors d'un mur
        do {
            posX = r.nextInt(nLig);
            posY = r.nextInt(nCol);
        } while (!matrice[posX][posY].estLibre());
        Cellule depart = matrice[0][0].getCellule(posX, posY);
        jps = new Explorateur(depart);                 // appelle depart.prendreOccupant(jps)

        // 4) boutons de la grille (texte = toString de la cellule)
        JPanel panneauGrille = new JPanel(new GridLayout(nLig, nCol));
        for (int i = 0; i < nLig; i++)
            for (int j = 0; j < nCol; j++) {
                grille[i][j] = new JButton(matrice[i][j].toString());
                panneauGrille.add(grille[i][j]);
            }

        // 5) boutons de direction
        String[] noms = {"est", "ouest", "nord", "sud"};
        JPanel panneauDirections = new JPanel(new GridLayout(1, 4));
        for (int k = 0; k < 4; k++) {
            directions[k] = new JButton(noms[k]);
            directions[k].addActionListener(this);
            panneauDirections.add(directions[k]);
        }

        Container cp = getContentPane();
        cp.setLayout(new BorderLayout());
        cp.add(panneauGrille, BorderLayout.CENTER);
        cp.add(panneauDirections, BorderLayout.SOUTH);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(60 * nCol, 60 * nLig + 60);
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        Cellule ici = jps.getCellule();
        Cellule cible = null;
        Object s = e.getSource();
        if (s == directions[0]) cible = ici.est;
        else if (s == directions[1]) cible = ici.ouest;
        else if (s == directions[2]) cible = ici.nord;
        else if (s == directions[3]) cible = ici.sud;
        try {
            jps.allerVers(cible);
            grille[ici.posX][ici.posY].setText(ici.toString());          // ancienne case : "-"
            Cellule nouv = jps.getCellule();
            grille[nouv.posX][nouv.posY].setText(nouv.toString());       // nouvelle case : "O"
        } catch (ObstacleException ex) {
            // l'explorateur ne bouge pas
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(Labyrinthe::new);
    }
}
