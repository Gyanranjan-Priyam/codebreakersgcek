import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import LenisProvider from "@/components/providers/lenis-provider";
import { Analytics } from "@vercel/analytics/next"


const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-source-code-pro", 
})

export const metadata: Metadata = {
  title: {
    template: "%s | CodeBreakers",
    default: "CodeBreakers - Registration Portal"
  },
  description: "Official registration portal for CodeBreakers, Government College of Engineering Kalahandi",
  icons: {
    icon: [
      { url: "/assets/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo.png", sizes: "16x16", type: "image/png" }
    ],
    apple: "/assets/logo.png",
    shortcut: "/assets/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={` ${sourceCodePro.variable} antialiased`}
      >
        <LenisProvider>
          {children}
        </LenisProvider>
        <Toaster position="top-center" richColors closeButton />
        <Analytics />
      </body>
    </html>
  );
}
