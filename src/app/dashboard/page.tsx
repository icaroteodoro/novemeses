"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
   Calendar,
   Baby,
   HelpCircle,
   Bell,
   ArrowRight,
   Sparkles,
   TrendingUp,
   Clock,
   AlertTriangle,
   CheckCircle2,
   Heart,
   FileText,
   MapPin,
   User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppTheme } from "@/components/providers/app-theme-provider";
import { PartnerInviteCard } from "@/components/pregnancy/partner-invite-card";

const BABY_SIZE_BY_WEEK: Record<number, string> = {
   4: "semente de papoula", 5: "semente de gergelim", 6: "lentilha",
   7: "mirtilo", 8: "framboesa", 9: "uva", 10: "azeitona",
   11: "figo", 12: "ameixa", 13: "pêssego", 14: "limão",
   15: "maçã", 16: "abacate", 17: "pera", 18: "pimentão",
   19: "tomate", 20: "banana", 21: "cenoura", 22: "mamão",
   23: "berinjela", 24: "milho", 25: "couve-flor", 26: "alface",
   27: "repolho", 28: "berinjela grande", 29: "abóbora japonesa",
   30: "pepino", 31: "coco", 32: "nabo", 33: "abacaxi pequeno",
   34: "melão cantaloupe", 35: "abobrinha", 36: "acelga", 37: "romã",
   38: "alho-poró", 39: "melão médio", 40: "melancia pequena",
};



