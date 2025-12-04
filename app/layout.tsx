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
  metadataBase: new URL('https://www.codebreakersgcek.tech'),
  title: {
    template: "%s | CodeBreakers GCEK",
    default: "CodeBreakers - Coding Club | Government College of Engineering Kalahandi"
  },
  description: "Join CodeBreakers, the premier coding club at Government College of Engineering Kalahandi (GCEK). Learn programming, participate in hackathons, compete in coding challenges, and build innovative projects with a community of 500+ passionate developers.",
  keywords: [
    "CodeBreakers",
    "GCEK",
    "Government College of Engineering Kalahandi",
    "coding club",
    "programming club",
    "hackathon",
    "competitive programming",
    "web development",
    "software development",
    "tech community",
    "student developers",
    "coding competitions",
    "Odisha engineering college",
    "tech events",
    "project collaboration"
  ],
  authors: [{ name: "CodeBreakers GCEK" }],
  creator: "CodeBreakers GCEK",
  publisher: "Government College of Engineering Kalahandi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/assets/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/logo.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/assets/logo.png",
    shortcut: "/assets/logo.png"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.codebreakersgcek.tech",
    siteName: "CodeBreakers GCEK",
    title: "CodeBreakers - Premier Coding Club at GCEK",
    description: "Join 500+ developers at CodeBreakers, GCEK's leading coding club. Participate in hackathons, competitive programming, and innovative projects. Build your coding skills and network with passionate developers.",
    images: [
      {
        url: "/assets/logo.png",
        width: 1200,
        height: 630,
        alt: "CodeBreakers GCEK Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeBreakers - Premier Coding Club at GCEK",
    description: "Join 500+ developers at CodeBreakers, GCEK's leading coding club. Hackathons, competitive programming, and innovative projects.",
    images: ["/assets/logo.png"],
    creator: "@codebreakers_gcek",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://www.codebreakersgcek.tech",
  },
  category: "Education",
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
