import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "emergence.tech - Digital Solutions & Software Development",
  description: "Ihr Partner für digitale Transformation. Spezialisiert auf moderne Webanwendungen, komplexe Systeme und native iOS Apps.",
  keywords: "Digital Solutions, Web Development, iOS Development, Software Development, React, Next.js, Swift, Digital Transformation",
  authors: [{ name: "emergence.tech" }],
  creator: "emergence.tech",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://emergence.tech",
    title: "emergence.tech - Digital Solutions & Software Development",
    description: "Moderne Websites, komplexe Systeme und native Apps für Ihr Unternehmen",
    siteName: "emergence.tech",
  },
  twitter: {
    card: "summary_large_image",
    title: "emergence.tech - Digital Solutions & Software Development",
    description: "Moderne Websites, komplexe Systeme und native Apps für Ihr Unternehmen",
    creator: "@emergencetech",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
