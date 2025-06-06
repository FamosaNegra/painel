/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["media.grupometrocasa.com"],
  },
  experimental: {
    allowedDevOrigins: "*", // ajuste o IP conforme necessário
  }
}

module.exports = nextConfig
