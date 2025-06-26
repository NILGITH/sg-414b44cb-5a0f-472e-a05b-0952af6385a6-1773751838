import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types"; // Import Database types
import emailService, { ContentForEmail } from "./emailService";
import { menuService } from "./menuService";

export interface ContentSubmission {
  id: string;
  title: string;
  description?: string | null; // Allow null
  content_type: "text" | "image" | "video" | "pdf";
  content_data?: string | null; // Allow null
  file_urls?: string[] | null; // Allow null
  menu_section_id?: string | null; // Allow null
  submenu_section_id?: string | null; // Allow null
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

      return (data as ContentSubmission[] | null) || [];
    } catch (error) {
      console.error('Erreur dans getContentSubmissions:', error);
      return [];
    }
  },

  async createContentSubmission(contentData: ContentFormData, userId: string): Promise<ContentSubmission> {
    try {
      let fileUrls: string[] = [];
      if (contentData.files && contentData.files.length > 0) {
        fileUrls = contentData.files.map(file =>
          `https://storage.capec-ci.com/${Date.now()}-${file.name}`
        );
      }

      const newSubmissionData: Database['public']['Tables']['content_submissions']['Insert'] = {
        title: contentData.title,
        description: contentData.description || null,
        content_type: contentData.content_type,
        content_data: contentData.content_data || null, // Corrected this line
        file_urls: fileUrls.length > 0 ? fileUrls : null,
        menu_section_id: contentData.menu_section_id || null,
        submenu_section_id: contentData.submenu_section_id || null,
        created_by: userId,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('content_submissions')
        .insert([newSubmissionData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la soumission:', error);
        throw error;
      }

      const resultData = data as ContentSubmission;

      if (resultData) {
        try {
          const menus = await menuService.getMenuSections();
          const menuName = resultData.menu_section_id ?
            menus.find(m => m.id === resultData.menu_section_id)?.name || "Menu inconnu" :
            "Non spécifié";
          const submenuName = resultData.submenu_section_id ?
            menus.find(m => m.id === resultData.submenu_section_id)?.name || "Sous-menu inconnu" :
            "Non spécifié";

          const emailContent: ContentForEmail = {
            type: resultData.content_type,
            title: resultData.title,
            description: resultData.description ?? undefined, // Ensure undefined if null for ContentForEmail
            menu: menuName,
            submenu: submenuName,
            files: resultData.file_urls?.map(url => ({
              name: url.split("/").pop() || "fichier",
              type: resultData.content_type,
              url: url
            }))
          };
          await emailService.sendContentSubmission(emailContent);
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email:", emailError);
        }
      }
      return resultData;
    } catch (error) {
      console.error('Erreur dans createContentSubmission:', error);
      throw error;
    }
  },

  async updateContentStatus(id: string, status: "approved" | "rejected"): Promise<ContentSubmission | null> {
    try {
      const updateData: Partial<Database['public']['Tables']['content_submissions']['Update']> = {
        status,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('content_submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }
      return data as ContentSubmission | null;
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
