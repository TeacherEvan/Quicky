/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [],
  },
  experimental: {
    typedRoutes: false,
    // tesseract.js is imported dynamically only (cost page), so it is
    // already tree-shaken out of the initial bundle. optimizePackageImports
    // is a no-op for it but kept for explicit intent + future direct
    // imports. exifr is similarly dynamically imported on the location
    // page; optimizePackageImports helps if either is ever pulled in
    // eagerly from a shared module.
    optimizePackageImports: ["tesseract.js", "exifr"],
  },
};

export default nextConfig;
