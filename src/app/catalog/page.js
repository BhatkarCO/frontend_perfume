import { Suspense } from 'react';
import CatalogContent from './CatalogContent';

export const metadata = {
  title: "Shop All Luxury Perfumes, Attars & Solid Fragrances",
  description:
    "Browse Bhatkar & Co.'s complete collection of luxury perfumes — Eau de Parfum, Eau de Toilette, traditional Attar Oils, and Solid Perfumes. Filter by category, gender, price, and rating.",
  alternates: {
    canonical: "/catalog",
  },
  openGraph: {
    title: "Shop All Luxury Fragrances — Bhatkar & Co. Perfumes",
    description:
      "Browse our complete collection of luxury Eau de Parfum, traditional Attars, and Solid Perfumes. Filter by category, gender, and price.",
    url: "/catalog",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Bhatkar & Co. Perfume Catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Luxury Fragrances — Bhatkar & Co. Perfumes",
    description:
      "Browse our complete collection of luxury Eau de Parfum, traditional Attars, and Solid Perfumes.",
    images: ["/hero-bg.jpg"],
  },
};

export default function Catalog() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhatkarco.com';

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Catalog",
        "item": `${BASE_URL}/catalog`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-32 text-gold text-xs uppercase tracking-widest font-semibold">
            Loading Catalog...
          </div>
        }
      >
        <CatalogContent />
      </Suspense>
    </>
  );
}
