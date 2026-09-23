class G {
    G(int i) { System.out.println("Success!"); }
}
public class H extends G {
    public static void main(String argv[]) { H h = new H(); }
    H() { super(10); }
}
