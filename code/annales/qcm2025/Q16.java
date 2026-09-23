class Maman { public String getVal() { return "Maman"; } public Maman() { System.out.print(this.getVal()); } }
class Fifille extends Maman { public String getVal() { return "Fifille"; } public Fifille() { super(); } }
public class Q16 { public static void main(String a[]) { new Fifille(); new Maman(); System.out.println(); } }
