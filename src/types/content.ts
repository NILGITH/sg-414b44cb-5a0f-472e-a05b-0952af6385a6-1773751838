
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content_type: "text" | "image" | "video" | "pdf";
  content_data: string;
  file_url?: string;
  menu_id?: string;
  submenu_id?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  is_active: boolean;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentFormData {
  title: string;
  description?: string;
  content_type: "text" | "image" | "video" | "pdf";
  content_data: string;
  file?: File;
  menu_id?: string;
  submenu_id?: string;
}
