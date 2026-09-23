package fastbite.modele;

/** Remplace les chaînes "PAYEE", "VALIDEE"… : une faute de frappe devient une erreur de compilation. */
public enum StatutCommande { NOUVELLE, VALIDEE, PAYEE, EN_LIVRAISON, LIVREE }