export default function DashboardPage() {
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);
   const [updatingGender, setUpdatingGender] = useState(false);
   const router = useRouter();
   const { setTheme } = useAppTheme();

   useEffect(() => {
      async function fetchDashboard() {
         try {
            const res = await apiFetch("/api/dashboard");
            const summary = await res.json();
            setData(summary);

            // Apply theme from pregnancy data
            if (summary?.pregnancy?.babyGender && summary?.pregnancy?.userRole) {
               setTheme(summary.pregnancy.babyGender, summary.pregnancy.userRole);
            }

            // Redirect to onboarding if not done
            if (!summary?.hasActivePregnancy || !summary?.pregnancy?.onboardingDone) {
               router.replace("/onboarding");
               return;
            }
         } catch (error) {
            console.error(error);
         } finally {
            setLoading(false);
         }
      }
      fetchDashboard();
   }, []);

   if (loading) {
      return (
         <MainLayout>
            <div className="flex items-center justify-center h-[calc(100vh-64px)] text-primary">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium animate-pulse">Organizando seu painel...</p>
               </div>
            </div>
         </MainLayout>
      );
   }

   // If loading is done but no pregnancy (redirect is in progress), show spinner
   if (!data?.hasActivePregnancy || !data?.pregnancy?.onboardingDone) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
         </div>
      );
   }


   const { pregnancy, summary } = data;
   const currentWeek = pregnancy.currentWeek || 0;
   const progressPercentage = Math.min((currentWeek / 40) * 100, 100);
   const weeksLeft = Math.max(40 - currentWeek, 0);
   const babySize = BABY_SIZE_BY_WEEK[currentWeek];

   const isMae = pregnancy.userRole !== "PAI";
   const greeting = isMae ? "Olá, Mamãe! ✨" : "Olá, Papai! ✨";
   const babyLabel =
      pregnancy.babyGender === "MENINO" ? "menino" :
         pregnancy.babyGender === "MENINA" ? "menina" : "bebê";

   const displayName =
      pregnancy.babyGender === "MENINO" ? (pregnancy.babyName || pregnancy.babyNameBoy || "seu menino") :
         pregnancy.babyGender === "MENINA" ? (pregnancy.babyName || pregnancy.babyNameGirl || "sua menina") :
            (pregnancy.babyNameBoy && pregnancy.babyNameGirl ? `${pregnancy.babyNameBoy} ou ${pregnancy.babyNameGirl}` : "seu bebê");

   // Highlight logic: Show gender question from week 9 if surprise
   const showGenderQuestion = pregnancy.babyGender === "SURPRESA" && currentWeek >= 9;

   const nextAppointment = summary.nextAppointment;
   const lastBabyRecord = summary.lastBabyRecord;
   const pendingRemindersCount = summary.pendingRemindersCount;
   const pendingQuestionsCount = summary.pendingQuestionsCount;

   return (
      <>
      <MainLayout>
         <div className="flex flex-col gap-8">
            {/* Welcome */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                     {greeting}
                  </h1>
                  <p className="text-muted-foreground">Aqui está o resumo da sua jornada hoje.</p>
               </div>
               <div className="flex gap-3">
                  <Button
                     variant="outline"
                     className="rounded-2xl h-11 px-6 border-2 active:scale-95"
                     onClick={() => router.push("/modules/appointments")}
                  >
                     <Calendar className="w-4 h-4 mr-2" />
                     Agendar Consulta
                  </Button>
               </div>
            </div>

            {showGenderQuestion && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8"
               >
                  <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                     <div className="bg-white p-5 rounded-3xl shadow-lg shadow-primary/10">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-foreground">Já descobriu o sexo?</h2>
                        <p className="text-muted-foreground max-w-sm">A partir da 9ª semana já é possível saber! Quer atualizar as cores do seu app?</p>
                     </div>
                  </div>
                  <Button
                     onClick={() => setIsGenderModalOpen(true)}
                     className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-bold text-lg shadow-xl shadow-primary/20 active:scale-95 w-full md:w-auto"
                  >
                     Sim, descobri! 🌈
                  </Button>
               </motion.div>
            )}

            {/* Progress Card */}
            <Card className="border-none shadow-xl shadow-primary/5 bg-white rounded-[2rem] overflow-hidden">
               <CardContent className="p-6 md:p-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                     <div className="flex items-center gap-5">
                        <div className="bg-primary/10 p-4 md:p-5 rounded-[1.5rem] flex-shrink-0">
                           <Baby className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                        </div>
                        <div className="space-y-1">
                           <h2 className="text-2xl md:text-3xl font-black text-foreground">
                              O {displayName} está com
                           </h2>
                           <p className="text-xl md:text-2xl font-bold text-primary">
                              {currentWeek} semanas {pregnancy.currentDays > 0 ? `e ${pregnancy.currentDays} dias` : ""}
                           </p>
                           <p className="text-muted-foreground font-medium">
                              {weeksLeft > 0 ? `Faltam aproximadamente ${weeksLeft} semanas` : "Você está na reta final! ✨"}
                           </p>
                        </div>
                     </div>
                     <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full px-4 py-1.5 text-sm font-bold self-start md:self-center">
                        Gestação Saudável
                     </Badge>
                  </div>

                  <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-3">
                     <div
                        className="absolute h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                     />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                     <span>Início</span>
                     <span className="text-primary">{Math.round(progressPercentage)}% concluído</span>
                     <span>40 Semanas</span>
                  </div>

                  {babySize && (
                     <div className="mt-6 bg-primary/5 p-4 rounded-2xl flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                        <p className="text-sm text-primary font-medium">
                           Esta semana, seu bebê tem o tamanho de um{" "}
                           <span className="font-black">{babySize}</span>! 🍼
                        </p>
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Invite Card */}
            {!pregnancy.partnerId && pregnancy.userId === data.user.id && (
               <PartnerInviteCard hasPartner={!!pregnancy.partnerId} />
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               <StatCard
                  label="Próx. Consulta"
                  value={nextAppointment ? format(new Date(nextAppointment.date), "dd/MM", { locale: ptBR }) : "---"}
                  sub={nextAppointment ? format(new Date(nextAppointment.date), "HH:mm") : "Sem consulta"}
                  icon={<Calendar className="w-5 h-5 text-primary" />}
                  bg="bg-primary/10"
                  onClick={() => router.push("/modules/appointments")}
               />
               <StatCard
                  label="Lembretes"
                  value={pendingRemindersCount}
                  sub={pendingRemindersCount === 1 ? "pendente" : "pendentes"}
                  icon={<Bell className="w-5 h-5 text-amber-500" />}
                  bg="bg-amber-50"
                  onClick={() => router.push("/modules/reminders")}
               />
               <StatCard
                  label="Dúvidas"
                  value={pendingQuestionsCount}
                  sub={pendingQuestionsCount === 1 ? "para perguntar" : "para perguntar"}
                  icon={<HelpCircle className="w-5 h-5 text-purple-500" />}
                  bg="bg-purple-50"
                  onClick={() => router.push("/modules/questions")}
               />
               <StatCard
                  label="Peso Bebê"
                  value={lastBabyRecord?.weight ? `${lastBabyRecord.weight}g` : "---"}
                  sub={lastBabyRecord ? `Sem. ${lastBabyRecord.week}` : "Sem registro"}
                  icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                  bg="bg-emerald-50"
                  onClick={() => router.push("/modules/baby")}
               />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Próxima Consulta Detail */}
               <Card
                  className="border-none shadow-sm bg-white rounded-[2rem] hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push("/modules/appointments")}
               >
                  <CardHeader className="p-6 pb-2">
                     <CardTitle className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Próxima Consulta
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                     {nextAppointment ? (
                        <div className="space-y-4">
                           <div className="flex items-start gap-4">
                              <div className="bg-primary/10 rounded-2xl p-3 text-center min-w-[60px]">
                                 <p className="text-[10px] font-black uppercase text-primary">
                                    {format(new Date(nextAppointment.date), "MMM", { locale: ptBR })}
                                 </p>
                                 <p className="text-2xl font-black text-primary">
                                    {format(new Date(nextAppointment.date), "dd")}
                                 </p>
                              </div>
                              <div className="flex-1">
                                 <p className="text-2xl font-black text-foreground">
                                    {format(new Date(nextAppointment.date), "HH:mm")}h
                                 </p>
                                 {nextAppointment.doctor && (
                                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                       <User className="w-4 h-4" /> {nextAppointment.doctor}
                                    </p>
                                 )}
                                 {nextAppointment.location && (
                                    <p className="text-muted-foreground flex items-center gap-1">
                                       <MapPin className="w-4 h-4" /> {nextAppointment.location}
                                    </p>
                                 )}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="py-4 text-center">
                           <p className="text-muted-foreground mb-4">Nenhuma consulta agendada</p>
                           <Button variant="link" className="text-primary font-bold group-hover:underline">
                              Agendar agora →
                           </Button>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Evolução do Bebê */}
               <Card
                  className="border-none shadow-sm bg-white rounded-[2rem] hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push("/modules/baby")}
               >
                  <CardHeader className="p-6 pb-2">
                     <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Evolução do Bebê
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                     {lastBabyRecord ? (
                        <div className="space-y-4">
                           <div className="flex items-center justify-around">
                              <div className="text-center">
                                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Peso</p>
                                 <p className="text-3xl font-black text-foreground">{lastBabyRecord.weight ?? "---"}g</p>
                              </div>
                              <div className="h-12 w-px bg-slate-100" />
                              <div className="text-center">
                                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Tamanho</p>
                                 <p className="text-3xl font-black text-foreground">{lastBabyRecord.size ?? "---"}cm</p>
                              </div>
                              <div className="h-12 w-px bg-slate-100" />
                              <div className="text-center">
                                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Semana</p>
                                 <p className="text-3xl font-black text-foreground">{lastBabyRecord.week}</p>
                              </div>
                           </div>
                           {lastBabyRecord.notes && (
                              <div className="bg-slate-50 p-4 rounded-2xl">
                                 <p className="text-sm text-muted-foreground italic line-clamp-2">"{lastBabyRecord.notes}"</p>
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="py-4 text-center">
                           <p className="text-muted-foreground mb-4">Nenhum registro ainda</p>
                           <Button variant="link" className="text-primary font-bold group-hover:underline">
                              Registrar evolução →
                           </Button>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Lembretes Pendentes */}
               <Card
                  className="border-none shadow-sm bg-white rounded-[2rem] hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push("/modules/reminders")}
               >
                  <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                     <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Lembretes Pendentes
                     </CardTitle>
                     {pendingRemindersCount > 0 && (
                        <Badge className="bg-primary text-white rounded-full h-6 min-w-6 flex items-center justify-center px-2 text-xs font-bold">
                           {pendingRemindersCount}
                        </Badge>
                     )}
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                     {pendingRemindersCount > 0 ? (
                        <div className="space-y-3">
                           <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl">
                              <Bell className="w-5 h-5 text-amber-500 flex-shrink-0" />
                              <p className="font-bold text-amber-700">
                                 {pendingRemindersCount} {pendingRemindersCount === 1 ? "tarefa" : "tarefas"} para concluir hoje
                              </p>
                           </div>
                           <Button variant="ghost" className="w-full text-primary font-bold hover:bg-primary/5 group/btn active:scale-95">
                              Ver lembretes <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                           </Button>
                        </div>
                     ) : (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                           <p className="font-bold text-emerald-700">Tudo em dia! 🎉</p>
                        </div>
                     )}
                  </CardContent>
               </Card>

               {/* Dúvidas Pendentes */}
               <Card
                  className="border-none shadow-sm bg-white rounded-[2rem] hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push("/modules/questions")}
               >
                  <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                     <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Banco de Dúvidas
                     </CardTitle>
                     {pendingQuestionsCount > 0 && (
                        <Badge className="bg-purple-500 text-white rounded-full h-6 min-w-6 flex items-center justify-center px-2 text-xs font-bold">
                           {pendingQuestionsCount}
                        </Badge>
                     )}
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                     {pendingQuestionsCount > 0 ? (
                        <div className="space-y-3">
                           <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
                              <HelpCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                              <p className="font-bold text-purple-700">
                                 {pendingQuestionsCount} {pendingQuestionsCount === 1 ? "dúvida" : "dúvidas"} para perguntar ao médico
                              </p>
                           </div>
                           <Button variant="ghost" className="w-full text-primary font-bold hover:bg-primary/5 group/btn active:scale-95">
                              Ver dúvidas <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                           </Button>
                        </div>
                     ) : (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                           <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                           <p className="font-medium text-muted-foreground">Nenhuma dúvida pendente</p>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>
         </div>
      </MainLayout>

      <AnimatePresence>
         {isGenderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsGenderModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
               />
               <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white"
               >
                  <div className="p-8 md:p-10">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                              <Sparkles className="w-6 h-6" />
                           </div>
                           <h2 className="text-2xl font-black text-foreground">É menino ou menina?</h2>
                        </div>
                        <Button
                           variant="ghost"
                           size="icon"
                           className="rounded-full"
                           onClick={() => setIsGenderModalOpen(false)}
                        >
                           <ArrowRight className="w-5 h-5 rotate-45" />
                        </Button>
                     </div>

                     <div className="grid grid-cols-1 gap-4 mb-8">
                        {[
                           { id: 'MENINO', label: 'Menino', icon: '👶🏻', color: 'bg-blue-50 border-blue-500 text-blue-700', active: 'ring-4 ring-blue-500/20' },
                           { id: 'MENINA', label: 'Menina', icon: '👶🏻', color: 'bg-pink-50 border-pink-500 text-pink-700', active: 'ring-4 ring-pink-500/20' },
                           { id: 'SURPRESA', label: 'Não sei (Bege)', icon: '🍼', color: 'bg-stone-50 border-[#dcc7a1] text-stone-800', active: 'ring-4 ring-[#dcc7a1]/20' }
                        ].map((g) => (
                           <button
                              key={g.id}
                              onClick={async () => {
                                 setUpdatingGender(true);
                                 try {
                                    const newName = g.id === "MENINO" ? (pregnancy.babyNameBoy || pregnancy.babyName) :
                                                   g.id === "MENINA" ? (pregnancy.babyNameGirl || pregnancy.babyName) : pregnancy.babyName;
                                    
                                    const res = await apiFetch("/api/pregnancy", {
                                       method: "PATCH",
                                       body: JSON.stringify({ 
                                          babyGender: g.id,
                                          babyName: newName
                                       }),
                                    });

                                    if (res.ok) {
                                       setTheme(g.id as any, pregnancy.userRole);
                                       setIsGenderModalOpen(false);
                                       // Refresh data to update dashboard
                                       const refreshRes = await apiFetch("/api/dashboard");
                                       const summary = await refreshRes.json();
                                       setData(summary);
                                    }
                                 } catch (err) {
                                    console.error(err);
                                 } finally {
                                    setUpdatingGender(false);
                                 }
                              }}
                              disabled={updatingGender}
                              className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all active:scale-[0.98] ${
                                 pregnancy.babyGender === g.id ? `${g.color} ${g.active}` : 'border-slate-100 bg-white hover:border-slate-200'
                              }`}
                           >
                              <div className="flex items-center gap-4">
                                 <span className="text-3xl">{g.icon}</span>
                                 <span className="text-xl font-black">{g.label}</span>
                              </div>
                              {pregnancy.babyGender === g.id && <CheckCircle2 className="w-6 h-6" />}
                           </button>
                        ))}
                     </div>

                     <p className="text-center text-sm text-muted-foreground">
                        Ao mudar, as cores de todo o aplicativo serão atualizadas instantaneamente! ✨
                     </p>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
      </>
   );
}

function StatCard({
   label,
   value,
   sub,
   icon,
   bg,
   onClick,
}: {
   label: string;
   value: string | number;
   sub: string;
   icon: React.ReactNode;
   bg: string;
   onClick?: () => void;
}) {
   return (
      <Card
         className="border-none shadow-sm bg-white rounded-[1.5rem] p-5 hover:shadow-md transition-all active:scale-95 cursor-pointer"
         onClick={onClick}
      >
         <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
            {icon}
         </div>
         <p className="text-2xl font-black text-foreground">{value}</p>
         <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">{label}</p>
         <p className="text-xs text-muted-foreground">{sub}</p>
      </Card>
   );
}
