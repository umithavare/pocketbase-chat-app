// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'kerembas.com.tr',
          pathname: '/api/files/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  