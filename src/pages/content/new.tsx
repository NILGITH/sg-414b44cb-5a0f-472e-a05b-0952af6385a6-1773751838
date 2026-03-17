import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Image as ImageIcon, Video, FileUp, X, Eye, Info, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { contentService } from "@/services/contentService";
import { menuService, MenuSection } from "@/services/menuService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function NewContent() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentData, setContentData] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [selectedSubmenuId, setSelectedSubmenuId] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ type: string; url: string } | null>(null);

  useEffect(() => {
    loadMenuSections();
  }, []);

  const loadMenuSections = async () => {
    try {
      const sections = await menuService.getMenuSections();
      setMenuSections(sections);
    } catch (error) {
      console.error("Erreur lors du chargement des menus:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les menus" });
    }
  };

  const mainMenus = menuSections.filter(section => !section.parent_id);
  const submenus = selectedMenuId ? menuSections.filter(section => section.parent_id === selectedMenuId) : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "pdf";
    setPreviewContent({ type, url });
    setPreviewOpen(true);
  };

  const determineContentType = () => {
    const hasText = contentData.trim().length > 0;
    const fileTypes = new Set(files.map(f => {
      if (f.type.startsWith("image/")) return "image";
      if (f.type.startsWith("video/")) return "video";
      if (f.type.includes("pdf")) return "pdf";
      return "other";
    }));

    if (hasText && fileTypes.size > 0) return "mixed";
    if (fileTypes.size > 1) return "mixed";
    if (fileTypes.size === 1) {
      const type = Array.from(fileTypes)[0];
      if (hasText) return "mixed";
      return type as any;
    }
    return "text";
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContentData("");
    setFiles([]);
    setSelectedMenuId("");
    setSelectedSubmenuId("");
    setSubmitStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "Le titre est requis" });
      return;
    }

    if (!selectedMenuId) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez sélectionner un menu" });
      return;
    }

    if (!contentData.trim() && files.length === 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez ajouter du texte ou au moins un fichier" });
      return;
    }

    setIsSubmitting(true);

    try {
      const finalType = determineContentType();
      
      await contentService.createContentSubmission({
        title: title.trim(),
        description: description.trim(),
        content_type: finalType,
        content_data: contentData.trim() || null,
        files,
        menu_section_id: selectedMenuId,
        submenu_section_id: (selectedSubmenuId && selectedSubmenuId !== "none") ? selectedSubmenuId : undefined
      }, user?.id || "anonymous");

      setSubmitStatus("success");
      toast({ title: "Succès", description: "Contenu envoyé pour approbation" });
    } catch (error) {
      console.error("Erreur:", error);
      setSubmitStatus("error");
      toast({ variant: "destructive", title: "Erreur", description: "Échec de la soumission" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <Layout title="Soumission réussie">
        <div className="container mx-auto py-20 px-4 flex justify-center">
          <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden rounded-3xl">
            <div className="bg-green-600 p-12 text-white flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/20 rounded-full animate-bounce">
                <CheckCircle2 className="h-16 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight uppercase">Bravo !</h2>
              <p className="text-green-50 font-medium opacity-90 leading-relaxed italic">
                Votre contenu a été soumis avec succès et attend désormais la validation de l'administrateur.
              </p>
            </div>
            <CardContent className="p-8 space-y-4 bg-white">
              <Link href="/dashboard" className="block w-full">
                <Button className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl shadow-lg">
                  Retour au tableau de bord
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="w-full h-14 border-2 border-gray-100 text-gray-600 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-gray-50 transition-all"
              >
                Soumettre une autre publication
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Soumettre du contenu">
      <div className="container mx-auto py-10 px-4">
        {submitStatus === "error" && (
          <Alert className="mb-8 border-red-200 bg-red-50 rounded-2xl p-6 shadow-xl shadow-red-100/50 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-red-900 uppercase italic text-lg tracking-tight">Erreur de soumission</h3>
                <p className="text-red-700 font-medium italic text-sm">Une erreur technique est survenue. Veuillez vérifier votre connexion ou réessayer plus tard.</p>
              </div>
              <Button 
                onClick={() => setSubmitStatus("idle")} 
                variant="ghost" 
                className="text-red-600 hover:bg-red-100 font-black text-[10px] uppercase tracking-widest"
              >
                Réessayer
              </Button>
            </div>
          </Alert>
        )}

        <Card className="max-w-4xl mx-auto border-none shadow-2xl shadow-gray-200">
          <CardHeader className="bg-orange-600 text-white rounded-t-xl pb-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">NOUVELLE SOUMISSION</CardTitle>
                <CardDescription className="text-orange-100 font-medium">
                  Composez votre contenu (texte, images, vidéos, PDF) pour le site CAPEC
                </CardDescription>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <PlusCircleIcon className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Infos de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title" className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Titre de la publication *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Rapport annuel 2025" className="h-12 border-gray-200 font-bold focus:ring-orange-500 rounded-xl" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="menu" className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Menu Principal *</Label>
                  <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
                    <SelectTrigger id="menu" className="h-12 border-gray-200 font-bold rounded-xl shadow-sm"><SelectValue placeholder="Choisir un menu" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">{mainMenus.map(m => <SelectItem key={m.id} value={m.id} className="font-bold text-gray-700">{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="submenu" className="font-bold uppercase text-[10px] tracking-widest text-gray-500">Sous-menu (Optionnel)</Label>
                  <Select value={selectedSubmenuId} onValueChange={setSelectedSubmenuId}>
                    <SelectTrigger id="submenu" className="h-12 border-gray-200 font-bold rounded-xl shadow-sm"><SelectValue placeholder="Choisir un sous-menu" /></SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      <SelectItem value="none" className="italic text-gray-400">Aucun sous-menu</SelectItem>
                      {submenus.map(s => <SelectItem key={s.id} value={s.id} className="font-bold text-gray-700">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contenu Texte */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="p-2 bg-orange-50 rounded-lg"><FileText className="h-5 w-5" /></div>
                  <h3 className="font-black italic uppercase tracking-tight">CORPS DU TEXTE</h3>
                </div>
                <Textarea 
                  id="content" 
                  value={contentData} 
                  onChange={(e) => setContentData(e.target.value)} 
                  placeholder="Rédigez votre article ou le contenu textuel ici..." 
                  className="min-h-[250px] border-gray-200 focus:border-orange-500 text-lg leading-relaxed shadow-inner rounded-2xl p-6 font-medium bg-[#fafafa]" 
                />
              </div>

              {/* Fichiers Multiples */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="p-2 bg-blue-50 rounded-lg"><ImageIcon className="h-5 w-5" /></div>
                    <h3 className="font-black italic uppercase tracking-tight">MÉDIAS & DOCUMENTS</h3>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase font-black text-gray-400 border-gray-200 bg-white shadow-sm">PDF</Badge>
                    <Badge variant="outline" className="text-[9px] uppercase font-black text-gray-400 border-gray-200 bg-white shadow-sm">Images</Badge>
                    <Badge variant="outline" className="text-[9px] uppercase font-black text-gray-400 border-gray-200 bg-white shadow-sm">Vidéos</Badge>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all group cursor-pointer relative overflow-hidden">
                  <input id="files" type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="space-y-4 relative z-0">
                    <div className="p-5 bg-white rounded-2xl shadow-xl shadow-gray-100 w-fit mx-auto group-hover:scale-110 transition-transform border border-gray-50">
                      <Upload className="h-10 w-10 text-gray-400 group-hover:text-orange-500" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-black text-lg">Cliquez ou glissez vos fichiers</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-2">Maximum 50MB par fichier</p>
                    </div>
                  </div>
                </div>

                {/* Liste des fichiers */}
                {files.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 group hover:border-orange-200 transition-all">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`p-3 rounded-xl ${file.type.startsWith("image/") ? 'bg-blue-50' : file.type.startsWith("video/") ? 'bg-purple-50' : 'bg-red-50'}`}>
                            {file.type.startsWith("image/") ? <ImageIcon className="h-5 w-5 text-blue-500" /> : 
                             file.type.startsWith("video/") ? <Video className="h-5 w-5 text-purple-500" /> : 
                             <FileUp className="h-5 w-5 text-red-500" />}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{file.name}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="ghost" size="icon" onClick={() => handlePreview(file)} className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="h-5 w-5" /></Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 transition-colors"><X className="h-5 w-5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Boutons Finaux */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-gray-100 gap-6">
                <div className="flex items-center gap-3 text-gray-400 italic text-sm font-medium bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 w-full sm:w-auto">
                  <Info className="h-5 w-5 text-orange-400 shrink-0" />
                  <span>Chaque soumission est vérifiée par un administrateur CAPEC.</span>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1 sm:flex-none font-black uppercase text-[10px] tracking-widest text-gray-400 h-14 px-8" 
                    onClick={() => {setTitle(""); setContentData(""); setFiles([]);}}
                  >
                    Réinitialiser
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 sm:flex-none bg-orange-600 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] px-12 h-14 shadow-2xl shadow-orange-200 rounded-2xl transition-all"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        ENVOI EN COURS...
                      </div>
                    ) : "VALIDER LA PUBLICATION"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl border-none shadow-2xl p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-8 bg-gray-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg"><Eye className="h-5 w-5" /></div>
              <DialogTitle className="font-black italic uppercase tracking-tighter text-2xl">Prévisualisation média</DialogTitle>
            </div>
          </DialogHeader>
          <div className="bg-black/5 flex items-center justify-center min-h-[400px]">
            {previewContent?.type === "image" && <img src={previewContent.url} alt="Preview" className="max-w-full h-auto max-h-[70vh] object-contain shadow-2xl rounded-lg" />}
            {previewContent?.type === "video" && <video src={previewContent.url} controls className="max-w-full h-auto max-h-[70vh] shadow-2xl rounded-lg" />}
            {previewContent?.type === "pdf" && <iframe src={previewContent.url} className="w-full h-[70vh] border-none" title="PDF Preview" />}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode; variant: string; className?: string }) {
  return <span className={`px-4 py-1.5 rounded-full text-[10px] border font-black tracking-widest ${className}`}>{children}</span>;
}
