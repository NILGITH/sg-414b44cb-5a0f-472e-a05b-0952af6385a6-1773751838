
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types/content";

export const menuService = {
  async getMenus() {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data as MenuItem[];
  },

  async getMenusWithSubmenus() {
    const { data, error } = await supabase
      .from("menus")
      .select(`
        *,
        submenus:menus!parent_id(*)
      `)
      .is("parent_id", null)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data;
  },

  async createMenu(menuData: Partial<MenuItem>) {
    const { data, error } = await supabase
      .from("menus")
      .insert([menuData])
      .select()
      .single();

    if (error) throw error;
    return data as MenuItem;
  },

  async updateMenu(id: string, menuData: Partial<MenuItem>) {
    const { data, error } = await supabase
      .from("menus")
      .update({ ...menuData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as MenuItem;
  },

  async deleteMenu(id: string) {
    const { error } = await supabase
      .from("menus")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
};

export default menuService;
