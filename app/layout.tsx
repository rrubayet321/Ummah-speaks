import type { Metadata, Viewport } from "next";
import { Playfair_Display, EB_Garamond, Cormorant_Garamond, Amiri } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ummah Speaks",
  description: "A quiet Islamic space to share how you feel — receive hadith guidance, personal reflections, prayer times and dhikr.",
  manifest: "/manifest.json",
  authors: [{ name: "Rubayet Hassan", url: "mailto:rrubayet321@gmail.com" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ummah Speaks",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="author" content="Rubayet Hassan" />
        {/* Preconnect to Hadith API for faster first fetch */}
        <link rel="preconnect" href="https://hadithapi.pages.dev" />
        {/* PWA icon references */}
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body
        className={`${playfair.variable} ${ebGaramond.variable} ${cormorant.variable} ${amiri.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
