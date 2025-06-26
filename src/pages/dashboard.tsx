import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { contentService } from "@/services/contentService";
import { menuService } from "@/services/menuService";
import statisticsService, { StatisticsData } from "@/services/statisticsService";
import { 
  FileText, 
  Menu, 
  Settings, 
  BarChart3, 
  Eye,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [submissions, menus, menuRequests] = await Promise.all([
        contentService.getContentSubmissions(),
        menuService.getMenuSections(),
        menuService.getMenuChangeRequests()
      ]);

      const calculatedStats = await statisticsService.calculateStatistics(
        submissions,
        menus,
        menuRequests
      );

      setStats(calculatedStats);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // Set stats to null or an empty state in case of error for production
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  const totalItems = stats ? stats.overview.totalContentSubmissions + stats.overview.totalMenuRequests : 0;
  const approvalRate = stats && totalItems > 0 ? (stats.overview.approvedItems / totalItems) * 100 : 0;

  return (
    <Layout title="Tableau de bord">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord CAPEC</h1>
            <p className="text-gray-600">Gestion des contenus et menus du site cepec-ci.org</p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-gray-600">Données en temps réel</span>
          </div>
        </div>

        {/* Statistiques principales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Contenus</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.overview.totalContentSubmissions}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Éléments Approuvés</p>
                    <p className="text-2xl font-bold text-green-700">{stats.overview.approvedItems}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">En Attente</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.overview.pendingItems}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Taux d'approbation</p>
                    <p className="text-2xl font-bold text-purple-700">{approvalRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/content/new")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ajouter du contenu</h3>
                  <p className="text-sm text-gray-600">Nouveau contenu pour le site</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/menus")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gérer les menus</h3>
                  <p className="text-sm text-gray-600">Modifier la structure</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/overview")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Eye className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Vue d'ensemble</h3>
                  <p className="text-sm text-gray-600">Aperçu complet</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/statistics")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Statistiques</h3>
                  <p className="text-sm text-gray-600">Analyses détaillées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        {stats && stats.recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {activity.type === "content" ? (
                        <FileText className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Menu className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{activity.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={
                        activity.status === "approved" ? "bg-green-100 text-green-800" :
                        activity.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-orange-100 text-orange-800"
                      } 
                      variant="secondary"
                    >
                      {activity.status === "approved" ? "Approuvé" :
                       activity.status === "rejected" ? "Rejeté" : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => router.push("/statistics")}>
                  Voir toutes les statistiques
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
