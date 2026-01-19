import type { Metadata } from "next";
import { Work_Sans, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navigation from "@/components/Navigation";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PsychLearn - Deine Lernplattform fÃ¼rs Psychologie-Studium",
  description: "Interaktive Lernplattform fÃ¼r Psychologie-Studierende mit gamifizierten Lernzielen und Aufgaben",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${workSans.variable} ${crimsonPro.variable} font-sans`}>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}