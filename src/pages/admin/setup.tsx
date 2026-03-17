import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Users } from "lucide-react";
import adminService from "@/services/adminService";
import Link from "next/link";

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    admin?: { success: boolean; message: string };
    user?: { success: boolean; message: string };
    menus?: { success: boolean; message: string };
  }>({});

  const handleInitialize = async () => {
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

      // Synchroniser les menus
      const menusResult = await adminService.initializeMainMenus();
      setResults(prev => ({ ...prev, menus: menusResult }));

    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
          <CardTitle className="text-2xl">Configuration Initiale - CAPEC</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Cette page va initialiser :</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Compte administrateur : admin@capec-ci.org</li>
              <li>Compte utilisateur : user@capec-ci.org</li>
              <li>Structure des menus et sous-menus du site CAPEC</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleInitialize}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initialisation...
                </>
              ) : (
                "Initialisation complète"
              )}
            </Button>

            <Link href="/admin/init-users">
              <Button
                variant="outline"
                className="w-full border-blue-500 text-blue-700 hover:bg-blue-50"
              >
                <Users className="mr-2 h-4 w-4" />
                Créer uniquement les utilisateurs
              </Button>
            </Link>
          </div>

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

              {results.menus && (
                <Alert className={results.menus.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                  <div className="flex items-center gap-2">
                    {results.menus.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={results.menus.success ? "text-green-800" : "text-red-800"}>
                      <strong>Menus:</strong> {results.menus.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          )}

          {results.admin?.success && results.user?.success && results.menus?.success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Initialisation terminée avec succès !</h3>
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
  );
}