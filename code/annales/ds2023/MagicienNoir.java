public class MagicienNoir extends Magicien {

    // constructeur « par copie » : on recopie l'état d'un autre Magicien
    public MagicienNoir(Magicien m) {
        super(m.point_vie, m.point_defense);           // OK : même package (protected = package + filles)
        setPoint_magie(3);                             // point_magie est private dans Magicien : on passe par le setter
    }
}
