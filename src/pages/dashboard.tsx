import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Menu, BarChart3, Users, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <Layout title="Tableau de bord">
      <div className="container mx-auto py-10 px-4">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest">
              <Zap className="h-4 w-4 fill-orange-600" />
              Plateforme CAPEC
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Bonjour, <span className="text-orange-600">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-gray-500 font-medium">
              Gérez les contenus et la structure du site officiel capec-ci.org
            </p>
          </div>

          {isAdmin && (
            <Link href="/admin/approvals">
              <Button size="lg" className="bg-gray-900 hover:bg-black text-white font-bold shadow-xl shadow-gray-200 group">
                <ShieldCheck className="mr-2 h-5 w-5 text-orange-500" />
                Panel d'Approbation
                <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard 
            href="/content/new"
            title="Soumettre du contenu"
            description="Ajoutez des images, vidéos, textes ou rapports PDF"
            icon={<FileText className="h-8 w-8 text-orange-500" />}
            buttonText="Nouveau contenu"
            color="orange"
          />

          <DashboardCard 
            href="/menus"
            title="Gérer les menus"
            description="Demander ou valider des modifications de structure"
            icon={<Menu className="h-8 w-8 text-blue-500" />}
            buttonText="Voir les menus"
            color="blue"
          />

          <DashboardCard 
            href="/statistics"
            title="Statistiques"
            description="Visualisez les performances des données collectées"
            icon={<BarChart3 className="h-8 w-8 text-green-500" />}
            buttonText="Analyses"
            color="green"
          />

          <DashboardCard 
            href="/overview"
            title="Vue d'ensemble"
            description="Accédez à l'historique global des soumissions"
            icon={<Users className="h-8 w-8 text-purple-500" />}
            buttonText="Aperçu global"
            color="purple"
          />
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <Card className="border-none shadow-xl shadow-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Image src="/logo-capec-mcdb23oy.png" alt="" width={300} height={300} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-black italic">Guide de l'utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center font-black text-orange-600">1</div>
                  <h3 className="font-bold text-gray-900">Choisissez votre contenu</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Sélectionnez le type de média que vous souhaitez ajouter au site. Assurez-vous d'avoir les droits sur les fichiers.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600">2</div>
                  <h3 className="font-bold text-gray-900">Assignez une section</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Rattachez votre contenu à un menu ou un sous-menu existant pour qu'il soit placé au bon endroit sur le site.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center font-black text-green-600">3</div>
                  <h3 className="font-bold text-gray-900">Attendez la validation</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    L'administrateur recevra une notification et devra approuver votre soumission avant qu'elle ne soit intégrée.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function DashboardCard({ href, title, description, icon, buttonText, color }: { 
  href: string; title: string; description: string; icon: React.ReactNode; buttonText: string; color: string 
}) {
  const colorMap: Record<string, string> = {
    orange: "hover:border-orange-200 group-hover:bg-orange-600",
    blue: "hover:border-blue-200 group-hover:bg-blue-600",
    green: "hover:border-green-200 group-hover:bg-green-600",
    purple: "hover:border-purple-200 group-hover:bg-purple-600",
  };

  return (
    <Card className={`group transition-all duration-300 border-2 border-transparent hover:shadow-2xl hover:-translate-y-1 ${colorMap[color].split(' ')[0]}`}>
      <CardHeader>
        <div className="mb-4 p-3 bg-gray-50 w-fit rounded-xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold group-hover:text-gray-900 transition-colors">{title}</CardTitle>
        <CardDescription className="font-medium text-gray-500 group-hover:text-gray-600 transition-colors">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href}>
          <Button className={`w-full font-bold transition-all duration-300 ${colorMap[color].split(' ')[1]}`}>
            {buttonText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
