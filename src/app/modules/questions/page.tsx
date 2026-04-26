"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Plus, 
  X, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  MessageSquare,
  ChevronRight,
  MoreVertical,
  Pencil
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [noPregnancy, setNoPregnancy] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit/Answer state
  const [answeringDoc, setAnsweringDoc] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await apiFetch("/api/questions");
      if (res.status === 404) {
        setNoPregnancy(true);
        return;
      }
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await apiFetch("/api/questions", {
        method: "POST",
        body: JSON.stringify({ content: newQuestion }),
      });

      if (res.ok) {
        await fetchQuestions();
        setShowAddModal(false);
        setNewQuestion("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringDoc) return;
    setIsSavingAnswer(true);
    try {
      const res = await apiFetch(`/api/questions/${answeringDoc.id}`, {
        method: "PATCH",
        body: JSON.stringify({ 
          answer: answerText,
          status: answerText.trim() ? "RESPONDIDO" : "PENDENTE"
        }),
      });
      if (res.ok) {
        await fetchQuestions();
        setAnsweringDoc(null);
        setAnswerText("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/questions/${deleteConfirmId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchQuestions();
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const pendingQuestions = questions.filter(q => q.status === "PENDENTE");
  const answeredQuestions = questions.filter(q => q.status === "RESPONDIDO");

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <HelpCircle className="text-primary w-8 h-8" />
              Banco de Dúvidas
            </h1>
            <p className="text-muted-foreground">Anote perguntas para sua próxima consulta.</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl h-12 px-8 font-bold flex gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Dúvida
          </Button>
        </div>

        {noPregnancy && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800">Gestação não configurada</p>
              <p className="text-amber-700 text-sm">Configure sua gestação para começar a registrar suas dúvidas.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Dúvidas Pendentes */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-8 bg-amber-400 rounded-full" />
                <h2 className="text-xl font-bold text-foreground">Para perguntar ao médico</h2>
              </div>
              
              {pendingQuestions.length > 0 ? (
                <div className="grid gap-4">
                  {pendingQuestions.map((q) => (
                    <QuestionRow 
                      key={q.id} 
                      question={q} 
                      onAnswer={() => { setAnsweringDoc(q); setAnswerText(q.answer || ""); }}
                      onDelete={() => setDeleteConfirmId(q.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-12 text-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nenhuma dúvida pendente.</p>
                </div>
              )}
            </section>

            {/* Dúvidas Respondidas */}
            {answeredQuestions.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-8 bg-emerald-400 rounded-full" />
                  <h2 className="text-xl font-bold text-foreground">Respondidas</h2>
                </div>
                <div className="grid gap-4">
                  {answeredQuestions.map((q) => (
                    <QuestionRow 
                      key={q.id} 
                      question={q} 
                      onAnswer={() => { setAnsweringDoc(q); setAnswerText(q.answer || ""); }}
                      onDelete={() => setDeleteConfirmId(q.id)}
                      isAnswered
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Modal Nova Dúvida */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-foreground">Nova Dúvida</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">O que você gostaria de perguntar?</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowAddModal(false)}>
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <textarea 
                  placeholder="Ex: Posso continuar praticando exercícios de impacto?" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  required
                  className="w-full min-h-[150px] p-6 rounded-[2rem] bg-slate-50 border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg resize-none"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting || !newQuestion.trim()}
                className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-lg font-bold shadow-xl shadow-primary/20"
              >
                {isSubmitting ? "Salvando..." : "Salvar Dúvida"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Responder */}
      {answeringDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-foreground line-clamp-1">
                  Resposta do Médico
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-1 italic">"{answeringDoc.content}"</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setAnsweringDoc(null)}>
                <X className="w-6 h-6" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSaveAnswer} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">O que o médico respondeu?</label>
                <textarea 
                  placeholder="Anote aqui a resposta ou orientações..." 
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full min-h-[150px] p-6 rounded-[2rem] bg-slate-50 border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg resize-none"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSavingAnswer}
                className="w-full h-16 rounded-[1.5rem] bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold shadow-xl shadow-emerald-200"
              >
                {isSavingAnswer ? "Salvando..." : "Salvar Resposta"}
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
                <h2 className="text-2xl font-black text-foreground">Excluir dúvida?</h2>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                  Esta ação removerá a pergunta permanentemente do seu banco de dúvidas.
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

function QuestionRow({ question, onAnswer, onDelete, isAnswered }: any) {
  return (
    <div className={`flex items-start gap-4 p-6 rounded-[2rem] bg-white shadow-sm border border-slate-50 group hover:shadow-md transition-all duration-300 ${isAnswered ? 'bg-slate-50/50' : ''}`}>
      <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${isAnswered ? 'bg-emerald-100' : 'bg-amber-100'}`}>
        {isAnswered ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
      </div>
      
      <div className="flex-1 space-y-3 min-w-0">
        <p className={`text-lg font-bold text-foreground leading-tight ${isAnswered ? 'text-slate-500 line-through decoration-slate-300' : ''}`}>
          {question.content}
        </p>
        
        {isAnswered && question.answer && (
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
            <p className="text-sm font-bold text-emerald-800 mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Resposta:
            </p>
            <p className="text-sm text-emerald-700 leading-relaxed">
              {question.answer}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={onAnswer} title={isAnswered ? "Editar Resposta" : "Registrar Resposta"}>
          <Pencil className="w-4 h-4 text-slate-400" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500" onClick={onDelete} title="Excluir">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
