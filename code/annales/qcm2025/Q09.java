class A9 { public static int f(int x) { return x + 5; } public int g(int x) { return 3; } }
class D9 extends A9 { public static int f(int x) { return x + 4; } public int g(int x) { return x + 8; } }
public class Q09 { public static void main(String a[]) { D9 d = new D9(); A9 aa = d; System.out.println(A9.f(2) * aa.g(3)); } }
