import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { display, body } from "./fonts";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

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
    <html lang="en" className={`${display.variable} ${body.variable} ${geistMono.variable}`}>
      <body className="font-body text-ink-900 bg-bg antialiased selection:bg-pink-hot selection:text-white">
        <SmoothScrollProvider>
          <Providers>
            <div className="relative z-10">
              {children}
            </div>
          </Providers>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
