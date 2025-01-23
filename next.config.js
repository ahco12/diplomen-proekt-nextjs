module.exports = {
  // ...existing code...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets-eu-01.kc-usercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pisces.bbystatic.com',
        pathname: '/**',
      },
      // Add other hostnames if needed
    ],
  },
  // ...existing code...
};
