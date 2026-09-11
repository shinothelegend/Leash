import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { LeashMotif } from "@/components/LeashMotif";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading-display",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leash | Policy Engine",
  description: "On-chain autonomous agent policy enforcement on Hedera",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} dark`}>
      <body>
        <Providers>
          <LeashMotif />
          <div className="relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

