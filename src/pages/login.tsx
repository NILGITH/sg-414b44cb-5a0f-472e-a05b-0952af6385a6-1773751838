import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, Lock, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { success, error: signInError } = await signIn(email, password);
      
      if (success) {
        router.push("/dashboard");
      } else {
        setError(signInError || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl shadow-xl border border-gray-100">
              <Image 
                src="/logo-capec-mcdb23oy.png" 
                alt="CAPEC Logo" 
                width={80} 
                height={80}
              />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Espace CAPEC</h1>
          <p className="text-gray-500 font-medium italic">Plateforme sécurisée de collecte de données</p>
        </div>

        <Card className="border-none shadow-2xl shadow-gray-200/50">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Lock className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Accès Restreint</span>
            </div>
            <CardTitle className="text-xl font-bold">Connexion</CardTitle>
            <CardDescription>
              Veuillez saisir vos identifiants pour accéder au back-office.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-gray-700">Adresse Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@capec-ci.org"
                  className="h-12 border-gray-200 focus:border-orange-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" title="password" className="font-bold text-gray-700">Mot de passe</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 border-gray-200 focus:border-orange-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50 py-3">
                  <AlertDescription className="text-red-800 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-bold text-lg shadow-lg shadow-orange-100 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authentification...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                © 2026 Cellule d'Analyse de Politiques Économiques du CIRES
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
