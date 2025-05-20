import Layout from "@/components/Layout";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "./_lib/auth";
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
  // get cookies
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;
  const isAuthPage = (await headers())
    .get("x-current-path")
    ?.startsWith("/auth/");

  if (!isAuthPage && !(uid && getUserById(uid))) redirect("/auth/login");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {isAuthPage ? children : <Layout>{children}</Layout>}
        </Providers>
      </body>
    </html>
  );
}
