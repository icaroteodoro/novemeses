"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { useAuthStore } from "@/modules/auth/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Menu } from "lucide-react";
import { auth } from "@/infra/auth/firebase.config";
import Link from "next/link";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden active:scale-95"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <span className="font-bold text-primary md:hidden">Nove Meses</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative active:scale-95">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </Button>

            <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold truncate max-w-[120px]">{user?.displayName || "Mamãe"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</p>
              </div>
              <Link href="/modules/settings">
                <Avatar className="w-9 h-9 border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
                  {user?.photoURL && <AvatarImage src={user.photoURL} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.displayName?.[0]?.toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:inline-flex active:scale-95">
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background/50 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
