
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fileUrl, fileName } = req.query;

    if (!fileUrl || !fileName) {
      return res.status(400).json({ message: 'URL du fichier et nom requis' });
    }

    // Pour les fichiers mock, on simule le téléchargement
    if (typeof fileUrl === 'string' && fileUrl.includes('mock-storage.capec-ci.com')) {
      // Simulation d'un fichier pour les tests
      const mockContent = `Contenu simulé du fichier: ${fileName}
Date de création: ${new Date().toISOString()}
Type: Fichier de test CAPEC
      
Ceci est un fichier de démonstration généré automatiquement.
Soumis via l'application CAPEC pour mise à jour du site cepec-ci.org`;

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', Buffer.byteLength(mockContent));
      
      return res.status(200).send(mockContent);
    }

    // Pour les vrais fichiers (à implémenter selon votre système de stockage)
    if (typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
      // Rediriger vers l'URL du fichier
      return res.redirect(fileUrl);
    }

    // Si c'est un fichier local
    if (typeof fileUrl === 'string' && !fileUrl.startsWith('http')) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileUrl);
      
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const stats = fs.statSync(filePath);
        
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', stats.size);
        
        return res.status(200).send(fileBuffer);
      }
    }

    return res.status(404).json({ message: 'Fichier non trouvé' });

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur lors du téléchargement',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
