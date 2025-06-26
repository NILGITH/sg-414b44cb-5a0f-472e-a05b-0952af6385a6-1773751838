import emailService from "./emailService";
import type { MenuChangeRequest } from "./menuService";

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

// Mock data pour l'application
const mockMenuSections: MenuSection[] = [
  {
    id: "menu-1",
    name: "Accueil",
    slug: "accueil",
    parent_id: undefined,
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "menu-2",
    name: "À propos",
    slug: "a-propos",
    parent_id: undefined,
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "submenu-1",
    name: "Notre histoire",
    slug: "notre-histoire",
    parent_id: "menu-2",
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "submenu-2",
    name: "Notre équipe",
    slug: "notre-equipe",
    parent_id: "menu-2",
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "menu-3",
    name: "Services",
    slug: "services",
    parent_id: undefined,
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "submenu-3",
    name: "Analyse économique",
    slug: "analyse-economique",
    parent_id: "menu-3",
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "menu-4",
    name: "Publications",
    slug: "publications",
    parent_id: undefined,
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "menu-5",
    name: "Contact",
    slug: "contact",
    parent_id: undefined,
    order_index: 5,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const mockMenuChangeRequests: MenuChangeRequest[] = [
  {
    id: "req-1",
    old_menu_name: "À propos",
    new_menu_name: "Qui sommes-nous",
    is_submenu: false,
    parent_menu_name: undefined,
    status: "pending",
    created_by: "admin@cepec-ci.org",
    created_at: new Date().toISOString()
  },
  {
    id: "req-2",
    old_menu_name: "Notre équipe",
    new_menu_name: "L'équipe CAPEC",
    is_submenu: true,
    parent_menu_name: "À propos",
    status: "approved",
    created_by: "admin@cepec-ci.org",
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const menuService = {
  async getMenuSections() {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockMenuSections];
  },

  async getMenusWithSubmenus() {
    const menus = await this.getMenuSections();
    const mainMenus = menus.filter(menu => !menu.parent_id);
    
    return mainMenus.map(menu => ({
      ...menu,
      submenus: menus.filter(submenu => submenu.parent_id === menu.id)
    }));
  },

  async createMenuChangeRequest(requestData: {
    old_menu_name: string;
    new_menu_name: string;
    is_submenu: boolean;
    parent_menu_name?: string;
  }, userId: string) {
    const newRequest: MenuChangeRequest = {
      id: Date.now().toString(),
      ...requestData,
      created_by: userId,
      status: "pending",
      created_at: new Date().toISOString()
    };

    mockMenuChangeRequests.unshift(newRequest);

    // Envoyer par email automatiquement
    try {
      await emailService.sendMenuChangeRequest(newRequest, userId);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }

    return newRequest;
  },

  async getMenuChangeRequests() {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockMenuChangeRequests];
  },

  async updateMenuChangeRequestStatus(id: string, status: "approved" | "rejected") {
    const request = mockMenuChangeRequests.find(r => r.id === id);
    if (request) {
      request.status = status;
    }
    return request;
  }
};

export default menuService;
