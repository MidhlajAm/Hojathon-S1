import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statically typed links — catches a broken href at build time rather than
  // in the demo. Generates the PageProps/LayoutProps/RouteContext helpers too.
  typedRoutes: true,
  images: {
    // Issue photos once CLOUDINARY_URL is set. `images.domains` is deprecated in 16.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
