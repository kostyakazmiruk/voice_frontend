"use client"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Header from "@/components/Header";



const queryClient = new QueryClient()


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-white">
              <Header />
        {children}
          </div>
      </QueryClientProvider>
      </body>
    </html>
  );
}
