import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, 
  Menu, 
  BarChart3, 
  Eye, 
  Settings,
  Upload,
  CheckSquare,
  Users
} from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout title="Tableau de bord">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord CAPEC</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue sur la plateforme de gestion de contenu du site CAPEC-CI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Soumission de contenu */}
          <Card className="hover:shadow-lg transition-shadow border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Upload className="h-5 w-5" />
                Soumettre du contenu
              </CardTitle>
              <CardDescription>
                Ajouter des articles, images, vidéos ou documents PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link href="/content/new">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Créer une soumission
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Historique des contenus */}
          <Card className="hover:shadow-lg transition-shadow border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <FileText className="h-5 w-5" />
                Mes contenus
              </CardTitle>
              <CardDescription>
                Consulter l'historique de vos soumissions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link href="/content">
                <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                  Voir mes contenus
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Gestion des menus */}
          <Card className="hover:shadow-lg transition-shadow border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Menu className="h-5 w-5" />
                Gestion des menus
              </CardTitle>
              <CardDescription>
                Demander des modifications de menus et sous-menus
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link href="/menus">
                <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                  Gérer les menus
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Vue d'ensemble */}
          <Card className="hover:shadow-lg transition-shadow border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Eye className="h-5 w-5" />
                Vue d'ensemble
              </CardTitle>
              <CardDescription>
                Aperçu complet des menus et contenus
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link href="/overview">
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  Voir l'aperçu
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card className="hover:shadow-lg transition-shadow border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <BarChart3 className="h-5 w-5" />
                Statistiques
              </CardTitle>
              <CardDescription>
                Analyse détaillée de l'activité
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link href="/statistics">
                <Button variant="outline" className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  Voir les stats
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Administration (si admin) */}
          <Card className="hover:shadow-lg transition-shadow border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <CheckSquare className="h-5 w-5" />
                Administration
              </CardTitle>
              <CardDescription>
                Approuver les soumissions et gérer les utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link href="/admin/login">
                <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                  Espace Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Instructions rapides */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Guide rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Soumettre du contenu</h4>
                  <p className="text-sm text-gray-600">
                    Cliquez sur "Soumettre du contenu" pour ajouter des articles, images, vidéos ou documents PDF au site CAPEC.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Demander une modification de menu</h4>
                  <p className="text-sm text-gray-600">
                    Allez dans "Gestion des menus" pour proposer l'ajout ou la modification de menus et sous-menus.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Suivre l'état de vos soumissions</h4>
                  <p className="text-sm text-gray-600">
                    Consultez "Mes contenus" pour voir le statut de vos soumissions (en attente, approuvé, rejeté).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Administration</h4>
                  <p className="text-sm text-gray-600">
                    Les administrateurs peuvent accéder à l'espace admin pour approuver ou rejeter les soumissions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}