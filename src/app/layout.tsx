import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { OrganizationJsonLd, LocalBusinessJsonLd, WebsiteJsonLd } from "@/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://oscarknabe.de'),
  title: {
    default: "Webentwicklung Frankfurt - Websites & Web-Apps | getemergence.com",
    template: "%s | getemergence.com",
  },
  description: "Professionelle Webentwicklung aus Deutschland. Websites, Web-Anwendungen und Mobile Apps für Unternehmen. Persönliche Betreuung, faire Preise.",
  keywords: "Webentwicklung, Website erstellen, Web-App, Mobile App, Frankfurt, Köln, Deutschland, Webdesign, SEO, Unternehmen",
  authors: [{ name: "Oscar Knabe", url: "https://oscarknabe.de" }],
  creator: "getemergence.com",
  publisher: "getemergence.com",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://oscarknabe.de",
    title: "Webentwicklung Frankfurt - Websites & Web-Apps | getemergence.com",
    description: "Professionelle Webentwicklung aus Deutschland. Websites, Web-Anwendungen und Mobile Apps für Unternehmen.",
    siteName: "getemergence.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "getemergence.com - Webentwicklung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webentwicklung Frankfurt - Websites & Web-Apps | getemergence.com",
    description: "Professionelle Webentwicklung aus Deutschland. Websites, Web-Anwendungen und Mobile Apps für Unternehmen.",
    images: ["/og-image.jpg"],
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
  alternates: {
    canonical: "./",
  },
  verification: {
    // Google Search Console verification (add your code here)
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <WebsiteJsonLd />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Header />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
