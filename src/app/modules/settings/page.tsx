"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  User as UserIcon,
  Heart,
  LogOut,
  Bell,
  Shield,
  Camera,
  CheckCircle2,
  ChevronRight,
  Baby,
  Calendar
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { auth } from "@/infra/auth/firebase.config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAppTheme } from "@/components/providers/app-theme-provider";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [pregnancy, setPregnancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [babyName, setBabyName] = useState("");
  const [babyNameBoy, setBabyNameBoy] = useState("");
  const [babyNameGirl, setBabyNameGirl] = useState("");
  const [babyGender, setBabyGender] = useState("");
  const [parentRole, setParentRole] = useState("");
  const [startDate, setStartDate] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();
  const { setTheme } = useAppTheme();

  const fetchData = async () => {
    try {
      const res = await apiFetch("/api/user");
      const data = await res.json();
      const u = data.user;
      setUser(u);
      setName(u?.name || "");

      const p = (u?.pregnancies && u.pregnancies.length > 0) 
                ? u.pregnancies[0] 
                : (u?.partnerPregnancies && u.partnerPregnancies.length > 0) 
                  ? u.partnerPregnancies[0] 
                  : null;

      if (p) {
        setPregnancy(p);
        setBabyName(p.babyName || "");
        setBabyNameBoy(p.babyNameBoy || "");
        setBabyNameGirl(p.babyNameGirl || "");
        setBabyGender(p.babyGender || "SURPRESA");
        
        // Determine the role of the current user in this pregnancy
        const role = u.id === p.userId ? (p.parentRole || "MAE") : (p.partnerRole || "PAI");
        setParentRole(role);
        setStartDate(p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : "");

        // Sync theme with database state
        setTheme(p.babyGender || "SURPRESA", role);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    try {
      const res = await apiFetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setSuccessMsg("Perfil atualizado!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePregnancy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");

    const payload: any = {
      babyName,
      babyNameBoy,
      babyNameGirl,
      babyGender,
      parentRole,
    };

    if (startDate) {
      payload.startDate = startDate;
    }

    try {
      // console.log("Sending payload:", payload);
      const res = await apiFetch("/api/pregnancy", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        // console.log("Save success:", data);
        setTheme(babyGender as any, parentRole as any);
        setSuccessMsg("Dados do bebê atualizados!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const err = await res.json();
        console.error("Save failed:", err);
      }
    } catch (error) {
      console.error("Error updating pregnancy:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("token");
      localStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Settings className="text-primary w-8 h-8" />
              Configurações
            </h1>
            <p className="text-muted-foreground">Personalize sua experiência no Nove Meses.</p>
          </div>
          {successMsg && (
            <p className="text-emerald-500 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <CheckCircle2 className="w-5 h-5" /> {successMsg}
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-64 bg-white rounded-[2.5rem] animate-pulse" />
            <div className="h-64 bg-white rounded-[2.5rem] animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-8">
            {/* Perfil */}
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-black">Sua Conta</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {user?.avatarUrl && user.avatarUrl !== "" ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-slate-300" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-md border hover:bg-slate-50 transition-colors">
                      <Camera className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{user?.name}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground ml-1">Seu Nome</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 border-none text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground ml-1">E-mail</label>
                      <Input value={user?.email || ""} disabled className="h-14 rounded-2xl bg-slate-50 border-none text-slate-400" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving || name === user?.name} className="bg-primary hover:bg-primary/90 rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                      {isSaving ? "Salvando..." : "Salvar Perfil"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Dados do Bebê & Onboarding */}
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                    <Baby className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-black">Dados da Gestação</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleUpdatePregnancy} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground ml-1">
                        {babyGender === "SURPRESA" ? "Nome (se for menino)" : "Nome do Bebê"}
                      </label>
                      <Input
                        value={babyGender === "SURPRESA" ? babyNameBoy : babyName}
                        onChange={(e) => babyGender === "SURPRESA" ? setBabyNameBoy(e.target.value) : setBabyName(e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 border-none text-lg"
                        placeholder="Ex: Miguel, Arthur..."
                      />
                    </div>
                    {babyGender === "SURPRESA" && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground ml-1">Nome (se for menina)</label>
                        <Input
                          value={babyNameGirl}
                          onChange={(e) => setBabyNameGirl(e.target.value)}
                          className="h-14 rounded-2xl bg-slate-50 border-none text-lg"
                          placeholder="Ex: Sofia, Maria..."
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground ml-1">Data da DUM (Início)</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 border-none text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground ml-1">Sexo do Bebê (Tema)</label>
                      <div className="flex gap-2">
                        {["MENINO", "MENINA", "SURPRESA"].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setBabyGender(g);
                              if (g === "MENINO" && babyNameBoy) setBabyName(babyNameBoy);
                              if (g === "MENINA" && babyNameGirl) setBabyName(babyNameGirl);
                            }}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${babyGender === g
                              ? (g === 'MENINO' ? 'bg-blue-50 border-blue-500 text-blue-700' : g === 'MENINA' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-[#8b7355]/5 border-[#8b7355] text-[#8b7355]')
                              : 'border-slate-100 text-muted-foreground'
                              }`}
                          >
                            {g === 'MENINO' ? 'Menino' : g === 'MENINA' ? 'Menina' : 'Não sei'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground ml-1">Eu sou...</label>
                      <div className="flex gap-2">
                        {["MAE", "PAI"].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setParentRole(r)}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all border-2 ${parentRole === r
                              ? 'bg-primary/5 border-primary text-primary'
                              : 'border-slate-100 text-muted-foreground'
                              }`}
                          >
                            {r === 'MAE' ? 'Mamãe' : 'Papai'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                      {isSaving ? "Salvando..." : "Atualizar Gestação"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-black">Pessoas Vinculadas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {/* Dono */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center overflow-hidden">
                        {pregnancy?.user?.avatarUrl ? (
                          <img src={pregnancy.user.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{pregnancy?.user?.name || "Administrador"}</p>
                        <p className="text-[10px] text-muted-foreground">{pregnancy?.user?.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                      Dono(a)
                    </span>
                  </div>

                  {/* Parceiro */}
                  {pregnancy?.partner ? (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center overflow-hidden">
                          {pregnancy.partner.avatarUrl ? (
                            <img src={pregnancy.partner.avatarUrl} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{pregnancy.partner.name || "Parceiro(a)"}</p>
                          <p className="text-[10px] text-muted-foreground">{pregnancy.partner.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">
                          Parceiro(a)
                        </span>
                        {user?.id === pregnancy?.userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={async () => {
                              if (confirm("Deseja remover o parceiro desta gestação?")) {
                                try {
                                  const res = await apiFetch("/api/pregnancy/partner", { method: "DELETE" });
                                  if (res.ok) fetchData();
                                } catch (error) {
                                  console.error(error);
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg h-8 w-8 p-0"
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl text-center space-y-3">
                      <p className="text-muted-foreground text-xs">Nenhum parceiro vinculado.</p>
                      {user?.id === pregnancy?.userId && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => router.push("/onboarding?tab=partner")}
                          className="rounded-xl border-primary text-primary hover:bg-primary/5 text-xs font-bold"
                        >
                          Convidar Parceiro
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sair */}
            <div className="pt-8 flex justify-center">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="h-14 px-8 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold flex gap-3"
              >
                <LogOut className="w-5 h-5" />
                Sair da Conta
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
