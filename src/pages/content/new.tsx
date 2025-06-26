import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, ArrowLeft, CheckCircle, Plus, List } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import contentService, { ContentFormData } from "@/services/contentService";
import { menuService, MenuSection } from "@/services/menuService";

export default function NewContentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    description: "",
    content_type: "text",
    content_data: "",
    menu_section_id: "",
    submenu_section_id: ""
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadMenus();
  }, [user, router]);

  const loadMenus = async () => {
    try {
      const menuData = await menuService.getMenuSections();
      setMenus(menuData);
    } catch (error) {
      console.error("Erreur lors du chargement des menus:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setAlert(null);

    try {
      const submissionData: ContentFormData = {
        ...formData,
        files: selectedFiles.length > 0 ? selectedFiles : undefined
      };

      await contentService.createContentSubmission(submissionData, user.id);
      
      setAlert({
        type: "success",
        message: "Contenu soumis avec succès ! Un email de notification a été envoyé."
      });

      // Afficher le modal de succès
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      setAlert({
        type: "error",
        message: error instanceof Error ? error.message : "Erreur lors de la soumission du contenu"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    // Réinitialiser le formulaire
    setFormData({
      title: "",
      description: "",
      content_type: "text",
      content_data: "",
      menu_section_id: "",
      submenu_section_id: ""
    });
    setSelectedFiles([]);
    setAlert(null);
    setShowSuccessModal(false);
  };

  const handleFinish = () => {
    router.push("/content");
  };

  const mainMenus = menus.filter(menu => !menu.parent_id);
  const submenus = menus.filter(menu => menu.parent_id === formData.menu_section_id);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Nouveau Contenu</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Ajouter du contenu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alert && (
                <Alert className={`mb-4 ${alert.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
                  <AlertDescription className={alert.type === "success" ? "text-green-700" : "text-red-700"}>
                    {alert.message}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Nouveau rapport économique"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type de contenu *</label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value: "text" | "image" | "video" | "pdf") =>
                      setFormData({ ...formData, content_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texte</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du contenu..."
                    rows={3}
                  />
                </div>

                {formData.content_type === "text" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Contenu textuel *</label>
                    <Textarea
                      value={formData.content_data}
                      onChange={(e) => setFormData({ ...formData, content_data: e.target.value })}
                      placeholder="Saisissez votre contenu ici..."
                      rows={6}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Menu principal</label>
                  <Select
                    value={formData.menu_section_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, menu_section_id: value, submenu_section_id: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un menu" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainMenus.map((menu) => (
                        <SelectItem key={menu.id} value={menu.id}>
                          {menu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {submenus.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Sous-menu</label>
                    <Select
                      value={formData.submenu_section_id}
                      onValueChange={(value) => setFormData({ ...formData, submenu_section_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un sous-menu" />
                      </SelectTrigger>
                      <SelectContent>
                        {submenus.map((submenu) => (
                          <SelectItem key={submenu.id} value={submenu.id}>
                            {submenu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Fichiers à télécharger</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      Sélectionner des fichiers
                    </Button>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Fichiers sélectionnés:</p>
                      <ul className="text-sm text-gray-600">
                        {selectedFiles.map((file, index) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Soumission en cours..." : "Soumettre le contenu"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de succès */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Contenu soumis avec succès !
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Votre contenu a été soumis avec succès et un email de notification a été envoyé.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Que souhaitez-vous faire maintenant ?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleAddAnother}
                className="flex items-center gap-2 flex-1"
              >
                <Plus className="h-4 w-4" />
                Ajouter un autre contenu
              </Button>
              <Button
                onClick={handleFinish}
                className="flex items-center gap-2 flex-1 bg-green-600 hover:bg-green-700"
              >
                <List className="h-4 w-4" />
                Terminer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
