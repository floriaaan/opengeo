/* eslint-disable @typescript-eslint/no-var-requires */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  poweredByHeader: false,

  headers: () => [
    {
      source: "/(.*)",
      headers: [
        // HSTS (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
      ],
    },
  ],
  webpack: (c) => ({ ...c, resolve: { ...c.resolve, fallback: { ...c.resolve.fallback, fs: false, path: false } } }),
};

module.exports = withPWA(nextConfig);
