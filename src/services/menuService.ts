
import { supabase } from "@/integrations/supabase/client";

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
  async getMenuSections() {
    const { data, error } = await supabase
      .from("menu_sections")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data as MenuSection[];
  },

  async getMenusWithSubmenus() {
    const { data, error } = await supabase
      .from("menu_sections")
      .select(`
        *,
        submenus:menu_sections!parent_id(*)
      `)
      .is("parent_id", null)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data;
  },

  async createMenuChangeRequest(requestData: {
    old_menu_name: string;
    new_menu_name: string;
    is_submenu: boolean;
    parent_menu_name?: string;
  }, userId: string) {
    const { data, error } = await supabase
      .from("menu_change_requests")
      .insert([
        {
          ...requestData,
          created_by: userId,
          status: "pending"
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as MenuChangeRequest;
  },

  async getMenuChangeRequests() {
    const { data, error } = await supabase
      .from("menu_change_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as MenuChangeRequest[];
  },

  async updateMenuChangeRequestStatus(id: string, status: "approved" | "rejected") {
    const { data, error } = await supabase
      .from("menu_change_requests")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as MenuChangeRequest;
  }
};

export default menuService;
