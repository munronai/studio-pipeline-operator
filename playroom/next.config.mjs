/** @type {import('next').NextConfig} */
const nextConfig = {
  // The operator's markdown files live in ../, outside the Next.js src tree.
  // We read them at runtime via fs in the API route — the folder IS the agent.
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
    // Bundle the committed operator mirror into the API function so the system
    // prompt is available at runtime on Vercel regardless of how it's deployed.
    outputFileTracingIncludes: {
      '/api/research': ['./.operator/**/*'],
    },
  },

  async redirects() {
    return [
      // /demo used to host the slideshow. Now it lives at /.
      { source: '/demo', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
