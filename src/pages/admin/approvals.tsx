import { useState, useEffect } from "react";
// import { useRouter } from "next/router"; // router n'est pas utilisé
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contentService, ContentSubmission } from "@/services/contentService";
import { menuService, MenuChangeRequest, MenuSection } from "@/services/menuService"; // Ajout de MenuSection
import emailService from "@/services/emailService";
import { 
  FileText, 
  Image as ImageIcon,
  Video as VideoIcon,
  FileIcon as FileIconLucide,
  CheckCircle, 
  XCircle, 
  Clock,
  LogOut,
  Shield
} from "lucide-react";

export default function ApprovalsPage() {
  // const router = useRouter(); // router n'est pas utilisé
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [menuRequests, setMenuRequests] = useState<MenuChangeRequest[]>([]);
  const [menus, setMenus] = useState<MenuSection[]>([]); // Type MenuSection[]
  const [pageIsLoading, setPageIsLoading] = useState(true); 
  const [message, setMessage] = useState("");

  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    if (adminSession === "authenticated") {
      setIsAuthenticated(true);
      loadData();
    } else {
      setPageIsLoading(false); // S'assurer que le chargement s'arrête si non authentifié
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setPageIsLoading(true); // Indiquer le chargement pendant la tentative de connexion

    if (email === "admin@capec-ci.org" && password === "admin2024") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_session", "authenticated");
      await loadData(); // Charger les données après une connexion réussie
    } else {
      setLoginError("Email ou mot de passe incorrect");
      setPageIsLoading(false); // Arrêter le chargement en cas d'échec
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_session");
    setEmail("");
    setPassword("");
    setSubmissions([]); // Vider les données lors de la déconnexion
    setMenuRequests([]);
    setMenus([]);
  };

  const loadData = async () => {
    setPageIsLoading(true); // Indiquer le début du chargement des données
    try {
      const [submissionsData, requestsData, menusData] = await Promise.all([
        contentService.getContentSubmissions(),
        menuService.getMenuChangeRequests(),
        menuService.getMenuSections()
      ]);
      setSubmissions(submissionsData);
      setMenuRequests(requestsData);
      setMenus(menusData);
    } catch (_loadError) { // error variable is unused, prefixed with _
      console.error("Erreur lors du chargement:", _loadError);
      setMessage("Erreur lors du chargement des données.");
    } finally {
      setPageIsLoading(false); // Indiquer la fin du chargement
    }
  };

  const getMenuName = (menuId?: string) => {
    if (!menuId) return "Non assigné";
    const menu = menus.find(m => m.id === menuId);
    return menu?.name || "Menu inconnu";
  };

  const handleApproveContent = async (id: string, status: "approved" | "rejected") => {
    try {
      const submission = await contentService.updateContentStatus(id, status);
      if (submission) {
        await emailService.sendApprovalNotification({
          id: submission.id,
          title: submission.title,
          type: submission.content_type
        }, status);
        setMessage(`Contenu ${status === "approved" ? "approuvé" : "rejeté"} avec succès`);
        await loadData(); // Recharger les données
      }
    } catch (_updateError) { // error variable is unused, prefixed with _
      console.error("Erreur lors de la mise à jour du contenu:", _updateError);
      setMessage("Erreur lors de la mise à jour du statut du contenu.");
    }
  };

  const handleApproveMenuRequest = async (id: string, status: "approved" | "rejected") => {
    try {
      await menuService.updateMenuChangeRequestStatus(id, status);
      // Optionnel: Envoyer un email de notification pour la demande de menu
      // const request = menuRequests.find(r => r.id === id);
      // if (request) {
      //   await emailService.sendMenuRequestApprovalNotification(request, status);
      // }
      setMessage(`Demande de menu ${status === "approved" ? "approuvée" : "rejetée"} avec succès`);
      await loadData(); // Recharger les données
    } catch (_updateError) { // error variable is unused, prefixed with _
      console.error("Erreur lors de la mise à jour de la demande de menu:", _updateError);
      setMessage("Erreur lors de la mise à jour du statut de la demande de menu.");
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

  if (pageIsLoading && !isAuthenticated) { // Afficher le chargement uniquement si non authentifié et en cours de chargement initial
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Connexion Administrateur</CardTitle>
            <p className="text-gray-600">Accès aux approbations CAPEC</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@capec-ci.org"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe administrateur"
                  required
                />
              </div>
              {loginError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === "pending");
  const pendingMenuRequests = menuRequests.filter(r => r.status === "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel d'Approbation</h1>
                <p className="text-sm text-gray-600">Gestion des soumissions en attente</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className={message.includes("succès") ? "border-green-200 bg-green-50 mb-6" : "border-red-200 bg-red-50 mb-6"}>
            <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Contenus en attente</p>
                  <p className="text-2xl font-bold text-orange-700">{pendingSubmissions.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Demandes menu</p>
                  <p className="text-2xl font-bold text-blue-700">{pendingMenuRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total approuvés</p>
                  <p className="text-2xl font-bold text-green-700">
                    {submissions.filter(s => s.status === "approved").length + menuRequests.filter(r => r.status === "approved").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total rejetés</p>
                  <p className="text-2xl font-bold text-red-700">
                    {submissions.filter(s => s.status === "rejected").length + menuRequests.filter(r => r.status === "rejected").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Soumissions de contenu en attente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Soumissions de contenu en attente ({pendingSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSubmissions.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Aucune soumission en attente</p>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getContentTypeIcon(submission.content_type)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{submission.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{submission.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Type: {submission.content_type}</span>
                              <span>Menu: {getMenuName(submission.menu_section_id)}</span>
                              {submission.submenu_section_id && (
                                <span>Sous-menu: {getMenuName(submission.submenu_section_id)}</span>
                              )}
                              <span>Par: {submission.created_by}</span>
                            </div>
                            {submission.file_urls && submission.file_urls.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">Fichiers: </span>
                                {submission.file_urls.map((url, index) => (
                                  <span key={index} className="text-xs text-blue-600 mr-2">
                                    {url.split("/").pop()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApproveContent(submission.id, "approved")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproveContent(submission.id, "rejected")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demandes de modification de menu en attente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Demandes de modification de menu en attente ({pendingMenuRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingMenuRequests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Aucune demande en attente</p>
              ) : (
                <div className="space-y-4">
                  {pendingMenuRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {request.old_menu_name} → {request.new_menu_name}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Type: {request.is_submenu ? "Sous-menu" : "Menu principal"}</span>
                            {request.parent_menu_name && (
                              <span>Menu parent: {request.parent_menu_name}</span>
                            )}
                            <span>Par: {request.created_by}</span>
                            <span>Le: {new Date(request.created_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApproveMenuRequest(request.id, "approved")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproveMenuRequest(request.id, "rejected")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des approbations */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des approbations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...submissions, ...menuRequests]
                  .filter(item => item.status !== "pending")
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 10)
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="font-medium text-sm">
                            {"title" in item ? item.title : `${item.old_menu_name} → ${item.new_menu_name}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)} variant="secondary">
                        {item.status === "approved" ? "Approuvé" : "Rejeté"}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
