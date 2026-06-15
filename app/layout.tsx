import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans, Montserrat, Monoton } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {AuthProvider} from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const montserratHeading = Montserrat({subsets:['latin'],variable:'--font-heading'});

const monotonDisplay = Monoton({subsets:['latin'], weight: "400", variable:'--font-display'});

const nunitoSans = Nunito_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RATE MY TONE",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", nunitoSans.variable, montserratHeading.variable, monotonDisplay.variable)}
    >
      <body className="min-h-full flex flex-col bg-[#141414]">

      <AuthProvider>
        <Header/>
        {children}
        <Footer/>

      </AuthProvider>
      </body>
    </html>
  );
}
