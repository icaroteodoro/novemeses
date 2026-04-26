"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Baby, 
  Calendar, 
  FileText, 
  HelpCircle, 
  Bell, 
  Settings,
  Heart,
  X
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Heart, label: "Gestação", href: "/modules/pregnancy" },
  { icon: FileText, label: "Documentos", href: "/modules/documents" },
  { icon: Calendar, label: "Consultas", href: "/modules/appointments" },
  { icon: HelpCircle, label: "Dúvidas", href: "/modules/questions" },
  { icon: Baby, label: "Acompanhamento", href: "/modules/baby" },
  { icon: Bell, label: "Lembretes", href: "/modules/reminders" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-card border-r w-64">
      <div className="p-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-2xl text-primary">
          <Baby className="w-8 h-8" />
          <span>Nove Meses</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary/10 text-primary font-semibold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
              pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/modules/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            pathname === "/modules/settings"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className={cn(
            "w-5 h-5 transition-transform duration-200 group-hover:rotate-45",
            pathname === "/modules/settings" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )} />
          Configurações
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        {content}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
          />
          <div className="relative h-full w-64 animate-in slide-in-from-left duration-300">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
