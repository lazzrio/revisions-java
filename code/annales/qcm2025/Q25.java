import java.io.*;
public class Q25 {
    public static void main(String argv[]) { System.out.println(new Q25().work()); }
    public int work() {
        try {
            FileInputStream dis = new FileInputStream("Hello.txt");
            System.out.print("File found.");
            return 0;
        } catch (FileNotFoundException fne) {
            System.out.print("No such file found.");
            return -1;
        } finally {
            System.out.print("Doing finally.");
        }
    }
}
