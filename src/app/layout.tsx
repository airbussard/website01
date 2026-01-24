import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OrganizationJsonLd, LocalBusinessJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://oscarknabe.de'),
  title: {
    default: "Webentwicklung NRW | Websites & Web-Apps - getemergence.com",
    template: "%s | getemergence.com",
  },
  description: "Professionelle Webentwicklung aus Deutschland. Websites, Web-Anwendungen und Mobile Apps für Unternehmen. Persönliche Betreuung, faire Preise.",
  keywords: "Webentwicklung, Website erstellen, Web-App, Mobile App, Nordrhein-Westfalen, NRW, Köln, Deutschland, Webdesign, SEO, Unternehmen",
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
    title: "Webentwicklung NRW | Websites & Web-Apps - getemergence.com",
    description: "Professionelle Webentwicklung aus Deutschland. Websites, Web-Anwendungen und Mobile Apps für Unternehmen.",
    siteName: "getemergence.com",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "getemergence.com - Webentwicklung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webentwicklung NRW | Websites & Web-Apps - getemergence.com",
    description: "Professionelle Webentwicklung aus Deutschland. Websites, Web-Anwendungen und Mobile Apps für Unternehmen.",
    images: ["/opengraph-image"],
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
    canonical: "https://oscarknabe.de",
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
