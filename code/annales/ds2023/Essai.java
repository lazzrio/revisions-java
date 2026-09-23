public class Essai {
    public void swap(char tab[], int a, int b) {
        char c = tab[a];
        tab[a] = tab[b];
        tab[b] = c;
    }
    public void display(char tab[]) {
        for (int i = 0; i < tab.length; i++) {
            System.out.print(tab[i] + ",");
        }
    }
    public void mystery(char tab[]) {
        int min = 0;
        for (int i = 0; i < tab.length - 1; i++) {
            for (int j = i; j < tab.length; j++) {
                if (j == i) min = j;
                if (tab[j] > tab[min]) min = j;
            }
            swap(tab, i, min);
        }
    }
    public static void main(String argv[]) {
        char tab[] = {'a', 'b', 'd', 'c'};
        Essai test = new Essai();
        test.mystery(tab);
        test.display(tab);
        System.out.println();
    }
}
