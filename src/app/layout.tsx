import type { Metadata } from "next";
import "./globals.css";
import "./styles/xp.css";
import { LangProvider } from "./lib/LangContext";

export const metadata: Metadata = {
  title: "not found",
  description: "npclvlc archive",
  icons: {
    icon: "/icon_clippy_01@2x.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}