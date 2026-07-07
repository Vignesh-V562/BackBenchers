import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Backbenchers - Sandboxed Multi-College Network",
  description: "Share notes, download past year question papers, and run scoped Q&A boards, completely isolated to your college.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-brand-primary text-text-primary selection:bg-accent-primary/30 relative z-0">
        <Providers>
          {/* Background Mesh Gradient with Grain Noise */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Gold/Yellow sweep */}
            <div className="absolute bottom-[10%] right-[5%] w-[45vw] h-[45vw] rounded-full bg-accent-warning/10 blur-[130px] mix-blend-screen" />
            
            {/* Pink sweep */}
            <div className="absolute bottom-[-5%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-accent-panic/10 blur-[140px] mix-blend-screen" />

            {/* Violet/Purple sweep */}
            <div className="absolute bottom-[-15%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-accent-primary/10 blur-[150px] mix-blend-screen" />

            {/* Grain Noise Overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07] mix-blend-overlay" pointerEvents="none">
              <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
              </filter>
              <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
          </div>

          <div className="flex-1 flex flex-col relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
