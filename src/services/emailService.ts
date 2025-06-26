
import { ContentSubmission } from "./contentService";
import { MenuChangeRequest, MenuSection } from "./menuService";

export interface EmailData {
  to: string;
  subject: string;
  content: Record<string, unknown>;
  timestamp: string;
  type: "content_submission" | "menu_change_request" | "overview_data" | "form_submission";
}

interface OverviewEmailPayload {
  menus: MenuSection[];
  menuRequests: MenuChangeRequest[];
  contentSubmissions: ContentSubmission[];
  summary: {
    totalMenus: number;
    totalSubmenus: number;
    totalMenuRequests: number;
    pendingMenuRequests: number;
    totalContentSubmissions: number;
    pendingContentSubmissions: number;
    approvedContentSubmissions: number;
  };
  submissionType: string;
}

export const emailService = {
  async sendEmail(data: EmailData): Promise<{ success: boolean; message: string }> {
    try {
      // Simulation d'envoi d'email - en production, ceci serait connecté à un service d'email réel
      console.log("📧 Email envoyé à:", data.to);
      console.log("📧 Sujet:", data.subject);
      console.log("📧 Type:", data.type);
      console.log("📧 Contenu:", data.content);
      console.log("📧 Timestamp:", data.timestamp);
      
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: `Email envoyé avec succès à ${data.to}`
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email"
      };
    }
  },

  async sendContentSubmission(contentData: ContentSubmission, userEmail: string): Promise<{ success: boolean; message: string }> {
    const emailData: EmailData = {
      to: "petronildaga@aitech-ci.com",
      subject: `Nouvelle soumission de contenu - ${contentData.title}`,
      content: {
        ...contentData,
        submittedBy: userEmail,
        submissionType: "Soumission de contenu"
      },
      timestamp: new Date().toISOString(),
      type: "content_submission"
    };

    return this.sendEmail(emailData);
  },

  async sendMenuChangeRequest(requestData: MenuChangeRequest, userEmail: string): Promise<{ success: boolean; message: string }> {
    const emailData: EmailData = {
      to: "petronildaga@aitech-ci.com",
      subject: `Demande de modification de menu - ${requestData.old_menu_name} → ${requestData.new_menu_name}`,
      content: {
        ...requestData,
        submittedBy: userEmail,
        submissionType: "Demande de modification de menu"
      },
      timestamp: new Date().toISOString(),
      type: "menu_change_request"
    };

    return this.sendEmail(emailData);
  },

  async sendOverviewData(overviewData: OverviewEmailPayload): Promise<{ success: boolean; message: string }> {
    const emailData: EmailData = {
      to: "petronildaga@aitech-ci.com",
      subject: "Vue d'ensemble complète - CAPEC-CI",
      content: {
        ...overviewData,
        submissionType: "Vue d'ensemble complète"
      },
      timestamp: new Date().toISOString(),
      type: "overview_data"
    };

    return this.sendEmail(emailData);
  },

  async sendAllContentData(contentSubmissions: ContentSubmission[]): Promise<{ success: boolean; message: string }> {
    const emailData: EmailData = {
      to: "petronildaga@aitech-ci.com",
      subject: "Toutes les soumissions de contenu - CAPEC-CI",
      content: {
        contentSubmissions,
        totalSubmissions: contentSubmissions.length,
        pendingSubmissions: contentSubmissions.filter(s => s.status === "pending").length,
        approvedSubmissions: contentSubmissions.filter(s => s.status === "approved").length,
        submissionType: "Toutes les soumissions de contenu"
      },
      timestamp: new Date().toISOString(),
      type: "form_submission"
    };

    return this.sendEmail(emailData);
  }
};

export default emailService;
