const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://bhatkar-perfumes.com';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap() {
  // Static routes with priorities
  const staticRoutes = [
    { url: BASE_URL,                          changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/catalog`,             changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/contact`,             changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/faqs`,                changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/policy/returns`,      changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/policy/privacy`,      changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/policy/terms`,        changeFrequency: 'yearly',  priority: 0.3 },
  ].map((route) => ({
    ...route,
    lastModified: new Date(),
  }));

  // Dynamic product routes — fetched from the backend API
  try {
    const res = await fetch(`${API_URL}/products?limit=500&sortBy=latest`, {
      next: { revalidate: 3600 }, // Regenerate sitemap every hour
    });

    if (!res.ok) return staticRoutes;

    const data = await res.json();
    const products = data.products || [];

    const productRoutes = products.map((product) => ({
      url: `${BASE_URL}/product/${product.slug}`,
      lastModified: new Date(product.updated_at || product.created_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    // If the API is unavailable during build, return static routes only
    return staticRoutes;
  }
}
