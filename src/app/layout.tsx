import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Oscar Knabe - Full-Stack Developer & iOS Experte",
  description: "Full-Stack Developer und iOS Experte aus Deutschland. Spezialisiert auf moderne Webanwendungen, komplexe Websysteme und native iOS Apps.",
  keywords: "Web Development, iOS Development, Full-Stack Developer, React, Next.js, Swift, SwiftUI, Deutschland",
  authors: [{ name: "Oscar Knabe" }],
  creator: "Oscar Knabe",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://oscarknabe.de",
    title: "Oscar Knabe - Full-Stack Developer & iOS Experte",
    description: "Entwicklung moderner Websites, komplexer Websysteme und nativer iOS Apps",
    siteName: "Oscar Knabe Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oscar Knabe - Full-Stack Developer & iOS Experte",
    description: "Entwicklung moderner Websites, komplexer Websysteme und nativer iOS Apps",
    creator: "@oscarknabe",
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
