"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationsPopover() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function fetchNotifications() {
    try {
      const res = await apiFetch("/api/notifications");
      const data = await res.json();
      setInvitations(data.invitations || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  async function handleRespond(invitationId: string, action: "ACEITAR" | "RECUSAR") {
    try {
      const res = await apiFetch("/api/pregnancy/invite/respond", {
        method: "POST",
        body: JSON.stringify({ invitationId, action }),
      });

      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
        if (action === "ACEITAR") {
          window.location.reload(); // Reload to update dashboard context
        }
      }
    } catch (err) {
      console.error("Error responding to invitation:", err);
    }
  }

  const hasNotifications = invitations.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative active:scale-95">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </Button>
        }
      />
      <PopoverContent className="w-80 p-0 rounded-2xl overflow-hidden shadow-2xl border-white" align="end">
        <div className="bg-primary/5 p-4 border-b border-primary/10">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notificações
          </h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">Buscando atualizações...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">Tudo limpo por aqui!</p>
              <p className="text-xs text-muted-foreground">Você não tem novas notificações.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              <AnimatePresence initial={false}>
                {invitations.map((inv) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="bg-primary/10 p-2 rounded-xl h-fit">
                        <UserPlus className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          Convite de Gestação
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-bold text-slate-700">{inv.invitedBy.name || "Alguém"}</span> convidou você para acompanhar a gestação juntos!
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-primary hover:bg-primary/90 text-[10px] font-black uppercase px-3 shadow-sm active:scale-95"
                            onClick={() => handleRespond(inv.id, "ACEITAR")}
                          >
                            <Check className="w-3 h-3 mr-1" /> Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 rounded-lg text-[10px] font-black uppercase px-3 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                            onClick={() => handleRespond(inv.id, "RECUSAR")}
                          >
                            <X className="w-3 h-3 mr-1" /> Recusar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
