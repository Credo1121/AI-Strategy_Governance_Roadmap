import type { NextConfig } from 'next';
const staticExport = process.env.STATIC_EXPORT === '1';
const config: NextConfig = {
  transpilePackages: ['@strategy/shared'],
  devIndicators: false,
  poweredByHeader: false,
  ...(staticExport ? {
    output: 'export' as const,
    trailingSlash: true,
    basePath: '/AI-Strategy_Governance_Roadmap',
    assetPrefix: '/AI-Strategy_Governance_Roadmap'
  } : {
    async rewrites() { return [{ source: '/api/:path*', destination: 'http://127.0.0.1:4010/api/:path*' }]; },
    async headers() { return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]}]; }
  })
};
export default config;
