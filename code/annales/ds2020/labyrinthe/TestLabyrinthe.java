/** Test console de la partie « modèle » (sans Swing). */
public class TestLabyrinthe {
    public static void main(String[] args) {
        Cellule[][] m = new Cellule[3][3];
        Cellule.matrice = m;
        for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) m[i][j] = new Cellule(i, j);
        for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) m[i][j].affecterVoisines();
        new Mur(m[0][1]);
        Explorateur o = new Explorateur(m[1][1]);
        afficher(m);
        try { o.allerVers(m[1][1].nord); } catch (ObstacleException e) { System.out.println("nord : " + e.getMessage()); }
        try { o.allerVers(m[1][1].est);  System.out.println("est : OK"); } catch (ObstacleException e) { System.out.println(e.getMessage()); }
        try { o.allerVers(o.getCellule().est); } catch (ObstacleException e) { System.out.println("encore est : " + e.getMessage()); }
        afficher(m);
    }
    static void afficher(Cellule[][] m) {
        for (Cellule[] ligne : m) { for (Cellule c : ligne) System.out.print(c + " "); System.out.println(); }
    }
}
