const development = process.env.NODE_ENV === 'development';

export default {
  ...(development ? {} : { output: 'export' }),
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  ...(development ? {
    async rewrites() {
      return [
        { source: '/api/:path*', destination: 'http://127.0.0.1:8788/api/:path*' },
      ];
    },
    async redirects() {
      return [{ source: '/angebote/:slug([a-z0-9-]+)', destination: '/angebote/?slug=:slug', permanent: false }];
    },
  } : {}),
};
