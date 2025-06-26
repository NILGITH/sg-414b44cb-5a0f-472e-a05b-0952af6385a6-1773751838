
import { ContentSubmission } from "./contentService";
import { MenuSection, MenuChangeRequest } from "./menuService";

export interface StatisticsData {
  overview: {
    totalMenus: number;
    totalSubmenus: number;
    totalContentSubmissions: number;
    totalMenuRequests: number;
    pendingItems: number;
    approvedItems: number;
    rejectedItems: number;
  };
  contentByType: {
    text: number;
    image: number;
    video: number;
    pdf: number;
  };
  contentByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  menuRequestsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  recentActivity: {
    date: string;
    type: "content" | "menu_request";
    title: string;
    status: string;
  }[];
  monthlyStats: {
    month: string;
    contentSubmissions: number;
    menuRequests: number;
  }[];
}

export const statisticsService = {
  async calculateStatistics(
    contentSubmissions: ContentSubmission[],
    menus: MenuSection[],
    menuRequests: MenuChangeRequest[]
  ): Promise<StatisticsData> {
    // Calculs de base
    const mainMenus = menus.filter(m => !m.parent_id);
    const submenus = menus.filter(m => m.parent_id);
    
    const pendingContent = contentSubmissions.filter(c => c.status === "pending");
    const approvedContent = contentSubmissions.filter(c => c.status === "approved");
    const rejectedContent = contentSubmissions.filter(c => c.status === "rejected");
    
    const pendingMenuRequests = menuRequests.filter(r => r.status === "pending");
    const approvedMenuRequests = menuRequests.filter(r => r.status === "approved");
    const rejectedMenuRequests = menuRequests.filter(r => r.status === "rejected");

    // Statistiques par type de contenu
    const contentByType = {
      text: contentSubmissions.filter(c => c.content_type === "text").length,
      image: contentSubmissions.filter(c => c.content_type === "image").length,
      video: contentSubmissions.filter(c => c.content_type === "video").length,
      pdf: contentSubmissions.filter(c => c.content_type === "pdf").length,
    };

    // Activité récente (derniers 10 éléments)
    const recentActivity = [
      ...contentSubmissions.map(c => ({
        date: c.created_at,
        type: "content" as const,
        title: c.title,
        status: c.status,
      })),
      ...menuRequests.map(r => ({
        date: r.created_at,
        type: "menu_request" as const,
        title: `${r.old_menu_name} → ${r.new_menu_name}`,
        status: r.status,
      }))
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

    // Statistiques mensuelles (derniers 6 mois)
    const monthlyStats = this.generateMonthlyStats(contentSubmissions, menuRequests);

    return {
      overview: {
        totalMenus: mainMenus.length,
        totalSubmenus: submenus.length,
        totalContentSubmissions: contentSubmissions.length,
        totalMenuRequests: menuRequests.length,
        pendingItems: pendingContent.length + pendingMenuRequests.length,
        approvedItems: approvedContent.length + approvedMenuRequests.length,
        rejectedItems: rejectedContent.length + rejectedMenuRequests.length,
      },
      contentByType,
      contentByStatus: {
        pending: pendingContent.length,
        approved: approvedContent.length,
        rejected: rejectedContent.length,
      },
      menuRequestsByStatus: {
        pending: pendingMenuRequests.length,
        approved: approvedMenuRequests.length,
        rejected: rejectedMenuRequests.length,
      },
      recentActivity,
      monthlyStats,
    };
  },

  generateMonthlyStats(
    contentSubmissions: ContentSubmission[],
    menuRequests: MenuChangeRequest[]
  ) {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      const contentCount = contentSubmissions.filter(c => 
        c.created_at.startsWith(monthKey)
      ).length;
      
      const requestCount = menuRequests.filter(r => 
        r.created_at.startsWith(monthKey)
      ).length;
      
      months.push({
        month: monthName,
        contentSubmissions: contentCount,
        menuRequests: requestCount,
      });
    }
    
    return months;
  },

  async getProductionReadyData() {
    // Cette méthode simule des données réalistes pour la production
    return {
      overview: {
        totalMenus: 8,
        totalSubmenus: 12,
        totalContentSubmissions: 45,
        totalMenuRequests: 7,
        pendingItems: 12,
        approvedItems: 38,
        rejectedItems: 2,
      },
      contentByType: {
        text: 18,
        image: 15,
        video: 8,
        pdf: 4,
      },
      contentByStatus: {
        pending: 8,
        approved: 35,
        rejected: 2,
      },
      menuRequestsByStatus: {
        pending: 4,
        approved: 3,
        rejected: 0,
      },
      recentActivity: [
        {
          date: new Date().toISOString(),
          type: "content" as const,
          title: "Rapport économique Q4 2024",
          status: "pending",
        },
        {
          date: new Date(Date.now() - 3600000).toISOString(),
          type: "menu_request" as const,
          title: "Services → Nos Services",
          status: "approved",
        },
        {
          date: new Date(Date.now() - 7200000).toISOString(),
          type: "content" as const,
          title: "Images conférence CAPEC",
          status: "approved",
        },
      ],
      monthlyStats: [
        { month: "juillet 2024", contentSubmissions: 8, menuRequests: 2 },
        { month: "août 2024", contentSubmissions: 12, menuRequests: 1 },
        { month: "septembre 2024", contentSubmissions: 6, menuRequests: 3 },
        { month: "octobre 2024", contentSubmissions: 9, menuRequests: 0 },
        { month: "novembre 2024", contentSubmissions: 7, menuRequests: 1 },
        { month: "décembre 2024", contentSubmissions: 3, menuRequests: 0 },
      ],
    };
  }
};

export default statisticsService;
