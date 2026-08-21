/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
    ],
    // Next 16 dejó `[75]` como única calidad permitida y coacciona el resto al
    // valor más cercano. Las pantallas de autenticación piden 100, así que se
    // declara para que no se degraden en silencio.
    qualities: [75, 100],
  },
}

export default nextConfig
