"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Baby, Save, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function PregnancyPage() {
  const [pregnancy, setPregnancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [babyName, setBabyName] = useState("");
  const [startDate, setStartDate] = useState("");

  const fetchPregnancy = async () => {
    try {
      const res = await apiFetch("/api/pregnancy");
      const data = await res.json();
      if (data.pregnancy) {
        setPregnancy(data.pregnancy);
        setBabyName(data.pregnancy.babyName || "");
        setStartDate(data.pregnancy.startDate ? new Date(data.pregnancy.startDate).toISOString().split('T')[0] : "");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPregnancy();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/api/pregnancy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ babyName, startDate }),
      });
      if (res.ok) {
        await fetchPregnancy();
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pregnancy) {
    return <div className="flex items-center justify-center h-screen text-primary">Carregando...</div>;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Heart className="text-primary w-8 h-8" />
              Minha Gestação
            </h1>
            <p className="text-muted-foreground">Gerencie as informações principais do seu bebê.</p>
          </div>
          {!pregnancy && (
             <Badge className="bg-primary/10 text-primary border-none py-2 px-4 rounded-full">
                Configuração Inicial
             </Badge>
          )}
        </div>

        {pregnancy && !isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-primary/5 pb-6">
                  <div className="flex items-center gap-4">
                     <div className="bg-white p-3 rounded-2xl shadow-sm">
                        <Baby className="w-8 h-8 text-primary" />
                     </div>
                     <div>
                        <CardTitle className="text-xl">Dados do Bebê</CardTitle>
                        <CardDescription>Informações básicas</CardDescription>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div>
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Nome</p>
                     <p className="text-2xl font-black text-foreground">{pregnancy.babyName || "Ainda não definido"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Semana Atual</p>
                        <p className="text-xl font-bold text-primary">{pregnancy.currentWeek}ª Semana</p>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Ativa</Badge>
                     </div>
                  </div>
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full rounded-2xl h-12 border-2">
                     Editar Informações
                  </Button>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
               <CardHeader className="bg-secondary/10 pb-6">
                  <div className="flex items-center gap-4">
                     <div className="bg-white p-3 rounded-2xl shadow-sm">
                        <Calendar className="w-8 h-8 text-secondary-foreground" />
                     </div>
                     <div>
                        <CardTitle className="text-xl text-secondary-foreground">Datas Importantes</CardTitle>
                        <CardDescription>Cálculos automáticos</CardDescription>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div>
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Data Prevista do Parto (DPP)</p>
                     <p className="text-2xl font-black text-foreground">{new Date(pregnancy.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Início (DUM)</p>
                     <p className="text-xl font-bold text-slate-700">{new Date(pregnancy.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/20">
                     <p className="text-sm text-secondary-foreground font-medium italic">
                        "Cada dia é um passo mais perto de conhecer o grande amor da sua vida."
                     </p>
                  </div>
               </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 md:p-12 text-center space-y-4">
               <div className="bg-primary/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-10 h-10 text-primary" />
               </div>
               <CardTitle className="text-3xl font-black">
                  {pregnancy ? "Editar Gestação" : "Começar Nova Jornada"}
               </CardTitle>
               <CardDescription className="text-lg max-w-md mx-auto">
                  Preencha os dados abaixo para que possamos calcular as semanas e acompanhar o crescimento.
               </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12 pt-0">
               <form onSubmit={handleSave} className="max-w-md mx-auto space-y-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-foreground ml-1">Nome do Bebê (Opcional)</label>
                     <Input 
                        placeholder="Ex: Alice ou Arthur" 
                        value={babyName}
                        onChange={(e) => setBabyName(e.target.value)}
                        className="h-14 rounded-2xl border-2 focus-visible:ring-primary px-6 text-lg"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-foreground ml-1">Data da Última Menstruação (DUM)</label>
                     <Input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="h-14 rounded-2xl border-2 focus-visible:ring-primary px-6 text-lg"
                     />
                  </div>
                  <div className="flex gap-4 pt-4">
                     {pregnancy && (
                        <Button 
                           type="button" 
                           variant="ghost" 
                           onClick={() => setIsEditing(false)}
                           className="flex-1 h-14 rounded-2xl font-bold"
                        >
                           Cancelar
                        </Button>
                     )}
                     <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-lg shadow-xl shadow-primary/20 flex gap-2"
                     >
                        <Save className="w-5 h-5" />
                        {loading ? "Salvando..." : "Salvar Gestação"}
                     </Button>
                  </div>
               </form>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
