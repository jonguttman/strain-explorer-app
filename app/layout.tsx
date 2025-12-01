import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LegalSplash from "./components/LegalSplash";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tripdar · Powered by Fungapedia",
  description: "Tripdar is a trip radar that visualizes psilocybin experiences by strain and dose — powered by Fungapedia, in partnership with The Original Psilly.",
  openGraph: {
    title: "Tripdar · Trip Radar by Fungapedia",
    description: "Visualize psilocybin experiences by strain and dose. Powered by Fungapedia, in partnership with The Original Psilly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LegalSplash />
        {children}
      </body>
    </html>
  );
}
