
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestEmailPage() {
  const [email, setEmail] = useState("petronildaga@aitech-ci.com");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendTestEmail = async () => {
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
          subject: 'Test Email - CAPEC',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #ea580c; color: white; padding: 20px; text-align: center;">
                <h1>CAPEC - Email de Test</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2>Ceci est un email de test</h2>
                <p>Si vous recevez cet email, la configuration Resend fonctionne correctement.</p>
                <p><strong>Date d'envoi :</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p><strong>Clé API utilisée :</strong> re_iVv7nWMv_2JgbjfKPLvRxSqYkFxLqyK5B</p>
              </div>
              <div style="background-color: #ea580c; color: white; padding: 10px; text-align: center; font-size: 12px;">
                <p>Cellule d'Analyse de Politiques Économiques du CIRES</p>
              </div>
            </div>
          `,
          text: `
            CAPEC - Email de Test
            
            Ceci est un email de test.
            Si vous recevez cet email, la configuration Resend fonctionne correctement.
            
            Date d'envoi: ${new Date().toLocaleString('fr-FR')}
            Clé API utilisée: re_iVv7nWMv_2JgbjfKPLvRxSqYkFxLqyK5B
          `
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(`Email de test envoyé avec succès à ${email}. ID: ${result.data?.id || 'N/A'}`);
      } else {
        setMessage(`Erreur: ${result.error} - ${result.details || ''}`);
      }
    } catch (error) {
      setMessage(`Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Test d'envoi d'email - CAPEC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse email de destination</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="petronildaga@aitech-ci.com"
              />
            </div>
            
            <Button 
              onClick={sendTestEmail}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Envoi en cours..." : "Envoyer email de test"}
            </Button>

            {message && (
              <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Informations de débogage :</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Clé API Resend : re_iVv7nWMv_2JgbjfKPLvRxSqYkFxLqyK5B</li>
                <li>• Expéditeur : CAPEC &lt;noreply@resend.dev&gt;</li>
                <li>• Destinataire : {email}</li>
                <li>• Vérifiez les logs de la console pour plus de détails</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
