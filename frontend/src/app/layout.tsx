import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Placement AI | Management System",
  description: "AI-Powered Placement Management System for Students and Admins",
};

import QueryProvider from "@/providers/QueryProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { NavabarLanding } from "@/components/layout/NavabarLanding";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <NavabarLanding />
            <main className="flex-1 container mx-auto px-4 md:px-8">
              {children}
            </main>
            <ToasterProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
