import HomeContent from './HomeContent';

export const metadata = {
  title: "Bhatkar & Co. Perfumes",
  description:
    "Shop Bhatkar & Co. Perfumes — India's finest luxury Eau de Parfum, traditional Attar Oils, and handcrafted Solid Perfumes. Free shipping above ₹1500. Cruelty-free & made in India.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bhatkar & Co. Perfumes | House of Luxury Fragrances",
    description:
      "Discover premium Eau de Parfum, traditional Attars, and handcrafted Solid Perfumes by Bhatkar & Co. Luxury fragrances made in India.",
    url: "/",
    images: [
      {
        url: "/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Bhatkar & Co. Luxury Perfumes — The Artistry of Scents",
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
};

export default function Home() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhatkar-perfumes.com';

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bhatkar & Co. Perfumes",
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo.png`,
    "sameAs": [
      "https://facebook.com/bhatkarperfumes",
      "https://www.instagram.com/bhatkarco.official?igsh=MTBlbTh4cnhvZXlqdw%3D%3D"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@bhatkar-perfumes.com",
      "contactType": "customer service"
    }
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bhatkar & Co. Perfumes",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/catalog?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeContent />
    </>
  );
}
