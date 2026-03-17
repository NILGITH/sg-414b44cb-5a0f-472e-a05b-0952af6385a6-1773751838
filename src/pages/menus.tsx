import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Menu,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  ArrowLeft,
  LayoutDashboard,
  ChevronRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  menuService,
  MenuSection,
  MenuChangeRequest,
} from "@/services/menuService";
import { useAuth } from "@/contexts/AuthContext";

export default function MenusPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [menus, setMenus] = useState<MenuSection[]>([]);
  const [requests, setRequests] = useState<MenuChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuSection | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [newMenuData, setNewMenuData] = useState({
    old_menu_name: "",
    new_menu_name: "",
    is_submenu: false,
    parent_menu_name: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuData, requestData] = await Promise.all([
        menuService.getMenuSections(),
        menuService.getMenuChangeRequests(),
      ]);
      setMenus(menuData);
      setRequests(requestData);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setAlert({
        type: "error",
        message: "Erreur lors du chargement des données",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await menuService.createMenuChangeRequest(
        {
          old_menu_name: "Nouveau",
          new_menu_name: newMenuData.new_menu_name,
          is_submenu: newMenuData.is_submenu,
          parent_menu_name: newMenuData.is_submenu
            ? newMenuData.parent_menu_name
            : undefined,
        },
        user?.id || "anonymous",
      );

      setAlert({
        type: "success",
        message: "Demande d'ajout envoyée avec succès !",
      });
      setShowAddDialog(false);
      setNewMenuData({
        old_menu_name: "",
        new_menu_name: "",
        is_submenu: false,
        parent_menu_name: "",
      });
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
      setAlert({
        type: "error",
        message: "Erreur lors de l'envoi de la demande",
      });
    }
  };

  const handleEditMenuRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenu) return;

    try {
      await menuService.createMenuChangeRequest(
        {
          old_menu_name: selectedMenu.name,
          new_menu_name: newMenuData.new_menu_name,
          is_submenu: !!selectedMenu.parent_id,
          parent_menu_name: selectedMenu.parent_id
            ? menus.find((m) => m.id === selectedMenu.parent_id)?.name
            : undefined,
        },
        user?.id || "anonymous",
      );

      setAlert({
        type: "success",
        message: "Demande de modification envoyée avec succès !",
      });
      setShowEditDialog(false);
      setSelectedMenu(null);
      setNewMenuData({
        old_menu_name: "",
        new_menu_name: "",
        is_submenu: false,
        parent_menu_name: "",
      });
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
      setAlert({
        type: "error",
        message: "Erreur lors de l'envoi de la demande",
      });
    }
  };

  const mainMenus = menus.filter((menu) => !menu.parent_id);

  const getSubmenus = (parentId: string) => {
    return menus.filter((menu) => menu.parent_id === parentId);
  };

  return (
    <Layout title="Gestion des menus">
      <div className="min-h-screen bg-[#fafafa] pb-20">
        {/* Modern Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                <Menu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">
                  Structure du site
                </h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Hiérarchie des Menus & Sections
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-6 h-12 shadow-lg shadow-orange-100 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Proposer un menu
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {alert && (
            <Alert
              className={`mb-8 border-2 rounded-2xl ${alert.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
            >
              <AlertDescription className="font-bold flex items-center gap-2">
                {alert.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-10">
            {/* CURRENT STRUCTURE */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <LayoutDashboard className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">
                  Navigation Actuelle
                </h2>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-gray-400 font-bold italic">
                    Synchronisation des menus...
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {mainMenus.map((menu) => {
                    const submenus = getSubmenus(menu.id);
                    return (
                      <Card
                        key={menu.id}
                        className="border-none shadow-xl shadow-gray-200/40 overflow-hidden group"
                      >
                        <CardContent className="p-0">
                          <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xs">
                                {menu.display_order}
                              </div>
                              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                                {menu.name}
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-orange-50 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedMenu(menu);
                                setNewMenuData({
                                  old_menu_name: menu.name,
                                  new_menu_name: menu.name,
                                  is_submenu: false,
                                  parent_menu_name: "",
                                });
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          {submenus.length > 0 && (
                            <div className="bg-[#fafafa] border-t divide-y divide-gray-100">
                              {submenus.map((submenu) => (
                                <div
                                  key={submenu.id}
                                  className="flex items-center justify-between p-4 pl-16 group/item hover:bg-white transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <ChevronRight className="h-3 w-3 text-blue-300" />
                                    <span className="font-bold text-gray-600 group-hover/item:text-blue-600 transition-colors">
                                      {submenu.name}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                                    onClick={() => {
                                      setSelectedMenu(submenu);
                                      setNewMenuData({
                                        old_menu_name: submenu.name,
                                        new_menu_name: submenu.name,
                                        is_submenu: true,
                                        parent_menu_name: menu.name,
                                      });
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RECENT REQUESTS */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">
                  Suivi des demandes
                </h2>
              </div>

              <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white rounded-3xl overflow-hidden sticky top-32">
                <CardContent className="p-6">
                  {requests.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <ShieldCheck className="h-10 w-10 text-gray-100 mx-auto" />
                      <p className="text-gray-300 text-xs font-bold italic caps">
                        Aucune demande en cours
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <div
                          key={request.id}
                          className="p-4 border border-gray-50 rounded-2xl bg-gray-50/30 space-y-3 hover:border-orange-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-black text-gray-900 text-sm leading-tight">
                                {request.old_menu_name === "Nouveau"
                                  ? "CRÉATION"
                                  : "MODIFICATION"}
                              </p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                {request.new_menu_name}
                              </p>
                            </div>
                            <Badge
                              className={`uppercase text-[8px] font-black tracking-widest ${
                                request.status === "pending"
                                  ? "bg-orange-100 text-orange-700 border-orange-200"
                                  : request.status === "approved"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                              }`}
                            >
                              {request.status === "pending"
                                ? "Attente"
                                : request.status}
                            </Badge>
                          </div>
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            <span>
                              {new Date(
                                request.created_at,
                              ).toLocaleDateString()}
                            </span>
                            <span># {request.id.split("-")[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-gray-900 text-white">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              Proposer un menu
            </DialogTitle>
            <CardDescription className="text-gray-400 font-medium">
              Suggérez une nouvelle section pour le site public.
            </CardDescription>
          </DialogHeader>
          <form
            onSubmit={handleAddMenuRequest}
            className="p-8 bg-white space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Libellé du menu
              </label>
              <Input
                value={newMenuData.new_menu_name}
                onChange={(e) =>
                  setNewMenuData({
                    ...newMenuData,
                    new_menu_name: e.target.value,
                  })
                }
                placeholder="Ex: Centre de Documentation"
                className="h-12 border-gray-200 font-bold rounded-xl text-black"
                required
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <input
                type="checkbox"
                id="is_submenu"
                checked={newMenuData.is_submenu}
                onChange={(e) =>
                  setNewMenuData({
                    ...newMenuData,
                    is_submenu: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="is_submenu"
                className="text-sm font-black text-gray-700 uppercase tracking-tight"
              >
                Définir comme sous-menu
              </label>
            </div>
            {newMenuData.is_submenu && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Rattachement Parent
                </label>
                <Select
                  value={newMenuData.parent_menu_name}
                  onValueChange={(value) =>
                    setNewMenuData({ ...newMenuData, parent_menu_name: value })
                  }
                >
                  <SelectTrigger className="h-12 border-gray-200 font-bold rounded-xl">
                    <SelectValue placeholder="Choisir le parent" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {mainMenus.map((menu) => (
                      <SelectItem
                        key={menu.id}
                        value={menu.name}
                        className="font-bold"
                      >
                        {menu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddDialog(false)}
                className="font-black uppercase text-xs tracking-widest text-gray-400"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] h-12 px-8 rounded-xl transition-all"
              >
                Envoyer la proposition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-orange-600 text-white">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              Modifier la section
            </DialogTitle>
            <CardDescription className="text-orange-100 font-medium italic">
              Suggérez un nouveau nom pour cette section.
            </CardDescription>
          </DialogHeader>
          <form
            onSubmit={handleEditMenuRequest}
            className="p-8 bg-white space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Nom actuel
              </label>
              <Input
                value={newMenuData.old_menu_name}
                disabled
                className="h-12 bg-gray-50 border-gray-100 font-bold italic text-gray-400 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Nouveau libellé souhaité
              </label>
              <Input
                value={newMenuData.new_menu_name}
                onChange={(e) =>
                  setNewMenuData({
                    ...newMenuData,
                    new_menu_name: e.target.value,
                  })
                }
                placeholder="Entrez le nouveau nom..."
                className="h-12 border-orange-200 focus:ring-orange-500 font-bold rounded-xl text-black"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowEditDialog(false)}
                className="font-black uppercase text-xs tracking-widest text-gray-400"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] h-12 px-8 rounded-xl transition-all"
              >
                Proposer le changement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] border font-black tracking-widest ${className}`}
    >
      {children}
    </span>
  );
}
