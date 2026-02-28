import type { Metadata } from "next";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";
import NavWrapper from "@/components/nav-wrapper";
import ThemeProvider from "@/components/theme-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${dmSans.variable} ${jetbrains.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <NavWrapper />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
