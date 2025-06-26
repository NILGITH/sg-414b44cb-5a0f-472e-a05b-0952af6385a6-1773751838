import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { adminLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await adminLogin(email, password);
      if (success) {
        router.push("/admin/approvals");
      } else {
        setError("Email ou mot de passe incorrect pour l'administration");
      }
    } catch (loginError) {
      console.error("Admin login error:", loginError);
      setError("Une erreur est survenue lors de la connexion administrateur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Connexion Administrateur - BACK CAPEC</title>
        <meta name="description" content="Connexion administrateur pour l'approbation des contenus CAPEC-CI" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/logo-capec-mcdawft9.png"
                alt="Logo CAPEC"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-gray-900">Administration CAPEC</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Connexion sécurisée pour l'approbation des contenus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Administrateur</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@capec-ci.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe Administrateur</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Se connecter en tant qu'Admin
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion normale
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}