import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Key, User } from "lucide-react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("petronildaga@capec-ci.org");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendCredentialsEmail = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'CAPEC - Informations de connexion',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
                <h1>🔐 CAPEC - Informations de Connexion</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2>Comptes d'accès à l'application CAPEC</h2>
                
                <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                  <h3 style="color: #3b82f6; margin-top: 0;">👤 Compte Utilisateur Principal</h3>
                  <p><strong>Email :</strong> admin@capec-ci.org</p>
                  <p><strong>Mot de passe :</strong> capec2024</p>
                  <p><strong>Accès :</strong> Tableau de bord, gestion des contenus et menus</p>
                </div>

                <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                  <h3 style="color: #dc2626; margin-top: 0;">🛡️ Compte Administrateur</h3>
                  <p><strong>Email :</strong> admin@capec-ci.org</p>
                  <p><strong>Mot de passe :</strong> admin2024</p>
                  <p><strong>Accès :</strong> Panel d'approbation des soumissions</p>
                  <p><strong>URL :</strong> <a href="https://backoffice.capec-ci.org/admin/approvals" style="color: #dc2626;">Panel d'approbation</a></p>
                </div>

                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; margin: 20px 0;">
                  <h4 style="color: #856404; margin-top: 0;">📋 Instructions d'utilisation :</h4>
                  <ol style="color: #856404;">
                    <li>Utilisez le <strong>compte utilisateur</strong> pour accéder au tableau de bord principal</li>
                    <li>Utilisez le <strong>compte administrateur</strong> pour approuver/rejeter les soumissions</li>
                    <li>Tous les emails de notification sont envoyés à cette adresse</li>
                    <li>Les fichiers joints peuvent être téléchargés via les liens dans les emails</li>
                  </ol>
                </div>

                <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; border: 1px solid #81d4fa; margin: 20px 0;">
                  <h4 style="color: #0277bd; margin-top: 0;">🔗 Liens utiles :</h4>
                  <ul style="color: #0277bd;">
                    <li><a href="https://backoffice.capec-ci.org/login" style="color: #0277bd;">Connexion principale</a></li>
                    <li><a href="https://backoffice.capec-ci.org/admin/approvals" style="color: #0277bd;">Panel d'approbation</a></li>
                    <li><a href="https://backoffice.capec-ci.org/dashboard" style="color: #0277bd;">Tableau de bord</a></li>
                  </ul>
                </div>

                <p><strong>Date d'envoi :</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p><strong>Application :</strong> Système de gestion de contenu CAPEC</p>
              </div>
              <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
                <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
                <p>🔒 Informations confidentielles - Ne pas transférer</p>
              </div>
            </div>
          `,
          text: `
            CAPEC - Informations de Connexion
            
            Comptes d'accès à l'application CAPEC :
            
            👤 COMPTE UTILISATEUR PRINCIPAL
            Email: admin@capec-ci.org
            Mot de passe: capec2024
            Accès: Tableau de bord, gestion des contenus et menus
            
            🛡️ COMPTE ADMINISTRATEUR
            Email: admin@capec-ci.org
            Mot de passe: admin2024
            Accès: Panel d'approbation des soumissions
            URL: https://backoffice.capec-ci.org/admin/approvals
            
            📋 INSTRUCTIONS :
            1. Utilisez le compte utilisateur pour accéder au tableau de bord principal
            2. Utilisez le compte administrateur pour approuver/rejeter les soumissions
            3. Tous les emails de notification sont envoyés à cette adresse
            4. Les fichiers joints peuvent être téléchargés via les liens dans les emails
            
            🔗 LIENS UTILES :
            - Connexion principale: https://backoffice.capec-ci.org/login
            - Panel d'approbation: https://backoffice.capec-ci.org/admin/approvals
            - Tableau de bord: https://backoffice.capec-ci.org/dashboard
            
            Date d'envoi: ${new Date().toLocaleString('fr-FR')}
            Application: Système de gestion de contenu CAPEC
            
            🔒 Informations confidentielles - Ne pas transférer
          `
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Informations de connexion envoyées avec succès à ${email}`);
      } else {
        setMessage(`❌ Erreur: ${result.error} - ${result.details || ''}`);
      }
    } catch (error) {
      setMessage(`❌ Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Envoi des informations de connexion</CardTitle>
            <p className="text-gray-600">Système de gestion CAPEC</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="email">Adresse email de destination</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="petronildaga@capec-ci.org"
              />
            </div>
            
            <Button 
              onClick={sendCredentialsEmail}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Envoi en cours..." : "Envoyer les informations de connexion"}
            </Button>

            {message && (
              <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Compte Utilisateur</h4>
                      <p className="text-sm text-blue-700">Gestion des contenus</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Key className="h-6 w-6 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-900">Compte Admin</h4>
                      <p className="text-sm text-red-700">Panel d'approbation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informations importantes :</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Les comptes ne s'affichent plus dans l'interface</li>
                <li>• Toutes les informations sont envoyées par email</li>
                <li>• Backend Supabase entièrement fonctionnel</li>
                <li>• Système d'approbation opérationnel</li>
                <li>• Téléchargement de fichiers disponible</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
