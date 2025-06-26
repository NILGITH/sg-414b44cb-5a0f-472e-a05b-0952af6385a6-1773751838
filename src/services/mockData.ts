
import { MenuItem, ContentData } from "@/types";

export const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    title: "Accueil",
    slug: "accueil",
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    title: "À propos",
    slug: "a-propos",
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    title: "Présentation",
    slug: "presentation",
    parentId: "2",
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    title: "Histoire",
    slug: "histoire",
    parentId: "2",
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "5",
    title: "Services",
    slug: "services",
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "6",
    title: "Formation",
    slug: "formation",
    parentId: "5",
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "7",
    title: "Conseil",
    slug: "conseil",
    parentId: "5",
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockContentData: ContentData[] = [
  {
    id: "1",
    menuItemId: "1",
    type: "text",
    title: "Contenu d'accueil",
    content: "Bienvenue sur le site du CEPEC-CI",
    status: "approved",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    menuItemId: "3",
    type: "image",
    title: "Image de présentation",
    fileUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43",
    fileName: "presentation.jpg",
    description: "Image de présentation du CEPEC",
    status: "pending",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
