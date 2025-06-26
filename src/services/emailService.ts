import type { ContentSubmission } from "./contentService";
import type { MenuSection, MenuChangeRequest } from "./menuService";

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ContentForEmail {
  type?: string;
  title?: string;
  description?: string;
  menu?: string;
  submenu?: string;
  files?: Array<{ name: string; type: string }>;
}

export interface SubmissionDetailsForEmail {
  id: string;
  title?: string;
  type?: string;
}

export interface OverviewEmailData {
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
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  },

  async sendContentSubmission(content: ContentForEmail): Promise<boolean> {
    const emailData = {
      to: 'petronildaga@aitech-ci.com',
      subject: 'Nouvelle soumission de contenu - CAPEC',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Nouvelle Soumission</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Détails de la soumission :</h2>
            <p><strong>Type :</strong> ${content.type || 'Contenu'}</p>
            <p><strong>Titre :</strong> ${content.title || 'Non spécifié'}</p>
            <p><strong>Description :</strong> ${content.description || 'Non spécifiée'}</p>
            <p><strong>Menu :</strong> ${content.menu || 'Non spécifié'}</p>
            <p><strong>Sous-menu :</strong> ${content.submenu || 'Non spécifié'}</p>
            <p><strong>Date de soumission :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            
            ${content.files && content.files.length > 0 ? `
              <h3>Fichiers joints :</h3>
              <ul>
                ${content.files.map((file) => `<li>${file.name} (${file.type})</li>`).join('')}
              </ul>
            ` : ''}
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `,
      text: `
        CAPEC - Nouvelle Soumission
        
        Type: ${content.type || 'Contenu'}
        Titre: ${content.title || 'Non spécifié'}
        Description: ${content.description || 'Non spécifiée'}
        Menu: ${content.menu || 'Non spécifié'}
        Sous-menu: ${content.submenu || 'Non spécifié'}
        Date: ${new Date().toLocaleString('fr-FR')}
        
        ${content.files && content.files.length > 0 ? 
          `Fichiers: ${content.files.map((file) => file.name).join(', ')}` : 
          'Aucun fichier joint'
        }
      `
    };

    return this.sendEmail(emailData);
  },

  async sendMenuUpdate(oldMenu: string, newMenu: string, type: "menu" | "submenu"): Promise<boolean> {
    const emailData = {
      to: 'petronildaga@aitech-ci.com',
      subject: `Demande de modification ${type} - CAPEC`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Modification ${type}</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Demande de modification :</h2>
            <p><strong>Type :</strong> ${type === 'menu' ? 'Menu' : 'Sous-menu'}</p>
            <p><strong>Ancien libellé :</strong> ${oldMenu}</p>
            <p><strong>Nouveau libellé :</strong> ${newMenu}</p>
            <p><strong>Date de demande :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `,
      text: `
        CAPEC - Modification ${type}
        
        Type: ${type === 'menu' ? 'Menu' : 'Sous-menu'}
        Ancien libellé: ${oldMenu}
        Nouveau libellé: ${newMenu}
        Date: ${new Date().toLocaleString('fr-FR')}
      `
    };

    return this.sendEmail(emailData);
  },

  async sendApprovalNotification(submission: SubmissionDetailsForEmail, status: "approved" | "rejected"): Promise<boolean> {
    const emailData = {
      to: 'petronildaga@aitech-ci.com',
      subject: `Soumission ${status === 'approved' ? 'approuvée' : 'rejetée'} - CAPEC`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${status === 'approved' ? '#16a34a' : '#dc2626'}; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Soumission ${status === 'approved' ? 'Approuvée' : 'Rejetée'}</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Détails de la soumission :</h2>
            <p><strong>ID :</strong> ${submission.id}</p>
            <p><strong>Titre :</strong> ${submission.title}</p>
            <p><strong>Type :</strong> ${submission.type}</p>
            <p><strong>Statut :</strong> ${status === 'approved' ? 'Approuvée' : 'Rejetée'}</p>
            <p><strong>Date de traitement :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `,
      text: `
        CAPEC - Soumission ${status === 'approved' ? 'Approuvée' : 'Rejetée'}
        
        ID: ${submission.id}
        Titre: ${submission.title}
        Type: ${submission.type}
        Statut: ${status === 'approved' ? 'Approuvée' : 'Rejetée'}
        Date: ${new Date().toLocaleString('fr-FR')}
      `
    };

    return this.sendEmail(emailData);
  },

  async sendMenuChangeRequest(request: MenuChangeRequest, userId: string): Promise<boolean> {
    const emailData = {
      to: "petronildaga@aitech-ci.com",
      subject: "Nouvelle demande de modification de menu - CAPEC",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Demande de Modification de Menu</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Détails de la demande :</h2>
            <p><strong>Demandé par :</strong> ${userId}</p>
            <p><strong>Ancien nom :</strong> ${request.old_menu_name}</p>
            <p><strong>Nouveau nom :</strong> ${request.new_menu_name}</p>
            <p><strong>Type :</strong> ${request.is_submenu ? "Sous-menu" : "Menu principal"}</p>
            ${request.is_submenu && request.parent_menu_name ? `<p><strong>Menu parent :</strong> ${request.parent_menu_name}</p>` : ""}
            <p><strong>Date de demande :</strong> ${new Date(request.created_at).toLocaleString("fr-FR")}</p>
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `,
      text: `
        CAPEC - Nouvelle demande de modification de menu
        Demandé par: ${userId}
        Ancien nom: ${request.old_menu_name}
        Nouveau nom: ${request.new_menu_name}
        Type: ${request.is_submenu ? "Sous-menu" : "Menu principal"}
        ${request.is_submenu && request.parent_menu_name ? `Menu parent: ${request.parent_menu_name}` : ""}
        Date: ${new Date(request.created_at).toLocaleString("fr-FR")}
      `
    };
    return this.sendEmail(emailData);
  },

  async sendOverviewData(overviewData: OverviewEmailData): Promise<{ success: boolean; message?: string }> {
    const { menus, menuRequests, contentSubmissions, summary } = overviewData;
    const emailData = {
      to: "petronildaga@aitech-ci.com",
      subject: "Vue d'ensemble complète des données CAPEC",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Vue d'ensemble complète</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Résumé :</h2>
            <ul>
              <li>Menus principaux : ${summary.totalMenus}</li>
              <li>Sous-menus : ${summary.totalSubmenus}</li>
              <li>Total demandes de menu : ${summary.totalMenuRequests} (Dont ${summary.pendingMenuRequests} en attente)</li>
              <li>Total soumissions de contenu : ${summary.totalContentSubmissions} (Dont ${summary.pendingContentSubmissions} en attente, ${summary.approvedContentSubmissions} approuvées)</li>
            </ul>

            <h2>Menus (${menus.length}) :</h2>
            <ul>${menus.map(m => `<li>${m.name} ${m.parent_id ? "(Sous-menu)" : "(Menu principal)"}</li>`).join("")}</ul>

            <h2>Demandes de modification de menu (${menuRequests.length}) :</h2>
            <ul>${menuRequests.map(r => `<li>${r.old_menu_name} -> ${r.new_menu_name} (Statut: ${r.status})</li>`).join("")}</ul>
            
            <h2>Soumissions de contenu (${contentSubmissions.length}) :</h2>
            <ul>${contentSubmissions.map(s => `<li>${s.title} (Type: ${s.content_type}, Statut: ${s.status})</li>`).join("")}</ul>
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `,
    };
    const success = await this.sendEmail(emailData);
    return { success, message: success ? "Email envoyé" : "Échec de l'envoi" };
  },

  async sendAllContentData(submissions: ContentSubmission[]): Promise<{ success: boolean; message?: string }> {
    const emailData = {
      to: "petronildaga@aitech-ci.com",
      subject: `Export de toutes les soumissions de contenu CAPEC (${submissions.length})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Export des Soumissions de Contenu</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Total Soumissions : ${submissions.length}</h2>
            <ul>
              ${submissions.map(s => `
                <li>
                  <strong>Titre :</strong> ${s.title} <br/>
                  <strong>Type :</strong> ${s.content_type} <br/>
                  <strong>Statut :</strong> ${s.status} <br/>
                  <strong>Description :</strong> ${s.description || "N/A"} <br/>
                  <strong>Fichiers :</strong> ${s.file_urls?.join(", ") || "N/A"} <br/>
                  <hr/>
                </li>
              `).join("")}
            </ul>
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `,
    };
    const success = await this.sendEmail(emailData);
    return { success, message: success ? "Email envoyé" : "Échec de l'envoi" };
  }
};

export default emailService;
