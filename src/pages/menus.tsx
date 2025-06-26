import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
// import { menuService, MenuChangeRequest, MenuSection } from "@/services/menuService"; // MenuSection removed
import { menuService, MenuChangeRequest } from "@/services/menuService"; // MenuSection removed
import { CheckCircle, Clock, XCircle, Send, ArrowLeft, Plus } from "lucide-react";

export default function MenusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // const [menus, setMenus] = useState<MenuSection[]>([]); // Removed unused state
  const [requests, setRequests] = useState<MenuChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    oldMenuName: "",
    newMenuName: "",
    isSubmenu: false,
    parentMenuName: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
      // const [menusData, requestsData] = await Promise.all([ // Modified to fetch only requests
      //   menuService.getMenuSections(),
      //   menuService.getMenuChangeRequests()
      // ]);
      // setMenus(menusData); // Removed
      const requestsData = await menuService.getMenuChangeRequests();
      setRequests(requestsData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      await menuService.createMenuChangeRequest({
        old_menu_name: formData.oldMenuName,
        new_menu_name: formData.newMenuName,
        is_submenu: formData.isSubmenu,
        parent_menu_name: formData.isSubmenu ? formData.parentMenuName : undefined
      }, user.id);

      setMessage("Demande de modification soumise avec succès ! Un email de notification a été envoyé.");
      setFormData({
        oldMenuName: "",
        newMenuName: "",
        isSubmenu: false,
        parentMenuName: ""
      });
      setShowForm(false);
      await loadData();
    } catch (error) {
      setMessage("Erreur lors de la soumission de la demande.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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

  // Removed unused getStatusColor function

  if (loading || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  // Removed unused mainMenus and submenus variables
  // const mainMenus = menus.filter(m => !m.parent_id);
  // const submenus = menus.filter(m => m.parent_id);

  return (
    <Layout title="Gestion des menus">
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des menus</h1>
            <p className="text-gray-600">Gérez la structure des menus du site</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Demander une modification
          </Button>
        </div>

        {showForm && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                <Send className="h-5 w-5" />
                Demander une modification de menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldMenu">Libellé actuel du menu/sous-menu</Label>
                    <Input
                      id="oldMenu"
                      value={formData.oldMenuName}
                      onChange={(e) => setFormData({ ...formData, oldMenuName: e.target.value })}
                      placeholder="Ex: À propos"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newMenu">Nouveau libellé souhaité</Label>
                    <Input
                      id="newMenu"
                      value={formData.newMenuName}
                      onChange={(e) => setFormData({ ...formData, newMenuName: e.target.value })}
                      placeholder="Ex: Qui sommes-nous"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSubmenu"
                    checked={formData.isSubmenu}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSubmenu: checked as boolean })}
                  />
                  <Label htmlFor="isSubmenu">Il s'agit d'un sous-menu</Label>
                </div>

                {formData.isSubmenu && (
                  <div className="space-y-2">
                    <Label htmlFor="parentMenu">Menu parent</Label>
                    <Input
                      id="parentMenu"
                      value={formData.parentMenuName}
                      onChange={(e) => setFormData({ ...formData, parentMenuName: e.target.value })}
                      placeholder="Ex: À propos"
                      required
                    />
                  </div>
                )}

                {message && (
                  <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
                      {message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? "Envoi en cours..." : "Soumettre la demande"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-xl text-green-800">Historique des demandes</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Aucune demande de modification</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="font-medium">{getStatusText(request.status)}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Ancien libellé:</span> {request.old_menu_name}
                      </div>
                      <div>
                        <span className="font-medium">Nouveau libellé:</span> {request.new_menu_name}
                      </div>
                      {request.is_submenu && (
                        <div>
                          <span className="font-medium">Menu parent:</span> {request.parent_menu_name}
                        </div>
                      )}
                    </div>
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
