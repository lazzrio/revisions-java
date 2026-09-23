public class B {
    public B() { System.out.printf("Exam"); }
    public B(int i) {
        this();
        System.out.println("I5 " + i);
    }
    public static void main(String[] a) { B monB = new B(2010); }
}
