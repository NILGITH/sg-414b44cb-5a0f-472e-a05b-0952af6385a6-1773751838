import { supabase } from "@/integrations/supabase/client";
import emailService from "./emailService";

export interface MenuSection {
  id: string;
  name: string;
  parent_id?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuChangeRequest {
  id: string;
  old_menu_name: string;
  new_menu_name: string;
  is_submenu: boolean;
  parent_menu_name?: string | null;
  status: "pending" | "approved" | "rejected";
  requested_by?: string | null;
  created_at: string;
  updated_at: string;
}

export const menuService = {
  async getMenuSections(): Promise<MenuSection[]> {
    try {
      const { data, error } = await supabase
        .from('menu_sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des menus:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getMenuSections:', error);
      return [];
    }
  },

  async getMenusWithSubmenus() {
    try {
      const menus = await this.getMenuSections();
      const mainMenus = menus.filter(menu => !menu.parent_id);
      
      return mainMenus.map(menu => ({
        ...menu,
        submenus: menus.filter(submenu => submenu.parent_id === menu.id)
      }));
    } catch (error) {
      console.error('Erreur dans getMenusWithSubmenus:', error);
      return [];
    }
  },

  async createMenuChangeRequest(requestData: {
    old_menu_name: string;
    new_menu_name: string;
    is_submenu: boolean;
    parent_menu_name?: string;
  }, userId: string): Promise<MenuChangeRequest> {
    try {
      const newRequest = {
        ...requestData,
        requested_by: userId,
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('menu_change_requests')
        .insert([newRequest as any])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la demande:', error);
        throw error;
      }

      if (data) {
        try {
          await emailService.sendMenuChangeRequest(data as unknown as MenuChangeRequest, userId);
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email:", emailError);
        }
      }

      return data as unknown as MenuChangeRequest;
    } catch (error) {
      console.error('Erreur dans createMenuChangeRequest:', error);
      throw error;
    }
  },

  async getMenuChangeRequests(): Promise<MenuChangeRequest[]> {
    try {
      const { data, error } = await supabase
        .from('menu_change_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        throw error;
      }

      return (data as unknown as MenuChangeRequest[]) || [];
    } catch (error) {
      console.error('Erreur dans getMenuChangeRequests:', error);
      return [];
    }
  },

  async updateMenuChangeRequestStatus(id: string, status: "approved" | "rejected"): Promise<MenuChangeRequest | null> {
    try {
      // 1. Récupérer les détails de la demande
      const { data: request, error: fetchError } = await supabase
        .from('menu_change_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !request) {
        console.error("Demande introuvable");
        return null;
      }

      // 2. Si approuvé, appliquer le changement à la structure réelle
      if (status === "approved") {
        if (request.old_menu_name === "Nouveau") {
          // LOGIQUE DE CRÉATION
          let parent_id = null;
          
          // Si c'est un sous-menu, on cherche l'ID du parent par son nom
          if (request.is_submenu && request.parent_menu_name) {
            const { data: parent } = await supabase
              .from('menu_sections')
              .select('id')
              .eq('name', request.parent_menu_name)
              .maybeSingle();
            
            parent_id = parent?.id || null;
          }

          // Insertion dans la structure réelle
          // Chercher le display_order max pour mettre à la fin
          const { data: maxOrder } = await supabase
            .from('menu_sections')
            .select('display_order')
            .eq('parent_id', parent_id as any)
            .order('display_order', { ascending: false })
            .limit(1)
            .maybeSingle();

          const nextOrder = (maxOrder?.display_order ?? -1) + 1;

          const { error: insertError } = await supabase
            .from('menu_sections')
            .insert([{
              name: request.new_menu_name,
              parent_id: parent_id,
              display_order: nextOrder,
              slug: request.new_menu_name.toLowerCase().replace(/ /g, '-')
            }]);

          if (insertError) console.error("Erreur lors de l'insertion du menu:", insertError);
        } else {
          // LOGIQUE DE MODIFICATION
          const { error: updateError } = await supabase
            .from('menu_sections')
            .update({ name: request.new_menu_name })
            .eq('name', request.old_menu_name);

          if (updateError) console.error("Erreur lors de la mise à jour du menu:", updateError);
        }
      }

      // 3. Mettre à jour le statut de la demande originale
      const { data, error } = await supabase
        .from('menu_change_requests')
        .update({ status } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }

      return data as unknown as MenuChangeRequest;
    } catch (error) {
      console.error('Erreur dans updateMenuChangeRequestStatus:', error);
      return null;
    }
  }
};

export default menuService;
