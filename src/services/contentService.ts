import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import emailService, { ContentForEmail } from "./emailService";
import { menuService } from "./menuService";

export interface ContentSubmission {
  id: string;
  title: string;
  description?: string | null;
  content_type: "text" | "image" | "video" | "pdf";
  content_data?: string | null;
  file_urls?: string[] | null;
  menu_section_id?: string | null;
  submenu_section_id?: string | null;
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

  async ensureBucketExists(): Promise<boolean> {
    try {
      // Vérifier si le bucket existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Erreur lors de la vérification des buckets:', listError);
        return false;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === 'content-files');
      
      if (!bucketExists) {
        // Créer le bucket s'il n'existe pas
        const { error: createError } = await supabase.storage.createBucket('content-files', {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'text/*', 'application/*']
        });

        if (createError) {
          console.error('Erreur lors de la création du bucket:', createError);
          return false;
        }
        
        console.log('Bucket content-files créé avec succès');
      }
      
      return true;
    } catch (error) {
      console.error('Erreur dans ensureBucketExists:', error);
      return false;
    }
  },

  async uploadFileToSupabase(file: File, userId: string): Promise<string | null> {
    try {
      // S'assurer que le bucket existe
      const bucketReady = await this.ensureBucketExists();
      if (!bucketReady) {
        console.error('Impossible de créer ou vérifier le bucket');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('Uploading file to Supabase:', fileName, 'Size:', file.size);
      
      // Upload avec options pour éviter les conflits
      const { data, error } = await supabase.storage
        .from('content-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur upload Supabase:', error);
        // Essayer avec upsert si le fichier existe déjà
        if (error.message.includes('already exists')) {
          const retryFileName = `${userId}/${Date.now()}-retry-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const { data: retryData, error: retryError } = await supabase.storage
            .from('content-files')
            .upload(retryFileName, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (retryError) {
            console.error('Erreur retry upload:', retryError);
            return null;
          }
          
          if (retryData) {
            const { data: urlData } = supabase.storage
              .from('content-files')
              .getPublicUrl(retryData.path);
            
            console.log('File uploaded successfully (retry):', urlData.publicUrl);
            return urlData.publicUrl;
          }
        }
        return null;
      }

      if (data) {
        // Générer l'URL publique correctement
        const { data: urlData } = supabase.storage
          .from('content-files')
          .getPublicUrl(data.path);
        
        console.log('File uploaded successfully:', urlData.publicUrl);
        
        // Vérifier que l'URL est bien formée
        if (urlData.publicUrl && urlData.publicUrl.includes('/storage/v1/object/public/content-files/')) {
          return urlData.publicUrl;
        } else {
          console.error('URL publique mal formée:', urlData.publicUrl);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      return null;
    }
  },

  async createContentSubmission(contentData: ContentFormData, userId: string): Promise<ContentSubmission> {
    try {
      const fileUrls: string[] = [];
      
      if (contentData.files && contentData.files.length > 0) {
        console.log('Uploading files to Supabase Storage...');
        
        for (const file of contentData.files) {
          const uploadedUrl = await this.uploadFileToSupabase(file, userId);
          if (uploadedUrl) {
            fileUrls.push(uploadedUrl);
            console.log(`✅ File uploaded successfully: ${file.name} -> ${uploadedUrl}`);
          } else {
            console.error(`❌ Failed to upload file: ${file.name}`);
            // Ne pas ajouter d'URL de remplacement - laisser échouer si l'upload ne marche pas
            throw new Error(`Impossible d'uploader le fichier: ${file.name}`);
          }
        }
        
        console.log('All files uploaded successfully:', fileUrls);
      }

      const newSubmissionData: Database['public']['Tables']['content_submissions']['Insert'] = {
        title: contentData.title,
        description: contentData.description || null,
        content_type: contentData.content_type,
        content_data: contentData.content_data || null,
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
            description: resultData.description ?? undefined,
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
