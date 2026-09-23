package fastbite.modele;

import java.io.Serializable;

/** TP4 Q2 : classe ABSTRAITE — on ne crée jamais « un utilisateur » tout court. */
public abstract class Utilisateur implements Serializable {
    private static final long serialVersionUID = 1L;

    protected String nom;
    protected String email;
    protected transient String motDePasse;   // TP5 : transient = jamais écrit dans le .ser

    public Utilisateur(String nom, String email, String motDePasse) {
        this.nom = nom;
        this.email = email;
        this.motDePasse = motDePasse;
    }

    public String getNom()   { return nom; }
    public String getEmail() { return email; }

    public boolean seConnecter(String email, String mdp) {
        return this.email.equals(email) && motDePasse != null && motDePasse.equals(mdp);
    }

    /** Méthodes abstraites : chaque sorte d'utilisateur a SON rôle et SON tableau de bord. */
    public abstract String getRole();
    public abstract void afficherTableauDeBord();

    @Override
    public String toString() { return getRole() + "[" + nom + ", " + email + "]"; }
}
