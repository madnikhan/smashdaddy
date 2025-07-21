import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmashDaddy - Smashed Burgers & Grilled Chicken | Daventry",
  description: "Premium smashed burgers, grilled chicken, and wings in Daventry. Order online for delivery or collection. Fresh, quality ingredients, fast service.",
  keywords: ["smashed burgers", "grilled chicken", "wings", "takeaway", "delivery", "Daventry", "fast food", "burgers"],
  authors: [{ name: "SmashDaddy Team" }],
  creator: "SmashDaddy",
  publisher: "SmashDaddy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    title: "SmashDaddy - Smashed Burgers & Grilled Chicken | Daventry",
    description: "Premium smashed burgers, grilled chicken, and wings in Daventry. Order online for delivery or collection.",
    siteName: "SmashDaddy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SmashDaddy - Smashed Burgers & Grilled Chicken",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmashDaddy - Smashed Burgers & Grilled Chicken | Daventry",
    description: "Premium smashed burgers, grilled chicken, and wings in Daventry. Order online for delivery or collection.",
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon-96x96.png" },
  ],
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Add favicon and web app manifest links to the <head> */}
      </head>
      <body 
        className="min-h-screen bg-black text-white" 
        style={{ 
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          color: 'white'
        }}
        suppressHydrationWarning
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
