import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Eye, Upload, Settings } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Layout title="Tableau de bord">
      <div className="space-y-6">
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">
              Bienvenue, {user.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Gérez facilement le contenu du site CEPEC-CI. Ajoutez des textes, images, vidéos et documents PDF pour mettre à jour les menus et sous-menus.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-orange-100">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Menu className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Gestion des Menus</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">Organisez les menus et sous-menus du site.</p>
              <Link href="/menus" passHref>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Gérer les menus
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-green-100">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Ajouter du Contenu</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">Soumettez du texte, des images, vidéos ou PDFs.</p>
              <Link href="/content/new" passHref>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Ajouter du contenu
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-100">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Vue d'ensemble</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">Consultez tous les éléments : menus, sous-menus et contenus.</p>
              <Link href="/overview" passHref>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir tout
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-blue-100">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Approbations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">Approuvez ou rejetez les soumissions en attente.</p>
              <Link href="/admin/approvals" passHref>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Gérer les approbations
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Statistiques rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">7</div>
                <div className="text-sm text-gray-600">Menus actifs</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-gray-600">Contenus en attente</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">1</div>
                <div className="text-sm text-gray-600">Contenu approuvé</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
