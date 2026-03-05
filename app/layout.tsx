import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display, Amiri } from "next/font/google";
import "./globals.css";

/* Body text — clean, legible sans-serif (--font-body keeps all existing inline-style refs) */
const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

/* Display / headings — elegant serif with italic support */
const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Arabic script */
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
  authors: [{ name: "Rubayet Hassan", url: "https://github.com/rrubayet321" }],
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
        <link rel="preconnect" href="https://hadithapi.pages.dev" />
        <link rel="preconnect" href="https://api.alquran.cloud" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body
        className={`${dmSans.variable} ${dmSerif.variable} ${amiri.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
