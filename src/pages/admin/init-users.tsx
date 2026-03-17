import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import adminService from "@/services/adminService";

export default function InitUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    admin?: { success: boolean; message: string };
    user?: { success: boolean; message: string };
  }>({});

  const handleCreateUsers = async () => {
    setLoading(true);
    setResults({});

    try {
      // Créer l'utilisateur admin
      const adminResult = await adminService.createAdminUser(
        "admin@capec-ci.org",
        "CapecAdmin2024!",
        "Administrateur CAPEC"
      );
      setResults(prev => ({ ...prev, admin: adminResult }));

      // Créer l'utilisateur standard
      const userResult = await adminService.createStandardUser(
        "user@capec-ci.org",
        "CapecUser2024!",
        "Utilisateur CAPEC"
      );
      setResults(prev => ({ ...prev, user: userResult }));

    } catch (error) {
      console.error("Erreur lors de la création des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/setup")}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la configuration
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
            <CardTitle className="text-2xl">Création des utilisateurs - CAPEC</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Cette page va créer :</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Compte administrateur : admin@capec-ci.org (mot de passe : CapecAdmin2024!)</li>
                <li>Compte utilisateur : user@capec-ci.org (mot de passe : CapecUser2024!)</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateUsers}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer les utilisateurs"
              )}
            </Button>

            {Object.keys(results).length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="font-semibold">Résultats :</h3>
                
                {results.admin && (
                  <Alert className={results.admin.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                    <div className="flex items-center gap-2">
                      {results.admin.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={results.admin.success ? "text-green-800" : "text-red-800"}>
                        <strong>Admin:</strong> {results.admin.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {results.user && (
                  <Alert className={results.user.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                    <div className="flex items-center gap-2">
                      {results.user.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={results.user.success ? "text-green-800" : "text-red-800"}>
                        <strong>Utilisateur:</strong> {results.user.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </div>
            )}

            {results.admin?.success && results.user?.success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Utilisateurs créés avec succès !</h3>
                <p className="text-sm text-green-700">Vous pouvez maintenant vous connecter avec :</p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Admin: admin@capec-ci.org / CapecAdmin2024!</li>
                  <li>• User: user@capec-ci.org / CapecUser2024!</li>
                </ul>
                <Button
                  onClick={() => router.push("/login")}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700"
                >
                  Aller à la page de connexion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}