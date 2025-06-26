import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contentService, ContentSubmission } from "@/services/contentService";
import { menuService, MenuSection, MenuChangeRequest } from "@/services/menuService";
import emailService, { OverviewEmailData } from "@/services/emailService"; // Updated import
import { 
  FileText, 
  Image as ImageIcon, // Renamed
  Video as VideoIcon, // Renamed
  FileIcon as FileIconLucide, // Renamed
  CheckCircle, 
  Clock, 
  XCircle, 
  Send,
  Menu,
  Settings
} from "lucide-react";
import { ArrowLeft } from "lucide-react";

export default function OverviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [menuRequests, setMenuRequests] = useState<MenuChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [submissionsData, menusData, requestsData] = await Promise.all([
        contentService.getContentSubmissions(),
        menuService.getMenuSections(),
        menuService.getMenuChangeRequests()
      ]);
      setSubmissions(submissionsData);
      setMenus(menusData);
      setMenuRequests(requestsData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "image":
        return <ImageIcon className="h-4 w-4 text-green-600" />;
      case "video":
        return <VideoIcon className="h-4 w-4 text-purple-600" />;
      case "pdf":
        return <FileIconLucide className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approuvé";
      case "rejected":
        return "Rejeté";
      default:
        return "En attente";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getMenuName = (menuId?: string) => {
    if (!menuId) return "Non assigné";
    const menu = menus.find(m => m.id === menuId);
    return menu?.name || "Menu inconnu";
  };

  const handleSendAllData = async () => {
    setIsSending(true);
    setMessage("");

    try {
      const allData: OverviewEmailData = {
        menus: menus,
        menuRequests: menuRequests,
        contentSubmissions: submissions,
        summary: {
          totalMenus: menus.filter(m => !m.parent_id).length,
          totalSubmenus: menus.filter(m => m.parent_id).length,
          totalMenuRequests: menuRequests.length,
          pendingMenuRequests: menuRequests.filter(r => r.status === "pending").length,
          totalContentSubmissions: submissions.length,
          pendingContentSubmissions: submissions.filter(s => s.status === "pending").length,
          approvedContentSubmissions: submissions.filter(s => s.status === "approved").length
        },
        submissionType: "Vue d'ensemble complète"
      };

      const result = await emailService.sendOverviewData(allData);
      
      if (result.success) {
        setMessage(`Vue d'ensemble complète envoyée avec succès à petronildaga@capec-ci.org`);
      } else {
        setMessage("Erreur lors de l'envoi des données");
      }
    } catch (error) {
      setMessage("Erreur lors de l'envoi des données");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  if (loading || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  const mainMenus = menus.filter(m => !m.parent_id);
  const submenus = menus.filter(m => m.parent_id);
  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  // const approvedSubmissions = submissions.filter(s => s.status === "approved"); // This variable was unused
  const pendingMenuRequests = menuRequests.filter(r => r.status === "pending");

  return (
    <Layout title="Vue d'ensemble">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble complète</h1>
            <p className="text-gray-600">Aperçu de tous les éléments : menus, sous-menus et contenus</p>
          </div>
          <Button 
            onClick={handleSendAllData}
            disabled={isSending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSending ? "Envoi..." : "Envoyer tout par email"}
          </Button>
        </div>

        {message && (
          <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Menus principaux</p>
                  <p className="text-2xl font-bold text-orange-700">{mainMenus.length}</p>
                </div>
                <Menu className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Sous-menus</p>
                  <p className="text-2xl font-bold text-green-700">{submenus.length}</p>
                </div>
                <Settings className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Contenus en attente</p>
                  <p className="text-2xl font-bold text-blue-700">{pendingSubmissions.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Demandes de menu</p>
                  <p className="text-2xl font-bold text-purple-700">{pendingMenuRequests.length}</p>
                </div>
                <XCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Structure des menus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mainMenus.map((menu) => {
                  const menuSubmenus = submenus.filter(s => s.parent_id === menu.id);
                  return (
                    <div key={menu.id} className="border rounded-lg p-3">
                      <div className="font-medium text-gray-900">{menu.name}</div>
                      {menuSubmenus.length > 0 && (
                        <div className="ml-4 mt-2 space-y-1">
                          {menuSubmenus.map((submenu) => (
                            <div key={submenu.id} className="text-sm text-gray-600">
                              • {submenu.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contenus récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getContentTypeIcon(submission.content_type)}
                      <div>
                        <div className="font-medium text-sm">{submission.title}</div>
                        <div className="text-xs text-gray-500">{getMenuName(submission.menu_section_id)}</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(submission.status)} variant="secondary">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(submission.status)}
                        {getStatusText(submission.status)}
                      </div>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Demandes de modification de menus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {menuRequests.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Aucune demande de modification</p>
            ) : (
              <div className="space-y-3">
                {menuRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">
                        {request.old_menu_name} → {request.new_menu_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.is_submenu ? "Sous-menu" : "Menu principal"}
                        {request.parent_menu_name && ` de ${request.parent_menu_name}`}
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)} variant="secondary">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </div>
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
