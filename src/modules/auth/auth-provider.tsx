"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/infra/auth/firebase.config";
import { useAuthStore } from "./auth.store";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        Cookies.set("token", token, { 
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        });

        // Sync user with backend
        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error("Failed to sync user", error);
        }

        if (pathname === "/login") {
          router.replace("/dashboard");
        }
      } else {
        Cookies.remove("token");
        if (pathname !== "/login" && pathname !== "/") {
          router.replace("/login");
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
