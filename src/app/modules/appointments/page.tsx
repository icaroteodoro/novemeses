"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Plus, 
  X, 
  MoreVertical,
  Pencil,
  Trash2,
  ChevronRight
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [noPregnancy, setNoPregnancy] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctor, setDoctor] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await apiFetch("/api/appointments");
      if (res.status === 404) {
        setNoPregnancy(true);
        return;
      }
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const appointmentDate = new Date(`${date}T${time || "00:00"}`);

    const payload = {
      date: appointmentDate.toISOString(),
      doctor,
      location,
      notes
    };

    try {
      const url = editingAppointment 
        ? `/api/appointments/${editingAppointment.id}` 
        : "/api/appointments";
      const method = editingAppointment ? "PATCH" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchAppointments();
        closeModal();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/appointments/${deleteConfirmId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchAppointments();
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (app: any) => {
    setEditingAppointment(app);
    const d = new Date(app.date);
    setDate(format(d, "yyyy-MM-dd"));
    setTime(format(d, "HH:mm"));
    setDoctor(app.doctor || "");
    setLocation(app.location || "");
    setNotes(app.notes || "");
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAppointment(null);
    setDate("");
    setTime("");
    setDoctor("");
    setLocation("");
    setNotes("");
  };

  const upcomingAppointments = appointments.filter(app => 
    isAfter(new Date(app.date), startOfDay(new Date()))
  );
  
  const pastAppointments = appointments.filter(app => 
    isBefore(new Date(app.date), startOfDay(new Date()))
  ).reverse();

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <CalendarIcon className="text-primary w-8 h-8" />
              Agenda de Consultas
            </h1>
            <p className="text-muted-foreground">Gerencie seu acompanhamento pré-natal.</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl h-12 px-8 font-bold flex gap-2"
          >
            <Plus className="w-5 h-5" />
            Agendar Consulta
          </Button>
        </div>

        {noPregnancy && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <CalendarIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800">Gestação não configurada</p>
              <p className="text-amber-700 text-sm">Configure sua gestação para começar a agendar consultas.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Próximas Consultas */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <h2 className="text-xl font-bold text-foreground">Próximas Consultas</h2>
              </div>
              
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingAppointments.map((app) => (
                    <AppointmentCard 
                      key={app.id} 
                      appointment={app} 
                      onEdit={() => openEditModal(app)}
                      onDelete={() => handleDeleteClick(app.id)}
                      isPast={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-12 text-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nenhuma consulta agendada.</p>
                </div>
              )}
            </section>

            {/* Consultas Passadas */}
            {pastAppointments.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-8 bg-slate-300 rounded-full" />
                  <h2 className="text-xl font-bold text-foreground">Histórico</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastAppointments.map((app) => (
                    <AppointmentCard 
                      key={app.id} 
                      appointment={app} 
                      onEdit={() => openEditModal(app)}
                      onDelete={() => handleDeleteClick(app.id)}
                      isPast={true}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Modal Agendar/Editar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-foreground">
                  {editingAppointment ? "Editar Consulta" : "Agendar Consulta"}
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Preencha os detalhes abaixo.</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={closeModal}>
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Médico(a)</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Nome do profissional" 
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Local</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Clínica ou hospital" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Anotações</label>
                <textarea 
                  placeholder="Dúvidas para levar, preparo, etc." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[100px] p-4 rounded-2xl bg-slate-50 border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Salvando..." : (editingAppointment ? "Atualizar Consulta" : "Confirmar Agendamento")}
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
                <h2 className="text-2xl font-black text-foreground">Excluir consulta?</h2>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  Esta ação removerá o agendamento permanentemente da sua agenda.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
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

function AppointmentCard({ appointment, onEdit, onDelete, isPast }: any) {
  const date = new Date(appointment.date);
  
  return (
    <Card className={`border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden rounded-[2rem] ${isPast ? 'opacity-75' : 'bg-white'}`}>
      <div className={`h-2 w-full ${isPast ? 'bg-slate-200' : 'bg-primary'}`} />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-slate-50 px-4 py-2 rounded-2xl text-center min-w-[80px]">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {format(date, "MMM", { locale: ptBR })}
            </p>
            <p className="text-2xl font-black text-foreground">
              {format(date, "dd")}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onEdit}>
              <Pencil className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isPast ? 'bg-slate-100' : 'bg-primary/10'}`}>
              <Clock className={`w-4 h-4 ${isPast ? 'text-slate-400' : 'text-primary'}`} />
            </div>
            <span className="font-bold text-foreground">{format(date, "HH:mm")}</span>
          </div>

          {appointment.doctor && (
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isPast ? 'bg-slate-100' : 'bg-primary/10'}`}>
                <UserIcon className={`w-4 h-4 ${isPast ? 'text-slate-400' : 'text-primary'}`} />
              </div>
              <span className="text-sm font-medium text-slate-600 truncate">{appointment.doctor}</span>
            </div>
          )}

          {appointment.location && (
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isPast ? 'bg-slate-100' : 'bg-primary/10'}`}>
                <MapPin className={`w-4 h-4 ${isPast ? 'text-slate-400' : 'text-primary'}`} />
              </div>
              <span className="text-sm font-medium text-slate-600 truncate">{appointment.location}</span>
            </div>
          )}
        </div>

        {appointment.notes && (
          <div className="mt-6 pt-6 border-t border-slate-50">
            <p className="text-xs text-muted-foreground line-clamp-2 italic">
              "{appointment.notes}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
