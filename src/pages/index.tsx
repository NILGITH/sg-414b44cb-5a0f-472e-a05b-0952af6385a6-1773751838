
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Head from "next/head";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <>
      <Head>
        <title>BACK CAPEC</title>
        <meta name="description" content="Application de gestion de contenu CEPEC-CI" />
      </Head>
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement de l'application...</p>
      </div>
    </>
  );
}
