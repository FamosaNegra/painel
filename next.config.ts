/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["media.grupometrocasa.com"],
  },
  experimental: {
    allowedDevOrigins: ['http://192.168.1.39:3000'], // ajuste o IP conforme necessário
  },
}

module.exports = nextConfig
