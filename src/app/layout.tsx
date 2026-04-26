import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/modules/auth/auth-provider";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";

export const metadata: Metadata = {
  title: "Nove Meses",
  description: "Seu acompanhamento gestacional",
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
