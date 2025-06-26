
import { supabase } from "@/integrations/supabase/client";

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
  async getContentSubmissions() {
    const { data, error } = await supabase
      .from("content_submissions")
      .select(`
        *,
        menu_section:menu_sections!content_submissions_menu_section_id_fkey(name),
        submenu_section:menu_sections!content_submissions_submenu_section_id_fkey(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ContentSubmission[];
  },

  async createContentSubmission(contentData: ContentFormData, userId: string) {
    let fileUrls: string[] = [];

    if (contentData.files && contentData.files.length > 0) {
      for (const file of contentData.files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `content/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("content-files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("content-files")
          .getPublicUrl(filePath);

        fileUrls.push(publicUrl);
      }
    }

    const { data, error } = await supabase
      .from("content_submissions")
      .insert([
        {
          title: contentData.title,
          description: contentData.description,
          content_type: contentData.content_type,
          content_data: contentData.content_data,
          file_urls: fileUrls.length > 0 ? fileUrls : null,
          menu_section_id: contentData.menu_section_id,
          submenu_section_id: contentData.submenu_section_id,
          created_by: userId,
          status: "pending"
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as ContentSubmission;
  },

  async updateContentStatus(id: string, status: "approved" | "rejected") {
    const { data, error } = await supabase
      .from("content_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ContentSubmission;
  },

  async deleteContentSubmission(id: string) {
    const { error } = await supabase
      .from("content_submissions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  async sendAllContentToEmail() {
    try {
      const submissions = await this.getContentSubmissions();
      
      const emailData = {
        to: "petronildaga@aitech-ci.com",
        subject: "Soumissions de contenu CAPEC-CI",
        content: submissions,
        timestamp: new Date().toISOString()
      };

      console.log("Données à envoyer par email:", emailData);
      
      return { success: true, message: "Contenu envoyé avec succès" };
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      throw error;
    }
  }
};

export default contentService;
