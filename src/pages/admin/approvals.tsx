
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contentService, ContentSubmission } from "@/services/contentService";
import { menuService, MenuSection, MenuChangeRequest } from "@/services/menuService";
import { 
  FileText, 
  Image as ImageIcon,
  Video as VideoIcon,
  FileIcon as FileIconLucide,
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowLeft,
  Check,
  X,
  Download,
  Settings,
  Menu
} from "lucide-react";

export default function ApprovalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contentSubmissions, setContentSubmissions] = useState<ContentSubmission[]>([]);
  const [menuRequests, setMenuRequests] = useState<MenuChangeRequest[]>([]);
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      const [submissionsData, requestsData, menusData] = await Promise.all([
        contentService.getContentSubmissions(),
        menuService.getMenuChangeRequests(),
        menuService.getMenuSections()
      ]);
      setContentSubmissions(submissionsData);
      setMenuRequests(requestsData);
      setMenus(menusData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentApproval = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id);
    setMessage("");

    try {
      await contentService.updateContentStatus(id, status);
      setContentSubmissions(prev => 
        prev.map(submission => 
          submission.id === id 
            ? { ...submission, status, updated_at: new Date().toISOString() }
            : submission
        )
      );
      setMessage(`Contenu ${status === "approved" ? "approuvé" : "rejeté"} avec succès`);
    } catch (error) {
      setMessage("Erreur lors de la mise à jour du statut");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMenuRequestApproval = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id);
    setMessage("");

    try {
      await menuService.updateMenuChangeRequestStatus(id, status);
      setMenuRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status }
            : request
        )
      );
      setMessage(`Demande de menu ${status === "approved" ? "approuvée" : "rejetée"} avec succès`);
    } catch (error) {
      setMessage("Erreur lors de la mise à jour du statut");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-green-600" />;
      case "video":
        return <VideoIcon className="h-5 w-5 text-purple-600" />;
      case "pdf":
        return <FileIconLucide className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
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

  if (loading || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  const pendingContentSubmissions = contentSubmissions.filter(s => s.status === "pending");
  const pendingMenuRequests = menuRequests.filter(r => r.status === "pending");

  return (
    <Layout title="Approbations">
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Approbations</h1>
            <p className="text-gray-600">Approuvez ou rejetez les soumissions en attente</p>
          </div>
        </div>

        {message && (
          <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Contenus en attente</p>
                  <p className="text-2xl font-bold text-orange-700">{pendingContentSubmissions.length}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
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
                <Menu className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contenus ({pendingContentSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="menus" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Menus ({pendingMenuRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Soumissions de contenu en attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingContentSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <p className="text-gray-600">Aucune soumission de contenu en attente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingContentSubmissions.map((submission) => (
                      <div key={submission.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getContentTypeIcon(submission.content_type)}
                            <div>
                              <h3 className="font-semibold text-gray-900">{submission.title}</h3>
                              {submission.description && (
                                <p className="text-sm text-gray-600 mt-1">{submission.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(submission.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(submission.status)}
                              En attente
                            </div>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <span className="ml-2 capitalize">{submission.content_type}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Menu:</span>
                            <span className="ml-2">{getMenuName(submission.menu_section_id)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Soumis par:</span>
                            <span className="ml-2">{submission.created_by}</span>
                          </div>
                        </div>

                        {submission.content_data && submission.content_type === "text" && (
                          <div className="mb-4 p-3 bg-white rounded text-sm">
                            <span className="font-medium text-gray-700">Contenu:</span>
                            <p className="mt-1 text-gray-600">
                              {submission.content_data.substring(0, 300)}
                              {submission.content_data.length > 300 && "..."}
                            </p>
                          </div>
                        )}

                        {submission.file_urls && submission.file_urls.length > 0 && (
                          <div className="mb-4">
                            <span className="font-medium text-gray-700 text-sm">Fichiers attachés:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {submission.file_urls.map((url, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(url, "_blank")}
                                >
                                  <Download className="mr-1 h-3 w-3" />
                                  Fichier {index + 1}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-3 border-t">
                          <Button
                            onClick={() => handleContentApproval(submission.id, "approved")}
                            disabled={processingId === submission.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approuver
                          </Button>
                          <Button
                            onClick={() => handleContentApproval(submission.id, "rejected")}
                            disabled={processingId === submission.id}
                            variant="destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menus" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Demandes de modification de menu en attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingMenuRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <p className="text-gray-600">Aucune demande de menu en attente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingMenuRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Modification: {request.old_menu_name} → {request.new_menu_name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {request.is_submenu ? "Sous-menu" : "Menu principal"}
                              {request.parent_menu_name && ` de ${request.parent_menu_name}`}
                            </p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              En attente
                            </div>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-700">Ancien libellé:</span>
                            <span className="ml-2">{request.old_menu_name}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Nouveau libellé:</span>
                            <span className="ml-2">{request.new_menu_name}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Soumis par:</span>
                            <span className="ml-2">{request.created_by}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <span className="ml-2">{new Date(request.created_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-3 border-t">
                          <Button
                            onClick={() => handleMenuRequestApproval(request.id, "approved")}
                            disabled={processingId === request.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approuver
                          </Button>
                          <Button
                            onClick={() => handleMenuRequestApproval(request.id, "rejected")}
                            disabled={processingId === request.id}
                            variant="destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
