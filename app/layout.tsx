import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AgentDock from "@/components/AgentDock";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Reserved for complaint tracking ids and coordinates — record identifiers where
// fixed-width genuinely helps. Not used for labels.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CivicConnect",
  description:
    "Photograph a civic problem. The agent works out who is responsible, writes the complaint, and submits it once you approve.",
};

export const viewport: Viewport = {
  themeColor: "#edf0f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-agent focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>

        <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 sm:px-6">
          <Sidebar />
          <main id="main" className="min-w-0 flex-1 pb-24 pt-4 md:pb-12 md:pt-8">
            {children}
          </main>
        </div>

        <BottomNav />
        <AgentDock />
      </body>
    </html>
  );
}
