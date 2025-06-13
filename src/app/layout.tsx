import AuthCheck from "@/components/AuthCheck";
import Layout from "@/components/Layout";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CrohnScope",
    template: "%s | CrohnScope",
  },

  description: "CrohnScope is a web application for Crohn's disease research.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthPage = (await headers()).get("x-current-path") === "/auth";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* Client-side auth check component */}
          <AuthCheck isAuthPage={isAuthPage} />
          {isAuthPage ? children : <Layout>{children}</Layout>}
        </Providers>
      </body>
    </html>
  );
}
