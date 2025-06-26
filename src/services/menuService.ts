import { supabase } from "@/integrations/supabase/client";
import emailService from "./emailService";

export interface MenuSection {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuChangeRequest {
  id: string;
  old_menu_name: string;
  new_menu_name: string;
  is_submenu: boolean;
  parent_menu_name?: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
}

export const menuService = {
  async getMenuSections(): Promise<MenuSection[]> {
    try {
      const { data, error } = await supabase
        .from('menu_sections')
        .select('*')
        .order('order_index', { ascending: true });

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
        created_by: userId,
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('menu_change_requests')
        .insert([newRequest as any]) // Cast to any
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la demande:', error);
        throw error;
      }

      // Envoyer par email automatiquement
      if (data) { // Add null check for data
        try {
          await emailService.sendMenuChangeRequest(data, userId);
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email:", emailError);
        }
      }

      return data as MenuChangeRequest; // data could be null
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

      return data || [];
    } catch (error) {
      console.error('Erreur dans getMenuChangeRequests:', error);
      return [];
    }
  },

  async updateMenuChangeRequestStatus(id: string, status: "approved" | "rejected"): Promise<MenuChangeRequest | null> {
    try {
      const { data, error } = await supabase
        .from('menu_change_requests')
        .update({ status } as any) // Cast to any
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans updateMenuChangeRequestStatus:', error);
      return null;
    }
  }
};

export default menuService;
