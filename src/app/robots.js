const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://bhatkar-perfumes.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/catalog',
          '/product/',
          '/contact',
          '/faqs',
          '/policy/',
        ],
        disallow: [
          '/admin',
          '/checkout',
          '/dashboard',
          '/login',
          '/register',
          '/verify-email',
          '/forgot-password',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
