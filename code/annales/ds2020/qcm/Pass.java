public class Pass {
    static int j = 20;
    public static void main(String[] args) {
        int i = 10;
        Pass p = new Pass();
        p.maMethod(i);
        System.out.printf("%d %d%n", i, j);
    }
    public void maMethod(int x) {
        x = x * 2;
        j = j * 2;
    }
}
