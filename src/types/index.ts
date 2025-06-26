
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "contributor";
}

export interface MenuItem {
  id: string;
  title: string;
  slug: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentData {
  id: string;
  menuItemId: string;
  type: "text" | "image" | "video" | "pdf";
  title: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  description?: string;
  status: "draft" | "pending" | "approved" | "rejected";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  status: "pending" | "uploading" | "completed" | "error";
}
