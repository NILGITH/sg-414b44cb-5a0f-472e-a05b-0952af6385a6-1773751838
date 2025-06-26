import { supabase } from "@/integrations/supabase/client";
import emailService, { ContentForEmail } from "./emailService";
import { menuService } from "./menuService";

export interface ContentSubmission {
  id: string;
  title: string;
  description?: string;
  content_type: "text" | "image" | "video" | "pdf";
  content_data?: string;
  file_urls?: string[];
  menu_section_id?: string;
  submenu_section_id?: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContentFormData {
  title: string;
  description?: string;
  content_type: "text" | "image" | "video" | "pdf";
  content_data?: string;
  files?: File[];
  menu_section_id?: string;
  submenu_section_id?: string;
}

export const contentService = {
  async getContentSubmissions(): Promise<ContentSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('content_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des soumissions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getContentSubmissions:', error);
      return [];
    }
  },

  async createContentSubmission(contentData: ContentFormData, userId: string): Promise<ContentSubmission> {
    try {
      // Simuler l'upload de fichiers
      let fileUrls: string[] = [];
      if (contentData.files && contentData.files.length > 0) {
        fileUrls = contentData.files.map(file => 
          `https://storage.capec-ci.com/${Date.now()}-${file.name}`
        );
      }

      const newSubmission = {
        title: contentData.title,
        description: contentData.description,
        content_type: contentData.content_type,
        content_data: contentData.content_data,
        file_urls: fileUrls,
        menu_section_id: contentData.menu_section_id,
        submenu_section_id: contentData.submenu_section_id,
        created_by: userId,
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('content_submissions')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert([newSubmission as any]) // Cast to any
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la soumission:', error);
        throw error;
      }

      // Envoyer par email automatiquement avec les noms des menus
      if (data) { // Add null check for data
        try {
          const menus = await menuService.getMenuSections();
          const menuName = data.menu_section_id ? 
            menus.find(m => m.id === data.menu_section_id)?.name || "Menu inconnu" : 
            "Non spécifié";
          const submenuName = data.submenu_section_id ? 
            menus.find(m => m.id === data.submenu_section_id)?.name || "Sous-menu inconnu" : 
            "Non spécifié";

          const emailContent: ContentForEmail = {
            type: data.content_type,
            title: data.title,
            description: data.description,
            menu: menuName,
            submenu: submenuName,
            files: data.file_urls?.map(url => ({ 
              name: url.split("/").pop() || "fichier", 
              type: data.content_type,
              url: url
            }))
          };
          await emailService.sendContentSubmission(emailContent);
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email:", emailError);
        }
      }

      return data as ContentSubmission; // data could be null, ensure it's handled or asserted if sure
    } catch (error) {
      console.error('Erreur dans createContentSubmission:', error);
      throw error;
    }
  },

  async updateContentStatus(id: string, status: "approved" | "rejected"): Promise<ContentSubmission | null> {
    try {
      const { data, error } = await supabase
        .from('content_submissions')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ 
          status,
          updated_at: new Date().toISOString()
        } as any) // Cast to any
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans updateContentStatus:', error);
      return null;
    }
  },

  async deleteContentSubmission(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur dans deleteContentSubmission:', error);
      return false;
    }
  },

  async sendAllContentToEmail() {
    try {
      const submissions = await this.getContentSubmissions();
      const result = await emailService.sendAllContentData(submissions);
      
      if (result.success) {
        return { 
          success: true, 
          message: `Contenu envoyé avec succès à petronildaga@capec-ci.org (${submissions.length} éléments)` 
        };
      } else {
        throw new Error(result.message || "Erreur inconnue lors de l'envoi de l'email");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'envoi des données par email";
      throw new Error(errorMessage);
    }
  }
};

export default contentService;
