import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, ArrowLeft, CheckCircle, Plus, List, X } from "lucide-react";
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
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Nouveau Contenu</h1>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Formulaire de Soumission de Contenu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {alert && (
                <Alert className={`mb-6 ${alert.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
                  <AlertDescription className={alert.type === "success" ? "text-green-700" : "text-red-700"}>
                    {alert.message}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Titre du contenu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Rapport économique trimestriel Q1 2024"
                    required
                    className="border-gray-300 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Type de contenu <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value: "text" | "image" | "video" | "pdf") =>
                      setFormData({ ...formData, content_type: value })
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:border-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">📝 Texte</SelectItem>
                      <SelectItem value="image">🖼️ Image</SelectItem>
                      <SelectItem value="video">🎥 Vidéo</SelectItem>
                      <SelectItem value="pdf">📄 PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Sélectionnez le type de contenu principal que vous souhaitez soumettre
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez brièvement le contenu que vous soumettez..."
                    rows={3}
                    className="border-gray-300 focus:border-orange-500"
                  />
                </div>

                {formData.content_type === "text" && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Contenu textuel <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={formData.content_data}
                      onChange={(e) => setFormData({ ...formData, content_data: e.target.value })}
                      placeholder="Saisissez votre contenu ici..."
                      rows={8}
                      required
                      className="border-gray-300 focus:border-orange-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pour du contenu texte, saisissez directement le texte ci-dessus
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Menu principal
                    </label>
                    <Select
                      value={formData.menu_section_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, menu_section_id: value, submenu_section_id: "" })
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-orange-500">
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
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        Sous-menu
                      </label>
                      <Select
                        value={formData.submenu_section_id}
                        onValueChange={(value) => setFormData({ ...formData, submenu_section_id: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-orange-500">
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
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Fichiers à télécharger
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Glissez-déposez vos fichiers ici
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      ou cliquez sur le bouton ci-dessous
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      Sélectionner des fichiers
                    </Button>
                    <p className="text-xs text-gray-500 mt-3">
                      Formats acceptés: Images, Vidéos, PDF, Documents Word, Excel
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Fichiers sélectionnés ({selectedFiles.length})
                      </p>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-orange-100 rounded flex items-center justify-center">
                                <Upload className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-semibold py-6"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Soumission en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Soumettre le contenu
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="px-8"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Contenu soumis avec succès !
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Votre contenu a été soumis avec succès et un email de notification a été envoyé à l'administrateur.
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
                Ajouter un autre
              </Button>
              <Button
                onClick={handleFinish}
                className="flex items-center gap-2 flex-1 bg-green-600 hover:bg-green-700"
              >
                <List className="h-4 w-4" />
                Voir mes contenus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}