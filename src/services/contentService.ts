import emailService, { ContentForEmail } from "./emailService";

export interface ContentSubmission {
  id: string;
  title: string;
  description?: string;
  content_type: "text" | "image" | "video" | "pdf";
  content_data?: string;
  file_urls?: string[];
  menu_section_id?: string;
  submenu_section_id?: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContentFormData {
  title: string;
  description?: string;
  content_type: "text" | "image" | "video" | "pdf";
  content_data?: string;
  files?: File[];
  menu_section_id?: string;
  submenu_section_id?: string;
}

// Mock data pour l'application
const mockContentSubmissions: ContentSubmission[] = [
  {
    id: "1",
    title: "Article sur l'économie ivoirienne",
    description: "Un article détaillé sur l'économie de la Côte d'Ivoire",
    content_type: "text",
    content_data: "L'économie ivoirienne connaît une croissance soutenue grâce aux réformes structurelles mises en place...",
    file_urls: [],
    menu_section_id: "menu-1",
    submenu_section_id: undefined,
    status: "pending",
    created_by: "admin@cepec-ci.org",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Rapport annuel CAPEC 2024",
    description: "Rapport complet des activités de l'année 2024",
    content_type: "pdf",
    content_data: "",
    file_urls: ["https://example.com/rapport-capec-2024.pdf"],
    menu_section_id: "menu-2",
    submenu_section_id: undefined,
    status: "approved",
    created_by: "admin@cepec-ci.org",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Images de la conférence économique",
    description: "Photos de la dernière conférence sur les politiques économiques",
    content_type: "image",
    content_data: "",
    file_urls: ["https://example.com/conference1.jpg", "https://example.com/conference2.jpg"],
    menu_section_id: "menu-3",
    submenu_section_id: undefined,
    status: "pending",
    created_by: "admin@cepec-ci.org",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const contentService = {
  async getContentSubmissions() {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockContentSubmissions];
  },

  async createContentSubmission(contentData: ContentFormData, userId: string) {
    const newSubmission: ContentSubmission = {
      id: Date.now().toString(),
      title: contentData.title,
      description: contentData.description,
      content_type: contentData.content_type,
      content_data: contentData.content_data,
      file_urls: [],
      menu_section_id: contentData.menu_section_id,
      submenu_section_id: contentData.submenu_section_id,
      created_by: userId,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Simulation d'upload de fichiers
    if (contentData.files && contentData.files.length > 0) {
      newSubmission.file_urls = contentData.files.map(file => 
        `https://mock-storage.capec-ci.com/${file.name}`
      );
    }

    mockContentSubmissions.unshift(newSubmission);

    // Envoyer par email automatiquement
    try {
      // Map ContentSubmission to ContentForEmail
      const emailContent: ContentForEmail = {
        type: newSubmission.content_type,
        title: newSubmission.title,
        description: newSubmission.description,
        // menu: newSubmission.menu_section_id, // Ideally, fetch menu name here
        // submenu: newSubmission.submenu_section_id, // Ideally, fetch submenu name here
        files: newSubmission.file_urls?.map(url => ({ name: url.split("/").pop() || "fichier", type: "url" })) // Simplified file info
      };
      await emailService.sendContentSubmission(emailContent);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }

    return newSubmission;
  },

  async updateContentStatus(id: string, status: "approved" | "rejected") {
    const submission = mockContentSubmissions.find(s => s.id === id);
    if (submission) {
      submission.status = status;
      submission.updated_at = new Date().toISOString();
    }
    return submission;
  },

  async deleteContentSubmission(id: string) {
    const index = mockContentSubmissions.findIndex(s => s.id === id);
    if (index > -1) {
      mockContentSubmissions.splice(index, 1);
    }
    return true;
  },

  async sendAllContentToEmail() {
    try {
      const submissions = await this.getContentSubmissions();
      const result = await emailService.sendAllContentData(submissions); // Corrected call
      
      if (result.success) {
        return { 
          success: true, 
          message: `Contenu envoyé avec succès à petronildaga@aitech-ci.com (${submissions.length} éléments)` 
        };
      } else {
        throw new Error(result.message || "Erreur inconnue lors de l'envoi de l'email");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'envoi des données par email";
      throw new Error(errorMessage);
    }
  }
};

export default contentService;
