import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contentService, ContentSubmission } from "@/services/contentService";
import {
  menuService,
  MenuChangeRequest,
  MenuSection,
} from "@/services/menuService";
import emailService from "@/services/emailService";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  FileIcon as FileIconLucide,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  ListFilter,
  Eye,
  ExternalLink,
  Download,
  Info,
  Maximize2,
  History as HistoryIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ApprovalsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [menuRequests, setMenuRequests] = useState<MenuChangeRequest[]>([]);
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // States for Details Modal
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContentSubmission | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isAdmin = user?.user_metadata?.role === "admin";

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        setPageIsLoading(false);
      } else {
        loadData();
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const loadData = async () => {
    setPageIsLoading(true);
    try {
      const [submissionsData, requestsData, menusData] = await Promise.all([
        contentService.getContentSubmissions(),
        menuService.getMenuChangeRequests(),
        menuService.getMenuSections(),
      ]);
      setSubmissions(submissionsData);
      setMenuRequests(requestsData);
      setMenus(menusData);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setMessage("Erreur lors du chargement des données.");
    } finally {
      setPageIsLoading(false);
    }
  };

  const getMenuName = (menuId?: string | null) => {
    if (!menuId) return "Non assigné";
    const menu = menus.find((m) => m.id === menuId);
    return menu?.name || "Menu inconnu";
  };

  const handleApproveContent = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    try {
      const submission = await contentService.updateContentStatus(id, status);
      if (submission) {
        await emailService.sendApprovalNotification(
          {
            id: submission.id,
            title: submission.title,
            type: submission.content_type,
          },
          status,
        );
        setMessage(
          `Contenu ${status === "approved" ? "approuvé" : "rejeté"} avec succès`,
        );
        setIsDetailsOpen(false);
        await loadData();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contenu:", error);
      setMessage("Erreur lors de la mise à jour du statut du contenu.");
    }
  };

  const handleApproveMenuRequest = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await menuService.updateMenuChangeRequestStatus(id, status);
      setMessage(
        `Demande de menu ${status === "approved" ? "approuvée" : "rejetée"} avec succès`,
      );
      await loadData();
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la demande de menu:",
        error,
      );
      setMessage(
        "Erreur lors de la mise à jour du statut de la demande de menu.",
      );
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
      case "mixed":
        return <Maximize2 className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  if (authLoading || (pageIsLoading && isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-gray-600 font-medium tracking-tight">
          Accès au registre CAPEC...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 shadow-xl text-center p-8 space-y-6">
          <div className="p-4 bg-red-100 rounded-full w-fit mx-auto border-2 border-red-50">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-black italic uppercase text-red-900 tracking-tight">
            Accès Refusé
          </CardTitle>
          <p className="text-gray-600 font-medium">
            Désolé, cette zone est réservée exclusivement aux administrateurs de
            la CAPEC.
          </p>
          <Link href="/dashboard">
            <Button className="w-full bg-gray-900 hover:bg-black h-12 font-bold">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const pendingMenuRequests = menuRequests.filter(
    (r) => r.status === "pending",
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-24">
      {/* Dynamic Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-xl shadow-orange-100">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">
                ADMINISTRATION
              </h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Flux de données en temps réel
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="font-bold border-2 border-gray-200 hover:bg-gray-50 hover:text-gray-500 h-11 px-6 text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quitter
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {message && (
          <Alert
            className={`mb-10 border-2 rounded-2xl shadow-lg ${message.includes("succès") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <AlertDescription
              className={`font-black flex items-center gap-3 uppercase text-xs italic ${message.includes("succès") ? "text-green-800" : "text-red-800"}`}
            >
              {message.includes("succès") ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Soumissions"
            value={pendingSubmissions.length}
            color="orange"
            icon={<Clock className="h-6 w-6" />}
            subtitle="En attente de revue"
          />
          <StatCard
            title="Menus"
            value={pendingMenuRequests.length}
            color="blue"
            icon={<ListFilter className="h-6 w-6" />}
            subtitle="Modifications demandées"
          />
          <StatCard
            title="Approuvés"
            value={
              submissions.filter((s) => s.status === "approved").length +
              menuRequests.filter((r) => r.status === "approved").length
            }
            color="green"
            icon={<CheckCircle className="h-6 w-6" />}
            subtitle="Total historique"
          />
          <StatCard
            title="Rejetés"
            value={
              submissions.filter((s) => s.status === "rejected").length +
              menuRequests.filter((r) => r.status === "rejected").length
            }
            color="red"
            icon={<XCircle className="h-6 w-6" />}
            subtitle="Total historique"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* SUBMISSIONS LIST */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">
                    Soumissions de contenu
                  </h2>
                </div>
                <Badge
                  variant="outline"
                  className="font-black px-4 py-1.5 rounded-full border-gray-200 bg-white shadow-sm"
                >
                  {pendingSubmissions.length} EN ATTENTE
                </Badge>
              </div>

              <div className="space-y-4">
                {pendingSubmissions.length === 0 ? (
                  <Card className="border-dashed border-2 py-20 bg-gray-50/50">
                    <div className="text-center space-y-3">
                      <CheckCircle className="h-12 w-12 text-gray-200 mx-auto" />
                      <p className="text-gray-400 font-bold italic">
                        Aucun contenu à examiner pour le moment.
                      </p>
                    </div>
                  </Card>
                ) : (
                  pendingSubmissions.map((s) => (
                    <Card
                      key={s.id}
                      className="border-none shadow-xl shadow-gray-200/40 hover:shadow-gray-300/50 transition-all group overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:items-stretch h-full">
                          <div
                            className={`w-2 ${s.content_type === "mixed" ? "bg-orange-500" : "bg-orange-400"} group-hover:w-3 transition-all`}
                          ></div>
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <div className="space-y-1">
                                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                                  {s.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none font-black text-[9px] uppercase tracking-widest">
                                    {s.content_type}
                                  </Badge>
                                  <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none font-black text-[9px] uppercase tracking-widest">
                                    {getMenuName(s.menu_section_id)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full hover:bg-orange-50 hover:text-orange-600"
                                  onClick={() => {
                                    setSelectedSubmission(s);
                                    setIsDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-500 italic line-clamp-2 leading-relaxed mb-6 font-medium">
                              {s.description || "Aucune description fournie."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Soumis le{" "}
                                {new Date(s.created_at).toLocaleDateString()}
                              </span>
                              <Button
                                onClick={() => {
                                  setSelectedSubmission(s);
                                  setIsDetailsOpen(true);
                                }}
                                className="bg-orange-600 hover:bg-black font-black text-[10px] uppercase tracking-widest h-9 px-6 shadow-lg shadow-orange-100 rounded-lg transition-all"
                              >
                                Examiner le document
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            {/* MENU REQUESTS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ListFilter className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">
                    Demandes de menus
                  </h2>
                </div>
              </div>
              <Card className="border-none shadow-xl shadow-gray-200/40">
                <CardContent className="p-0">
                  {pendingMenuRequests.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 font-bold italic">
                      Aucune modification de menu en attente.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {pendingMenuRequests.map((r) => (
                        <div
                          key={r.id}
                          className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex-1 space-y-2">
                            <Badge className="bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest">
                              {r.is_submenu ? "Sous-menu" : "Menu principal"}
                            </Badge>
                            <div className="flex items-center gap-4 pt-1">
                              <span className="text-lg font-bold text-gray-400 line-through">
                                {r.old_menu_name}
                              </span>
                              <ArrowLeft className="h-4 w-4 text-blue-400 rotate-180" />
                              <span className="text-lg font-black text-blue-700 bg-blue-50 px-4 py-1 rounded-xl">
                                {r.new_menu_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApproveMenuRequest(r.id, "approved")
                              }
                              className="bg-green-600 hover:bg-green-700 font-black uppercase text-[10px] tracking-widest px-6 h-10"
                            >
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleApproveMenuRequest(r.id, "rejected")
                              }
                              className="text-red-600 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest px-6 h-10"
                            >
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          {/* SIDEBAR - HISTORY */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-900 rounded-lg shadow-lg">
                <HistoryIcon className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">
                Historique
              </h2>
            </div>
            <Card className="border-none shadow-2xl shadow-gray-200/50 h-[calc(100vh-280px)] sticky top-32">
              <CardContent className="p-4 overflow-y-auto h-full scrollbar-hide">
                <div className="space-y-3">
                  {[...submissions, ...menuRequests]
                    .filter((item) => item.status !== "pending")
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                    )
                    .slice(0, 30)
                    .map((item, index) => {
                      const isContent = "title" in item;
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (isContent) {
                              setSelectedSubmission(item as ContentSubmission);
                              setIsDetailsOpen(true);
                            }
                          }}
                          className={`group relative p-4 border rounded-2xl transition-all duration-200 flex flex-col gap-2 ${
                            isContent
                              ? "cursor-pointer border-gray-100 hover:border-orange-200 hover:bg-orange-50/30"
                              : "border-gray-50 bg-gray-50/30 opacity-80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <Badge
                              className={`text-[8px] font-black uppercase px-2 py-0 border ${getStatusColor(item.status)}`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div className="font-bold text-xs text-gray-800 leading-snug pr-6">
                            {isContent
                              ? (item as ContentSubmission).title
                              : `${(item as MenuChangeRequest).old_menu_name} → ${(item as MenuChangeRequest).new_menu_name}`}
                          </div>
                          {isContent && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all scale-75">
                              <div className="p-2 bg-orange-600 rounded-full text-white shadow-lg">
                                <Eye className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {submissions.filter((s) => s.status !== "pending").length ===
                    0 && (
                    <div className="py-20 text-center space-y-2">
                      <HistoryIcon className="h-10 w-10 text-gray-100 mx-auto" />
                      <p className="text-gray-300 text-xs font-bold italic caps">
                        Aucune activité récente
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SUBMISSION DETAILS MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 border-none shadow-2xl overflow-hidden rounded-3xl">
          {selectedSubmission && (
            <>
              <DialogHeader className="p-8 bg-gray-900 text-white shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none rotate-12">
                  <ShieldCheck className="h-40 w-40" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-600 text-white border-none font-black text-[10px] px-4 py-1 uppercase tracking-widest">
                      {selectedSubmission.content_type}
                    </Badge>
                    <Badge className="bg-white/10 text-white border-none font-black text-[10px] px-4 py-1 uppercase tracking-widest">
                      {getMenuName(selectedSubmission.menu_section_id)}
                    </Badge>
                    {selectedSubmission.status !== "pending" && (
                      <Badge
                        className={`${getStatusColor(selectedSubmission.status)} border-none font-black text-[10px] px-4 py-1 uppercase tracking-widest`}
                      >
                        {selectedSubmission.status === "approved"
                          ? "DOCUMENT PUBLIÉ"
                          : "DOCUMENT REJETÉ"}
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                    {selectedSubmission.title}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400 text-lg font-medium italic">
                    {selectedSubmission.description ||
                      "Aucune description détaillée disponible."}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-10 bg-[#f8f9fa]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                    {selectedSubmission.content_data && (
                      <section className="space-y-4">
                        <h4 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-orange-600 italic">
                          <FileText className="h-4 w-4" /> Corps du document
                        </h4>
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 text-lg leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                          {selectedSubmission.content_data}
                        </div>
                      </section>
                    )}

                    {selectedSubmission.file_urls &&
                      selectedSubmission.file_urls.length > 0 && (
                        <section className="space-y-6">
                          <h4 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-blue-600 italic">
                            <Download className="h-4 w-4" /> Fichiers joints (
                            {selectedSubmission.file_urls.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedSubmission.file_urls.map((url, idx) => {
                              const fileName =
                                url.split("/").pop() || "fichier";
                              const isImage = url.match(
                                /\.(jpg|jpeg|png|gif|webp)$/i,
                              );
                              const isVideo = url.match(/\.(mp4|webm|mov)$/i);

                              return (
                                <div
                                  key={idx}
                                  className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden group"
                                >
                                  <div className="aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
                                    {isImage ? (
                                      <img
                                        src={url}
                                        alt=""
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                    ) : isVideo ? (
                                      <VideoIcon className="h-12 w-12 text-gray-700" />
                                    ) : (
                                      <FileIconLucide className="h-12 w-12 text-gray-700" />
                                    )}

                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 bg-white rounded-full text-black hover:bg-orange-600 hover:text-white transition-colors shadow-xl"
                                      >
                                        <ExternalLink className="h-5 w-5" />
                                      </a>
                                    </div>
                                  </div>
                                  <div className="p-4 flex items-center justify-between">
                                    <div className="truncate">
                                      <p className="text-[10px] font-black text-gray-900 truncate uppercase tracking-tight">
                                        {fileName.split("-").slice(1).join("-")}
                                      </p>
                                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                        {isImage
                                          ? "IMAGE"
                                          : isVideo
                                            ? "VIDÉO"
                                            : "DOCUMENT"}
                                      </p>
                                    </div>
                                    <a
                                      href={url}
                                      download
                                      className="text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}
                  </div>

                  <div className="space-y-8">
                    <section className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
                      <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 border-b pb-4 text-center">
                        Informations
                      </h4>
                      <div className="space-y-4">
                        <MetaItem
                          icon={<ShieldCheck className="h-4 w-4" />}
                          label="Identifiant"
                          value={selectedSubmission.id
                            .split("-")[0]
                            .toUpperCase()}
                        />
                        <MetaItem
                          icon={<Clock className="h-4 w-4" />}
                          label="Soumission"
                          value={new Date(
                            selectedSubmission.created_at,
                          ).toLocaleString()}
                        />
                        <MetaItem
                          icon={<Info className="h-4 w-4" />}
                          label="État actuel"
                          value={selectedSubmission.status || "pending"}
                          uppercase
                          isStatus
                        />
                      </div>
                    </section>

                    {selectedSubmission.status === "pending" && (
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 font-medium leading-relaxed italic">
                          Action requise : Vérifiez le contenu avant de
                          confirmer la publication.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="p-8 bg-white border-t flex items-center justify-between gap-4 shrink-0">
                <Button
                  variant="ghost"
                  onClick={() => setIsDetailsOpen(false)}
                  className="font-black uppercase text-xs tracking-widest text-gray-400"
                >
                  Fermer l'examen
                </Button>
                {selectedSubmission.status === "pending" && (
                  <div className="flex gap-4">
                    <Button
                      onClick={() =>
                        handleApproveContent(selectedSubmission.id, "rejected")
                      }
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 font-black uppercase text-xs tracking-[0.2em] px-8 h-12 rounded-xl"
                    >
                      Rejeter
                    </Button>
                    <Button
                      onClick={() =>
                        handleApproveContent(selectedSubmission.id, "approved")
                      }
                      className="bg-green-600 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] px-10 h-12 rounded-xl shadow-xl shadow-green-100 transition-all"
                    >
                      Approuver la publication
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  icon,
  subtitle,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  const colors: Record<string, string> = {
    orange: "border-orange-100 bg-orange-50 text-orange-600 shadow-orange-100",
    blue: "border-blue-100 bg-blue-50 text-blue-600 shadow-blue-100",
    green: "border-green-100 bg-green-50 text-green-600 shadow-green-100",
    red: "border-red-100 bg-red-50 text-red-600 shadow-red-100",
  };

  return (
    <Card
      className={`border-2 ${colors[color]} p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">
            {title}
          </p>
          <p className="text-4xl font-black italic tracking-tighter">{value}</p>
          <p className="text-[9px] font-bold opacity-60 mt-2 uppercase tracking-widest">
            {subtitle}
          </p>
        </div>
        <div className="p-3 bg-white/80 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:scale-150 transition-transform duration-700">
        {icon}
      </div>
    </Card>
  );
}

function MetaItem({
  icon,
  label,
  value,
  uppercase,
  isStatus,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  uppercase?: boolean;
  isStatus?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p
          className={`text-sm font-bold text-gray-900 ${uppercase ? "uppercase" : ""} ${isStatus ? (value === "approved" ? "text-green-600" : "text-red-600") : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
