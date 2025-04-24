import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BlackPearlLogo from "./components/BlackPearlLogo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Samsung Finance+ Dashboard",
  description: "Real-time overview of financing sales performance with visualizations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} bg-gray-50 antialiased`}>
        {children}
        <BlackPearlLogo />
      </body>
    </html>
  );
}
