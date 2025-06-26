
import { supabase } from "@/integrations/supabase/client";
import { ContentItem, ContentFormData } from "@/types/content";

export const contentService = {
  async getContent() {
    const { data, error } = await supabase
      .from("content_items")
      .select(`
        *,
        menu:menus(name),
        submenu:menus!content_items_submenu_id_fkey(name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ContentItem[];
  },

  async createContent(contentData: ContentFormData, userId: string) {
    let fileUrl = null;

    if (contentData.file) {
      const fileExt = contentData.file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("content-files")
        .upload(filePath, contentData.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("content-files")
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
    }

    const { data, error } = await supabase
      .from("content_items")
      .insert([
        {
          title: contentData.title,
          description: contentData.description,
          content_type: contentData.content_type,
          content_data: contentData.content_data,
          file_url: fileUrl,
          menu_id: contentData.menu_id,
          submenu_id: contentData.submenu_id,
          created_by: userId,
          status: "pending"
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as ContentItem;
  },

  async updateContentStatus(id: string, status: "approved" | "rejected") {
    const { data, error } = await supabase
      .from("content_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ContentItem;
  },

  async deleteContent(id: string) {
    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
};

export default contentService;
