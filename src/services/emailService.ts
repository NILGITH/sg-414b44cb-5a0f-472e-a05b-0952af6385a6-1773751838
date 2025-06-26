
interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
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

  async sendContentSubmission(content: any): Promise<boolean> {
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
                ${content.files.map((file: any) => `<li>${file.name} (${file.type})</li>`).join('')}
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
          `Fichiers: ${content.files.map((file: any) => file.name).join(', ')}` : 
          'Aucun fichier joint'
        }
      `
    };

    return this.sendEmail(emailData);
  },

  async sendMenuUpdate(oldMenu: string, newMenu: string, type: 'menu' | 'submenu'): Promise<boolean> {
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

  async sendApprovalNotification(submission: any, status: 'approved' | 'rejected'): Promise<boolean> {
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
  }
};

export default emailService;
