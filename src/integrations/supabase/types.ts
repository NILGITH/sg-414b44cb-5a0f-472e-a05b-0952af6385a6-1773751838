
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      content_submissions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          content_type: "text" | "image" | "video" | "pdf";
          content_ string | null;
          file_urls: string[] | null;
          menu_section_id: string | null;
          submenu_section_id: string | null;
          status: "pending" | "approved" | "rejected";
          created_by: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          content_type: "text" | "image" | "video" | "pdf";
          content_data?: string | null;
          file_urls?: string[] | null;
          menu_section_id?: string | null;
          submenu_section_id?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_by: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          content_type?: "text" | "image" | "video" | "pdf";
          content_data?: string | null;
          file_urls?: string[] | null;
          menu_section_id?: string | null;
          submenu_section_id?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_by?: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      menu_sections: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      menu_change_requests: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: [];
      };
      // Add other tables if necessary, with 'any' for now to ensure parsing
    };
    Enums: {
      content_type: "text" | "image" | "video" | "pdf";
      submission_status: "pending" | "approved" | "rejected";
    };
    Views: {
      [_in: string]: never;
    };
    Functions: {
      [_in: string]: never;
    };
    CompositeTypes: {
      [_in: string]: never;
    };
  };
}
