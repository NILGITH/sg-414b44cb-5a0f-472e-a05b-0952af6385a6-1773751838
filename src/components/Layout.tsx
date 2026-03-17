import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, PlusCircle, ListFilter, BarChart3, Globe, ShieldCheck } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  requireAuth?: boolean;
}

export default function Layout({ children, title, requireAuth = true }: LayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers login si l'auth est requise et que l'utilisateur n'est pas connecté
    if (!loading && requireAuth && !user) {
      router.push("/login");
    }
  }, [user, loading, requireAuth, router]);

  if (loading && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-500 font-medium">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Ne pas afficher le contenu si l'auth est requise et qu'on n'a pas d'utilisateur
  if (requireAuth && !user) {
    return null;
  }

  return (
    <>
      <SEO title={title} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo et titre */}
              <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition group">
                <div className="p-1 bg-gray-50 rounded border border-gray-100 group-hover:border-orange-200 transition-colors">
                  <Image 
                    src="/logo-capec-mcdb23oy.png" 
                    alt="CAPEC Logo" 
                    width={32} 
                    height={32}
                    className="rounded-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-black text-gray-900 leading-tight tracking-tight">CAPEC</h1>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Data Collector</p>
                </div>
              </Link>

              {/* Navigation Desktop */}
              <nav className="hidden lg:flex items-center space-x-1">
                <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>Accueil</NavLink>
                <NavLink href="/content/new" icon={<PlusCircle className="h-4 w-4" />}>Nouveau contenu</NavLink>
                <NavLink href="/menus" icon={<ListFilter className="h-4 w-4" />}>Menus</NavLink>
                <NavLink href="/statistics" icon={<BarChart3 className="h-4 w-4" />}>Statistiques</NavLink>
                <NavLink href="/overview" icon={<Globe className="h-4 w-4" />}>Vue d'ensemble</NavLink>
              </nav>

              {/* User Actions */}
              <div className="flex items-center space-x-2">
                {user && (
                  <div className="flex items-center space-x-3 border-l pl-4 ml-2">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold text-gray-900 max-w-[120px] truncate">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter flex items-center gap-1">
                        {user.user_metadata?.role === 'admin' && <ShieldCheck className="h-2 w-2" />}
                        {user.user_metadata?.role || 'Utilisateur'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => signOut()}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      title="Déconnexion"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow pb-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <div className="space-y-1">
                <p className="text-gray-900 text-sm font-bold">CAPEC - Collecte de Données</p>
                <p className="text-gray-500 text-[11px]">Cellule d'Analyse de Politiques Économiques du CIRES</p>
              </div>
              <div className="flex items-center gap-6">
                <a href="https://capec-ci.org" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-400 hover:text-orange-600 transition-colors">capec-ci.org</a>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                <p className="text-xs text-gray-400 font-medium italic">Plateforme Sécurisée</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function NavLink({ href, children, icon }: { href: string; children: ReactNode; icon?: ReactNode }) {
  const router = useRouter();
  const isActive = router.pathname === href || (href !== '/dashboard' && router.pathname.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        isActive 
          ? "bg-orange-600 text-white shadow-md shadow-orange-200 scale-[1.02]" 
          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
      }`}
    >
      {icon && <span className={isActive ? "text-white" : "text-orange-500"}>{icon}</span>}
      {children}
    </Link>
  );
}
