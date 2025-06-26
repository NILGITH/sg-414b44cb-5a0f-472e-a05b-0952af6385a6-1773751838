import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contentService, ContentFormData } from "@/services/contentService";
import { menuService, MenuSection } from "@/services/menuService";
import { 
  Upload, 
  FileText as FileTextIcon, // Renamed
  Image as ImageIcon, // Renamed
  Video as VideoIcon, // Renamed
  FileIcon as FileIconLucide, // Renamed
  Plus, 
  X, 
  ArrowLeft 
} from "lucide-react";

export default function NewContentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    description: "",
    content_type: "text",
    content_data: "",
    files: [],
    menu_section_id: "",
    submenu_section_id: ""
  });
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadMenus();
    }
  }, [user]);

  const loadMenus = async () => {
    try {
      const menusData = await menuService.getMenuSections();
      setMenus(menusData);
    } catch (error) {
      console.error("Erreur lors du chargement des menus:", error);
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
      await contentService.createContentSubmission(formData, user.id);
      setMessage("Contenu soumis avec succès ! Un email de notification a été envoyé.");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        content_type: "text",
        content_data: "",
        files: [],
        menu_section_id: "",
        submenu_section_id: ""
      });
    } catch (error) {
      setMessage("Erreur lors de la soumission du contenu.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, files }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileTextIcon className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <VideoIcon className="h-5 w-5" />;
      case "pdf":
        return <FileIconLucide className="h-5 w-5" />;
      default:
        return <FileTextIcon className="h-5 w-5" />;
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
  const selectedMainMenu = formData.menu_section_id;
  const submenus = selectedMainMenu ? menus.filter(m => m.parent_id === selectedMainMenu) : [];

  return (
    <Layout title="Nouveau contenu">
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

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter du contenu</h1>
          <p className="text-gray-600">Soumettez du nouveau contenu pour le site CAPEC</p>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-xl text-green-800 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ajouter du nouveau contenu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du contenu *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Nouveau rapport économique"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentType">Type de contenu *</Label>
                  <Select value={formData.content_type} onValueChange={(value: "text" | "image" | "video" | "pdf") => setFormData(prev => ({ ...prev, content_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-4 w-4" />
                          Texte
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Image
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <VideoIcon className="h-4 w-4" />
                          Vidéo
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileIconLucide className="h-4 w-4" />
                          PDF
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du contenu..."
                  rows={3}
                />
              </div>

              {formData.content_type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="contentData">Contenu textuel *</Label>
                  <Textarea
                    id="contentData"
                    value={formData.content_data}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_data: e.target.value }))}
                    placeholder="Saisissez votre contenu ici..."
                    rows={8}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="menu">Menu principal</Label>
                  <Select
                    value={formData.menu_section_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, menu_section_id: value }))}
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
                  <div className="space-y-2">
                    <Label htmlFor="submenu">Sous-menu</Label>
                    <Select
                      value={formData.submenu_section_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, submenu_section_id: value }))}
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
              </div>

              <div className="space-y-4">
                <Label>Fichiers à télécharger</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                    </p>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept={formData.content_type === "image" ? "image/*" : formData.content_type === "video" ? "video/*" : formData.content_type === "pdf" ? ".pdf" : "*"}
                      className="hidden"
                      id="fileInput"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("fileInput")?.click()}
                    >
                      Sélectionner des fichiers
                    </Button>
                  </div>
                </div>

                {formData.files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Fichiers sélectionnés:</Label>
                    <div className="space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(formData.content_type)}
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message && (
                <Alert className={message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={message.includes("succès") ? "text-green-800" : "text-red-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Envoi en cours..." : "Soumettre le contenu"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/content")}
                  className="px-8"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
