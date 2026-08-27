import { Inter, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "https://www.bhatkarco.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bhatkar & Co. Perfumes | House of Luxury Fragrances",
    template: "%s | Bhatkar & Co. Perfumes",
  },
  description:
    "Bhatkar & Co. Perfumes — House of Premium Luxury Fragrances. Indulge in our exquisite collection of Eau de Parfum, Attars, and Solid Perfumes. Long-lasting, cruelty-free, handcrafted in India.",
  keywords: [
    "luxury perfumes India",
    "buy attar online",
    "Eau de Parfum",
    "solid perfumes",
    "Bhatkar perfumes",
    "best attars India",
    "premium fragrance India",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Bhatkar & Co. Perfumes",
    title: "Bhatkar & Co. Perfumes | House of Luxury Fragrances",
    description:
      "Discover premium Eau de Parfum, traditional Attars, and handcrafted Solid Perfumes by Bhatkar & Co. — luxury fragrances made in India.",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Bhatkar & Co. Luxury Perfumes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhatkar & Co. Perfumes | House of Luxury Fragrances",
    description:
      "Discover premium Eau de Parfum, traditional Attars, and handcrafted Solid Perfumes by Bhatkar & Co.",
    images: ["/hero-bg.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
