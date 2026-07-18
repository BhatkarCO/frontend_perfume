import ProductContent from './ProductContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fetch product server-side for metadata only (does not block page render)
async function getProduct(slug) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 3600 }, // Cache metadata for 1 hour (ISR)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Dynamic metadata generated per product slug
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested fragrance could not be found in our collection.',
      robots: { index: false, follow: false },
    };
  }

  // Truncate description to ~155 chars for the meta description
  const rawDesc = product.description || '';
  const metaDescription =
    rawDesc.length > 155
      ? rawDesc.slice(0, 152) + '...'
      : rawDesc ||
        `Shop ${product.name} — a premium ${product.category_name || 'fragrance'} by Bhatkar & Co. Perfumes. ${product.gender} scent with free shipping across India.`;

  const ogImage = product.primary_image
    ? { url: product.primary_image, width: 800, height: 800, alt: product.name }
    : { url: '/hero-bg.jpg', width: 1200, height: 630, alt: 'Bhatkar & Co. Luxury Perfumes' };

  return {
    title: `${product.name} — ${product.category_name || 'Luxury Perfume'}`,
    description: metaDescription,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title: `${product.name} | Bhatkar & Co. Perfumes`,
      description: metaDescription,
      url: `/product/${slug}`,
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Bhatkar & Co. Perfumes`,
      description: metaDescription,
      images: [ogImage.url],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhatkar-perfumes.com';

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || "",
        "image": product.primary_image || `${BASE_URL}/hero-bg.jpg`,
        "offers": {
          "@type": "Offer",
          "price": parseFloat(product.price || 0),
          "priceCurrency": "INR",
          "availability":
            product.stock_quantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          "url": `${BASE_URL}/product/${slug}`,
        },
        "brand": {
          "@type": "Brand",
          "name": "Bhatkar & Co. Perfumes",
        },
        "category": product.category_name || "Luxury Perfume",
        ...(product.rating
          ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": parseFloat(product.rating),
                "reviewCount": 1,
              },
            }
          : {}),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": product?.category_name || "Catalog",
        "item": `${BASE_URL}/catalog`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product?.name || "Product",
        "item": `${BASE_URL}/product/${slug}`,
      },
    ],
  };

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductContent />
    </>
  );
}
