/** @type {import('next').NextConfig} */

const backendUrl =
  process.env.BACKEND_URL || "http://localhost:5000";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://*.razorpay.com",

  `script-src 'self' 'unsafe-inline'${
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
  } https://checkout.razorpay.com https://cdn.razorpay.com`,

  "style-src 'self' 'unsafe-inline'",

  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.fbcdn.net https://*.cdninstagram.com",

  "media-src 'self' https://*.fbcdn.net https://*.cdninstagram.com",

  "font-src 'self' data:",

  // Browser talks to the same-origin /api endpoint.
  // Next.js handles the server-side rewrite to Render.
  `connect-src 'self' https://razorpay.com https://*.razorpay.com${
    process.env.NODE_ENV === "development"
      ? " ws://127.0.0.1:*"
      : ""
  }`,

  "frame-src 'self' https://razorpay.com https://*.razorpay.com https://maps.google.com https://www.google.com",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },

  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000",
        },
      ]
    : []),
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  images: {
    loader: "custom",
    loaderFile: "./src/utils/imageLoader.js",

    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;