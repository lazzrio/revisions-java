class A2 { public void prn() { System.out.println(this.getVal()); } public int getVal() { return 10; } }
class B2 extends A2 { public int getVal() { return 20; } }
public class Q02 extends B2 { public static void main(String a[]) { new B2().prn(); new Q02().prn(); } }
