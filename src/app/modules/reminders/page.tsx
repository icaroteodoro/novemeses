"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Plus, 
  X, 
  CheckCircle2, 
  Circle, 
  Pill, 
  Stethoscope, 
  Calendar, 
  Trash2,
  AlertCircle,
  Clock
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const REMINDER_TYPES = [
  { id: "REMEDIO", label: "Medicamento/Vitamina", icon: Pill, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "EXAME", label: "Exame", icon: Stethoscope, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "CONSULTA", label: "Consulta", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50" },
];

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [noPregnancy, setNoPregnancy] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState("REMEDIO");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReminders = async () => {
    try {
      const res = await apiFetch("/api/reminders");
      if (res.status === 404) {
        setNoPregnancy(true);
        return;
      }
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reminderDate = new Date(`${date}T${time || "00:00"}`);

    try {
      const res = await apiFetch("/api/reminders", {
        method: "POST",
        body: JSON.stringify({
          title,
          type,
          date: reminderDate.toISOString(),
        }),
      });

      if (res.ok) {
        await fetchReminders();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (reminder: any) => {
    try {
      const res = await apiFetch(`/api/reminders/${reminder.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !reminder.completed }),
      });
      if (res.ok) {
        setReminders(prev => prev.map(r => 
          r.id === reminder.id ? { ...r, completed: !r.completed } : r
        ));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/reminders/${deleteConfirmId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchReminders();
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setType("REMEDIO");
    setDate("");
    setTime("");
  };

  const pendingReminders = reminders.filter(r => !r.completed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const completedReminders = reminders.filter(r => r.completed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Bell className="text-primary w-8 h-8" />
              Lembretes
            </h1>
            <p className="text-muted-foreground">Nunca esqueça uma vitamina ou compromisso importante.</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl h-12 px-8 font-bold flex gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Lembrete
          </Button>
        </div>

        {noPregnancy && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800">Gestação não configurada</p>
              <p className="text-amber-700 text-sm">Configure sua gestação para começar a criar lembretes.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-3xl animate-pulse border border-slate-50" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Lembretes Pendentes */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <h2 className="text-xl font-bold text-foreground">Tarefas Pendentes</h2>
              </div>
              
              {pendingReminders.length > 0 ? (
                <div className="grid gap-4">
                  {pendingReminders.map((reminder) => (
                    <ReminderRow 
                      key={reminder.id} 
                      reminder={reminder} 
                      onToggle={() => toggleComplete(reminder)}
                      onDelete={() => setDeleteConfirmId(reminder.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12 text-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-300" />
                  </div>
                  <p className="text-muted-foreground font-medium">Tudo em dia! Nenhum lembrete pendente.</p>
                </div>
              )}
            </section>

            {/* Lembretes Concluídos */}
            {completedReminders.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-8 bg-slate-300 rounded-full" />
                  <h2 className="text-xl font-bold text-foreground opacity-60">Concluídos</h2>
                </div>
                <div className="grid gap-4 opacity-60">
                  {completedReminders.map((reminder) => (
                    <ReminderRow 
                      key={reminder.id} 
                      reminder={reminder} 
                      onToggle={() => toggleComplete(reminder)}
                      onDelete={() => setDeleteConfirmId(reminder.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Modal Novo Lembrete */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-foreground">Novo Lembrete</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">O que você precisa lembrar?</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Título</label>
                <Input 
                  placeholder="Ex: Tomar ácido fólico" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-lg font-bold"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Tipo</label>
                <div className="grid grid-cols-3 gap-3">
                  {REMINDER_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        type === t.id 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      <t.icon className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.label.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Data</label>
                  <Input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Horário</label>
                  <Input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !title || !date}
                className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20"
              >
                {isSubmitting ? "Salvando..." : "Criar Lembrete"}
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
                <h2 className="text-2xl font-black text-foreground">Excluir lembrete?</h2>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  Esta ação removerá o lembrete permanentemente da sua lista.
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

function ReminderRow({ reminder, onToggle, onDelete }: any) {
  const date = new Date(reminder.date);
  const typeInfo = REMINDER_TYPES.find(t => t.id === reminder.type) || REMINDER_TYPES[0];
  const Icon = typeInfo.icon;

  return (
    <div className={`flex items-center gap-4 p-6 rounded-[2rem] bg-white shadow-sm border border-slate-50 group hover:shadow-md transition-all duration-300 ${reminder.completed ? 'bg-slate-50/50 shadow-none border-transparent' : ''}`}>
      <button 
        onClick={onToggle}
        className={`flex-shrink-0 transition-transform active:scale-90 ${reminder.completed ? 'text-emerald-500' : 'text-slate-200 hover:text-primary'}`}
      >
        {reminder.completed ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
      </button>
      
      <div className={`p-3 rounded-2xl flex-shrink-0 ${typeInfo.bg} ${typeInfo.color}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-lg font-bold text-foreground truncate ${reminder.completed ? 'text-slate-400 line-through' : ''}`}>
          {reminder.title}
        </p>
        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(date, "dd/MM 'às' HH:mm", { locale: ptBR })}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className={`uppercase tracking-widest text-[9px] font-black ${typeInfo.color}`}>{typeInfo.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
