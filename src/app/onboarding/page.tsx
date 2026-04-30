"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useAppTheme } from "@/components/providers/app-theme-provider";
import { subWeeks, differenceInDays } from "date-fns";
import {
  Baby, Sparkles, Check,
  ChevronRight, ChevronLeft, Calendar
} from "lucide-react";

type ParentRole = "PAI" | "MAE";
type BabyGender = "MENINO" | "MENINA" | "SURPRESA";
type KnowsWeeks = "SIM" | "NAO";
type KnowsGender = "SIM" | "NAO";

interface OnboardingData {
  parentRole: ParentRole | null;
  knowsWeeks: KnowsWeeks | null;
  currentWeek: number;
  currentDays: number;
  dumDate: string;
  knowsGender: KnowsGender | null;
  babyGender: BabyGender | null;
  babyName: string;
  babyNameBoy: string;
  babyNameGirl: string;
}

const STEP_COUNT = 5;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const transition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] } as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { setTheme } = useAppTheme();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await apiFetch("/api/dashboard");
        if (res.ok) {
          const summary = await res.json();
          if (summary?.pregnancy?.onboardingDone) {
            router.replace("/dashboard");
            return;
          }
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkStatus();
  }, [router]);

  const [data, setData] = useState<OnboardingData>({
    parentRole: null,
    knowsWeeks: null,
    currentWeek: 20,
    currentDays: 0,
    dumDate: "",
    knowsGender: null,
    babyGender: null,
    babyName: "",
    babyNameBoy: "",
    babyNameGirl: "",
  });

  const update = (partial: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return true;
      case 1: return data.parentRole !== null;
      case 2: return data.knowsWeeks === "SIM"
        ? data.currentWeek >= 1 && data.currentWeek <= 42
        : data.dumDate !== "";
      case 3: return data.knowsGender !== null;
      case 4: return data.knowsGender === "SIM" ? data.babyName.trim() !== "" : true;
      default: return true;
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    let startDate: Date;
    if (data.knowsWeeks === "SIM") {
      startDate = subWeeks(new Date(), data.currentWeek);
    } else {
      startDate = new Date(data.dumDate);
    }

    const gender = (data.knowsGender === "SIM" ? data.babyGender : "SURPRESA") || "SURPRESA";

    const payload = {
      startDate: startDate.toISOString(),
      parentRole: data.parentRole,
      babyGender: gender,
      babyName: data.knowsGender === "SIM" ? data.babyName : undefined,
      babyNameBoy: data.knowsGender === "NAO" ? data.babyNameBoy : undefined,
      babyNameGirl: data.knowsGender === "NAO" ? data.babyNameGirl : undefined,
      onboardingDone: true,
    };

    try {
      const res = await apiFetch("/api/pregnancy", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTheme(gender as BabyGender, data.parentRole!);
        setStep(STEP_COUNT);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeBg =
    data.babyGender === "MENINO"
      ? "from-blue-50 to-indigo-50"
      : data.babyGender === "MENINA"
        ? "from-pink-50 to-rose-50"
        : "from-[#fcfaf7] to-[#f5f0e6]";

  const accentClass =
    data.babyGender === "MENINO"
      ? "bg-blue-500 hover:bg-blue-600"
      : data.babyGender === "MENINA"
        ? "bg-pink-500 hover:bg-pink-600"
        : "bg-[#8b7355] hover:bg-[#766148] text-white";

  const rangeAccentClass =
    data.babyGender === "MENINO"
      ? "[&::-webkit-slider-thumb]:bg-blue-600"
      : data.babyGender === "MENINA"
        ? "[&::-webkit-slider-thumb]:bg-pink-600"
        : "[&::-webkit-slider-thumb]:bg-[#8b7355]";

  const getDUMProgress = () => {
    if (!data.dumDate) return null;
    const daysDiff = differenceInDays(new Date(), new Date(data.dumDate));
    const weeks = Math.floor(daysDiff / 7);
    const days = daysDiff % 7;
    return { weeks, days };
  };

  const dumProgress = getDUMProgress();

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeBg} flex flex-col items-center justify-center p-6`}>
        <div className="w-10 h-10 border-4 border-[#8b7355] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeBg} flex flex-col items-center justify-center p-6 transition-all duration-700`}>
      <div className="mb-8 flex items-center gap-2 text-xl font-black text-foreground/70">
        <Baby className="w-6 h-6" />
        Nove Meses
      </div>

      {step < STEP_COUNT && step > 0 && (
        <div className="flex gap-2 mb-8">
          {Array.from({ length: STEP_COUNT - 1 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i < step - 1 ? `w-6 ${accentClass}` : i === step - 1 ? `w-8 ${accentClass} opacity-100` : "w-2 bg-slate-200"
                }`}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-lg overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {step === 0 && (
              <StepWrapper>
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Baby className="w-12 h-12 text-[#8b7355]" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black text-foreground">Que notícia incrível! 🎉</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Vamos preparar tudo para acompanhar essa jornada especial juntos.
                    </p>
                    <p className="text-muted-foreground text-sm">Vai levar menos de 2 minutos ⏱️</p>
                  </div>
                </div>
              </StepWrapper>
            )}

            {step === 1 && (
              <StepWrapper>
                <h2 className="text-2xl font-black text-foreground text-center mb-2">Quem está aqui?</h2>
                <p className="text-muted-foreground text-center mb-8">Vamos personalizar o app para você.</p>
                <div className="grid grid-cols-2 gap-4">
                  <RoleCard
                    label="Mamãe 🤰"
                    description="Estou grávida"
                    selected={data.parentRole === "MAE"}
                    onClick={() => { update({ parentRole: "MAE" }); }}
                    emoji="🤱"
                  />
                  <RoleCard
                    label="Papai 👨"
                    description="Minha parceira está grávida"
                    selected={data.parentRole === "PAI"}
                    onClick={() => { update({ parentRole: "PAI" }); }}
                    emoji="👨‍👩‍👧"
                  />
                </div>
              </StepWrapper>
            )}

            {step === 2 && (
              <StepWrapper>
                <h2 className="text-2xl font-black text-foreground text-center mb-2">Como está a gestação?</h2>
                <p className="text-muted-foreground text-center mb-8">Vamos calcular o progresso da sua jornada.</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <OptionCard
                    label="Sei quantas semanas"
                    icon={<Calendar className="w-6 h-6" />}
                    selected={data.knowsWeeks === "SIM"}
                    onClick={() => update({ knowsWeeks: "SIM" })}
                  />
                  <OptionCard
                    label="Sei a data da DUM"
                    icon={<Calendar className="w-6 h-6" />}
                    selected={data.knowsWeeks === "NAO"}
                    onClick={() => update({ knowsWeeks: "NAO" })}
                  />
                </div>

                {data.knowsWeeks === "SIM" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <label className="text-sm font-bold text-foreground block">Semana atual</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={1}
                        max={42}
                        value={data.currentWeek}
                        onChange={(e) => update({ currentWeek: parseInt(e.target.value) })}
                        className={`flex-1 h-2 rounded-full appearance-none bg-slate-100 ${rangeAccentClass}`}
                      />
                      <div className="bg-slate-50 rounded-2xl px-4 py-2 font-black text-2xl text-foreground min-w-[80px] text-center">
                        {data.currentWeek}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-foreground">Dias extras</label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5, 6].map(d => (
                          <button
                            key={d}
                            onClick={() => update({ currentDays: d })}
                            className={`w-8 h-8 rounded-lg font-bold transition-all ${data.currentDays === d ? accentClass : 'bg-slate-100 text-muted-foreground'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-center font-bold text-primary">
                      {data.currentWeek} semanas e {data.currentDays} dias
                    </p>
                  </motion.div>
                )}

                {data.knowsWeeks === "NAO" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">Data da última menstruação (DUM)</label>
                    <input
                      type="date"
                      value={data.dumDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => update({ dumDate: e.target.value })}
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-none focus:outline-none focus:ring-2 focus:ring-current text-lg font-bold"
                    />
                    {dumProgress && (
                      <p className="text-sm text-primary font-bold text-center mt-4">
                        Progresso: {dumProgress.weeks} semanas e {dumProgress.days} dias
                      </p>
                    )}
                  </motion.div>
                )}
              </StepWrapper>
            )}

            {step === 3 && (
              <StepWrapper>
                <h2 className="text-2xl font-black text-foreground text-center mb-2">Já sabe o sexo?</h2>
                <p className="text-muted-foreground text-center mb-8">Vamos adaptar as cores do app para vocês! 🎨</p>

                <div className="grid grid-cols-1 gap-3">
                  <GenderCard
                    label="Sim! É um menino 💙"
                    selected={data.knowsGender === "SIM" && data.babyGender === "MENINO"}
                    onClick={() => update({ knowsGender: "SIM", babyGender: "MENINO" })}
                    color="border-blue-200 bg-blue-50 text-blue-700"
                  />
                  <GenderCard
                    label="Sim! É uma menina 💗"
                    selected={data.knowsGender === "SIM" && data.babyGender === "MENINA"}
                    onClick={() => update({ knowsGender: "SIM", babyGender: "MENINA" })}
                    color="border-pink-200 bg-pink-50 text-pink-700"
                  />
                  <GenderCard
                    label="Ainda não sei 🌟"
                    selected={data.knowsGender === "NAO"}
                    onClick={() => update({ knowsGender: "NAO", babyGender: "SURPRESA" })}
                    color="border-[#8b7355] bg-[#8b7355]/5 text-[#8b7355]"
                  />
                </div>
              </StepWrapper>
            )}

            {step === 4 && (
              <StepWrapper>
                <h2 className="text-2xl font-black text-foreground text-center mb-2">
                  {data.knowsGender === "SIM" ? `Qual o nome do ${data.babyGender === "MENINO" ? "menino" : "da menina"}?` : "Já pensaram em nomes?"}
                </h2>
                <p className="text-muted-foreground text-center mb-8">
                  {data.knowsGender === "SIM" ? "Registre o nome do seu bebê! 💕" : "Pode deixar em branco se ainda não decidiram."}
                </p>

                {data.knowsGender === "SIM" ? (
                  <NameInput
                    label="Nome do bebê"
                    placeholder={data.babyGender === "MENINO" ? "Ex: Miguel, Arthur, Pedro..." : "Ex: Sofia, Maria, Valentina..."}
                    value={data.babyName}
                    onChange={(v: string) => update({ babyName: v })}
                    required
                  />
                ) : (
                  <div className="space-y-5">
                    <NameInput
                      label="Se for menino 💙"
                      placeholder="Ex: Miguel, Arthur..."
                      value={data.babyNameBoy}
                      onChange={(v: string) => update({ babyNameBoy: v })}
                    />
                    <NameInput
                      label="Se for menina 💗"
                      placeholder="Ex: Sofia, Maria..."
                      value={data.babyNameGirl}
                      onChange={(v: string) => update({ babyNameGirl: v })}
                    />
                  </div>
                )}
              </StepWrapper>
            )}

            {step === STEP_COUNT && (
              <StepWrapper>
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto border border-slate-100">
                      <span className="text-5xl">
                        {data.babyGender === "MENINO" ? "👶🏻" : data.babyGender === "MENINA" ? "👶🏻" : "🍼"}
                      </span>
                    </div>
                    <div className="absolute -top-2 -right-4 text-3xl animate-bounce">✨</div>
                    <div className="absolute -bottom-2 -left-4 text-3xl animate-bounce delay-150">🌟</div>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-black text-foreground">Tudo pronto! 🎉</h1>
                    {data.babyName && (
                      <p className="text-2xl font-black text-foreground">{data.babyName} já tem um lar digital!</p>
                    )}
                    <p className="text-muted-foreground">Sua jornada começa agora. Aproveite cada momento! 💕</p>
                  </div>
                </div>
              </StepWrapper>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-4 w-full max-w-lg">
        {step > 0 && step < STEP_COUNT && (
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/50 text-foreground/60 font-bold hover:text-foreground transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        )}

        {step < STEP_COUNT - 1 && (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${accentClass}`}
          >
            {step === 0 ? "Começar!" : "Próximo"}
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {step === STEP_COUNT - 1 && (
          <button
            onClick={handleFinish}
            disabled={!canProceed() || isSubmitting}
            className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 disabled:opacity-40 ${accentClass}`}
          >
            {isSubmitting ? "Salvando..." : "Finalizar! 🎉"}
            <Sparkles className="w-5 h-5" />
          </button>
        )}

        {step === STEP_COUNT && (
          <button
            onClick={() => router.push("/dashboard")}
            className={`w-full flex items-center justify-center gap-2 h-16 rounded-2xl text-white font-bold text-xl transition-all active:scale-95 ${accentClass}`}
          >
            Ir para o Dashboard
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/40">
      {children}
    </div>
  );
}

interface RoleCardProps {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  emoji: string;
}

function RoleCard({ label, description, selected, onClick, emoji }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-3xl border-2 text-center transition-all active:scale-95 ${selected ? "border-current bg-current/5 scale-[1.02]" : "border-slate-50 bg-white/40 hover:border-slate-200"
        }`}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="font-black text-foreground text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {selected && <div className="mt-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mx-auto"><Check className="w-3 h-3 text-white" /></div>}
    </button>
  );
}

interface OptionCardProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

function OptionCard({ label, icon, selected, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-3xl border-2 text-left transition-all active:scale-95 flex items-start gap-3 ${selected ? "border-current bg-current/5" : "border-slate-50 bg-white/40 hover:border-slate-200"
        }`}
    >
      <div className={`mt-0.5 ${selected ? "text-current" : "text-muted-foreground"}`}>{icon}</div>
      <p className={`font-bold text-sm ${selected ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
      {selected && <Check className="w-4 h-4 text-green-500 ml-auto flex-shrink-0 mt-0.5" />}
    </button>
  );
}

interface GenderCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  color: string;
}

function GenderCard({ label, selected, onClick, color }: GenderCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-3xl border-2 text-left font-bold transition-all active:scale-95 flex items-center justify-between ${selected ? `${color} border-current scale-[1.01]` : "border-slate-50 bg-white/40 hover:border-slate-200 text-foreground"
        }`}
    >
      <span>{label}</span>
      {selected && <Check className="w-5 h-5 text-green-500 flex-shrink-0" />}
    </button>
  );
}

interface NameInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

function NameInput({ label, placeholder, value, onChange, required }: NameInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground">{label}{required && " *"}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-14 px-5 rounded-2xl bg-slate-50/50 border-none focus:outline-none focus:ring-2 focus:ring-current text-lg font-bold placeholder:font-normal placeholder:text-slate-400"
      />
    </div>
  );
}
