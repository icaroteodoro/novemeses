"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/infra/auth/firebase.config";
import { useAuthStore } from "@/modules/auth/auth.store";
import { Button } from "@/components/ui/button";
import { Baby, Sparkles, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LoginPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // router.replace("/dashboard"); // useEffect handles this
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-primary font-medium animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side: Illustration/Info (Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12 border-r relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 max-w-lg text-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-primary/20 inline-block mb-8 animate-bounce duration-[3000ms]">
            <Baby className="w-24 h-24 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-6 leading-tight">
            Acompanhe cada momento da sua <span className="text-primary">gestação</span> com amor.
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma simples, segura e completa para você registrar o crescimento do seu bebê e organizar sua rotina.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="text-center lg:hidden">
            <Baby className="w-16 h-16 text-primary mx-auto mb-4" />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center justify-center lg:justify-start gap-3">
              Nove Meses <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </h1>
            <p className="text-muted-foreground text-lg">
              Bem-vinda! Escolha uma forma de entrar abaixo.
            </p>
          </div>

          <div className="pt-4">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-card border rounded-3xl shadow-sm">
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    {user.photoURL && <AvatarImage src={user.photoURL} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {user.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate text-lg">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button
                    className="w-full py-7 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                  >
                    <a href="/dashboard">Acessar Painel</a>
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full py-7 text-lg rounded-2xl border-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all"
                  >
                    Desconectar conta
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="w-full py-8 text-xl font-bold rounded-2xl bg-white text-slate-900 border-2 border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 shadow-xl shadow-slate-100 flex gap-4 group"
              >
                <div className="bg-white p-2 rounded-full shadow-inner">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                Entrar com Google
                <LogIn className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Ao entrar, você concorda com nossos <br />
              <a href="#" className="text-primary hover:underline font-medium">Termos de Uso</a> e <a href="#" className="text-primary hover:underline font-medium">Privacidade</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
