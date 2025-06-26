
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue, {user.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>C'est ici que vous pourrez gérer le contenu du site CEPEC-CI.</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Menus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Organisez les menus et sous-menus du site.</p>
              <Link href="/menus" passHref>
                <Button>Gérer les menus</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ajouter du Contenu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Soumettez du texte, des images, vidéos ou PDFs.</p>
              <Link href="/content/new" passHref>
                <Button>Ajouter du contenu</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voir le Contenu Soumis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Revoyez et gérez le contenu en attente ou approuvé.</p>
              <Link href="/content" passHref>
                <Button>Voir le contenu</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
