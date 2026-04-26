"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart, 
  Calendar, 
  Baby, 
  Bell, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Baby className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Nove Meses</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Funcionalidades</Link>
            <Link href="#about" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Sobre</Link>
            <Link href="/login">
              <Button className="rounded-2xl px-6 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                Acessar Minha Conta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">A jornada mais linda começa aqui</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Acompanhe cada <span className="text-primary italic">instante</span> da sua gestação.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-slate-600 leading-relaxed max-w-xl">
              Do primeiro teste até o grande dia. O Nove Meses organiza sua jornada, monitora o crescimento do seu bebê e te ajuda a não esquecer nenhum detalhe importante.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login">
                <Button className="w-full sm:w-auto h-16 px-10 rounded-[2rem] text-lg font-bold bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 group">
                  Começar Jornada Agora
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" className="w-full sm:w-auto h-16 px-10 rounded-[2rem] text-lg font-bold hover:bg-slate-50">
                  Ver funcionalidades
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500">
                Mais de <span className="text-slate-900">+5.000 mamães</span> já usam o app.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-3xl" />
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <Image 
                src="/hero-image.png" 
                alt="Gestante feliz acompanhando seu bebê" 
                width={800} 
                height={800} 
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-10 bg-white p-4 rounded-3xl shadow-xl border border-slate-50 hidden md:flex items-center gap-3"
            >
              <div className="bg-emerald-500/10 p-2 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Status</p>
                <p className="text-sm font-bold text-slate-900">Gestação Saudável</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 -right-8 bg-white p-4 rounded-3xl shadow-xl border border-slate-50 hidden md:flex items-center gap-3"
            >
              <div className="bg-amber-500/10 p-2 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Próxima</p>
                <p className="text-sm font-bold text-slate-900">Vitamina em 2h</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Tudo o que você precisa em um só lugar.</h2>
            <p className="text-lg text-slate-600 font-medium">Desenvolvemos as ferramentas certas para que você possa focar no que importa: o seu bebê.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Acompanhamento Semanal"
              description="Veja o crescimento do seu bebê semana a semana com comparações divertidas de tamanho."
              color="bg-blue-50 text-blue-600"
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Controle de Consultas"
              description="Nunca perca um pré-natal. Organize seus exames, consultas e lembretes médicos."
              color="bg-pink-50 text-pink-600"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Diário do Bebê"
              description="Registre pesos, medidas e fotos da sua barriga em uma linha do tempo inesquecível."
              color="bg-purple-50 text-purple-600"
            />
            <FeatureCard 
              icon={<Bell className="w-6 h-6" />}
              title="Lembretes Inteligentes"
              description="Alertas para hidratação, medicamentos e tarefas importantes da rotina gestacional."
              color="bg-amber-50 text-amber-600"
            />
            <FeatureCard 
              icon={<Heart className="w-6 h-6" />}
              title="Temas Personalizados"
              description="O app muda de cor automaticamente: Azul para meninos, Rosa para meninas e Bege para surpresas."
              color="bg-emerald-50 text-emerald-600"
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6" />}
              title="Dicas de Especialistas"
              description="Informações baseadas no seu tempo de gestação para tirar todas as suas dúvidas."
              color="bg-rose-50 text-rose-600"
            />
          </div>
        </div>
      </section>

      {/* Benefits / Social Proof */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Sua privacidade e segurança em primeiro lugar.
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Sabemos o quão preciosos são os dados da sua gestação. Por isso, utilizamos criptografia de ponta e armazenamento seguro para que suas memórias e informações médicas estejam sempre protegidas.
            </p>
            <div className="space-y-4">
              {[
                "Login seguro com Google",
                "Dados criptografados na nuvem",
                "Privacidade total das suas fotos",
                "Exportação de dados para consultas"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-slate-800">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 bg-primary/5 rounded-[4rem] p-12 relative">
             <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/10 border border-slate-50 rotate-2">
                   <p className="text-lg italic text-slate-700 font-medium leading-relaxed">
                     "O Nove Meses me ajudou a manter a calma durante toda a gravidez. Ter os lembretes de vitaminas e as datas das consultas todas organizadas foi essencial para mim."
                   </p>
                   <div className="flex items-center gap-4 mt-6">
                      <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" />
                      </div>
                      <div>
                         <p className="font-black text-slate-900 text-sm">Sarah Oliveira</p>
                         <p className="text-xs font-bold text-slate-400">Mãe do Theo, 32 semanas</p>
                      </div>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/10 border border-slate-50 -rotate-2 ml-12">
                   <p className="text-lg italic text-slate-700 font-medium leading-relaxed">
                     "Finalmente um app que pensa nos pais também! O design é clean e as informações sobre o tamanho do bebê são ótimas para acompanhar a evolução."
                   </p>
                   <div className="flex items-center gap-4 mt-6">
                      <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Joao" alt="Joao" />
                      </div>
                      <div>
                         <p className="font-black text-slate-900 text-sm">João Pedro</p>
                         <p className="text-xs font-bold text-slate-400">Pai da Alice, 24 semanas</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center space-y-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -ml-32 -mb-32" />
          
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight relative z-10">Pronta para começar essa jornada?</h2>
          <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto relative z-10">Crie sua conta em segundos e comece a acompanhar o crescimento do seu maior amor.</p>
          <div className="pt-6 relative z-10">
            <Link href="/login">
              <Button className="h-16 px-12 rounded-[2rem] text-xl font-bold bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 active:scale-95">
                Começar Grátis Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary" />
            <span className="text-lg font-black tracking-tight text-slate-900">Nove Meses</span>
          </div>
          <p className="text-sm font-bold text-slate-400">© 2026 Nove Meses. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Termos</Link>
            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Privacidade</Link>
            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  color: string
}) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
    >
      <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </motion.div>
  );
}
