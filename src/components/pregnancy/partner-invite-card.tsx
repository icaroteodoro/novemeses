"use client";

import { useState } from "react";
import { UserPlus, Send, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export function PartnerInviteCard({ hasPartner }: { hasPartner: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hasPartner) return null;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/pregnancy/invite", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        setEmail("");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao enviar convite");
      }
    } catch (err) {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-xl shadow-primary/5 bg-white rounded-[2rem] overflow-hidden">
      <CardContent className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="bg-primary/10 p-6 rounded-[2rem] flex-shrink-0">
            <UserPlus className="w-10 h-10 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-black text-foreground">Convidar o outro genitor?</h2>
              <p className="text-muted-foreground font-medium">
                Compartilhe a jornada! Papai e Mamãe podem administrar tudo juntos.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700 font-bold justify-center md:justify-start"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Convite enviado com sucesso!
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto h-7 px-2 text-emerald-600 hover:bg-emerald-100"
                    onClick={() => setSent(false)}
                  >
                    Novo
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleInvite}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1 relative">
                    <Input
                      type="email"
                      placeholder="E-mail do parceiro(a)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 rounded-2xl border-2 border-slate-100 focus:border-primary px-5 font-medium"
                      required
                    />
                    {error && (
                      <p className="absolute -bottom-6 left-2 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                        {error}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-14 rounded-2xl px-8 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Enviar Convite
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
