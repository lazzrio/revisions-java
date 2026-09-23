class D11 { public int x; public D11() { x = 3; } public D11(int a) { this(); x = x + a; }
            public D11(int a, int b) { this(b); x = x - a; } }
public class Q11 { public static void main(String a[]) { D11 d = new D11(5, 6); System.out.println(d.x); } }
