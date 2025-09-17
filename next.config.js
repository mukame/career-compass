/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['canvas', 'jsdom'], // experimental.serverComponentsExternalPackagesから移動
  // experimental: {
  //   serverComponentsExternalPackages: ['canvas', 'jsdom'] // この行を削除またはコメントアウト
  // }
};

module.exports = nextConfig;
