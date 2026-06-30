/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { defaultLoaders }) {
    // Exclude Next.js compiled internals from Babel to avoid OOM during compilation
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOf) => {
          if (
            oneOf.use &&
            Array.isArray(oneOf.use) &&
            oneOf.use.some((u) => u.loader && u.loader.includes('babel'))
          ) {
            oneOf.exclude = [
              ...(Array.isArray(oneOf.exclude) ? oneOf.exclude : oneOf.exclude ? [oneOf.exclude] : []),
              /node_modules[\\/]next[\\/]dist[\\/]compiled/,
            ];
          }
        });
      }
    });
    return config;
  },
};

module.exports = nextConfig;
