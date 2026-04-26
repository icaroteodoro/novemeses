import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/modules/auth/auth-provider";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";

export const metadata: Metadata = {
  title: "Nove Meses | Seu Acompanhamento Gestacional Completo",
  description: "Acompanhe cada semana da sua gravidez com dicas personalizadas, controle de consultas, diário do bebê e muito mais. O app mais completo para futuras mamães e papais.",
  keywords: ["gravidez", "gestação", "acompanhamento gestacional", "semanas de gravidez", "bebê", "maternidade", "paternidade"],
  authors: [{ name: "Nove Meses" }],
  openGraph: {
    title: "Nove Meses | Seu Acompanhamento Gestacional",
    description: "Acompanhe cada semana da sua gravidez com dicas personalizadas e controle total da sua jornada.",
    url: "https://novemeses.app",
    siteName: "Nove Meses",
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AppThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
