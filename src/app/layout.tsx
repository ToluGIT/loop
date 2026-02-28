import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavWrapper from "@/components/nav-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loop - Know Your Grade, Find Your Help",
  description:
    "Real-time degree classification projection with peer skill matching. Built for RGU students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <NavWrapper />
        {children}
      </body>
    </html>
  );
}
