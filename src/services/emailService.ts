
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
  files?: Array<{ name: string; type: string; url?: string }>;
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
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  },

  async sendContentSubmission(content: ContentForEmail): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://3000-414b44cb-5a0f-472e-a05b-0952af6385a6.h1088.daytona.work";
    
    let filesDetailsText = "Aucun fichier joint";
    if (content.files && content.files.length > 0) {
      const filesList = content.files.map((file) => {
        let detail = `- ${file.name} (${file.type})`;
        if (file.url) {
          detail += `\n  Télécharger: ${baseUrl}/api/download-file?fileUrl=${encodeURIComponent(file.url)}&fileName=${encodeURIComponent(file.name)}`;
        }
        return detail;
      });
      filesDetailsText = "Fichiers joints:\n" + filesList.join("\n");
    }

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Nouvelle Soumission</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Détails de la soumission :</h2>
            <p><strong>Type :</strong> ${content.type || "Contenu"}</p>
            <p><strong>Titre :</strong> ${content.title || "Non spécifié"}</p>
            <p><strong>Description :</strong> ${content.description || "Non spécifiée"}</p>
            <p><strong>Menu sélectionné :</strong> ${content.menu || "Non spécifié"}</p>
            <p><strong>Sous-menu sélectionné :</strong> ${content.submenu || "Non spécifié"}</p>
            <p><strong>Date de soumission :</strong> ${new Date().toLocaleString("fr-FR")}</p>
            
            ${content.files && content.files.length > 0 ? `
              <h3>Fichiers joints :</h3>
              <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                ${content.files.map((file) => `
                  <div style="margin-bottom: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 3px;">
                    <strong>📎 ${file.name}</strong> (${file.type})
                    ${file.url ? `
                      <br/>
                      <a href="${baseUrl}/api/download-file?fileUrl=${encodeURIComponent(file.url)}&fileName=${encodeURIComponent(file.name)}" 
                         style="color: #ea580c; text-decoration: none; font-weight: bold;">
                        🔗 Télécharger le fichier
                      </a>
                    ` : ""}
                  </div>
                `).join("")}
              </div>
            ` : ""}
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffeaa7;">
              <p style="margin: 0; color: #856404;"><strong>Action requise :</strong> Cette soumission nécessite votre approbation.</p>
              <p style="margin: 5px 0 0 0; color: #856404;">Connectez-vous au panel d'administration pour approuver ou rejeter cette soumission.</p>
            </div>
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `;

    const textBody = [
      "CAPEC - Nouvelle Soumission",
      "",
      `Type: ${content.type || "Contenu"}`,
      `Titre: ${content.title || "Non spécifié"}`,
      `Description: ${content.description || "Non spécifiée"}`,
      `Menu sélectionné: ${content.menu || "Non spécifié"}`,
      `Sous-menu sélectionné: ${content.submenu || "Non spécifié"}`,
      `Date: ${new Date().toLocaleString("fr-FR")}`,
      "",
      filesDetailsText,
      "",
      "Action requise: Cette soumission nécessite votre approbation.",
      "Connectez-vous au panel d'administration pour approuver ou rejeter cette soumission."
    ].join("\n");

    const emailData = {
      to: "petronildaga@capec-ci.org",
      subject: "Nouvelle soumission de contenu - CAPEC",
      html: htmlBody,
      text: textBody
    };

    return this.sendEmail(emailData);
  },

  async sendMenuUpdate(oldMenu: string, newMenu: string, type: "menu" | "submenu"): Promise<boolean> {
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Modification ${type}</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Demande de modification :</h2>
            <p><strong>Type :</strong> ${type === "menu" ? "Menu" : "Sous-menu"}</p>
            <p><strong>Ancien libellé :</strong> ${oldMenu}</p>
            <p><strong>Nouveau libellé :</strong> ${newMenu}</p>
            <p><strong>Date de demande :</strong> ${new Date().toLocaleString("fr-FR")}</p>
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `;

    const textBody = [
      `CAPEC - Modification ${type}`,
      "",
      `Type: ${type === "menu" ? "Menu" : "Sous-menu"}`,
      `Ancien libellé: ${oldMenu}`,
      `Nouveau libellé: ${newMenu}`,
      `Date: ${new Date().toLocaleString("fr-FR")}`
    ].join("\n");

    const emailData = {
      to: "petronildaga@capec-ci.org",
      subject: `Demande de modification ${type} - CAPEC`,
      html: htmlBody,
      text: textBody
    };

    return this.sendEmail(emailData);
  },

  async sendApprovalNotification(submission: SubmissionDetailsForEmail, status: "approved" | "rejected"): Promise<boolean> {
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${status === "approved" ? "#16a34a" : "#dc2626"}; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Soumission ${status === "approved" ? "Approuvée" : "Rejetée"}</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Détails de la soumission :</h2>
            <p><strong>ID :</strong> ${submission.id}</p>
            <p><strong>Titre :</strong> ${submission.title || "N/A"}</p>
            <p><strong>Type :</strong> ${submission.type || "N/A"}</p>
            <p><strong>Statut :</strong> ${status === "approved" ? "Approuvée" : "Rejetée"}</p>
            <p><strong>Date de traitement :</strong> ${new Date().toLocaleString("fr-FR")}</p>
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `;

    const textBody = [
      `CAPEC - Soumission ${status === "approved" ? "Approuvée" : "Rejetée"}`,
      "",
      `ID: ${submission.id}`,
      `Titre: ${submission.title || "N/A"}`,
      `Type: ${submission.type || "N/A"}`,
      `Statut: ${status === "approved" ? "Approuvée" : "Rejetée"}`,
      `Date: ${new Date().toLocaleString("fr-FR")}`
    ].join("\n");

    const emailData = {
      to: "petronildaga@capec-ci.org",
      subject: `Soumission ${status === "approved" ? "approuvée" : "rejetée"} - CAPEC`,
      html: htmlBody,
      text: textBody
    };

    return this.sendEmail(emailData);
  },

  async sendMenuChangeRequest(request: MenuChangeRequest, userId: string): Promise<boolean> {
    const htmlBody = `
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
      `;

    const textLines = [
      "CAPEC - Nouvelle demande de modification de menu",
      "",
      `Demandé par: ${userId}`,
      `Ancien nom: ${request.old_menu_name}`,
      `Nouveau nom: ${request.new_menu_name}`,
      `Type: ${request.is_submenu ? "Sous-menu" : "Menu principal"}`
    ];

    if (request.is_submenu && request.parent_menu_name) {
      textLines.push(`Menu parent: ${request.parent_menu_name}`);
    }

    textLines.push(`Date: ${new Date(request.created_at).toLocaleString("fr-FR")}`);

    const emailData = {
      to: "petronildaga@capec-ci.org",
      subject: "Nouvelle demande de modification de menu - CAPEC",
      html: htmlBody,
      text: textLines.join("\n")
    };
    return this.sendEmail(emailData);
  },

  async sendOverviewData(overviewData: OverviewEmailData): Promise<{ success: boolean; message?: string }> {
    const { menus, menuRequests, contentSubmissions, summary } = overviewData;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://3000-414b44cb-5a0f-472e-a05b-0952af6385a6.h1088.daytona.work";
    
    const contentSubmissionsHtml = contentSubmissions.map(s => `
      <div style="margin-bottom: 15px; padding: 15px; background-color: #fff; border-radius: 5px; border: 1px solid #ddd;">
        <h4>${s.title}</h4>
        <p><strong>Type:</strong> ${s.content_type} | <strong>Statut:</strong> ${s.status}</p>
        <p><strong>Description:</strong> ${s.description || "N/A"}</p>
        ${s.file_urls && s.file_urls.length > 0 ? `
          <p><strong>Fichiers joints:</strong></p>
          <ul>
            ${s.file_urls.map(url => {
              const fileName = url.split("/").pop() || "fichier";
              return `<li>
                <a href="${baseUrl}/api/download-file?fileUrl=${encodeURIComponent(url)}&fileName=${encodeURIComponent(fileName)}" 
                   style="color: #ea580c; text-decoration: none;">
                  🔗 ${fileName}
                </a>
              </li>`;
            }).join("")}
          </ul>
        ` : ""}
      </div>
    `).join("");

    const contentSubmissionsText = contentSubmissions.map(s => {
      const lines = [
        `  Titre: ${s.title}`,
        `  Type: ${s.content_type} | Statut: ${s.status}`,
        `  Description: ${s.description || "N/A"}`
      ];

      if (s.file_urls && s.file_urls.length > 0) {
        lines.push("  Fichiers joints:");
        s.file_urls.forEach(url => {
          const fileName = url.split("/").pop() || "fichier";
          lines.push(`    - ${fileName} (Télécharger: ${baseUrl}/api/download-file?fileUrl=${encodeURIComponent(url)}&fileName=${encodeURIComponent(fileName)})`);
        });
      }

      return lines.join("\n");
    }).join("\n\n");

    const htmlBody = `
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
            ${contentSubmissionsHtml}
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `;

    const textLines = [
      "CAPEC - Vue d'ensemble complète",
      "",
      "Résumé:",
      `- Menus principaux: ${summary.totalMenus}`,
      `- Sous-menus: ${summary.totalSubmenus}`,
      `- Total demandes de menu: ${summary.totalMenuRequests} (Dont ${summary.pendingMenuRequests} en attente)`,
      `- Total soumissions de contenu: ${summary.totalContentSubmissions} (Dont ${summary.pendingContentSubmissions} en attente, ${summary.approvedContentSubmissions} approuvées)`,
      "",
      `Menus (${menus.length}):`
    ];

    menus.forEach(m => {
      textLines.push(`- ${m.name} ${m.parent_id ? "(Sous-menu)" : "(Menu principal)"}`);
    });

    textLines.push("");
    textLines.push(`Demandes de modification de menu (${menuRequests.length}):`);

    menuRequests.forEach(r => {
      textLines.push(`- ${r.old_menu_name} -> ${r.new_menu_name} (Statut: ${r.status})`);
    });

    textLines.push("");
    textLines.push(`Soumissions de contenu (${contentSubmissions.length}):`);
    textLines.push(contentSubmissionsText);
      
    const emailData = {
      to: "petronildaga@capec-ci.org",
      subject: "Vue d'ensemble complète des données CAPEC",
      html: htmlBody,
      text: textLines.join("\n")
    };
    const success = await this.sendEmail(emailData);
    return { success, message: success ? "Email envoyé" : "Échec de l'envoi" };
  },

  async sendAllContentData(submissions: ContentSubmission[]): Promise<{ success: boolean; message?: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://3000-414b44cb-5a0f-472e-a05b-0952af6385a6.h1088.daytona.work";
    
    const submissionsHtml = submissions.map(s => `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #fff; border-radius: 5px; border: 1px solid #ddd;">
        <h3>${s.title}</h3>
        <p><strong>Type :</strong> ${s.content_type}</p>
        <p><strong>Statut :</strong> ${s.status}</p>
        <p><strong>Description :</strong> ${s.description || "N/A"}</p>
        <p><strong>Date de création :</strong> ${new Date(s.created_at).toLocaleString("fr-FR")}</p>
        ${s.file_urls && s.file_urls.length > 0 ? `
          <div style="margin-top: 10px;">
            <strong>Fichiers joints :</strong>
            <ul style="margin-top: 5px;">
              ${s.file_urls.map(url => {
                const fileName = url.split("/").pop() || "fichier";
                return `<li style="margin-bottom: 5px;">
                  <a href="${baseUrl}/api/download-file?fileUrl=${encodeURIComponent(url)}&fileName=${encodeURIComponent(fileName)}" 
                     style="color: #ea580c; text-decoration: none; font-weight: bold;">
                    🔗 Télécharger ${fileName}
                  </a>
                </li>`;
              }).join("")}
            </ul>
          </div>
        ` : "<p><em>Aucun fichier joint</em></p>"}
        <hr style="margin-top: 15px; border: none; border-top: 1px solid #eee;"/>
      </div>
    `).join("");

    const submissionsDetailsText = submissions.map(s => {
      const lines = [
        `Titre: ${s.title}`,
        `Type: ${s.content_type}`,
        `Statut: ${s.status}`,
        `Description: ${s.description || "N/A"}`,
        `Date de création: ${new Date(s.created_at).toLocaleString("fr-FR")}`
      ];

      if (s.file_urls && s.file_urls.length > 0) {
        lines.push("  Fichiers joints:");
        s.file_urls.forEach(url => {
          const fileName = url.split("/").pop() || "fichier";
          lines.push(`    - ${fileName} (Télécharger: ${baseUrl}/api/download-file?fileUrl=${encodeURIComponent(url)}&fileName=${encodeURIComponent(fileName)})`);
        });
      }

      return lines.join("\n");
    }).join("\n\n");

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
            <h1>CAPEC - Export des Soumissions de Contenu</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Total Soumissions : ${submissions.length}</h2>
            ${submissionsHtml}
          </div>
          <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
          </div>
        </div>
      `;

    const textBody = [
      "CAPEC - Export des Soumissions de Contenu",
      "",
      `Total Soumissions: ${submissions.length}`,
      "",
      submissionsDetailsText
    ].join("\n");

    const emailData = {
      to: "petronildaga@capec-ci.org",
      subject: `Export de toutes les soumissions de contenu CAPEC (${submissions.length})`,
      html: htmlBody,
      text: textBody
    };
    const success = await this.sendEmail(emailData);
    return { success, message: success ? "Email envoyé" : "Échec de l'envoi" };
  }
};

export default emailService;
