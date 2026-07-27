/** @type {import('next').NextConfig} */
const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
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
