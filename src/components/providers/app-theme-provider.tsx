"use client";

import { createContext, useContext, useEffect, useState } from "react";

type BabyGender = "MENINO" | "MENINA" | "SURPRESA";
type ParentRole = "PAI" | "MAE";

interface ThemeContextValue {
  babyGender: BabyGender;
  parentRole: ParentRole;
  setTheme: (gender: BabyGender, role: ParentRole) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  babyGender: "SURPRESA",
  parentRole: "MAE",
  setTheme: () => { },
});

const THEME_VARS: Record<BabyGender, { primary: string; shadow: string; ring: string }> = {
  MENINO: { primary: "#2563eb", shadow: "37, 99, 235", ring: "#2563eb" },
  MENINA: { primary: "#ec4899", shadow: "236, 72, 153", ring: "#ec4899" },
  SURPRESA: { primary: "#dcc7a1", shadow: "220, 199, 161", ring: "#dcc7a1" },
};

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [babyGender, setBabyGender] = useState<BabyGender>("SURPRESA");
  const [parentRole, setParentRole] = useState<ParentRole>("MAE");

  const applyTheme = (gender: BabyGender) => {
    const vars = THEME_VARS[gender];
    document.documentElement.style.setProperty("--primary", vars.primary);
    document.documentElement.style.setProperty("--ring", vars.ring);
    document.documentElement.style.setProperty("--primary-shadow", vars.shadow);
  };

  useEffect(() => {
    // Load from localStorage on mount
    const savedGender = localStorage.getItem("babyGender") as BabyGender | null;
    const savedRole = localStorage.getItem("parentRole") as ParentRole | null;
    if (savedGender) {
      setBabyGender(savedGender);
      applyTheme(savedGender);
    }
    if (savedRole) setParentRole(savedRole);
  }, []);

  const setTheme = (gender: BabyGender, role: ParentRole) => {
    setBabyGender(gender);
    setParentRole(role);
    localStorage.setItem("babyGender", gender);
    localStorage.setItem("parentRole", role);
    applyTheme(gender);
  };

  return (
    <ThemeContext.Provider value={{ babyGender, parentRole, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
