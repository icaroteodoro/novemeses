"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Baby, 
  Plus, 
  X, 
  Scale, 
  Ruler, 
  Calendar, 
  Trash2, 
  History,
  TrendingUp,
  Info,
  ChevronRight
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function BabyDiaryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [noPregnancy, setNoPregnancy] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [week, setWeek] = useState("");
  const [weight, setWeight] = useState("");
  const [size, setSize] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRecords = async () => {
    try {
      const res = await apiFetch("/api/baby");
      if (res.status === 404) {
        setNoPregnancy(true);
        return;
      }
      const data = await res.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      week: parseInt(week),
      weight: weight ? parseFloat(weight) : undefined,
      size: size ? parseFloat(size) : undefined,
      notes: notes || undefined,
    };

    try {
      const res = await apiFetch("/api/baby", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchRecords();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/baby/${deleteConfirmId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchRecords();
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setWeek("");
    setWeight("");
    setSize("");
    setNotes("");
  };

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Baby className="text-primary w-8 h-8" />
              Diário do Bebê
            </h1>
            <p className="text-muted-foreground">Acompanhe o crescimento e evolução do seu bebê.</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl h-12 px-8 font-bold flex gap-2"
          >
            <Plus className="w-5 h-5" />
            Registrar Evolução
          </Button>
        </div>

        {noPregnancy && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <Baby className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800">Gestação não configurada</p>
              <p className="text-amber-700 text-sm">Configure sua gestação para começar o diário do bebê.</p>
            </div>
          </div>
        )}

        {/* Resumo cards */}
        {!loading && records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Último Peso</p>
                <p className="text-2xl font-black text-foreground">{latestRecord?.weight ? `${latestRecord.weight}g` : "---"}</p>
              </div>
            </Card>
            <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 flex items-center gap-4">
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-500">
                <Ruler className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Último Tamanho</p>
                <p className="text-2xl font-black text-foreground">{latestRecord?.size ? `${latestRecord.size}cm` : "---"}</p>
              </div>
            </Card>
            <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6 flex items-center gap-4">
              <div className="bg-purple-50 p-4 rounded-2xl text-purple-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Semana Atual</p>
                <p className="text-2xl font-black text-foreground">{latestRecord?.week}ª Semana</p>
              </div>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-3xl animate-pulse border border-slate-50" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <div className="w-2 h-8 bg-primary rounded-full" />
              <h2 className="text-xl font-bold text-foreground">Timeline de Crescimento</h2>
            </div>

            {records.length > 0 ? (
              <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <div className="grid grid-cols-4 px-8 py-4 bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <div>Semana</div>
                  <div>Peso</div>
                  <div>Tamanho</div>
                  <div className="text-right">Ações</div>
                </div>
                <div className="divide-y">
                  {[...records].reverse().map((record) => (
                    <div key={record.id} className="grid grid-cols-4 px-8 py-6 items-center group hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                          {record.week}
                        </div>
                        <span className="font-bold text-foreground hidden sm:inline">Semana</span>
                      </div>
                      <div className="font-bold text-slate-600">{record.weight ? `${record.weight}g` : "---"}</div>
                      <div className="font-bold text-slate-600">{record.size ? `${record.size}cm` : "---"}</div>
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 hover:text-red-500"
                          onClick={() => setDeleteConfirmId(record.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-20 text-center">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Nenhum registro ainda</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Comece a registrar o peso e tamanho do seu bebê para ver a evolução semana a semana.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Novo Registro */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-foreground">Registrar Evolução</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Insira os dados da semana.</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Semana da Gestação</label>
                <Input 
                  type="number" 
                  placeholder="Ex: 24" 
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  required
                  min="1"
                  max="42"
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Peso (gramas)</label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="number" 
                      placeholder="Ex: 600" 
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Tamanho (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="number" 
                      step="0.1"
                      placeholder="Ex: 30.5" 
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Anotações da Semana</label>
                <textarea 
                  placeholder="Ex: Mexendo bastante, coração forte..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[100px] p-4 rounded-2xl bg-slate-50 border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !week}
                className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20"
              >
                {isSubmitting ? "Salvando..." : "Salvar Registro"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Deletar */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-md border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <div className="p-10 text-center space-y-6">
              <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">Excluir registro?</h2>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  Esta ação removerá permanentemente os dados desta semana do diário.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200"
                >
                  {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-xl text-slate-400 font-bold hover:text-foreground" 
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
