/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js which file extensions are "pages"
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Allows importing SVG files as React components (optional, nice for icons)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

module.exports = nextConfig;
