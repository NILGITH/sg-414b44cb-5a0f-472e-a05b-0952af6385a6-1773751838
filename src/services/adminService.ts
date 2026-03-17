import { supabase } from "@/integrations/supabase/client";

export const adminService = {
  /**
   * Créer un nouvel utilisateur avec email et mot de passe
   * Note: Cette fonction nécessite les privilèges admin
   */
  async createUser(email: string, password: string, fullName: string, role: "admin" | "user" = "user") {
    try {
      // Créer l'utilisateur via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (authError) {
        console.error("Erreur lors de la création de l'utilisateur:", authError);
        throw authError;
      }

      if (authData.user) {
        // Mettre à jour le profil
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: role
          });

        if (profileError) {
          console.error("Erreur lors de la création du profil:", profileError);
          throw profileError;
        }

        return {
          success: true,
          user: authData.user,
          message: `Utilisateur ${email} créé avec succès`
        };
      }

      return {
        success: false,
        message: "Erreur lors de la création de l'utilisateur"
      };
    } catch (error) {
      console.error("Erreur dans createUser:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue"
      };
    }
  },

  /**
   * Initialiser les utilisateurs par défaut
   */
  async initializeDefaultUsers() {
    try {
      const users = [
        {
          email: "admin@capec-ci.org",
          password: "CapecAdmin2024!",
          fullName: "Administrateur CAPEC",
          role: "admin" as const
        },
        {
          email: "user@capec-ci.org",
          password: "CapecUser2024!",
          fullName: "Utilisateur CAPEC",
          role: "user" as const
        }
      ];

      const results = [];
      for (const user of users) {
        const result = await this.createUser(user.email, user.password, user.fullName, user.role);
        results.push(result);
      }

      return {
        success: true,
        results: results,
        message: "Utilisateurs initialisés avec succès"
      };
    } catch (error) {
      console.error("Erreur lors de l'initialisation des utilisateurs:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de l'initialisation"
      };
    }
  }
};

export default adminService;